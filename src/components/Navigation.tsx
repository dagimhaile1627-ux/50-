import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Heart, MessageSquareText, Calendar, User, LucideIcon } from 'lucide-react';
import { NavigationTab } from '../types';

interface TabItem {
  id: NavigationTab;
  label: string;
  icon: LucideIcon;
  badge?: number;
  accessibilityLabel: string;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, matches, conversations } = useApp();

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const activeMatchesCount = matches.length;

  const tabs: TabItem[] = [
    {
      id: 'discover',
      label: 'Discover',
      icon: Compass,
      accessibilityLabel: 'Discover personalized 50+ companion recommendations',
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: Heart,
      badge: activeMatchesCount > 0 ? activeMatchesCount : undefined,
      accessibilityLabel: `Matches tab, ${activeMatchesCount} active connections`,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquareText,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
      accessibilityLabel: `Messages tab, ${totalUnreadMessages} unread messages`,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Calendar,
      accessibilityLabel: 'Activity tab: Community events and shared date ideas',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      accessibilityLabel: 'Profile and account settings tab',
    },
  ];

  return (
    <nav
      className="bg-black border-t border-neutral-800 text-neutral-300 select-none z-20 shrink-0 sticky bottom-0"
      role="navigation"
      aria-label="Primary Mobile Navigation"
    >
      <div className="w-full max-w-md mx-auto px-1.5 pt-2 pb-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id || (tab.id === 'discover' && activeTab === 'home') || (tab.id === 'activity' && activeTab === 'events');

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.accessibilityLabel}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center py-2 px-2 min-w-[56px] min-h-[56px] rounded-2xl transition-all tap-active ${
                isActive
                  ? 'text-white font-bold bg-neutral-900 shadow-md border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                    isActive ? 'text-white stroke-[2.5] scale-110' : 'text-neutral-400 stroke-[1.8]'
                  }`}
                />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] sm:text-xs mt-1 tracking-tight leading-none ${
                  isActive ? 'text-white font-black' : 'text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile OS Gesture Home Bar */}
      <div className="w-full flex justify-center pb-1.5 pt-0.5 pointer-events-none">
        <div className="w-28 h-1 bg-neutral-700 rounded-full" />
      </div>
    </nav>
  );
};
