import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  Settings,
  User,
  Lock,
  Globe,
  Sliders,
  Shield,
  FileText,
  Trash2,
  PauseCircle,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToSafety?: () => void;
  onNavigateToNotifications?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLogout,
  onNavigateToPrivacy,
  onNavigateToSafety,
  onNavigateToNotifications,
}) => {
  const { currentUser, setCurrentUser, refreshAllData } = useApp();

  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'legal'>('account');

  // Account form
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordMsg, setPasswordMsg] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Preferences
  const [language, setLanguage] = useState<'English' | 'Spanish' | 'French' | 'German'>(
    currentUser?.appPreferences?.language || 'English'
  );
  const [distanceUnits, setDistanceUnits] = useState<'miles' | 'km'>(
    currentUser?.appPreferences?.distanceUnits || 'miles'
  );
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);
  const [prefsSuccess, setPrefsSuccess] = useState<string>('');

  // Delete Account Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  // Legal Modal
  const [legalModalContent, setLegalModalContent] = useState<{ title: string; body: string } | null>(null);

  if (!currentUser) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordMsg('');
    setPasswordError('');

    try {
      await API.changePassword(currentPassword, newPassword);
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Could not update password. Please verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    setPrefsSuccess('');
    try {
      const updated = await API.updateMe({
        appPreferences: {
          language,
          distanceUnits,
          isPaused: !!currentUser.appPreferences?.isPaused,
        },
      });
      setCurrentUser(updated);
      setPrefsSuccess('App preferences updated.');
      refreshAllData();
      setTimeout(() => setPrefsSuccess(''), 3000);
    } catch (err) {
      // ignore
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      await API.deleteAccount();
      onLogout();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  const openLegal = (type: 'terms' | 'privacy' | 'guidelines') => {
    if (type === 'terms') {
      setLegalModalContent({
        title: 'Terms of Service',
        body: `Welcome to SilverHeart. By accessing or using our platform, you agree to comply with our core terms:
1. Eligibility: SilverHeart is exclusively designed for adults aged 50 and older. You must accurately provide your birth date and agree to verify your identity upon request.
2. Respectful Communication: Harassment, hate speech, deceitful solicitations, and explicit unrequested content are strictly prohibited and result in permanent expulsion.
3. Anti-Fraud Commitment: Asking for money, investments, cryptocurrency, or gift cards is strictly forbidden. We cooperate fully with law enforcement and elder protection agencies.
4. Account Security: You are responsible for safeguarding your login credentials.`,
      });
    } else if (type === 'privacy') {
      setLegalModalContent({
        title: 'Privacy Policy',
        body: `Your privacy and personal dignity are paramount:
1. Information We Collect: We collect basic account details (name, email, age, location), self-provided lifestyle preferences, and photos you choose to share.
2. Never Shared: Your exact home address, phone number, and financial information are NEVER sold or shared with advertisers or third parties.
3. Verification Data: Encrypted with AES-256 standard and stored on secure enterprise infrastructure.
4. Control: You can edit, pause, download, or permanently delete your account and all associated data at any time.`,
      });
    } else {
      setLegalModalContent({
        title: '50+ Community Guidelines',
        body: `SilverHeart is built on kindness, trust, and mutual respect:
1. Be Honest & Genuine: Represent yourself accurately with recent, smiling photos and genuine relationship intentions.
2. Patience & Respect: Treat every companion with courtesy. Understand that people communicate at their own comfortable pace.
3. Safety First: Keep early conversations within the app, meet in public venues, and never send money to anyone.
4. Active Moderation: Our 24/7 team reviews all reports immediately to keep our community safe for everyone.`,
      });
    }
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-settings-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Account Settings
        </h2>

        <div className="w-12" />
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'account', label: 'Account & Security', icon: Lock },
          { id: 'preferences', label: 'App Preferences', icon: Sliders },
          { id: 'legal', label: 'Legal & Guidelines', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border tap-active ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACCOUNT & SECURITY */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          {/* Account Overview */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <User className="w-4 h-4 text-white" />
              <span>Account Credentials</span>
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-neutral-400">Registered Email</span>
                <span className="text-white font-semibold">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-neutral-400">Registered Phone</span>
                <span className="text-white font-semibold">{currentUser.phone || 'Not added'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <span className="text-neutral-400">Date of Birth / Age</span>
                <span className="text-white font-semibold">{currentUser.dateOfBirth} ({currentUser.age} yrs)</span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-white" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Ensure your account is protected with a secure, memorable password (minimum 8 characters).
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all tap-active flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                <Lock className="w-4 h-4 text-black" />
                <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>

            {passwordMsg && (
              <div className="bg-neutral-900 border border-neutral-700 text-white text-xs sm:text-sm p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {passwordError && (
              <div className="bg-neutral-900 border border-red-800 text-red-300 text-xs sm:text-sm p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-neutral-400" />
              <span>Permanent Account Deletion</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              If you wish to leave SilverHeart, you can permanently erase your profile, messages, matches, and uploaded photos. This action cannot be reversed.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors tap-active flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: APP PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-white" />
              <span>App Display & Regional Settings</span>
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
              >
                <option value="English">English (United States & Global)</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Distance Measurement Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDistanceUnits('miles')}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    distanceUnits === 'miles'
                      ? 'bg-white text-black border-white shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  Miles (mi)
                </button>
                <button
                  type="button"
                  onClick={() => setDistanceUnits('km')}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    distanceUnits === 'km'
                      ? 'bg-white text-black border-white shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  Kilometers (km)
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all tap-active flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-black" />
              <span>{isSavingPrefs ? 'Saving...' : 'Save App Preferences'}</span>
            </button>

            {prefsSuccess && (
              <div className="bg-neutral-900 border border-neutral-700 text-white text-xs sm:text-sm p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{prefsSuccess}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LEGAL & GUIDELINES */}
      {activeTab === 'legal' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-white" />
            <span>Legal Policies & Safety Standards</span>
          </h3>

          <div className="space-y-2">
            {[
              { id: 'terms', label: 'Terms of Service', desc: 'User agreements, age eligibility, and member rules' },
              { id: 'privacy', label: 'Privacy Policy', desc: 'How your data is encrypted, stored, and protected' },
              { id: 'guidelines', label: 'Community Guidelines', desc: 'Respectful conduct, anti-fraud rules, and harassment prevention' },
            ].map((policy) => (
              <button
                key={policy.id}
                onClick={() => openLegal(policy.id as any)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 p-3.5 rounded-xl border border-neutral-800 text-left flex items-center justify-between transition-colors tap-active"
              >
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block">{policy.label}</span>
                  <span className="text-[11px] text-neutral-400">{policy.desc}</span>
                </div>
                <span className="text-xs text-neutral-400">Read →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legal Modal Reader */}
      {legalModalContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-white">{legalModalContent.title}</h3>
              <button
                onClick={() => setLegalModalContent(null)}
                className="text-neutral-400 hover:text-white text-sm font-bold px-2 py-1"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {legalModalContent.body}
            </div>
            <div className="p-4 border-t border-neutral-800">
              <button
                onClick={() => setLegalModalContent(null)}
                className="w-full bg-white text-black font-black py-2.5 rounded-xl text-xs sm:text-sm"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-serif text-white">Permanently Delete Account?</h3>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              This will permanently delete your profile, messages, matches, and photo records from our servers. Type <strong className="text-white">DELETE</strong> to confirm:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "DELETE"'
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-sm font-bold text-center focus:outline-none focus:border-white"
            />

            {deleteError && (
              <p className="text-xs text-red-400 text-center font-semibold">{deleteError}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                className="flex-1 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold border border-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black shadow-md disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
