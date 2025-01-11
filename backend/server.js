const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path=require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); 
const { default: Stripe } = require('stripe');
const dotenv=require('dotenv');
dotenv.config();

const jwtSecret = process.env.JWT_SECRET_KEY;
const tokenBlacklist = new Set(); 


// Initialize Express
const app = express();

// Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.Google_Id);

// path
const _dirname=path.resolve();

// join with frontend 
app.use(express.static(path.join(_dirname,'/frontend/build')))

app.get('*',(_,res)=>{
  res.sendFile(path.resolve(_dirname,"frontend","build","index.html"))
})

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// Connect to MongoDB Atlas
const mongoURI=process.env.mongoURI;
mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Define a user model
const userSchema = new mongoose.Schema({
  fName: String,
  lName: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { fName, lName, email, password, cPassword } = req.body;

    if (!fName || !lName || !email || !password || !cPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    if (password !== cPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fName,
      lName,
      email,
      password: hashedPassword,
    });

    await user.save();

    return res.status(200).json({
      message: 'Signup successful!',
      data: {
        fName,
        lName,
        email,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
    if (token) {
      tokenBlacklist.add(token); // Add token to blacklist
      return res.status(200).json({ message: 'Logged out successfully!' });
    } else {
      return res.status(400).json({ message: 'Token is required.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Google Sign-In/Sign-Up Route
app.post('/google-signin', async (req, res) => {
  try {
    const { credential } = req.body; // Token sent from frontend

    if (!credential) {
      return res.status(400).json({ message: 'Credential is required.' });
    }

    // Verify the token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.Google_Id,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload; // Extract user details

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        fName: name.split(' ')[0] || '',
        lName: name.split(' ')[1] || '',
        email,
        googleId,
        picture,
      });
      await user.save();
    }

    // Generate a JWT token
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Google Sign-In successful!',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.fName} ${user.lName}`,
        picture: user.picture,
      },
    });

  } catch (error) {
    console.error('Error during Google Sign-In:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const stripe = Stripe(process.env.Stripe_Code); 

// Payment route
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { product } = req.body;

        if (!product || product.length === 0) {
            return res.status(400).json({ message: 'Product data is required' });
        }

        const BASE_URL=process.env.BASE_URL
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: product.map((p) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: p.title,
                    },
                    unit_amount: p.price * 100, // Convert price to cents
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: `${BASE_URL}/success`,
            cancel_url: `${BASE_URL}/cancel`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).send('Server Error');
    }
});

// Middleware to check token validity
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
  next();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error(`Error starting server: ${error.message}`);
});
