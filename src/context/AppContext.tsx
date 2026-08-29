import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Match,
  Conversation,
  Message,
  CommunityEvent,
  DateSuggestion,
  TextScale,
  DiscoveryFilter,
} from '../types';
import { API } from '../services/api';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  activeTab: 'home' | 'discover' | 'matches' | 'messages' | 'profile' | 'events';
  setActiveTab: (tab: 'home' | 'discover' | 'matches' | 'messages' | 'profile' | 'events') => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  deviceFrame: boolean;
  setDeviceFrame: (val: boolean) => void;
  
  // Data
  discoveryProfiles: UserProfile[];
  matches: Match[];
  conversations: Conversation[];
  events: CommunityEvent[];
  dateSuggestions: DateSuggestion[];
  
  // Filters
  discoveryFilter: DiscoveryFilter;
  setDiscoveryFilter: React.Dispatch<React.SetStateAction<DiscoveryFilter>>;
  
  // Modals & Active states
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  selectedProfileDetail: UserProfile | null;
  setSelectedProfileDetail: (profile: UserProfile | null) => void;
  showVerificationModal: boolean;
  setShowVerificationModal: (val: boolean) => void;
  showVideoDateModal: boolean;
  setShowVideoDateModal: (val: boolean) => void;
  showDatePlannerModal: boolean;
  setShowDatePlannerModal: (val: boolean) => void;
  showSafetyReportModal: { open: boolean; targetUser?: UserProfile };
  setShowSafetyReportModal: (val: { open: boolean; targetUser?: UserProfile }) => void;
  showAdminDashboard: boolean;
  setShowAdminDashboard: (val: boolean) => void;
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: (val: boolean) => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (val: boolean) => void;
  newMatchModal: UserProfile | null;
  setNewMatchModal: (user: UserProfile | null) => void;
  
  // Actions
  refreshAllData: () => Promise<void>;
  handleLike: (targetUser: UserProfile) => Promise<void>;
  handlePass: (targetUserId: string) => Promise<void>;
  handleSendMessage: (conversationId: string, receiverId: string, text: string) => Promise<Message | null>;
  handleToggleRSVP: (eventId: string) => Promise<void>;
  handleCompleteVerification: (outcome: 'VERIFIED' | 'REVIEW_REQUIRED' | 'FAILED') => Promise<void>;
  handleBlockUser: (targetUserId: string) => Promise<void>;
  handleUpgradeTier: (tier: string) => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'matches' | 'messages' | 'profile' | 'events'>('home');
  const [textScale, setTextScale] = useState<TextScale>('large'); // Default to comfortable Large for 50+ seniors
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Lists
  const [discoveryProfiles, setDiscoveryProfiles] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [dateSuggestions, setDateSuggestions] = useState<DateSuggestion[]>([]);

  // Filter
  const [discoveryFilter, setDiscoveryFilter] = useState<DiscoveryFilter>({
    goal: 'all',
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
  });

  // Modals
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<UserProfile | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [showVideoDateModal, setShowVideoDateModal] = useState<boolean>(false);
  const [showDatePlannerModal, setShowDatePlannerModal] = useState<boolean>(false);
  const [showSafetyReportModal, setShowSafetyReportModal] = useState<{ open: boolean; targetUser?: UserProfile }>({ open: false });
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [newMatchModal, setNewMatchModal] = useState<UserProfile | null>(null);

  const refreshAllData = async () => {
    try {
      setLoading(true);
      const [user, disc, mtchs, convs, evts, dates] = await Promise.all([
        API.getMe(),
        API.getDiscovery(discoveryFilter),
        API.getMatches(),
        API.getConversations(),
        API.getEvents(),
        API.getDateSuggestions(),
      ]);
      setCurrentUser(user);
      setDiscoveryProfiles(disc.profiles);
      setMatches(mtchs);
      setConversations(convs);
      setEvents(evts);
      setDateSuggestions(dates);
    } catch (err) {
      console.error('Error loading app data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [discoveryFilter.goal, discoveryFilter.verifiedOnly, discoveryFilter.maxDistanceMiles]);

  const handleLike = async (targetUser: UserProfile) => {
    try {
      const res = await API.likeProfile(targetUser.id);
      // Remove from discovery deck
      setDiscoveryProfiles((prev) => prev.filter((p) => p.id !== targetUser.id));

      if (res.isMatch) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#0284c7', '#f59e0b'],
        });
        setNewMatchModal(targetUser);
        const updatedMatches = await API.getMatches();
        setMatches(updatedMatches);
        const updatedConvs = await API.getConversations();
        setConversations(updatedConvs);
      }
    } catch (err) {
      console.error('Error liking profile:', err);
    }
  };

  const handlePass = async (targetUserId: string) => {
    try {
      await API.passProfile(targetUserId);
      setDiscoveryProfiles((prev) => prev.filter((p) => p.id !== targetUserId));
    } catch (err) {
      console.error('Error passing profile:', err);
    }
  };

  const handleSendMessage = async (conversationId: string, receiverId: string, text: string): Promise<Message | null> => {
    try {
      const res = await API.sendMessage(conversationId, receiverId, text);
      const convs = await API.getConversations();
      setConversations(convs);
      return res.message;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  };

  const handleToggleRSVP = async (eventId: string) => {
    try {
      const res = await API.rsvpEvent(eventId);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, isJoined: res.isJoined, attendeesCount: e.attendeesCount + (res.isJoined ? 1 : -1) }
            : e
        )
      );
    } catch (err) {
      console.error('Error RSVPing to event:', err);
    }
  };

  const handleCompleteVerification = async (outcome: 'VERIFIED' | 'REVIEW_REQUIRED' | 'FAILED') => {
    try {
      await API.completeVerification(outcome, "Driver's License & Biometric Liveness");
      const updatedMe = await API.getMe();
      setCurrentUser(updatedMe);
      setShowVerificationModal(false);
    } catch (err) {
      console.error('Error completing verification:', err);
    }
  };

  const handleBlockUser = async (targetUserId: string) => {
    try {
      await API.blockUser(targetUserId);
      setDiscoveryProfiles((prev) => prev.filter((p) => p.id !== targetUserId));
      setMatches((prev) => prev.filter((m) => m.user.id !== targetUserId));
      setConversations((prev) => prev.filter((c) => c.participant.id !== targetUserId));
      if (activeConversation?.participant.id === targetUserId) {
        setActiveConversation(null);
      }
      if (selectedProfileDetail?.id === targetUserId) {
        setSelectedProfileDetail(null);
      }
    } catch (err) {
      console.error('Error blocking user:', err);
    }
  };

  const handleUpgradeTier = async (tier: string) => {
    try {
      await API.upgradeTier(tier);
      const updated = await API.getMe();
      setCurrentUser(updated);
      setShowSubscriptionModal(false);
    } catch (err) {
      console.error('Error upgrading subscription:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        textScale,
        setTextScale,
        highContrast,
        setHighContrast,
        deviceFrame,
        setDeviceFrame,
        discoveryProfiles,
        matches,
        conversations,
        events,
        dateSuggestions,
        discoveryFilter,
        setDiscoveryFilter,
        activeConversation,
        setActiveConversation,
        selectedProfileDetail,
        setSelectedProfileDetail,
        showVerificationModal,
        setShowVerificationModal,
        showVideoDateModal,
        setShowVideoDateModal,
        showDatePlannerModal,
        setShowDatePlannerModal,
        showSafetyReportModal,
        setShowSafetyReportModal,
        showAdminDashboard,
        setShowAdminDashboard,
        showSubscriptionModal,
        setShowSubscriptionModal,
        showOnboardingModal,
        setShowOnboardingModal,
        newMatchModal,
        setNewMatchModal,
        refreshAllData,
        handleLike,
        handlePass,
        handleSendMessage,
        handleToggleRSVP,
        handleCompleteVerification,
        handleBlockUser,
        handleUpgradeTier,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
