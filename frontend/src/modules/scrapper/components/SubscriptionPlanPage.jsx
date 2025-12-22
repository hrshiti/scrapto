import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { checkAndProcessMilestone } from '../../shared/utils/referralUtils';
import { subscriptionAPI } from '../../shared/utils/api';

const SubscriptionPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  
  // Check if user is authenticated as scrapper
  useEffect(() => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
    }
  }, [navigate]);

  // Fetch plans and current subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch plans
        const plansRes = await subscriptionAPI.getPlans();
        if (plansRes.success) {
          // Transform plans for display
          const transformedPlans = plansRes.data.plans.map(plan => ({
            id: plan._id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency || 'INR',
            duration: plan.duration,
            durationType: plan.durationType,
            features: plan.features || [],
            maxPickups: plan.maxPickups,
            isPopular: plan.isPopular || false
          }));
          setPlans(transformedPlans);
        }

        // Fetch current subscription
        try {
          const subRes = await subscriptionAPI.getMySubscription();
          if (subRes.success && subRes.data.subscription) {
            const sub = subRes.data.subscription;
            // Check if subscription is active and not expired
            const expiryDate = sub.expiryDate ? new Date(sub.expiryDate) : null;
            const now = new Date();
            if (sub.status === 'active' && expiryDate && expiryDate > now) {
              setCurrentSubscription(sub);
              // Update localStorage
              localStorage.setItem('scrapperSubscriptionStatus', 'active');
              localStorage.setItem('scrapperSubscription', JSON.stringify({
                status: sub.status,
                planId: sub.planId?._id || sub.planId,
                planName: sub.planId?.name || 'Unknown Plan',
                startDate: sub.startDate,
                expiryDate: sub.expiryDate,
                autoRenew: sub.autoRenew
              }));
            } else {
              localStorage.setItem('scrapperSubscriptionStatus', 'expired');
            }
          }
        } catch (subError) {
          // Subscription not found or error - that's okay
          console.log('No active subscription found');
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError(err.message || 'Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const loadRazorpay = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedPlan) {
      alert('Please select a subscription plan');
      return;
    }

    if (isProcessing) {
      return; // Prevent double submission
    }

    setIsProcessing(true);

    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    const scrapperUser = JSON.parse(localStorage.getItem('scrapperUser') || '{}');

    try {
      await loadRazorpay();

      // Use new subscription API
      const createRes = await subscriptionAPI.subscribe(selectedPlan);

      if (!createRes.success) {
        throw new Error(createRes.error || 'Failed to create subscription order');
      }

      const { razorpayOrderId, amount, currency, keyId, paymentId, plan } = createRes.data;

      const options = {
        key: keyId,
        amount,
        currency: currency || 'INR',
        name: 'Scrapto',
        description: `${selectedPlanData.name} - ${selectedPlanData.durationType || 'monthly'} subscription`,
        order_id: razorpayOrderId,
        prefill: {
          name: scrapperUser.name || 'Scrapper',
          email: scrapperUser.email || 'scrapper@example.com',
          contact: scrapperUser.phone || ''
        },
        handler: async (response) => {
          try {
            // Use new subscription API for verification
            const verifyRes = await subscriptionAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (!verifyRes.success) {
              throw new Error(verifyRes.error || 'Payment verification failed');
            }

            // Update localStorage with subscription data
            const subscription = verifyRes.data.subscription;
            localStorage.setItem('scrapperSubscriptionStatus', 'active');
            localStorage.setItem('scrapperSubscription', JSON.stringify({
              status: subscription.status,
              planId: subscription.planId?._id || subscription.planId,
              planName: verifyRes.data.plan?.name || selectedPlanData.name,
              startDate: subscription.startDate,
              expiryDate: subscription.expiryDate,
              autoRenew: subscription.autoRenew
            }));

            try {
              checkAndProcessMilestone(scrapperUser.phone || scrapperUser.id, 'scrapper', 'subscription');
            } catch (err) {
              console.error('Error processing milestone:', err);
            }

            alert('Subscription activated successfully!');
            navigate('/scrapper', { replace: true });
          } catch (err) {
            console.error('Verification failed', err);
            alert(err.message || 'Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        },
        notes: {
          plan: selectedPlanData.name,
          entityType: 'subscription'
        },
        theme: {
          color: '#64946e'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Subscription payment error:', error);
      alert(error.message || 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  // Format duration display
  const formatDuration = (duration, durationType) => {
    if (durationType === 'monthly') {
      return duration === 1 ? 'month' : `${duration} months`;
    } else if (durationType === 'quarterly') {
      return `${duration} months`;
    } else if (durationType === 'yearly') {
      return duration === 12 ? 'year' : `${duration / 12} years`;
    }
    return `${duration} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#f4ebe2' }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-green-600 mx-auto mb-4"
          />
          <p style={{ color: '#718096' }}>Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full p-4 md:p-6" style={{ backgroundColor: '#f4ebe2' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 mb-2">Error loading subscription plans</p>
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full p-4 md:p-6"
      style={{ backgroundColor: '#f4ebe2' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#2d3748' }}>
            {currentSubscription ? 'Manage Your Subscription' : 'Choose Your Plan'}
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#718096' }}>
            {currentSubscription 
              ? 'Your subscription is active. You can renew or change your plan below.'
              : 'Select a subscription plan to start receiving pickup requests'}
          </p>
        </motion.div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: '#ffffff', border: '2px solid #64946e' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#2d3748' }}>
                  Current Subscription: {currentSubscription.planId?.name || 'Active Plan'}
                </h3>
                <p className="text-sm" style={{ color: '#718096' }}>
                  Expires: {currentSubscription.expiryDate ? new Date(currentSubscription.expiryDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}>
                Active
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => handlePlanSelect(plan.id)}
              className={`relative rounded-2xl p-6 md:p-8 shadow-lg cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.id ? 'ring-4' : 'hover:shadow-xl'
              }`}
              style={{
                backgroundColor: '#ffffff',
                border: selectedPlan === plan.id ? '2px solid #64946e' : '2px solid transparent',
                ringColor: selectedPlan === plan.id ? '#64946e' : 'transparent'
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#64946e', color: '#ffffff' }}>
                  Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#2d3748' }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-bold" style={{ color: '#64946e' }}>
                    ₹{plan.price}
                  </span>
                  <span className="text-sm md:text-base" style={{ color: '#718096' }}>
                    /{formatDuration(plan.duration, plan.durationType)}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5" style={{ color: '#64946e' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm md:text-base" style={{ color: '#2d3748' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Selection Indicator */}
              {selectedPlan === plan.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full py-2 rounded-lg text-center font-semibold"
                  style={{ backgroundColor: 'rgba(100, 148, 110, 0.1)', color: '#64946e' }}
                >
                  Selected
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Subscribe Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubscribe(e);
            }}
            disabled={!selectedPlan || isProcessing}
            className="w-full py-4 md:py-5 rounded-xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#64946e', color: '#ffffff' }}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                />
                <span>Processing...</span>
              </div>
            ) : (
              `Subscribe - ₹${selectedPlan ? plans.find(p => p.id === selectedPlan).price : '0'}/${selectedPlan ? formatDuration(plans.find(p => p.id === selectedPlan).duration, plans.find(p => p.id === selectedPlan).durationType) : 'month'}`
            )}
          </motion.button>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-2xl p-4 md:p-6 shadow-lg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#64946e', flexShrink: 0, marginTop: '2px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
            </svg>
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: '#2d3748' }}>
                Subscription Details
              </p>
              <ul className="text-xs md:text-sm space-y-1" style={{ color: '#718096' }}>
                <li>• Subscription will auto-renew every month</li>
                <li>• You can cancel anytime from your profile</li>
                <li>• Payment will be processed securely via Razorpay</li>
                <li>• All plans include full access to pickup requests</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SubscriptionPlanPage;

