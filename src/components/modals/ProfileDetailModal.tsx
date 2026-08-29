import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Heart,
  MapPin,
  Briefcase,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const ProfileDetailModal: React.FC = () => {
  const {
    selectedProfileDetail,
    setSelectedProfileDetail,
    handleLike,
    handlePass,
    setShowSafetyReportModal,
  } = useApp();

  if (!selectedProfileDetail) return null;

  const profile = selectedProfileDetail;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-xl w-full my-auto overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProfileDetail(null)}
          className="absolute top-4 right-4 z-20 bg-black/80 hover:bg-neutral-800 text-white p-2 rounded-full border border-neutral-700 tap-active"
          title="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 space-y-5 pb-6">
          {/* Main Photo & Header */}
          <div className="relative h-80 sm:h-96 w-full bg-neutral-900">
            <img
              src={profile.photos?.[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'}
              alt={profile.firstName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

            {/* Verified Badge */}
            {profile.verificationBadge && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/90 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full border border-neutral-600">
                <CheckCircle2 className="w-4 h-4 text-white" />
                Verified 50+ Member
              </div>
            )}

            {/* Title & Age */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold font-serif">{profile.firstName}</h2>
                <span className="text-2xl font-light text-neutral-300">({profile.age})</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-neutral-300 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-white" />
                  {profile.location?.city || profile.city || 'Seattle'}, {profile.location?.state || profile.state || 'WA'} ({profile.location?.distanceMiles ?? profile.distanceMiles ?? 0} mi away)
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-white" />
                  {profile.occupation}
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 space-y-5">
            {/* Compatibility Breakdown */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold tracking-wider text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-white" />
                  Compatibility Analysis ({profile.compatibilityScore || 90}%)
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-200">
                {(profile.compatibilityReasons || [
                  `Both seeking ${profile.relationshipGoals?.map(g => g.replace(/_/g, ' ')).join(' & ') || 'Companionship'}`,
                  `Complementary active schedules and calm communication style`,
                  `Close proximity in the Pacific Northwest`
                ]).map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-white font-bold mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                About {profile.firstName}
              </h4>
              <p className="text-neutral-200 text-sm sm:text-base leading-relaxed italic bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                "{profile.bio}"
              </p>
            </div>

            {/* Relationship Goals & Expectations */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-white">
                What {profile.firstName} is Seeking
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.relationshipGoals?.map((g) => (
                  <span
                    key={g}
                    className="bg-white text-black text-xs px-3 py-1 rounded-full font-bold capitalize"
                  >
                    {g.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 pt-1">
                <strong>Expectations:</strong> {profile.relationshipExpectations}
              </p>
            </div>

            {/* Lifestyle & Key Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-0.5">
                <span className="text-neutral-400">Retirement Status:</span>
                <div className="font-bold text-white capitalize">
                  {profile.retirementStatus?.replace(/_/g, ' ') || 'Retired'}
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-0.5">
                <span className="text-neutral-400">Daily Rhythm:</span>
                <div className="font-bold text-white capitalize">
                  {profile.lifestyle?.morningOrNight?.replace(/_/g, ' ') || 'Early Riser'}
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-0.5">
                <span className="text-neutral-400">Relationship Status:</span>
                <div className="font-bold text-white capitalize">
                  {profile.relationshipStatus?.replace(/_/g, ' ') || 'Single'}
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-0.5">
                <span className="text-neutral-400">Communication:</span>
                <div className="font-bold text-white capitalize">
                  {profile.communicationStyle?.replace(/_/g, ' ') || 'Thoughtful'}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                Interests & Hobbies
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest) => (
                  <span
                    key={interest}
                    className="bg-neutral-900 text-neutral-200 border border-neutral-750 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Photos if available */}
            {profile.photos && profile.photos.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                  More Photos
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {profile.photos.slice(1).map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt="Additional"
                      className="w-full h-44 object-cover rounded-xl border border-neutral-800"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Report / Safety button */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  setSelectedProfileDetail(null);
                  setShowSafetyReportModal({ open: true, targetUser: profile });
                }}
                className="text-neutral-400 hover:text-white text-xs flex items-center gap-1 transition-colors tap-active p-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Report profile concern or block member
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Footer */}
        <div className="bg-neutral-950 border-t border-neutral-800 p-4 flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              handlePass(profile.id);
              setSelectedProfileDetail(null);
            }}
            className="flex-1 py-3.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tap-active min-h-[48px]"
          >
            Pass
          </button>

          <button
            onClick={() => {
              handleLike(profile);
              setSelectedProfileDetail(null);
            }}
            className="flex-2 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg tap-active min-h-[48px]"
          >
            <Heart className="w-5 h-5 fill-black text-black" />
            <span>Connect with {profile.firstName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

