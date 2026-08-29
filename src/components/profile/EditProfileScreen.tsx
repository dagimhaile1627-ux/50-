import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import { API } from '../../services/api';
import {
  ChevronLeft,
  Save,
  CheckCircle2,
  Sparkles,
  Camera,
  Trash2,
  Plus,
  Heart,
  User,
  Compass,
  Smile,
  Shield,
  MapPin,
  Sliders,
  X,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { RelationshipGoal } from '../../types';

interface EditProfileScreenProps {
  onBack: () => void;
  onNavigateToPreferences?: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBack,
  onNavigateToPreferences,
}) => {
  const { currentUser, setCurrentUser, refreshAllData } = useApp();

  if (!currentUser) return null;

  const [activeSection, setActiveSection] = useState<
    'photos' | 'about' | 'basic' | 'interests' | 'goals' | 'lifestyle' | 'values' | 'location'
  >('about');

  // Form states
  const [firstName, setFirstName] = useState<string>(currentUser.firstName || '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(currentUser.dateOfBirth || '1962-05-14');
  const [gender, setGender] = useState<string>(currentUser.gender || 'woman');
  const [occupation, setOccupation] = useState<string>(currentUser.occupation || 'Retired Teacher');
  const [retirementStatus, setRetirementStatus] = useState<string>(currentUser.retirementStatus || 'retired');
  const [education, setEducation] = useState<string>(currentUser.education || 'University Degree');
  const [city, setCity] = useState<string>(currentUser.city || currentUser.location?.city || 'Seattle');
  const [state, setState] = useState<string>(currentUser.state || currentUser.location?.state || 'WA');

  // Bio & AI Story
  const [bio, setBio] = useState<string>(currentUser.bio || currentUser.aboutMe || '');
  const [aiRawInput, setAiRawInput] = useState<string>('');
  const [isPolishingBio, setIsPolishingBio] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>('');

  // Photos
  const [photos, setPhotos] = useState<any[]>(currentUser.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [showPhotoAddModal, setShowPhotoAddModal] = useState<boolean>(false);

  // Interests
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [customInterest, setCustomInterest] = useState<string>('');

  // Relationship Goals
  const [relationshipGoals, setRelationshipGoals] = useState<RelationshipGoal[]>(
    currentUser.relationshipGoals || ['companionship']
  );
  const [relationshipExpectations, setRelationshipExpectations] = useState<string>(
    currentUser.relationshipExpectations || ''
  );

  // Lifestyle
  const [activityLevel, setActivityLevel] = useState<string>(
    currentUser.lifestyle?.activityLevel || 'moderate'
  );
  const [exercise, setExercise] = useState<string>(currentUser.lifestyle?.exercise || 'light_walks');
  const [smoking, setSmoking] = useState<string>(currentUser.lifestyle?.smoking || 'non_smoker');
  const [alcohol, setAlcohol] = useState<string>(currentUser.lifestyle?.alcohol || 'social_wine');
  const [livingSituation, setLivingSituation] = useState<string>(
    currentUser.lifestyle?.livingSituation || 'own_home'
  );
  const [petsInput, setPetsInput] = useState<string>(
    currentUser.lifestyle?.pets ? currentUser.lifestyle.pets.join(', ') : 'Golden Retriever'
  );
  const [travelInput, setTravelInput] = useState<string>(
    currentUser.travelPreferences ? currentUser.travelPreferences.join(', ') : 'Scenic Road Trips, National Parks'
  );

  // Values (Family, Honesty, Kindness, Independence, Adventure, Community, Faith, Financial responsibility)
  const [values, setValues] = useState<string[]>(
    currentUser.values || ['Family', 'Honesty', 'Kindness', 'Independence', 'Community']
  );

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  const completion = calculateProfileCompletion({
    ...currentUser,
    firstName,
    bio,
    interests,
    relationshipGoals,
    photos,
    values,
    lifestyle: {
      activityLevel: activityLevel as any,
      smoking: smoking as any,
      alcohol: alcohol as any,
      exercise: exercise as any,
      livingSituation: livingSituation as any,
      morningOrNight: currentUser.lifestyle?.morningOrNight || 'early_bird',
      pets: petsInput.split(',').map((p) => p.trim()).filter(Boolean),
    },
  });

  const availableInterests = [
    'Gardening & Plants',
    'Walking & Hiking',
    'Reading & Book Clubs',
    'Classical Music',
    'Jazz & Acoustic',
    'Cooking & Baking',
    'Art & Museums',
    'Travel & Road Trips',
    'History & Genealogy',
    'Theater & Opera',
    'Board Games & Cards',
    'Birdwatching & Nature',
    'Volunteering & Charity',
    'Coffee & Pastries',
    'Photography',
    'Wine Tasting',
    'Golf & Pickleball',
    'Yoga & Stretching',
  ];

  const availableValues = [
    'Family',
    'Honesty & Integrity',
    'Kindness & Compassion',
    'Independence',
    'Adventure & Curiosity',
    'Community & Giving Back',
    'Faith & Spirituality',
    'Financial Responsibility',
    'Lifelong Learning',
    'Patience & Humor',
  ];

  const availableGoals: Array<{ id: RelationshipGoal; label: string; desc: string }> = [
    { id: 'companionship', label: 'Companionship', desc: 'Sharing daily joys, meals, walks, and meaningful conversation' },
    { id: 'serious_relationship', label: 'Long-term Relationship', desc: 'Committed, loving partnership built for the future' },
    { id: 'marriage', label: 'Marriage', desc: 'Lifelong union and mutual devotion' },
    { id: 'friendship', label: 'Friendship First', desc: 'Getting to know each other gently as trusted companions' },
    { id: 'dating', label: 'Dating', desc: 'Enjoying outings and seeing where genuine connection leads' },
    { id: 'travel_companionship', label: 'Travel Partner', desc: 'Exploring national parks, cruises, and scenic getaways together' },
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      setValues(values.filter((v) => v !== val));
    } else {
      setValues([...values, val]);
    }
  };

  const toggleGoal = (goal: RelationshipGoal) => {
    if (relationshipGoals.includes(goal)) {
      if (relationshipGoals.length > 1) {
        setRelationshipGoals(relationshipGoals.filter((g) => g !== goal));
      }
    } else {
      setRelationshipGoals([...relationshipGoals, goal]);
    }
  };

  const handlePolishBioWithAI = async () => {
    const textToPolish = aiRawInput.trim() || bio.trim();
    if (!textToPolish) {
      setAiMessage('Please write a few notes or a draft story first.');
      return;
    }
    setIsPolishingBio(true);
    setAiMessage('');
    try {
      const res = await API.parseBioWithAI(textToPolish);
      if (res && res.polishedBio) {
        setBio(res.polishedBio);
        setAiMessage('Your bio has been gracefully refined below! You can edit any sentence.');
      }
    } catch (err: any) {
      setAiMessage('Could not refine bio right now. Please try again.');
    } finally {
      setIsPolishingBio(false);
    }
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const newP = {
      id: `photo_${Date.now()}`,
      url: newPhotoUrl.trim(),
      isPrimary: photos.length === 0,
      moderationStatus: 'APPROVED' as const,
    };
    setPhotos([...photos, newP]);
    setNewPhotoUrl('');
    setShowPhotoAddModal(false);
  };

  const handleSetPrimaryPhoto = (index: number) => {
    const updated = photos.map((p, i) => ({
      ...p,
      isPrimary: i === index,
    }));
    setPhotos(updated);
  };

  const handleDeletePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((p) => p.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setPhotos(updated);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const pets = petsInput.split(',').map((p) => p.trim()).filter(Boolean);
      const travel = travelInput.split(',').map((t) => t.trim()).filter(Boolean);

      const updatedUser = await API.updateMe({
        firstName,
        dateOfBirth,
        gender: gender as any,
        occupation,
        retirementStatus: retirementStatus as any,
        education,
        city,
        state,
        bio,
        aboutMe: bio,
        photos,
        interests,
        relationshipGoals,
        relationshipExpectations,
        values,
        travelPreferences: travel,
        lifestyle: {
          activityLevel: activityLevel as any,
          morningOrNight: currentUser.lifestyle?.morningOrNight || 'early_bird',
          smoking: smoking as any,
          alcohol: alcohol as any,
          pets,
          exercise: exercise as any,
          livingSituation: livingSituation as any,
        },
      });

      setCurrentUser(updatedUser);
      setSaveSuccess(true);
      refreshAllData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const sections: Array<{ id: typeof activeSection; label: string; icon: React.ElementType }> = [
    { id: 'about', label: 'About Me', icon: User },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'interests', label: 'Interests', icon: Compass },
    { id: 'goals', label: 'Goals', icon: Heart },
    { id: 'lifestyle', label: 'Lifestyle', icon: Smile },
    { id: 'values', label: 'Values', icon: Shield },
    { id: 'location', label: 'Location', icon: MapPin },
  ];

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Top Header & Save Button */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-edit-profile-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Edit Your Profile
        </h2>

        <button
          id="btn-edit-profile-save"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-black transition-all tap-active shadow-md disabled:opacity-60"
        >
          <Save className="w-4 h-4 text-black" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Completion Indicator (Non-aggressive) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
          <span className="text-neutral-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-white" />
            <span>Profile Completion</span>
          </span>
          <span className="font-bold text-white">{completion.percentage}%</span>
        </div>
        <div className="w-full bg-neutral-950 rounded-full h-2.5 border border-neutral-800 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>
        <p className="text-xs text-neutral-400">
          {completion.message}
        </p>
      </div>

      {/* Feedback Messages */}
      {saveSuccess && (
        <div className="bg-neutral-900 border border-neutral-700 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span className="font-bold">Profile changes saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="bg-neutral-900 border border-red-800 text-red-300 text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {sections.map((s) => {
          const Icon = s.icon;
          const isSelected = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border tap-active ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ABOUT ME & AI WRITING ASSISTANT */}
      {activeSection === 'about' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-white" />
              <span>About Me (Biography)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Introduce yourself warmly. Write about your favorite morning routine, past stories, and what brings you happiness.
            </p>
          </div>

          <textarea
            id="input-edit-bio"
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="I enjoy morning coffee with a good book, quiet walks around green parks, and warm conversation over dinner..."
            className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm sm:text-base placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
          />

          {/* AI Bio Writing Assistant */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Need Inspiration? AI Bio Assistant</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Jot down quick thoughts (e.g. "I love gardening, retired teacher, looking for someone kind to travel with") and let our assistant polish it gracefully.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiRawInput}
                onChange={(e) => setAiRawInput(e.target.value)}
                placeholder="Type a few rough notes or keywords..."
                className="flex-1 bg-neutral-950 border border-neutral-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={handlePolishBioWithAI}
                disabled={isPolishingBio}
                className="bg-white hover:bg-neutral-200 text-black px-4 py-2.5 rounded-xl text-xs font-black transition-all tap-active shrink-0 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                {isPolishingBio ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-black" />}
                <span>{isPolishingBio ? 'Polishing...' : 'Polish Bio'}</span>
              </button>
            </div>

            {aiMessage && (
              <p className="text-xs text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                {aiMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: PHOTOS */}
      {activeSection === 'photos' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-white" />
                <span>Your Photos ({photos.length})</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Clear, smiling, recent photos help genuine companions get to know you safely.
              </p>
            </div>

            <button
              onClick={() => setShowPhotoAddModal(true)}
              className="flex items-center gap-1.5 bg-white text-black px-3.5 py-2 rounded-xl text-xs font-bold transition-all tap-active shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                className="relative bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden aspect-[4/5] group"
              >
                <img
                  src={photo.url}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {photo.isPrimary && (
                  <span className="absolute top-2 left-2 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                    Main Photo
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 flex items-center justify-between gap-1">
                  {!photo.isPrimary && (
                    <button
                      onClick={() => handleSetPrimaryPhoto(idx)}
                      className="text-[11px] bg-neutral-800 hover:bg-white hover:text-black text-white px-2 py-1 rounded-lg font-bold transition-colors"
                    >
                      Make Main
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(idx)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors ml-auto"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Photo Modal / Prompt */}
          {showPhotoAddModal && (
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Add Photo by Image URL</span>
                <button
                  onClick={() => setShowPhotoAddModal(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowPhotoAddModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPhoto}
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-black shadow-md"
                >
                  Add Photo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: BASIC INFORMATION */}
      {activeSection === 'basic' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-white" />
              <span>Basic Information</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              General details about yourself. (Must be 50+ to participate).
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
                >
                  <option value="woman">Woman</option>
                  <option value="man">Man</option>
                  <option value="non_binary">Non-Binary</option>
                  <option value="prefer_not_to_say">Prefer Not to Say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Occupation / Past Career
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Retirement Status
                </label>
                <select
                  value={retirementStatus}
                  onChange={(e) => setRetirementStatus(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
                >
                  <option value="retired">Fully Retired</option>
                  <option value="semi_retired">Semi-Retired</option>
                  <option value="working_part_time">Working Part-Time</option>
                  <option value="working_full_time">Working Full-Time</option>
                  <option value="volunteer">Community Volunteer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Education
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="College, Trade School, Post-Graduate, etc."
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: INTERESTS */}
      {activeSection === 'interests' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-white" />
              <span>Interests & Activities ({interests.length} selected)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select what you love doing so we can introduce companions who enjoy similar outings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => {
              const isSelected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border tap-active ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-sm font-bold'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {isSelected && '✓ '}
                  {interest}
                </button>
              );
            })}
          </div>

          {/* Add Custom Interest */}
          <div className="pt-2 border-t border-neutral-900 flex items-center gap-2">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Add another hobby (e.g. Woodworking, Kayaking)..."
              className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomInterest()}
            />
            <button
              type="button"
              onClick={handleAddCustomInterest}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold border border-neutral-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* SECTION 5: RELATIONSHIP GOALS */}
      {activeSection === 'goals' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-white" />
              <span>Relationship Intentions</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Clear intentions foster honest relationships without misaligned expectations.
            </p>
          </div>

          <div className="space-y-2.5">
            {availableGoals.map((goal) => {
              const isSelected = relationshipGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all tap-active flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-black bg-black' : 'border-neutral-500'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className={`text-sm sm:text-base font-bold block ${isSelected ? 'text-black' : 'text-white'}`}>
                      {goal.label}
                    </span>
                    <span className={`text-xs block mt-0.5 ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                      {goal.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Expectations in a Partner (Optional)
            </label>
            <input
              type="text"
              value={relationshipExpectations}
              onChange={(e) => setRelationshipExpectations(e.target.value)}
              placeholder="e.g. Honesty, good sense of humor, kindness, mutual respect..."
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
            />
          </div>
        </div>
      )}

      {/* SECTION 6: LIFESTYLE */}
      {activeSection === 'lifestyle' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smile className="w-4 h-4 text-white" />
              <span>Lifestyle & Habits</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Help prospective partners understand your rhythm and everyday lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              >
                <option value="daily_active">Very Active (Daily fitness & outdoors)</option>
                <option value="moderate">Moderate (Regular walks & gentle outings)</option>
                <option value="relaxed">Relaxed (Quiet pace, reading & gardening)</option>
                <option value="homebody">Comfortable Homebody</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Exercise Habits
              </label>
              <select
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              >
                <option value="daily">Daily workouts or long walks</option>
                <option value="several_times_week">A few times a week</option>
                <option value="light_walks">Gentle daily walks</option>
                <option value="rarely">Rarely / As mood strikes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Smoking
              </label>
              <select
                value={smoking}
                onChange={(e) => setSmoking(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              >
                <option value="non_smoker">Non-Smoker</option>
                <option value="occasional">Occasional / Social</option>
                <option value="regular">Regular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Alcohol
              </label>
              <select
                value={alcohol}
                onChange={(e) => setAlcohol(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              >
                <option value="non_drinker">Non-Drinker</option>
                <option value="social_wine">Social Wine / Beer with Meals</option>
                <option value="regular">Regular</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Pets
            </label>
            <input
              type="text"
              value={petsInput}
              onChange={(e) => setPetsInput(e.target.value)}
              placeholder="e.g. Golden Retriever, 1 Cat, None"
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Travel Preferences
            </label>
            <input
              type="text"
              value={travelInput}
              onChange={(e) => setTravelInput(e.target.value)}
              placeholder="e.g. Scenic road trips, European river cruises, Coast cabin weekends"
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
            />
          </div>
        </div>
      )}

      {/* SECTION 7: VALUES */}
      {activeSection === 'values' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              <span>Values & Principles (Optional)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select values that guide your life. We never pressure you to disclose sensitive information.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {availableValues.map((val) => {
              const isSelected = values.includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggleValue(val)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all border tap-active flex items-center gap-2 ${
                    isSelected
                      ? 'bg-white text-black border-white font-bold shadow-md'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>{isSelected ? '★' : '☆'}</span>
                  <span>{val}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 8: LOCATION & DATING PREFERENCES SHORTCUT */}
      {activeSection === 'location' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white" />
              <span>Location & Privacy</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Your exact address is NEVER shared. Other verified members only see approximate distance (e.g. "About 8 miles away").
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {onNavigateToPreferences && (
            <div className="pt-2 border-t border-neutral-900">
              <button
                type="button"
                onClick={onNavigateToPreferences}
                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white p-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors tap-active"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-white" />
                  <span>Configure Match Search Distance & Age Ranges</span>
                </div>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save Button Footer */}
      <div className="pt-2">
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 px-4 rounded-2xl text-base transition-all tap-active flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
        >
          <Save className="w-5 h-5 text-black" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </div>
    </div>
  );
};
