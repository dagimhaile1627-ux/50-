import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, MessageSquare, Video, Calendar, Sparkles, CheckCircle2, Star, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { calculateCompatibility } from '../../utils/compatibility';

export const MatchesTab: React.FC = () => {
  const {
    currentUser,
    matches,
    setActiveConversation,
    setActiveTab,
    setShowVideoDateModal,
    setShowDatePlannerModal,
    setSelectedProfileDetail,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'favorites'>('all');
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  const displayedMatches = activeSubTab === 'favorites' ? matches.filter((m) => m.isFavorite) : matches;

  return (
    <div className="space-y-5 pb-8 text-white">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-white fill-white" />
            Your Mutual Connections
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300">
            People who share mutual interest with you. Every connection is verified and compatibility-scored.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'all' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({matches.length})
          </button>
          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              activeSubTab === 'favorites' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${activeSubTab === 'favorites' ? 'fill-black text-black' : 'text-neutral-400'}`} />
            Favorites ({matches.filter((m) => m.isFavorite).length})
          </button>
        </div>
      </div>

      {displayedMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMatches.map((match) => {
            const user = match.user;
            if (!user) return null;

            const compat = currentUser ? calculateCompatibility(currentUser, user) : {
              overallScore: match.compatibilityScore || 88,
              interestScore: 26,
              relationshipGoalScore: 24,
              locationScore: 18,
              lifestyleScore: 13,
              agePreferenceScore: 9,
              sharedInterests: user.interests.slice(0, 2),
              sharedGoals: user.relationshipGoals,
              lifestyleMatches: ['Active lifestyle', 'Non-smoker'],
              distanceKm: 8,
              reasons: user.compatibilityReasons || ['Mutual values', 'Close location'],
            };

            const isExpanded = expandedBreakdownId === match.id;

            return (
              <div
                key={match.id}
                className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-5 shadow-xl space-y-4 transition-all"
              >
                {/* Profile row */}
                <div className="flex items-start gap-4">
                  <div
                    className="relative cursor-pointer shrink-0"
                    onClick={() => setSelectedProfileDetail(user)}
                  >
                    <img
                      src={user.photos[0]?.url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'}
                      alt={user.firstName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-neutral-700 shadow"
                      referrerPolicy="no-referrer"
                    />
                    {user.verificationBadge && (
                      <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-0.5 border border-black shadow">
                        <CheckCircle2 className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3
                        onClick={() => setSelectedProfileDetail(user)}
                        className="text-lg sm:text-xl font-bold font-serif text-white hover:underline cursor-pointer truncate"
                      >
                        {user.firstName}, {user.age}
                      </h3>
                      <span className="bg-white text-black text-xs font-black px-2.5 py-0.5 rounded-full shrink-0 shadow">
                        {compat.overallScore}% Match
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 mt-0.5 font-medium">
                      📍 {user.city || user.location?.city || 'Seattle'}, {user.state || user.location?.state || 'WA'} • {user.occupation || 'Retired'}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.relationshipGoals.map((g) => (
                        <span
                          key={g}
                          className="bg-neutral-900 text-neutral-200 border border-neutral-800 text-[10px] px-2.5 py-0.5 rounded-full capitalize font-semibold"
                        >
                          {g.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compatibility Highlight & Factors */}
                <div className="bg-neutral-900 rounded-2xl p-3.5 text-xs text-neutral-200 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" /> Compatibility Highlights:
                    </span>
                    <button
                      onClick={() => setExpandedBreakdownId(isExpanded ? null : match.id)}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-0.5 font-medium tap-active"
                    >
                      {isExpanded ? 'Hide Breakdown' : 'See Score Breakdown'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <ul className="space-y-1 text-xs text-neutral-300">
                    {compat.reasons.slice(0, 2).map((factor, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-white text-xs">✓</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Expandable Breakdown Bars */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-neutral-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <div className="flex justify-between text-neutral-400 mb-0.5">
                            <span>Relationship Goals</span>
                            <span className="text-white font-bold">{Math.round((compat.relationshipGoalScore / 25) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white" style={{ width: `${Math.round((compat.relationshipGoalScore / 25) * 100)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-neutral-400 mb-0.5">
                            <span>Interests & Hobbies</span>
                            <span className="text-white font-bold">{Math.round((compat.interestScore / 30) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white" style={{ width: `${Math.round((compat.interestScore / 30) * 100)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-neutral-400 mb-0.5">
                            <span>Lifestyle Pace</span>
                            <span className="text-white font-bold">{Math.round((compat.lifestyleScore / 15) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white" style={{ width: `${Math.round((compat.lifestyleScore / 15) * 100)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-neutral-400 mb-0.5">
                            <span>Location Match</span>
                            <span className="text-white font-bold">{Math.round((compat.locationScore / 20) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white" style={{ width: `${Math.round((compat.locationScore / 20) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Toolbar (Messaging, Video Date, Public Date Planner) */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setActiveConversation({
                        id: `conv_user_me_${user.id}`,
                        participant: user,
                        unreadCount: 0,
                        isPausedDueToRisk: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                      setActiveTab('messages');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black flex items-center justify-center gap-1.5 transition-colors min-h-[44px] tap-active shadow"
                  >
                    <MessageSquare className="w-4 h-4 text-black" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setShowVideoDateModal(true)}
                    className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px] tap-active"
                    title="Start private Video Date"
                  >
                    <Video className="w-4 h-4 text-white" />
                    <span>Video</span>
                  </button>

                  <button
                    onClick={() => setShowDatePlannerModal(true)}
                    className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px] tap-active"
                    title="Plan verified public meetup"
                  >
                    <Calendar className="w-4 h-4 text-white" />
                    <span>Plan Date</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 text-center space-y-3">
          <Heart className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-lg font-bold font-serif">No mutual connections found yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Discover verified adults 50+ in your area and send a like to connect.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="bg-white hover:bg-neutral-200 text-black font-black text-xs px-6 py-2.5 rounded-xl shadow tap-active"
          >
            Explore Profiles in Discover →
          </button>
        </div>
      )}
    </div>
  );
};


