import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Heart,
  MessageCircle,
  Eye,
  Sliders,
  Plane,
  Star,
  Check,
} from 'lucide-react';
import { SubscriptionTier } from '../../types';

interface MembershipScreenProps {
  onBack: () => void;
}

export const MembershipScreen: React.FC<MembershipScreenProps> = ({ onBack }) => {
  const { currentUser, setCurrentUser, refreshAllData } = useApp();

  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string>('');
  const [upgradeError, setUpgradeError] = useState<string>('');

  if (!currentUser) return null;

  const currentTier = currentUser.subscriptionTier || 'FREE';

  const handleSelectTier = async (tier: SubscriptionTier) => {
    if (tier === currentTier) return;
    setIsUpgrading(true);
    setUpgradeSuccess('');
    setUpgradeError('');

    try {
      const res = await API.upgradeTier(tier);
      if (res && res.user) {
        setCurrentUser(res.user);
      }
      setUpgradeSuccess(`Your membership has been upgraded to ${tier === 'FREE' ? 'Standard' : 'Golden Dignity Premium'}!`);
      refreshAllData();
    } catch (err: any) {
      setUpgradeError(err.message || 'Could not process membership update.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-membership-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Membership & Plans
        </h2>

        <div className="w-12" />
      </div>

      {upgradeSuccess && (
        <div className="bg-neutral-900 border border-neutral-700 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span className="font-bold">{upgradeSuccess}</span>
        </div>
      )}

      {upgradeError && (
        <div className="bg-neutral-900 border border-red-800 text-red-300 text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>{upgradeError}</span>
        </div>
      )}

      {/* Philosophy Callout: Safety is Never Paywalled */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span>Our SilverHeart Fair Guarantee</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Essential safety features, blocking, reporting, verified badge identity checks, and real-time chat with mutual matches are ALWAYS 100% free and will never be behind a paywall.
        </p>
      </div>

      {/* PLAN 1: STANDARD (FREE FOREVER) */}
      <div className={`bg-neutral-950 border rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg transition-all ${
        currentTier === 'FREE' ? 'border-neutral-500' : 'border-neutral-800'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-neutral-400">Standard Tier</span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5">Free Member</h3>
            <p className="text-xs text-neutral-400 mt-1">Full access to meaningful dating and safe communication.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white">$0</span>
            <span className="text-xs text-neutral-400 block">Forever free</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-neutral-900 text-xs sm:text-sm">
          {[
            'Complete Profile & Bio Creation',
            'Full Discover Feed & Local Recommendations',
            'Mutual Matching & Unlimited Messaging with Matches',
            'Safety Center, Reporting, Blocking & 50+ Scam Guide',
            'Identity Verification & 50+ Verified Badge Check',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-neutral-200">
              <Check className="w-4 h-4 text-white shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <button
          disabled={currentTier === 'FREE' || isUpgrading}
          onClick={() => handleSelectTier('FREE')}
          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all tap-active ${
            currentTier === 'FREE'
              ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 cursor-default'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700'
          }`}
        >
          {currentTier === 'FREE' ? '✓ Your Current Plan' : 'Switch to Free Plan'}
        </button>
      </div>

      {/* PLAN 2: GOLDEN DIGNITY PREMIUM */}
      <div className={`bg-neutral-950 border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden ${
        currentTier !== 'FREE' ? 'border-white ring-1 ring-white' : 'border-neutral-700'
      }`}>
        <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-md">
          Most Popular
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-white" />
              <span className="text-xs font-black uppercase tracking-wider text-white">Golden Dignity</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5">Premium Companion</h3>
            <p className="text-xs text-neutral-300 mt-1">Enhanced insights and advanced discovery filters.</p>
          </div>
          <div className="text-right pt-4">
            <span className="text-2xl font-extrabold text-white">$14.99</span>
            <span className="text-xs text-neutral-400 block">per month</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-neutral-900 text-xs sm:text-sm">
          {[
            'See Everyone Who Liked Your Profile Instantly',
            'Unlimited Likes & Direct Introduction Notes',
            'Advanced Lifestyle & Values Search Filters',
            'Travel Mode: Connect with companions in upcoming destinations',
            'AI Profile Bio Polish & Conversation Icebreaker Assistant',
            'Priority Identity Verification Processing',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-neutral-100">
              <Star className="w-4 h-4 text-white shrink-0 fill-white" />
              <span className="font-medium">{feature}</span>
            </div>
          ))}
        </div>

        <button
          disabled={currentTier !== 'FREE' || isUpgrading}
          onClick={() => handleSelectTier('GOLDEN_PREMIUM')}
          className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all tap-active shadow-lg flex items-center justify-center gap-2 ${
            currentTier !== 'FREE'
              ? 'bg-neutral-900 text-neutral-300 border border-neutral-700'
              : 'bg-white hover:bg-neutral-200 text-black'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>{currentTier !== 'FREE' ? '✓ Golden Dignity Active' : 'Upgrade to Golden Dignity'}</span>
        </button>
      </div>
    </div>
  );
};
