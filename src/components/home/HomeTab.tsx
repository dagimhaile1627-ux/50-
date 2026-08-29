import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import {
  Heart,
  Sparkles,
  MapPin,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  X,
  Search,
  Compass,
  SlidersHorizontal,
  RotateCcw,
  Dog,
  Cigarette,
  Wine,
  Sun,
  Activity,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const HomeTab: React.FC = () => {
  const {
    discoveryProfiles,
    discoveryFilter,
    setDiscoveryFilter,
    handleLike,
    handlePass,
    setSelectedProfileDetail,
    refreshAllData,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Draft filter state while configuring
  const [tempFilter, setTempFilter] = useState(discoveryFilter);

  const openFilterModal = () => {
    setTempFilter(discoveryFilter);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setDiscoveryFilter(tempFilter);
    setShowFilterModal(false);
    setCurrentIndex(0);
    refreshAllData();
  };

  const resetFilters = () => {
    const defaultFilter = {
      goal: 'all' as const,
      ageMin: 50,
      ageMax: 85,
      maxDistanceMiles: 60,
      verifiedOnly: false,
      activityLevel: 'all',
      retirementStatus: 'all',
      relationshipStatus: 'all',
      petPreference: 'all',
      smokingPreference: 'all',
      drinkingPreference: 'all',
      keyword: '',
    };
    setTempFilter(defaultFilter);
    setDiscoveryFilter(defaultFilter);
    setSearchTerm('');
    setCurrentIndex(0);
    refreshAllData();
  };

  // Count active filters
  const activeFilterCount = [
    discoveryFilter.verifiedOnly,
    discoveryFilter.retirementStatus !== 'all',
    discoveryFilter.activityLevel !== 'all',
    discoveryFilter.relationshipStatus !== 'all',
    discoveryFilter.petPreference !== 'all',
    discoveryFilter.smokingPreference !== 'all',
    discoveryFilter.drinkingPreference !== 'all',
    discoveryFilter.ageMin > 50 || discoveryFilter.ageMax < 85,
    discoveryFilter.maxDistanceMiles !== 60,
  ].filter(Boolean).length;

  // Filter profiles by search term
  const filteredProfiles = discoveryProfiles.filter((profile) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const city = (profile.location?.city || profile.city || '').toLowerCase();
    return (
      profile.firstName.toLowerCase().includes(term) ||
      profile.bio.toLowerCase().includes(term) ||
      profile.interests.some((i) => i.toLowerCase().includes(term)) ||
      city.includes(term)
    );
  });

  const activeProfile: UserProfile | undefined = filteredProfiles[currentIndex] || filteredProfiles[0];

  const handleNextProfilePass = (profileId: string) => {
    handlePass(profileId);
    if (currentIndex >= filteredProfiles.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleNextProfileLike = (profile: UserProfile) => {
    handleLike(profile);
    if (currentIndex >= filteredProfiles.length - 1) {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between min-h-0 text-white gap-2 select-none">
      {/* Top Discover Bar: Search & Deep Research Filter Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-home-search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentIndex(0);
            }}
            placeholder="Search name, city, or interests..."
            className="w-full bg-neutral-900 border border-neutral-700 text-white pl-8 pr-3 py-1.5 rounded-lg text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-[10px] font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Preferences Button */}
        <button
          onClick={openFilterModal}
          id="btn-home-toggle-filter"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors tap-active shrink-0 ${
            activeFilterCount > 0
              ? 'bg-white text-black border-white'
              : 'bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips Bar (if active) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px] shrink-0">
          <span className="text-neutral-400 text-[10px] shrink-0 font-medium">Applied:</span>
          {discoveryFilter.verifiedOnly && (
            <span className="bg-neutral-800 text-white border border-neutral-700 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-white" /> 50+ Verified
            </span>
          )}
          {discoveryFilter.retirementStatus !== 'all' && (
            <span className="bg-neutral-800 text-white border border-neutral-700 px-2 py-0.5 rounded-full shrink-0 capitalize">
              {discoveryFilter.retirementStatus.replace(/_/g, ' ')}
            </span>
          )}
          {discoveryFilter.activityLevel !== 'all' && (
            <span className="bg-neutral-800 text-white border border-neutral-700 px-2 py-0.5 rounded-full shrink-0 capitalize">
              {discoveryFilter.activityLevel.replace(/_/g, ' ')}
            </span>
          )}
          {discoveryFilter.petPreference !== 'all' && (
            <span className="bg-neutral-800 text-white border border-neutral-700 px-2 py-0.5 rounded-full shrink-0 capitalize">
              {discoveryFilter.petPreference === 'none' ? 'Pet-Free' : `${discoveryFilter.petPreference} lover`}
            </span>
          )}
          {(discoveryFilter.ageMin > 50 || discoveryFilter.ageMax < 85) && (
            <span className="bg-neutral-800 text-white border border-neutral-700 px-2 py-0.5 rounded-full shrink-0">
              Age {discoveryFilter.ageMin}-{discoveryFilter.ageMax}
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-neutral-400 hover:text-white underline text-[10px] ml-auto shrink-0"
          >
            Reset
          </button>
        </div>
      )}

      {/* Main Single-Screen Curated Discovery Card */}
      {activeProfile ? (
        <div className="flex-1 min-h-0 flex flex-col justify-between bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Photo & Overlays container */}
          <div className="relative flex-1 min-h-0 w-full bg-neutral-900 overflow-hidden">
            <img
              src={activeProfile.photos[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'}
              alt={activeProfile.firstName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

            {/* Verified Badge Overlay */}
            {activeProfile.verificationBadge && (
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/85 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-neutral-700 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Verified 50+
              </div>
            )}

            {/* Match percentage pill & Profile count */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-neutral-300 bg-black/70 px-2 py-0.5 rounded-full border border-neutral-700">
                {currentIndex + 1} of {filteredProfiles.length}
              </span>
              <span className="bg-white text-black text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                {activeProfile.compatibilityScore || 92}% Match
              </span>
            </div>

            {/* Name, Age, Location & Match Reasoning Overlaid on Photo */}
            <div className="absolute bottom-2.5 left-3 right-3 text-white space-y-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold font-serif leading-none">{activeProfile.firstName}</h3>
                <span className="text-xl font-light text-neutral-300">({activeProfile.age})</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-200 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-white" />
                  {activeProfile.location?.city || activeProfile.city || 'Seattle'}, {activeProfile.location?.state || activeProfile.state || 'WA'} ({activeProfile.location?.distanceMiles ?? activeProfile.distanceMiles ?? 0} mi)
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-white" />
                  {activeProfile.retirementStatus === 'retired' ? 'Retired' : activeProfile.occupation}
                </span>
              </div>

              {/* Compact AI Why You Connect Highlight */}
              <div className="bg-black/80 backdrop-blur-md border border-neutral-700/80 px-2.5 py-1 rounded-lg text-[11px] text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="truncate">
                  {activeProfile.compatibilityReasons?.[0] || `Shared interest in relaxed companionship and morning walks`}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Card Controls & Bio */}
          <div className="p-3 bg-neutral-900 border-t border-neutral-800 space-y-2 shrink-0">
            {/* Bio quote */}
            <p className="text-neutral-300 text-xs line-clamp-2 leading-snug italic">
              "{activeProfile.bio}"
            </p>

            {/* Lifestyle & Interest Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {activeProfile.lifestyle?.pets && activeProfile.lifestyle.pets.length > 0 && (
                <span className="bg-neutral-800 text-neutral-200 border border-neutral-700 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Dog className="w-3 h-3 text-neutral-300" />
                  {activeProfile.lifestyle.pets[0]}
                </span>
              )}
              {activeProfile.lifestyle?.morningOrNight && (
                <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize">
                  {activeProfile.lifestyle.morningOrNight.replace(/_/g, ' ')}
                </span>
              )}
              {activeProfile.interests?.slice(0, 2).map((interest) => (
                <span
                  key={interest}
                  className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] px-2 py-0.5 rounded-full font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>

            {/* Large 3-Action Discovery Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleNextProfilePass(activeProfile.id)}
                id="btn-home-pass"
                className="flex-1 py-2.5 px-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors min-h-[46px] tap-active"
                title="Pass for now"
              >
                <X className="w-4 h-4 text-neutral-400" />
                <span>Pass</span>
              </button>

              <button
                onClick={() => setSelectedProfileDetail(activeProfile)}
                id="btn-home-view-profile"
                className="flex-1 py-2.5 px-2 rounded-xl border border-neutral-600 bg-neutral-800 hover:bg-neutral-750 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors min-h-[46px] tap-active"
              >
                <span>Full Story</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleNextProfileLike(activeProfile)}
                id="btn-home-like"
                className="flex-1 py-2.5 px-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-lg transition-all min-h-[46px] tap-active"
                title="Express gentle interest"
              >
                <Heart className="w-4 h-4 fill-black text-black" />
                <span>Connect</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 my-auto flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
          <h3 className="text-xl font-bold text-white">No Profiles Match These Filters</h3>
          <p className="text-neutral-300 text-sm max-w-md mx-auto">
            Try broadening your search radius, age bracket, or lifestyle preferences.
          </p>
          <button
            onClick={resetFilters}
            className="bg-white hover:bg-neutral-200 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors tap-active flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Filters
          </button>
        </div>
      )}

      {/* Comprehensive Deep Research Senior Filters Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 text-white animate-in fade-in duration-150">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">Refine Discovery Preferences</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* 1. Verified 50+ Trust Protection */}
              <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <div>
                      <span className="font-bold text-white text-sm block">50+ Verified Members Only</span>
                      <span className="text-neutral-400 text-[11px]">Strict ID & age-checked profiles to prevent romance scams</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="filter-verified-toggle"
                    checked={tempFilter.verifiedOnly}
                    onChange={(e) => setTempFilter({ ...tempFilter, verifiedOnly: e.target.checked })}
                    className="w-5 h-5 accent-white rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Age Range Bracket */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-white" />
                    Age Bracket: {tempFilter.ageMin} – {tempFilter.ageMax} years
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <span className="text-neutral-400 text-[10px]">Min: {tempFilter.ageMin}</span>
                    <input
                      type="range"
                      min={50}
                      max={75}
                      value={tempFilter.ageMin}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val <= tempFilter.ageMax) {
                          setTempFilter({ ...tempFilter, ageMin: val });
                        }
                      }}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-neutral-400 text-[10px]">Max: {tempFilter.ageMax}</span>
                    <input
                      type="range"
                      min={55}
                      max={85}
                      value={tempFilter.ageMax}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= tempFilter.ageMin) {
                          setTempFilter({ ...tempFilter, ageMax: val });
                        }
                      }}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Distance Radius */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-white" />
                    Search Radius: {tempFilter.maxDistanceMiles} miles
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={tempFilter.maxDistanceMiles}
                  onChange={(e) => setTempFilter({ ...tempFilter, maxDistanceMiles: parseInt(e.target.value) })}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* 4. Retirement Status & Availability */}
              <div className="space-y-1.5">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-white" />
                  Retirement & Schedule Rhythm
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Any Status' },
                    { id: 'retired', label: 'Fully Retired' },
                    { id: 'semi_retired', label: 'Semi-Retired' },
                    { id: 'working_part_time', label: 'Part-Time / Active' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTempFilter({ ...tempFilter, retirementStatus: option.id })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-colors ${
                        tempFilter.retirementStatus === option.id
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Daily Activity & Energy Level */}
              <div className="space-y-1.5">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-white" />
                  Daily Energy & Activity Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Any Energy Level' },
                    { id: 'daily_active', label: 'Daily Active / Outdoors' },
                    { id: 'moderate', label: 'Moderate & Leisurely' },
                    { id: 'relaxed', label: 'Relaxed / Homebody' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTempFilter({ ...tempFilter, activityLevel: option.id })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-colors ${
                        tempFilter.activityLevel === option.id
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Pets & Companionship Compatibility */}
              <div className="space-y-1.5">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-white" />
                  Pet Preferences
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'No Preference' },
                    { id: 'dog', label: 'Dog Lovers' },
                    { id: 'cat', label: 'Cat Lovers' },
                    { id: 'none', label: 'Pet-Free Home' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTempFilter({ ...tempFilter, petPreference: option.id })}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-colors ${
                        tempFilter.petPreference === option.id
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Smoking & Drinking Habits */}
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <Cigarette className="w-3.5 h-3.5 text-white" />
                    Smoking Preference
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'Any' },
                      { id: 'non_smoker', label: 'Non-Smokers Only' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTempFilter({ ...tempFilter, smokingPreference: option.id })}
                        className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                          tempFilter.smokingPreference === option.id
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-white" />
                    Alcohol Habits
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'Any' },
                      { id: 'social_wine', label: 'Social Wine' },
                      { id: 'non_drinker', label: 'Non-Drinker' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTempFilter({ ...tempFilter, drinkingPreference: option.id })}
                        className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                          tempFilter.drinkingPreference === option.id
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={resetFilters}
                className="py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center gap-1.5 tap-active"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 tap-active"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
