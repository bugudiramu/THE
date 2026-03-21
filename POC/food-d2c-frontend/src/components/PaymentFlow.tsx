import React, { useState, useEffect } from 'react';
import { paymentAPI, subscriptionAPI } from '../services/api';

interface Subscription {
  id: string;
  name: string;
  amount: string;
  status: string;
  interval: string;
  razorpaySubscriptionId?: string;
  nextBillingDate?: string;
}

const PaymentFlow: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load subscriptions
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getMySubscriptions();
      setSubscriptions(response.data);
    } catch (err: any) {
      setError('Failed to load subscriptions');
    }
  };

  const createOneTimePayment = async (amount: number) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create order
      const orderResponse = await paymentAPI.createOrder(amount);
      const order = orderResponse.data;

      // Open Razorpay checkout
      const options = {
        key: 'rzp_test_STZeCvuVRxPPby', // Your test key
        amount: order.amount,
        currency: 'INR',
        name: 'Food D2C',
        description: 'One-time payment',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess('Payment successful!');
            loadSubscriptions();
          } catch (err: any) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          email: 'paymenttest@example.com',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError('Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (name: string, amount: number, interval: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await subscriptionAPI.createSubscription({
        name,
        amount,
        interval,
      });

      setSuccess('Subscription created successfully!');
      loadSubscriptions();
    } catch (err: any) {
      setError('Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (id: string, action: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      switch (action) {
        case 'cancel':
          await subscriptionAPI.cancelSubscription(id);
          setSuccess('Subscription cancelled!');
          break;
        case 'pause':
          await subscriptionAPI.pauseSubscription(id);
          setSuccess('Subscription paused!');
          break;
        case 'resume':
          await subscriptionAPI.resumeSubscription(id);
          setSuccess('Subscription resumed!');
          break;
      }
      loadSubscriptions();
    } catch (err: any) {
      setError(`Failed to ${action} subscription`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-flow">
      <h1>Food D2C - Payment Flow Testing</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* One-time Payment Section */}
      <section className="section">
        <h2>One-time Payment</h2>
        <div className="payment-options">
          <button onClick={() => createOneTimePayment(299)}>
            Pay ₹299 - Trial Box
          </button>
          <button onClick={() => createOneTimePayment(599)}>
            Pay ₹599 - Premium Box
          </button>
          <button onClick={() => createOneTimePayment(999)}>
            Pay ₹999 - Deluxe Box
          </button>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="section">
        <h2>Create Subscription</h2>
        <div className="subscription-options">
          <button onClick={() => createSubscription('Weekly Fresh Box', 299, 'weekly')}>
            Weekly Box - ₹299/week
          </button>
          <button onClick={() => createSubscription('Monthly Premium Box', 799, 'monthly')}>
            Monthly Box - ₹799/month
          </button>
        </div>
      </section>

      {/* Existing Subscriptions */}
      <section className="section">
        <h2>Your Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <p>No subscriptions found</p>
        ) : (
          <div className="subscriptions-list">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="subscription-card">
                <h3>{sub.name}</h3>
                <p>Amount: ₹{sub.amount}/{sub.interval}</p>
                <p>Status: <span className={`status ${sub.status}`}>{sub.status}</span></p>
                {sub.nextBillingDate && (
                  <p>Next Billing: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                )}
                
                <div className="subscription-actions">
                  {sub.status === 'active' && (
                    <>
                      <button onClick={() => handleSubscriptionAction(sub.id, 'pause')}>
                        Pause
                      </button>
                      <button onClick={() => handleSubscriptionAction(sub.id, 'cancel')}>
                        Cancel
                      </button>
                    </>
                  )}
                  {sub.status === 'paused' && (
                    <button onClick={() => handleSubscriptionAction(sub.id, 'resume')}>
                      Resume
                      </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {loading && <div className="loading">Processing...</div>}
    </div>
  );
};

export default PaymentFlow;
