import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Crown, CheckCircle2, X, CreditCard, ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import { API } from '../../services/api';

export const SubscriptionModal: React.FC = () => {
  const { showSubscriptionModal, setShowSubscriptionModal, currentUser, setCurrentUser } = useApp();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'payment' | 'success'>('select');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (showSubscriptionModal) {
      API.getSubscriptionPlans().then((data) => {
        setPlans(data);
        if (data.length > 0) {
          const defaultPopular = data.find((p: any) => p.interval === 'ANNUAL') || data[0];
          setSelectedPlan(defaultPopular);
        }
      });
      setCheckoutStep('select');
      setErrorMsg('');
    }
  }, [showSubscriptionModal]);

  if (!showSubscriptionModal) return null;

  const handleStartCheckout = async (plan: any) => {
    setSelectedPlan(plan);
    setErrorMsg('');
    try {
      await API.createCheckoutSession(plan.id);
      setCheckoutStep('payment');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize payment checkout.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const response = await API.confirmSubscriptionPayment({
        planId: selectedPlan.id,
        cardBrand: 'Visa',
        last4: '4242',
      });

      if (response.success) {
        const updatedUser = await API.getMe();
        setCurrentUser(updatedUser);
        setCheckoutStep('success');
      } else {
        setErrorMsg('Payment verification was not accepted. Please try another card.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-2xl w-full my-auto p-5 sm:p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={() => setShowSubscriptionModal(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 tap-active"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Step 1: Select Plan */}
        {checkoutStep === 'select' && (
          <>
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white border border-neutral-700 px-3 py-1 rounded-full text-xs font-bold">
                <Crown className="w-4 h-4 text-amber-400" />
                50+ Dignity & Trust Tiers
              </div>
              <h3 className="text-2xl font-bold font-serif text-white">Choose Your Companion Membership</h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                Essential safety, scam reporting, and identity verification remain 100% free for all members.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {plans.map((plan) => {
                const isCurrent = currentUser?.subscriptionTier === plan.tier;
                const isPopular = plan.interval === 'ANNUAL';

                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 border transition-all ${
                      isPopular
                        ? 'bg-neutral-900 border-white shadow-xl'
                        : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <div className="space-y-2">
                      {isPopular && (
                        <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                          Best Value
                        </span>
                      )}
                      <h4 className="text-lg font-bold font-serif text-white">{plan.name}</h4>
                      <div className="text-2xl font-black text-white">
                        ${plan.price}
                        <span className="text-xs font-normal text-neutral-400 block">
                          {plan.interval === 'ANNUAL' ? '/year ($9.99/mo)' : '/month'}
                        </span>
                      </div>

                      <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                        {plan.features.map((feat: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleStartCheckout(plan)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all tap-active min-h-[40px] ${
                        isCurrent
                          ? 'bg-neutral-800 text-neutral-400 cursor-default'
                          : isPopular
                          ? 'bg-white hover:bg-neutral-200 text-black shadow'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : `Select ${plan.tier === 'PREMIUM_PLUS' ? 'VIP' : 'Premium'}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Step 2: Payment Checkout */}
        {checkoutStep === 'payment' && selectedPlan && (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-serif text-white">Secure Encrypted Checkout</h3>
              <p className="text-xs text-neutral-400 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Server-Side Payment Processing
              </p>
            </div>

            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-white text-sm">
                <span>{selectedPlan.name}</span>
                <span>${selectedPlan.price} {selectedPlan.currency}</span>
              </div>
              <div className="text-neutral-400">Billed securely. Cancel anytime from your account settings.</div>
            </div>

            <div className="space-y-3 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-white"
                  />
                  <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Expiration</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">CVC / Security Code</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCheckoutStep('select')}
                className="w-1/3 py-3 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 tap-active"
              >
                Back
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-2/3 py-3 rounded-xl text-sm font-bold bg-white hover:bg-neutral-200 text-black shadow flex items-center justify-center gap-2 tap-active"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  `Pay $${selectedPlan.price}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {checkoutStep === 'success' && (
          <div className="py-8 text-center space-y-4 max-w-md mx-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h4 className="text-2xl font-bold font-serif text-white">
              Upgrade Confirmed!
            </h4>
            <p className="text-sm text-neutral-300">
              Your {currentUser?.subscriptionTier} membership is now active on your account. Unlimited discovery, verified priority badges, and video dating rooms are ready for you.
            </p>

            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 rounded-xl shadow transition-colors tap-active min-h-[44px]"
            >
              Start Enjoying Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
