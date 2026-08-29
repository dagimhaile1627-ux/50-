import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  Bell,
  Mail,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Heart,
  MessageCircle,
  Users,
  Eye,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { currentUser, setCurrentUser, refreshAllData } = useApp();

  const savedNotifications = currentUser?.notificationSettings || {
    newMatch: true,
    newMessage: true,
    newLike: true,
    profileView: false,
    recommendations: true,
    safetyAlert: true,
    accountAlert: true,
    channelEmail: true,
    channelSMS: false,
    channelPush: true,
  };

  const [newMatch, setNewMatch] = useState<boolean>(savedNotifications.newMatch ?? true);
  const [newMessage, setNewMessage] = useState<boolean>(savedNotifications.newMessage ?? true);
  const [newLike, setNewLike] = useState<boolean>(savedNotifications.newLike ?? true);
  const [profileView, setProfileView] = useState<boolean>(savedNotifications.profileView ?? false);
  const [recommendations, setRecommendations] = useState<boolean>(savedNotifications.recommendations ?? true);
  const [safetyAlert, setSafetyAlert] = useState<boolean>(savedNotifications.safetyAlert ?? true);
  const [accountAlert, setAccountAlert] = useState<boolean>(savedNotifications.accountAlert ?? true);

  const [channelEmail, setChannelEmail] = useState<boolean>(savedNotifications.channelEmail ?? true);
  const [channelSMS, setChannelSMS] = useState<boolean>(savedNotifications.channelSMS ?? false);
  const [channelPush, setChannelPush] = useState<boolean>(savedNotifications.channelPush ?? true);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const updatedSettings = {
        newMatch,
        newMessage,
        newLike,
        profileView,
        recommendations,
        safetyAlert,
        accountAlert,
        channelEmail,
        channelSMS,
        channelPush,
      };

      const updatedUser = await API.updateMe({
        notificationSettings: updatedSettings,
      });

      setCurrentUser(updatedUser);
      setSaveSuccess(true);
      refreshAllData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-notifications-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Notification Preferences
        </h2>

        <button
          id="btn-notifications-save"
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
          <span className="font-bold">Notification preferences saved successfully.</span>
        </div>
      )}

      {saveError && (
        <div className="bg-neutral-900 border border-red-800 text-red-300 text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* NOTIFICATION CHANNELS */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-white" />
            <span>Delivery Channels</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Choose where you wish to receive updates.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">In-App & Push Alerts</span>
                <span className="text-[11px] text-neutral-400">Immediate badge banners on your screen</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channelPush}
              onChange={(e) => setChannelPush(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">Email Digest</span>
                <span className="text-[11px] text-neutral-400">Sent to {currentUser.email}</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channelEmail}
              onChange={(e) => setChannelEmail(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">SMS Text Messages</span>
                <span className="text-[11px] text-neutral-400">Direct urgent security alerts to your phone</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channelSMS}
              onChange={(e) => setChannelSMS(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>
        </div>
      </div>

      {/* EVENT TYPES */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <span>Activity Alerts</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Select what triggers a notice.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">New Mutual Match</span>
                <span className="text-[11px] text-neutral-400">When someone you liked also connects with you</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={newMatch}
              onChange={(e) => setNewMatch(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">New Chat Messages</span>
                <span className="text-[11px] text-neutral-400">When a match sends you a thoughtful note</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={newMessage}
              onChange={(e) => setNewMessage(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">Likes & Introductions</span>
                <span className="text-[11px] text-neutral-400">When a new member sends you an expression of interest</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={newLike}
              onChange={(e) => setNewLike(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">Profile Views</span>
                <span className="text-[11px] text-neutral-400">Notice when another member views your full profile</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profileView}
              onChange={(e) => setProfileView(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">Curated Weekly Recommendations</span>
                <span className="text-[11px] text-neutral-400">Handpicked compatible profiles matching your values</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={recommendations}
              onChange={(e) => setRecommendations(e.target.checked)}
              className="w-5 h-5 accent-white cursor-pointer rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">Safety Check-ins & Scam Alerts</span>
                <span className="text-[11px] text-neutral-400">Emergency contact notifications and security warnings</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={safetyAlert}
              onChange={(e) => setSafetyAlert(e.target.checked)}
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
          <span>{isSaving ? 'Saving Preferences...' : 'Save Notification Preferences'}</span>
        </button>
      </div>
    </div>
  );
};
