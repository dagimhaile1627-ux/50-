import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProfileNavigationMenu, ProfileViewMode } from './ProfileNavigationMenu';
import { ViewMyProfileScreen } from './ViewMyProfileScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { VerificationScreen } from './VerificationScreen';
import { DatingPreferencesScreen } from './DatingPreferencesScreen';
import { SafetyCenterScreen } from './SafetyCenterScreen';
import { PrivacyScreen } from './PrivacyScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { MembershipScreen } from './MembershipScreen';
import { HelpSupportScreen } from './HelpSupportScreen';
import { SettingsScreen } from './SettingsScreen';
import { API } from '../../services/api';

export const ProfileTab: React.FC = () => {
  const { currentUser, setCurrentUser } = useApp();
  const [viewMode, setViewMode] = useState<ProfileViewMode>('menu');

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await API.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-1 sm:px-2">
      {viewMode === 'menu' && (
        <ProfileNavigationMenu
          onSelectView={(mode) => setViewMode(mode)}
          onLogout={handleLogout}
        />
      )}

      {viewMode === 'view_profile' && (
        <ViewMyProfileScreen
          onBack={() => setViewMode('menu')}
          onEdit={() => setViewMode('edit_profile')}
        />
      )}

      {viewMode === 'edit_profile' && (
        <EditProfileScreen
          onBack={() => setViewMode('menu')}
          onNavigateToPreferences={() => setViewMode('dating_preferences')}
        />
      )}

      {viewMode === 'verification' && (
        <VerificationScreen onBack={() => setViewMode('menu')} />
      )}

      {viewMode === 'dating_preferences' && (
        <DatingPreferencesScreen onBack={() => setViewMode('menu')} />
      )}

      {viewMode === 'safety_center' && (
        <SafetyCenterScreen
          onBack={() => setViewMode('menu')}
          onNavigateToPrivacy={() => setViewMode('privacy')}
        />
      )}

      {viewMode === 'privacy' && (
        <PrivacyScreen onBack={() => setViewMode('menu')} />
      )}

      {viewMode === 'notifications' && (
        <NotificationsScreen onBack={() => setViewMode('menu')} />
      )}

      {viewMode === 'membership' && (
        <MembershipScreen onBack={() => setViewMode('menu')} />
      )}

      {viewMode === 'help_support' && (
        <HelpSupportScreen
          onBack={() => setViewMode('menu')}
          onNavigateToSafety={() => setViewMode('safety_center')}
          onNavigateToSettings={() => setViewMode('settings')}
        />
      )}

      {viewMode === 'settings' && (
        <SettingsScreen
          onBack={() => setViewMode('menu')}
          onLogout={handleLogout}
          onNavigateToPrivacy={() => setViewMode('privacy')}
          onNavigateToSafety={() => setViewMode('safety_center')}
          onNavigateToNotifications={() => setViewMode('notifications')}
        />
      )}
    </div>
  );
};
