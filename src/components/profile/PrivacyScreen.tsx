import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Activity,
  UserCheck,
  Search,
} from 'lucide-react';

interface PrivacyScreenProps {
  onBack: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  const { currentUser, setCurrentUser, refreshAllData } = useApp();

  const savedPrivacy = currentUser?.privacySettings || {
    profileVisibility: 'public' as const,
    photoVisibility: 'all' as const,
    showOnlineStatus: true,
    showLastActive: true,
    showProfileViews: true,
    sendReadReceipts: true,
    locationPrecision: 'approximate' as const,
    searchVisibility: true,
    showDistance: true,
    showCityOnly: false,
    incognitoMode: false,
  };

  const [profileVisibility, setProfileVisibility] = useState<'public' | 'matches_only' | 'hidden'>(
    savedPrivacy.profileVisibility || (savedPrivacy.incognitoMode ? 'hidden' : 'public')
  );
  const [photoVisibility, setPhotoVisibility] = useState<'all' | 'verified_only'>(
    savedPrivacy.photoVisibility || 'all'
  );
  const [showOnlineStatus, setShowOnlineStatus] = useState<boolean>(
    savedPrivacy.showOnlineStatus !== undefined ? savedPrivacy.showOnlineStatus : true
  );
  const [showLastActive, setShowLastActive] = useState<boolean>(
    savedPrivacy.showLastActive !== undefined ? savedPrivacy.showLastActive : true
  );
  const [showProfileViews, setShowProfileViews] = useState<boolean>(
    savedPrivacy.showProfileViews !== undefined ? savedPrivacy.showProfileViews : true
  );
  const [sendReadReceipts, setSendReadReceipts] = useState<boolean>(
    savedPrivacy.sendReadReceipts !== undefined ? savedPrivacy.sendReadReceipts : true
  );
  const [locationPrecision, setLocationPrecision] = useState<'approximate' | 'city_state' | 'hidden'>(
    savedPrivacy.locationPrecision || (savedPrivacy.showCityOnly ? 'city_state' : 'approximate')
  );
  const [searchVisibility, setSearchVisibility] = useState<boolean>(
    savedPrivacy.searchVisibility !== undefined ? savedPrivacy.searchVisibility : true
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const updatedPrivacy = {
        profileVisibility,
        photoVisibility,
        showOnlineStatus,
        showLastActive,
        showProfileViews,
        sendReadReceipts,
        locationPrecision,
        searchVisibility,
        showDistance: locationPrecision === 'approximate',
        showCityOnly: locationPrecision === 'city_state',
        incognitoMode: profileVisibility === 'hidden',
      };

      const updatedUser = await API.updateMe({
        privacySettings: updatedPrivacy,
      });

      setCurrentUser(updatedUser);
      setSaveSuccess(true);
      refreshAllData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save privacy settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-privacy-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Privacy & Visibility Controls
        </h2>

        <button
          id="btn-privacy-save"
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
          <span className="font-bold">Privacy settings saved successfully.</span>
        </div>
      )}

      {saveError && (
        <div className="bg-neutral-900 border border-red-800 text-red-300 text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. PROFILE VISIBILITY */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Eye className="w-4 h-4 text-white" />
            <span>Profile Visibility</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Choose who can discover your profile card.
          </p>
        </div>

        <div className="space-y-2">
          {[
            {
              id: 'public',
              label: 'Visible to all 50+ members',
              desc: 'Recommended for meeting verified companions smoothly.',
            },
            {
              id: 'matches_only',
              label: 'Visible to existing matches only',
              desc: 'New members cannot browse your profile.',
            },
            {
              id: 'hidden',
              label: 'Incognito Mode (Completely Hidden)',
              desc: 'Your profile is hidden from discovery feeds.',
            },
          ].map((item) => {
            const isSelected = profileVisibility === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setProfileVisibility(item.id as any)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all tap-active flex items-start gap-3 ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-black bg-black' : 'border-neutral-500'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className={`text-xs sm:text-sm font-bold block ${isSelected ? 'text-black' : 'text-white'}`}>
                    {item.label}
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PHOTO VISIBILITY */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-white" />
            <span>Photo Visibility</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Restrict your photos to verified profiles if desired.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPhotoVisibility('all')}
            className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all tap-active ${
              photoVisibility === 'all'
                ? 'bg-white text-black border-white shadow-sm'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            All SilverHeart Members
          </button>
          <button
            type="button"
            onClick={() => setPhotoVisibility('verified_only')}
            className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all tap-active ${
              photoVisibility === 'verified_only'
                ? 'bg-white text-black border-white shadow-sm'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            Verified Members Only
          </button>
        </div>
      </div>

      {/* 3. LOCATION PRECISION */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white" />
            <span>Location Precision</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            We never share your exact GPS coordinate or home street address.
          </p>
        </div>

        <div className="space-y-2">
          {[
            {
              id: 'approximate',
              label: 'Approximate Distance (e.g. "About 8 miles away")',
              desc: 'Ideal for local community discovery while protecting home privacy.',
            },
            {
              id: 'city_state',
              label: 'City & State Only (e.g. "Seattle, WA")',
              desc: 'Shows only your general municipality name.',
            },
            {
              id: 'hidden',
              label: 'Hide Distance Completely',
              desc: 'Distance indicator will not be displayed on your profile card.',
            },
          ].map((item) => {
            const isSelected = locationPrecision === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLocationPrecision(item.id as any)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all tap-active flex items-start gap-3 ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-black bg-black' : 'border-neutral-500'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <span className={`text-xs sm:text-sm font-bold block ${isSelected ? 'text-black' : 'text-white'}`}>
                    {item.label}
                  </span>
                  <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVITY & PRESENCE TOGGLES */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-white" />
          <span>Activity & Presence</span>
        </h3>

        <div className="space-y-3">
          {/* Online Status */}
          <div className="flex items-center justify-between gap-3 bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Show Online Status
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Displays a green active badge when you are using the app.
              </span>
            </div>
            <input
              type="checkbox"
              checked={showOnlineStatus}
              onChange={(e) => setShowOnlineStatus(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          {/* Last Active */}
          <div className="flex items-center justify-between gap-3 bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Show Last Active Timestamp
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Shows when you were last active (e.g. "Active today").
              </span>
            </div>
            <input
              type="checkbox"
              checked={showLastActive}
              onChange={(e) => setShowLastActive(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          {/* Read Receipts */}
          <div className="flex items-center justify-between gap-3 bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Send & Receive Read Receipts
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Shows checkmarks when messages have been opened and read.
              </span>
            </div>
            <input
              type="checkbox"
              checked={sendReadReceipts}
              onChange={(e) => setSendReadReceipts(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          {/* Search Visibility */}
          <div className="flex items-center justify-between gap-3 bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Search Engine & Public Filter Indexing
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Allow compatible verified members to find you in hobby keyword searches.
              </span>
            </div>
            <input
              type="checkbox"
              checked={searchVisibility}
              onChange={(e) => setSearchVisibility(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
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
          <span>{isSaving ? 'Saving Privacy Settings...' : 'Save Privacy Controls'}</span>
        </button>
      </div>
    </div>
  );
};
