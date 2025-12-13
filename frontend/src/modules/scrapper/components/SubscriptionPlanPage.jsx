import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const SubscriptionPlanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if user is authenticated as scrapper
  useEffect(() => {
    const scrapperAuth = localStorage.getItem('scrapperAuthenticated');
    const scrapperUser = localStorage.getItem('scrapperUser');
    if (scrapperAuth !== 'true' || !scrapperUser) {
      navigate('/scrapper/login', { replace: true });
    }
  }, [navigate]);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 99,
      duration: 'month',
      features: [
        'Receive pickup requests',
        'Basic support',
        'Standard priority',
        'Up to 50 pickups/month'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 199,
      duration: 'month',
      features: [
        'Priority pickup requests',
        '24/7 Premium support',
        'Higher priority in queue',
        'Unlimited pickups',
        'Advanced analytics',
        'Early access to features'
      ],
      popular: true
    }
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
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

    // Simulate payment processing
    setTimeout(() => {
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      const subscriptionData = {
        planId: selectedPlan,
        planName: selectedPlanData.name,
        price: selectedPlanData.price,
        status: 'active',
        subscribedAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      // Store subscription in localStorage (frontend only)
      localStorage.setItem('scrapperSubscription', JSON.stringify(subscriptionData));
      localStorage.setItem('scrapperSubscriptionStatus', 'active');

      setIsProcessing(false);
      
      // Redirect to dashboard (homepage) after subscription
      // Use window.location to force a full page reload and routing re-evaluation
      console.log('Subscription saved, redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/scrapper';
      }, 100);
    }, 2000);
  };

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
            Choose Your Plan
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#718096' }}>
            Select a subscription plan to start receiving pickup requests
          </p>
        </motion.div>

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
                    /{plan.duration}
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
              `Subscribe - ₹${selectedPlan ? plans.find(p => p.id === selectedPlan).price : '0'}/month`
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

