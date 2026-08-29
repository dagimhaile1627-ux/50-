import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateProfileCompletion } from '../../utils/profileCompletion';
import {
  User,
  Edit3,
  ShieldCheck,
  Sliders,
  ShieldAlert,
  Lock,
  Bell,
  Crown,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export type ProfileViewMode =
  | 'menu'
  | 'view_profile'
  | 'edit_profile'
  | 'verification'
  | 'dating_preferences'
  | 'safety_center'
  | 'privacy'
  | 'notifications'
  | 'membership'
  | 'help_support'
  | 'settings';

interface ProfileNavigationMenuProps {
  onSelectView: (view: ProfileViewMode) => void;
  onLogout: () => void;
}

export const ProfileNavigationMenu: React.FC<ProfileNavigationMenuProps> = ({
  onSelectView,
  onLogout,
}) => {
  const { currentUser, setShowVerificationModal, setShowSubscriptionModal } = useApp();

  if (!currentUser) return null;

  const completion = calculateProfileCompletion(currentUser);
  const primaryPhoto =
    currentUser.photos?.find((p) => p.isPrimary)?.url ||
    currentUser.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80';

  const menuItems: Array<{
    id: ProfileViewMode;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: 'view_profile',
      label: 'View My Profile',
      description: 'See how your complete profile looks to other members',
      icon: Eye,
    },
    {
      id: 'edit_profile',
      label: 'Edit Profile',
      description: 'Update photos, bio, interests, lifestyle, and values',
      icon: Edit3,
      badge: completion.percentage < 100 ? `${completion.percentage}%` : undefined,
      badgeColor: 'bg-neutral-800 text-white',
    },
    {
      id: 'verification',
      label: 'Profile Verification',
      description: 'Email, phone, photo, and 50+ age verification',
      icon: ShieldCheck,
      badge: currentUser.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending',
      badgeColor: currentUser.verificationStatus === 'VERIFIED' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-300',
    },
    {
      id: 'dating_preferences',
      label: 'Dating Preferences',
      description: 'Age range, distance, intentions, and lifestyle filters',
      icon: Sliders,
    },
    {
      id: 'safety_center',
      label: 'Safety Center',
      description: 'Scam awareness, safety tips, reporting, and emergency help',
      icon: ShieldAlert,
    },
    {
      id: 'privacy',
      label: 'Privacy Controls',
      description: 'Manage profile visibility, online status, and distance precision',
      icon: Lock,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Customize match alerts, message notices, and safety check-ins',
      icon: Bell,
    },
    {
      id: 'membership',
      label: 'Membership & Plans',
      description: 'Review free features and premium upgrades',
      icon: Crown,
      badge: currentUser.subscriptionTier !== 'FREE' ? 'Premium' : 'Free Member',
      badgeColor: currentUser.subscriptionTier !== 'FREE' ? 'bg-white text-black font-black' : 'bg-neutral-800 text-neutral-300',
    },
    {
      id: 'help_support',
      label: 'Help & Support',
      description: 'FAQs, beginner guide, safety assistance, and contact support',
      icon: HelpCircle,
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Account security, language, units, and legal guidelines',
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* User Header Summary Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={primaryPhoto}
              alt={currentUser.firstName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-neutral-700 shadow-md"
            />
            {currentUser.verificationStatus === 'VERIFIED' && (
              <div
                className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-1 shadow-md border border-neutral-300"
                title="Verified 50+ Member"
              >
                <CheckCircle2 className="w-3.5 h-3.5 fill-black text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white truncate">
                {currentUser.firstName}, {currentUser.age}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-300 mt-1">
              <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate">
                {currentUser.city || currentUser.location?.city || 'Seattle'}, {currentUser.state || currentUser.location?.state || 'WA'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
                {currentUser.subscriptionTier === 'FREE' ? 'Standard Member' : 'Golden Dignity Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completion Indicator - Non-pressuring & Encouraging */}
        <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
            <span className="text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Profile Completion</span>
            </span>
            <span className="font-bold text-white">{completion.percentage}%</span>
          </div>

          <div className="w-full bg-neutral-950 rounded-full h-2.5 border border-neutral-800 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${completion.percentage}%` }}
              role="progressbar"
              aria-valuenow={completion.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <p className="text-[12px] text-neutral-400 leading-snug">
            {completion.message}
          </p>
        </div>
      </div>

      {/* Profile Navigation Menu Rows */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1 pt-2">
          Profile & Account Menu
        </h3>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`btn-menu-${item.id}`}
                onClick={() => onSelectView(item.id)}
                aria-label={`${item.label}: ${item.description}`}
                className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all group tap-active min-h-[58px]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 group-hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-white group-hover:text-white">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-white shrink-0 transition-colors" />
              </button>
            );
          })}

          {/* Logout Button */}
          <button
            id="btn-menu-logout"
            onClick={onLogout}
            aria-label="Log Out of your account"
            className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-red-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all group tap-active min-h-[58px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 group-hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 text-neutral-300 group-hover:text-white" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-neutral-200 group-hover:text-white">
                  Log Out
                </span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Safely sign out of your SilverHeart session
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-white shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
