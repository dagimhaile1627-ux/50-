import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import {
  User,
  Edit3,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Heart,
  Sparkles,
  Compass,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cigarette,
  Wine,
  Activity,
  Home,
  Plane,
  Dog,
  Sun,
  Shield,
  Smile,
  Globe,
} from 'lucide-react';

interface ViewMyProfileScreenProps {
  onBack: () => void;
  onEdit: () => void;
}

export const ViewMyProfileScreen: React.FC<ViewMyProfileScreenProps> = ({ onBack, onEdit }) => {
  const { currentUser } = useApp();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  if (!currentUser) return null;

  const completion = calculateProfileCompletion(currentUser);
  const photos = currentUser.photos && currentUser.photos.length > 0
    ? currentUser.photos
    : [
        {
          id: 'default_photo',
          url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
          isPrimary: true,
          moderationStatus: 'APPROVED' as const,
        },
      ];

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  const goalLabels: Record<string, string> = {
    serious_relationship: 'Long-term Relationship',
    marriage: 'Marriage & Lifetime Partnership',
    companionship: 'Companionship & Shared Life',
    friendship: 'Friendship First',
    dating: 'Casual & Meaningful Dating',
    travel_companionship: 'Travel Companionship',
    activity_partner: 'Activity & Hobby Partner',
  };

  const lifestyle = currentUser.lifestyle || {
    activityLevel: 'moderate',
    morningOrNight: 'early_bird',
    smoking: 'non_smoker',
    alcohol: 'social_wine',
    pets: ['Golden Retriever'],
    exercise: 'daily',
    livingSituation: 'own_home',
  };

  const valuesList = currentUser.values && currentUser.values.length > 0
    ? currentUser.values
    : ['Family', 'Honesty', 'Kindness', 'Independence', 'Community'];

  return (
    <div className="space-y-5 pb-8 text-white select-none">
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-view-profile-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Full Profile Preview
        </h2>

        <button
          id="btn-view-profile-edit"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-black transition-all tap-active shadow-md"
        >
          <Edit3 className="w-4 h-4 text-black" />
          <span>Edit</span>
        </button>
      </div>

      {/* Main Profile Card Header */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Photo Gallery Carousel */}
        <div className="relative h-80 sm:h-96 w-full bg-neutral-900 overflow-hidden group">
          <img
            src={currentPhoto.url}
            alt={`${currentUser.firstName} photo ${selectedPhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Photo Count Dots / Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-neutral-600 transition-all tap-active"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-neutral-600 transition-all tap-active"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700">
                {photos.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`cursor-pointer rounded-full transition-all ${
                      selectedPhotoIndex === idx
                        ? 'w-4 h-1.5 bg-white'
                        : 'w-1.5 h-1.5 bg-neutral-500 hover:bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Verification Badge Overlay */}
          {currentUser.verificationStatus === 'VERIFIED' && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-neutral-600 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Verified 50+</span>
            </div>
          )}
        </div>

        {/* Profile Header Details */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                  {currentUser.firstName}, {currentUser.age}
                </h1>
                {currentUser.verificationStatus === 'VERIFIED' && (
                  <span className="bg-white text-black text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Verified ID
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-neutral-300 text-sm mt-1">
                <MapPin className="w-4 h-4 text-white shrink-0" />
                <span>
                  {currentUser.city || currentUser.location?.city || 'Seattle'}, {currentUser.state || currentUser.location?.state || 'WA'}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">Approximate local area</span>
              </div>
            </div>

            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all tap-active shrink-0"
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Profile Completion Indicator */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Profile Completeness</span>
              </span>
              <span className="font-bold text-white">{completion.percentage}%</span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-2 border border-neutral-800 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: About Me */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-2.5 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <User className="w-4 h-4 text-white" />
          <span>About Me</span>
        </h3>
        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed whitespace-pre-line">
          {currentUser.bio || currentUser.aboutMe || 'No biography provided yet. Tap Edit Profile to share a few heartfelt words about your life and story.'}
        </p>
      </div>

      {/* Section: Relationship Goals */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Heart className="w-4 h-4 text-white" />
          <span>What I'm Looking For</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {(currentUser.relationshipGoals || ['companionship']).map((goal, idx) => (
            <span
              key={idx}
              className="bg-white text-black font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-black text-black" />
              <span>{goalLabels[goal] || goal.replace(/_/g, ' ')}</span>
            </span>
          ))}
        </div>
        {currentUser.relationshipExpectations && (
          <p className="text-xs sm:text-sm text-neutral-300 italic pt-1 border-t border-neutral-900">
            "{currentUser.relationshipExpectations}"
          </p>
        )}
      </div>

      {/* Section: Interests & Passions */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Compass className="w-4 h-4 text-white" />
          <span>Interests & Activities</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {(currentUser.interests || ['Gardening', 'Walking', 'Reading', 'Classical Music']).map((interest, idx) => (
            <span
              key={idx}
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-100 border border-neutral-700 text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-semibold shadow-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Section: Values */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-white" />
          <span>Values & Principles</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {valuesList.map((val, idx) => (
            <span
              key={idx}
              className="bg-neutral-900 text-white border border-neutral-700 text-xs sm:text-sm px-3.5 py-1.5 rounded-full font-bold shadow-sm"
            >
              ✨ {val}
            </span>
          ))}
        </div>
      </div>

      {/* Section: Lifestyle & Daily Rhythm */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Smile className="w-4 h-4 text-white" />
          <span>Lifestyle & Rhythm</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {/* Work / Retirement */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="text-neutral-400 block text-[11px]">Work / Retirement</span>
              <span className="text-white font-semibold capitalize">
                {currentUser.retirementStatus ? currentUser.retirementStatus.replace(/_/g, ' ') : 'Retired'}
              </span>
            </div>
          </div>

          {/* Activity / Exercise */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <Activity className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="text-neutral-400 block text-[11px]">Daily Rhythm</span>
              <span className="text-white font-semibold capitalize">
                {lifestyle.activityLevel ? `${lifestyle.activityLevel} activity` : 'Moderate activity'}
              </span>
            </div>
          </div>

          {/* Smoking */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <Cigarette className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="text-neutral-400 block text-[11px]">Smoking</span>
              <span className="text-white font-semibold capitalize">
                {lifestyle.smoking ? lifestyle.smoking.replace(/_/g, ' ') : 'Non-smoker'}
              </span>
            </div>
          </div>

          {/* Alcohol */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <Wine className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="text-neutral-400 block text-[11px]">Alcohol</span>
              <span className="text-white font-semibold capitalize">
                {lifestyle.alcohol ? lifestyle.alcohol.replace(/_/g, ' ') : 'Social wine with dinner'}
              </span>
            </div>
          </div>

          {/* Pets */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <Dog className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="text-neutral-400 block text-[11px]">Pets</span>
              <span className="text-white font-semibold">
                {lifestyle.pets && lifestyle.pets.length > 0 ? lifestyle.pets.join(', ') : 'No pets currently'}
              </span>
            </div>
          </div>

          {/* Living Situation */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <Home className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="text-neutral-400 block text-[11px]">Living Situation</span>
              <span className="text-white font-semibold capitalize">
                {lifestyle.livingSituation ? lifestyle.livingSituation.replace(/_/g, ' ') : 'Owns Home'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Action Footer */}
      <div className="pt-2">
        <button
          onClick={onEdit}
          className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 px-4 rounded-2xl text-base transition-all tap-active flex items-center justify-center gap-2 shadow-lg"
        >
          <Edit3 className="w-5 h-5 text-black" />
          <span>Edit Profile Details</span>
        </button>
      </div>
    </div>
  );
};
