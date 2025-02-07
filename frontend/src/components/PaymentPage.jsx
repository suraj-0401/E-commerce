import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { base_url, stripe_Url } from '../Urls';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCheckout = async () => {
      if (!stripe_Url) {
        setError('Stripe public key is missing');
        return;
      }

      try {
        const stripe = await loadStripe(stripe_Url);

        if (!stripe) {
          throw new Error('Stripe.js failed to load');
        }

        // Fetch session from the backend
        const response = await fetch(`${base_url}/api/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product: JSON.parse(localStorage.getItem('cart')),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create checkout session: ${response.statusText}`);
        }

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
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div>
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Error</h1>
          <p className="text-center text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Redirecting to Payment...</h1>
        <p className="text-center text-gray-500">If the payment page does not load, please check the console for errors.</p>
      </div>
    </div>
  );
};

export default PaymentPage;