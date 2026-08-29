import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Heart,
  User,
  Compass,
  Smile,
} from 'lucide-react';
import { RelationshipGoal } from '../../types';

interface DatingPreferencesScreenProps {
  onBack: () => void;
}

export const DatingPreferencesScreen: React.FC<DatingPreferencesScreenProps> = ({ onBack }) => {
  const { currentUser, setCurrentUser, discoveryFilter, setDiscoveryFilter, refreshAllData } =
    useApp();

  const savedPrefs = currentUser?.datingPreferences || {
    ageMin: discoveryFilter.ageMin || 50,
    ageMax: discoveryFilter.ageMax || 75,
    maxDistance: discoveryFilter.maxDistanceMiles || 35,
    distanceUnit: 'miles' as const,
    gender: 'everyone' as const,
    relationshipGoals: (currentUser?.relationshipGoals || ['companionship']) as RelationshipGoal[],
    interests: currentUser?.interests || [],
    lifestylePreferences: {
      smoking: 'non_smoker',
      alcohol: 'any',
      pets: 'any',
      exercise: 'any',
      retirement: 'any',
    },
    location: currentUser?.city || 'Seattle, WA',
  };

  const [ageMin, setAgeMin] = useState<number>(savedPrefs.ageMin || 50);
  const [ageMax, setAgeMax] = useState<number>(savedPrefs.ageMax || 75);
  const [maxDistance, setMaxDistance] = useState<number>(savedPrefs.maxDistance || 35);
  const [distanceUnit, setDistanceUnit] = useState<'miles' | 'km'>(savedPrefs.distanceUnit || 'miles');
  const [gender, setGender] = useState<'men' | 'women' | 'everyone'>(savedPrefs.gender || 'everyone');
  const [relationshipGoals, setRelationshipGoals] = useState<RelationshipGoal[]>(
    savedPrefs.relationshipGoals || ['companionship']
  );
  const [smokingPref, setSmokingPref] = useState<string>(
    savedPrefs.lifestylePreferences?.smoking || 'non_smoker'
  );
  const [alcoholPref, setAlcoholPref] = useState<string>(
    savedPrefs.lifestylePreferences?.alcohol || 'any'
  );
  const [activityPref, setActivityPref] = useState<string>(
    savedPrefs.lifestylePreferences?.exercise || 'any'
  );
  const [retirementPref, setRetirementPref] = useState<string>(
    savedPrefs.lifestylePreferences?.retirement || 'any'
  );
  const [locationPref, setLocationPref] = useState<string>(
    savedPrefs.location || currentUser?.city || 'Seattle, WA'
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  const goalOptions: Array<{ id: RelationshipGoal; label: string }> = [
    { id: 'companionship', label: 'Companionship' },
    { id: 'serious_relationship', label: 'Long-term Relationship' },
    { id: 'marriage', label: 'Marriage' },
    { id: 'friendship', label: 'Friendship First' },
    { id: 'dating', label: 'Dating & Outings' },
    { id: 'travel_companionship', label: 'Travel Partner' },
  ];

  const toggleGoal = (goal: RelationshipGoal) => {
    if (relationshipGoals.includes(goal)) {
      if (relationshipGoals.length > 1) {
        setRelationshipGoals(relationshipGoals.filter((g) => g !== goal));
      }
    } else {
      setRelationshipGoals([...relationshipGoals, goal]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const updatedPrefs = {
        ageMin,
        ageMax,
        maxDistance,
        distanceUnit,
        gender,
        relationshipGoals,
        interests: currentUser?.interests || [],
        lifestylePreferences: {
          smoking: smokingPref,
          alcohol: alcoholPref,
          exercise: activityPref,
          retirement: retirementPref,
        },
        location: locationPref,
      };

      const updatedUser = await API.updateMe({
        datingPreferences: updatedPrefs,
      });

      setCurrentUser(updatedUser);

      // Also sync discovery filter
      setDiscoveryFilter({
        ...discoveryFilter,
        ageMin,
        ageMax,
        maxDistanceMiles: maxDistance,
        goal: relationshipGoals[0] || 'all',
      });

      setSaveSuccess(true);
      refreshAllData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save dating preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-dating-prefs-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Dating Preferences
        </h2>

        <button
          id="btn-dating-prefs-save"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-black transition-all tap-active shadow-md disabled:opacity-60"
        >
          <Save className="w-4 h-4 text-black" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-neutral-900 border border-neutral-700 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span className="font-bold">Dating preferences updated! Recommendations will adapt.</span>
        </div>
      )}

      {saveError && (
        <div className="bg-neutral-900 border border-red-800 text-red-300 text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. GENDER PREFERENCE */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <User className="w-4 h-4 text-white" />
          <span>I Am Interested In Meeting</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'women', label: 'Women' },
            { id: 'men', label: 'Men' },
            { id: 'everyone', label: 'Everyone' },
          ].map((item) => {
            const isSelected = gender === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setGender(item.id as any)}
                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all border tap-active text-center ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. AGE RANGE (50 to 85+) */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-white" />
            <span>Preferred Age Range</span>
          </h3>
          <span className="text-sm font-bold text-white bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full">
            {ageMin} to {ageMax >= 85 ? '85+' : ageMax} years old
          </span>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Minimum Age: {ageMin}</span>
              <span>Must be 50+</span>
            </div>
            <input
              type="range"
              min={50}
              max={80}
              value={ageMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAgeMin(val);
                if (val > ageMax) setAgeMax(val);
              }}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Maximum Age: {ageMax >= 85 ? '85+' : ageMax}</span>
              <span>85+</span>
            </div>
            <input
              type="range"
              min={55}
              max={85}
              value={ageMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAgeMax(val);
                if (val < ageMin) setAgeMin(val);
              }}
              className="w-full accent-white cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. DISTANCE & UNITS */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white" />
            <span>Maximum Distance Radius</span>
          </h3>
          <span className="text-sm font-bold text-white bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full">
            Within {maxDistance} {distanceUnit}
          </span>
        </div>

        <div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
            <span>5 {distanceUnit} (Very close)</span>
            <span>50 {distanceUnit}</span>
            <span>100 {distanceUnit} (Regional)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
          <span className="text-xs text-neutral-300 font-medium">Distance Measurement Unit</span>
          <div className="flex bg-neutral-900 rounded-xl p-1 border border-neutral-700">
            <button
              type="button"
              onClick={() => setDistanceUnit('miles')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                distanceUnit === 'miles' ? 'bg-white text-black' : 'text-neutral-400'
              }`}
            >
              Miles
            </button>
            <button
              type="button"
              onClick={() => setDistanceUnit('km')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                distanceUnit === 'km' ? 'bg-white text-black' : 'text-neutral-400'
              }`}
            >
              Kilometers
            </button>
          </div>
        </div>
      </div>

      {/* 4. RELATIONSHIP INTENTION */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Heart className="w-4 h-4 text-white" />
          <span>Desired Connection Types</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {goalOptions.map((goal) => {
            const isSelected = relationshipGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all tap-active flex items-center justify-between ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                <span>{goal.label}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. LIFESTYLE PREFERENCES */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Smile className="w-4 h-4 text-white" />
          <span>Lifestyle Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Smoking Preference
            </label>
            <select
              value={smokingPref}
              onChange={(e) => setSmokingPref(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
            >
              <option value="non_smoker">Non-Smokers Only</option>
              <option value="any">Open to Any / No Preference</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Alcohol Preference
            </label>
            <select
              value={alcoholPref}
              onChange={(e) => setAlcoholPref(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
            >
              <option value="any">Open to Any / Social</option>
              <option value="non_drinker">Non-Drinkers Only</option>
              <option value="social_wine">Social Drinkers</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Activity Pace
            </label>
            <select
              value={activityPref}
              onChange={(e) => setActivityPref(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
            >
              <option value="any">Any Pace</option>
              <option value="active">Active & Energetic</option>
              <option value="moderate">Moderate & Steady</option>
              <option value="relaxed">Relaxed & Quiet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Retirement Status
            </label>
            <select
              value={retirementPref}
              onChange={(e) => setRetirementPref(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
            >
              <option value="any">Any Status</option>
              <option value="retired">Fully Retired</option>
              <option value="semi_retired">Semi-Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 px-4 rounded-2xl text-base transition-all tap-active flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
        >
          <Save className="w-5 h-5 text-black" />
          <span>{isSaving ? 'Saving Preferences...' : 'Save Dating Preferences'}</span>
        </button>
      </div>
    </div>
  );
};
