import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, MessageSquare, Sparkles, X } from 'lucide-react';

export const MatchCelebrationModal: React.FC = () => {
  const { newMatchModal, setNewMatchModal, currentUser, setActiveConversation, setActiveTab } = useApp();

  if (!newMatchModal) return null;

  const partner = newMatchModal;

  const handleStartChat = () => {
    setActiveConversation({
      id: `conv_user_me_${partner.id}`,
      participant: partner,
      unreadCount: 0,
      isPausedDueToRisk: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewMatchModal(null);
    setActiveTab('messages');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        <button
          onClick={() => setNewMatchModal(null)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 tap-active"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-neutral-900 text-white border border-neutral-700 px-3.5 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-4 h-4 text-white" />
            Mutual Connection
          </div>
          <h3 className="text-3xl font-bold font-serif text-white">
            It's a Match!
          </h3>
          <p className="text-sm text-neutral-300">
            You and <strong className="text-white">{partner.firstName}</strong> both expressed interest in connecting.
          </p>
        </div>

        {/* Dual Avatars */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="relative">
            <img
              src={currentUser?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'}
              alt="You"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg border-2 border-black">
            <Heart className="w-6 h-6 fill-black text-black" />
          </div>

          <div className="relative">
            <img
              src={partner.photos?.[0]?.url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'}
              alt={partner.firstName}
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 space-y-1">
          <div className="font-bold text-white">Why You Connected:</div>
          <p>
            You both seek {partner.relationshipGoals?.map(g => g.replace(/_/g, ' ')).join(' & ') || 'Companionship'} and share a relaxed lifestyle pace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleStartChat}
            className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-base flex items-center justify-center gap-2 tap-active min-h-[48px]"
          >
            <MessageSquare className="w-5 h-5 text-black" />
            Send a Thoughtful Greeting
          </button>
          <button
            onClick={() => setNewMatchModal(null)}
            className="w-full text-xs sm:text-sm text-neutral-400 hover:text-white py-2 font-semibold tap-active"
          >
            Keep Exploring Profiles
          </button>
        </div>
      </div>
    </div>
  );
};

