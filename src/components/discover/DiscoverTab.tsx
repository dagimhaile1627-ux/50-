import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RelationshipGoal, UserProfile } from '../../types';
import { Filter, Search, CheckCircle2, Heart, X, MapPin, Briefcase, Sparkles, Compass, ShieldCheck } from 'lucide-react';

export const DiscoverTab: React.FC = () => {
  const {
    discoveryProfiles,
    discoveryFilter,
    setDiscoveryFilter,
    handleLike,
    handlePass,
    setSelectedProfileDetail,
  } = useApp();

  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const goals: Array<{ id: RelationshipGoal | 'all'; label: string }> = [
    { id: 'all', label: 'All Goals' },
    { id: 'companionship', label: 'Companionship' },
    { id: 'serious_relationship', label: 'Serious Relationship' },
    { id: 'travel_companionship', label: 'Travel Partner' },
    { id: 'friendship', label: 'Friendship' },
    { id: 'dating', label: 'Dating' },
    { id: 'marriage', label: 'Marriage' },
  ];

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

  return (
    <div className="space-y-5 pb-8 text-white">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-discover-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by interests (e.g. Gardening, Jazz, Books, Travel)..."
            className="w-full bg-neutral-900 border border-neutral-700 text-white pl-10 pr-4 py-3 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterModal(true)}
          id="btn-discover-open-filters"
          className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 px-4 py-3 rounded-xl text-sm font-bold transition-colors shrink-0"
        >
          <Filter className="w-4 h-4 text-white" />
          <span>Filters</span>
          {discoveryFilter.verifiedOnly && (
            <span className="w-2 h-2 rounded-full bg-white"></span>
          )}
        </button>
      </div>

      {/* Goal Category Filter Chips (Simple 1-click select) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {goals.map((g) => {
          const isSelected = discoveryFilter.goal === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setDiscoveryFilter((prev) => ({ ...prev, goal: g.id }))}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 border tap-active ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Search Radius Status */}
      <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Compass className="w-3.5 h-3.5 text-white" />
          Showing verified adults 50+ within <strong className="text-white">{discoveryFilter.maxDistanceMiles} miles</strong>
        </span>
        <span className="text-neutral-300 font-semibold">{filteredProfiles.length} Members</span>
      </div>

      {/* Grid of Profiles */}
      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              {/* Photo & Quick Badges */}
              <div
                className="relative h-64 w-full bg-neutral-900 cursor-pointer overflow-hidden group"
                onClick={() => setSelectedProfileDetail(profile)}
              >
                <img
                  src={profile.photos[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'}
                  alt={profile.firstName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Verified 50+ Pill */}
                {profile.verificationBadge && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/85 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    Verified 50+
                  </div>
                )}

                {/* Compatibility pill */}
                <div className="absolute top-3 right-3 bg-white text-black text-xs font-black px-2.5 py-1 rounded-full shadow">
                  {profile.compatibilityScore || 88}% Match
                </div>

                {/* Name & Basic info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="text-xl font-bold font-serif">{profile.firstName}</h3>
                    <span className="text-lg font-light text-neutral-300">({profile.age})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-200 mt-0.5 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-white" />
                      {profile.location?.city || profile.city || 'Seattle'}, {profile.location?.state || profile.state || 'WA'} ({profile.location?.distanceMiles ?? profile.distanceMiles ?? 0} mi)
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-white" />
                      {profile.retirementStatus === 'retired' ? 'Retired' : profile.occupation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-neutral-900">
                <p className="text-neutral-300 text-xs sm:text-sm line-clamp-2 italic">
                  "{profile.bio}"
                </p>

                {/* Interests Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="bg-black text-neutral-200 border border-neutral-800 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                  {profile.relationshipGoals.slice(0, 2).map((goal) => (
                    <span
                      key={goal}
                      className="bg-white text-black text-[11px] px-2.5 py-0.5 rounded-full font-bold capitalize"
                    >
                      {goal.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {/* Big, Simple Action Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-neutral-800">
                  <button
                    onClick={() => handlePass(profile.id)}
                    className="flex-1 py-2.5 px-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[46px] tap-active"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
                    <span>Pass</span>
                  </button>

                  <button
                    onClick={() => setSelectedProfileDetail(profile)}
                    className="flex-1 py-2.5 px-2 rounded-xl border border-neutral-600 bg-neutral-800 hover:bg-neutral-750 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-colors min-h-[46px] tap-active"
                  >
                    <span>Full Story</span>
                  </button>

                  <button
                    onClick={() => handleLike(profile)}
                    className="flex-1 py-2.5 px-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow transition-colors min-h-[46px] tap-active"
                  >
                    <Heart className="w-4 h-4 fill-black text-black" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-white mx-auto" />
          <h3 className="text-lg font-bold text-white">No Profiles Match Your Exact Filter</h3>
          <p className="text-neutral-300 text-sm max-w-md mx-auto">
            Try expanding your distance radius or selecting "All Goals" to discover more verified 50+ members nearby.
          </p>
          <button
            onClick={() => setDiscoveryFilter({
              goal: 'all',
              ageMin: 50,
              ageMax: 85,
              maxDistanceMiles: 100,
              verifiedOnly: false,
              activityLevel: 'all',
              retirementStatus: 'all',
              keyword: '',
            })}
            className="bg-white hover:bg-neutral-200 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Reset Filters (Expand Search)
          </button>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-white font-serif">Discovery Preferences</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-neutral-400 hover:text-white text-sm font-bold"
              >
                Close &times;
              </button>
            </div>

            {/* Distance slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-300 font-medium">Maximum Distance:</span>
                <span className="text-white font-black">{discoveryFilter.maxDistanceMiles} miles</span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={discoveryFilter.maxDistanceMiles}
                onChange={(e) => setDiscoveryFilter((prev) => ({ ...prev, maxDistanceMiles: parseInt(e.target.value) }))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
                <span>10 mi (Local)</span>
                <span>50 mi</span>
                <span>150 mi (Statewide)</span>
              </div>
            </div>

            {/* Verified only switch */}
            <div className="flex items-center justify-between p-3.5 bg-black rounded-xl border border-neutral-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-white" />
                <div>
                  <div className="text-sm font-bold text-white">Verified 50+ Profiles Only</div>
                  <div className="text-xs text-neutral-400">Show only members with verified photo & ID</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={discoveryFilter.verifiedOnly}
                onChange={(e) => setDiscoveryFilter((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
                className="w-5 h-5 accent-white rounded cursor-pointer"
              />
            </div>

            <button
              onClick={() => setShowFilterModal(false)}
              className="w-full bg-white hover:bg-neutral-200 text-black font-extrabold py-3.5 rounded-xl shadow transition-colors text-base"
            >
              Apply Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

