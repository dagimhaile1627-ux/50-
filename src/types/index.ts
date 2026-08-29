export type Role = 'USER' | 'MODERATOR' | 'SUPPORT' | 'ADMIN' | 'SUPER_ADMIN';

export type RelationshipGoal = 
  | 'serious_relationship'
  | 'marriage'
  | 'dating'
  | 'companionship'
  | 'friendship'
  | 'travel_companionship'
  | 'activity_partner';

export type RelationshipStatus = 
  | 'divorced'
  | 'widowed'
  | 'never_married'
  | 'separated'
  | 'single';

export type VerificationStatus = 
  | 'NOT_STARTED'
  | 'PENDING'
  | 'PROCESSING'
  | 'VERIFIED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REVIEW_REQUIRED'
  | 'REVOKED';

export type VerificationType = 'GOVERNMENT_ID' | 'LIVENESS_CHECK' | 'PHONE_OTP' | 'MANUAL_REVIEW';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type PhotoModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';

export type SubscriptionTier = 'FREE' | 'GOLDEN_PREMIUM' | 'PLATINUM_VIP';

export interface UserPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  moderationStatus: PhotoModerationStatus;
  caption?: string;
  uploadedAt: string;
}

export interface TrustedContact {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  notifyOnDate: boolean;
}

export interface UserProfile {
  id: string;
  userId?: string;
  email?: string;
  firstName: string;
  lastName?: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  gender: 'man' | 'woman' | 'non_binary' | 'prefer_not_to_say';
  lookingFor?: 'men' | 'women' | 'everyone';
  city?: string;
  state?: string;
  distanceMiles?: number;
  location: {
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    distanceMiles?: number;
  };
  bio: string;
  aboutMe?: string;
  relationshipGoals: RelationshipGoal[];
  relationshipStatus: RelationshipStatus;
  occupation: string;
  retirementStatus: 'retired' | 'semi_retired' | 'working_full_time' | 'working_part_time' | 'volunteer';
  education: string;
  children: 'grown_children' | 'have_children' | 'no_children' | 'prefer_not_to_say';
  languages: string[];
  interests: string[];
  hobbies: string[];
  lifestyle: {
    activityLevel: 'daily_active' | 'moderate' | 'relaxed' | 'homebody';
    morningOrNight: 'early_bird' | 'night_owl' | 'flexible';
    smoking: 'non_smoker' | 'occasional' | 'regular';
    alcohol: 'non_drinker' | 'social_wine' | 'regular';
    pets: string[];
    exercise?: 'daily' | 'several_times_week' | 'light_walks' | 'rarely';
    livingSituation?: 'own_home' | 'condo_apartment' | 'retirement_community' | 'with_family';
  };
  travelPreferences: string[];
  communicationStyle: 'phone_calls' | 'thoughtful_messages' | 'in_person' | 'video_chats';
  relationshipExpectations: string;
  photos: UserPhoto[];
  verificationStatus: VerificationStatus;
  verificationBadge: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idVerified?: boolean;
  verifiedAt?: string;
  isOnline: boolean;
  lastActive: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  compatibilityScore?: number;
  compatibilityReasons?: string[];
  trustedContact?: TrustedContact;
  values?: string[];
  datingPreferences?: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    distanceUnit: 'miles' | 'km';
    gender: 'men' | 'women' | 'everyone';
    relationshipGoals: RelationshipGoal[];
    interests: string[];
    lifestylePreferences: {
      smoking?: string;
      alcohol?: string;
      pets?: string;
      exercise?: string;
      retirement?: string;
    };
    location?: string;
  };
  notificationSettings?: {
    newMatch: boolean;
    newMessage: boolean;
    newLike: boolean;
    profileView: boolean;
    recommendations: boolean;
    safetyAlert: boolean;
    accountAlert: boolean;
    channelEmail: boolean;
    channelSMS: boolean;
    channelPush: boolean;
  };
  appPreferences?: {
    language: 'English' | 'Spanish' | 'French' | 'German';
    distanceUnits: 'miles' | 'km';
    isPaused: boolean;
  };
  privacySettings?: {
    profileVisibility?: 'public' | 'matches_only' | 'hidden';
    photoVisibility?: 'all' | 'verified_only';
    showOnlineStatus?: boolean;
    showLastActive?: boolean;
    showProfileViews?: boolean;
    sendReadReceipts?: boolean;
    locationPrecision?: 'approximate' | 'city_state' | 'hidden';
    searchVisibility?: boolean;
    showDistance: boolean;
    showCityOnly: boolean;
    incognitoMode: boolean;
  };
  blockedUsers?: string[];
  likedByCount?: number;
}

export interface CompatibilityBreakdown {
  overallScore: number;
  interestScore: number; // 30%
  relationshipGoalScore: number; // 25%
  locationScore: number; // 20%
  lifestyleScore: number; // 15%
  agePreferenceScore: number; // 10%
  sharedInterests: string[];
  sharedGoals: string[];
  lifestyleMatches: string[];
  distanceKm: number;
  reasons: string[];
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  user: UserProfile;
  createdAt: string;
  compatibilityScore: number;
  compatibilityBreakdown?: CompatibilityBreakdown;
  status: 'active' | 'archived' | 'unmatched';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isFavorite?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  mediaType?: 'text' | 'image' | 'voice_note';
  mediaUrl?: string;
  voiceDurationSeconds?: number;
  createdAt: string;
  isRead: boolean;
  isDelivered?: boolean;
  flaggedRisk?: RiskLevel;
  riskReason?: string;
  scamWarningGiven?: boolean;
}

export interface Conversation {
  id: string;
  participant: UserProfile;
  lastMessage?: Message;
  unreadCount: number;
  isPausedDueToRisk: boolean;
  isTyping?: boolean;
  riskAlert?: {
    level: RiskLevel;
    message: string;
    signals: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: 'walking' | 'book_club' | 'coffee' | 'travel' | 'dancing' | 'cooking' | 'cultural' | 'social' | 'hobby' | 'dinner';
  description: string;
  imageUrl?: string;
  host: {
    id: string;
    name: string;
    photo: string;
    isVerified: boolean;
  };
  locationName: string;
  address: string;
  city: string;
  date: string;
  time: string;
  attendeesCount: number;
  maxCapacity: number;
  isJoined: boolean;
  accessibilityNotes: string[];
  safetyApproved: boolean;
  discussionMessages?: Array<{
    id: string;
    senderName: string;
    senderPhoto: string;
    text: string;
    time: string;
  }>;
}

export interface DatePlan {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string;
  activity: string;
  locationName: string;
  address: string;
  date: string;
  time: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED';
  sharedWithTrustedContact: boolean;
  reminderMinutesBefore: number;
}

export interface DateSuggestion {
  id: string;
  title: string;
  category: 'coffee' | 'museum' | 'botanical_garden' | 'casual_dining' | 'scenic_walk' | 'cultural' | 'lunch' | 'park' | 'concert';
  locationName: string;
  address: string;
  description: string;
  whySafe: string;
  budget: '$' | '$$' | '$$$';
  accessibilityHighlights: string[];
  bestTimes: string;
}

export interface AppNotification {
  id: string;
  type: 'match' | 'message' | 'event_reminder' | 'date_reminder' | 'verification' | 'safety_alert';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionTab?: NavigationTab;
  metadata?: any;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  category: 'Scam/Financial' | 'Fake Profile' | 'Harassment' | 'Inappropriate Content' | 'Pressure off-platform' | 'Other';
  description: string;
  evidenceSnippets: string[];
  riskLevel: RiskLevel;
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'RESOLVED_ACTIONED' | 'DISMISSED';
  moderatorAction?: string;
  createdAt: string;
}

export interface ModerationAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorRole: Role;
  targetUserId: string;
  targetUserName: string;
  details: string;
  timestamp: string;
}

export interface DiscoveryFilter {
  goal?: RelationshipGoal | 'all';
  ageMin: number;
  ageMax: number;
  maxDistanceMiles: number;
  verifiedOnly: boolean;
  activityLevel: string | 'all';
  retirementStatus: string | 'all';
  relationshipStatus: string | 'all';
  petPreference: string | 'all';
  smokingPreference: string | 'all';
  drinkingPreference: string | 'all';
  keyword: string;
}

export type TextScale = 'normal' | 'large' | 'extra_large';

export type NavigationTab = 'discover' | 'matches' | 'messages' | 'activity' | 'profile' | 'home' | 'events' | 'safety';

