import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const REACT_APP_STRIPE_CODE_FRONT=process.env.REACT_APP_STRIPE_CODE_FRONT;
  useEffect(() => {
    const handleCheckout = async () => {
      try {
        const stripe = await loadStripe(REACT_APP_STRIPE_CODE_FRONT);

        if (!stripe) {
          throw new Error('Stripe.js failed to load');
        }

        // Fetch session from the backend
        const REACT_APP_BASE_URL=process.env.REACT_APP_BASE_URL;
        const response = await fetch(`${REACT_APP_BASE_URL}/api/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product: JSON.parse(localStorage.getItem('cart')),
          }),
        });

        // if (!response.ok) {
        //   throw new Error(`Failed to create checkout session: ${response.statusText}`);
        // }

        const session = await response.json();

        if (!session.id) {
          throw new Error('Checkout session ID not found');
        }

        // Redirect to Stripe checkout
        const result = await stripe.redirectToCheckout({ sessionId: session.id });

        if (result.error) {
          throw new Error(`Stripe Checkout Error: ${result.error.message}`);

        }
      } catch (error) {
        setError(error.message);
      }
    };

    handleCheckout();
  }, [navigate,REACT_APP_STRIPE_CODE_FRONT]);

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Error</h1>
        <p className="text-center text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Redirecting to Payment...</h1>
      <p className="text-center text-gray-500">If the payment page does not load, please check the console for errors.</p>
    </div>
  );
};

export default PaymentPage;
