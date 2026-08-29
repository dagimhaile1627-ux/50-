import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeTab } from './components/home/HomeTab';
import { DiscoverTab } from './components/discover/DiscoverTab';
import { MatchesTab } from './components/matches/MatchesTab';
import { MessagesTab } from './components/messages/MessagesTab';
import { EventsTab } from './components/events/EventsTab';
import { ProfileTab } from './components/profile/ProfileTab';
import { Smartphone, Monitor } from 'lucide-react';

// Modals
import { IdentityVerificationModal } from './components/modals/IdentityVerificationModal';
import { VideoCallModal } from './components/modals/VideoCallModal';
import { ProfileDetailModal } from './components/modals/ProfileDetailModal';
import { DatePlannerModal } from './components/modals/DatePlannerModal';
import { SafetyReportModal } from './components/modals/SafetyReportModal';
import { SubscriptionModal } from './components/modals/SubscriptionModal';
import { MatchCelebrationModal } from './components/modals/MatchCelebrationModal';

const MainAppContent: React.FC = () => {
  const { activeTab, loading, textScale, highContrast, deviceFrame, setDeviceFrame } = useApp();

  const textScaleClass =
    textScale === 'large' ? 'text-scale-large' : textScale === 'extra_large' ? 'text-scale-xl' : 'text-scale-normal';

  return (
    <div
      className={`min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black ${
        highContrast ? 'high-contrast-mode' : ''
      }`}
    >
      {/* Desktop Mode Switcher Bar */}
      <div className="hidden md:flex items-center justify-between px-4 py-2 bg-neutral-950 border-b border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">SilverHeart 50+ Mobile App</span>
          <span className="text-neutral-500">• Simple Black & White Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            id="toggle-phone-frame"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 transition-colors font-medium"
          >
            {deviceFrame ? <Smartphone className="w-3.5 h-3.5 text-white" /> : <Monitor className="w-3.5 h-3.5 text-white" />}
            <span>{deviceFrame ? 'Phone Frame' : 'Expanded View'}</span>
          </button>
        </div>
      </div>

      {/* Main App Container (Centered Phone Chassis on Desktop, Full Screen on Mobile) */}
      <div className={`flex-1 flex justify-center items-center overflow-hidden ${deviceFrame ? 'py-0 md:py-2 px-0 md:px-4' : ''}`}>
        <div
          className={`w-full flex flex-col justify-between bg-neutral-950 shadow-2xl relative ${
            deviceFrame
              ? 'max-w-[440px] h-full md:h-[96vh] md:max-h-[860px] md:rounded-[36px] md:border-2 md:border-neutral-700 md:shadow-[0_0_50px_rgba(255,255,255,0.05)] overflow-hidden'
              : 'max-w-md h-full'
          } ${textScaleClass}`}
        >
          {/* Top Mobile App Header */}
          <Header />

          {/* Screen Content - Fit without overflow */}
          <main className="flex-1 w-full overflow-hidden flex flex-col p-2.5 min-h-0 bg-black">
            {loading ? (
              <div className="m-auto text-center space-y-3">
                <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-neutral-400 text-sm font-medium">Loading SilverHeart 50+...</p>
              </div>
            ) : (
              <div className="w-full h-full flex-1 flex flex-col min-h-0 overflow-y-auto sm:overflow-hidden">
                {(activeTab === 'discover' || activeTab === 'home') && <DiscoverTab />}
                {activeTab === 'matches' && <MatchesTab />}
                {activeTab === 'messages' && <MessagesTab />}
                {(activeTab === 'events' || activeTab === 'activity') && <EventsTab />}
                {activeTab === 'profile' && <ProfileTab />}
              </div>
            )}
          </main>

          {/* Bottom Mobile Tab Bar */}
          <Navigation />
        </div>
      </div>

      {/* Modals & Overlays */}
      <IdentityVerificationModal />
      <VideoCallModal />
      <ProfileDetailModal />
      <DatePlannerModal />
      <SafetyReportModal />
      <SubscriptionModal />
      <MatchCelebrationModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

