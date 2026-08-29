import fs from 'fs';
import path from 'path';

export interface UserPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
  moderationStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface UserLifestyle {
  activityLevel: 'gentle' | 'moderate' | 'active' | 'very_active';
  morningOrNight: 'early_bird' | 'night_owl' | 'flexible';
  smoking: 'non_smoker' | 'occasional' | 'regular' | 'smoker';
  alcohol: 'non_drinker' | 'social_wine' | 'occasional' | 'regular';
  pets: string[];
}

export interface TrustedContact {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  notifyOnDate: boolean;
}

export interface PrivacySettings {
  showDistance: boolean;
  showCityOnly: boolean;
  incognitoMode: boolean;
}

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  firstName: string;
  gender: string;
  lookingForGender?: string;
  city: string;
  state: string;
  country?: string;
  distanceMiles: number;
  bio: string;
  relationshipGoals: string[];
  relationshipStatus: string;
  occupation: string;
  retirementStatus: string;
  education: string;
  children: string;
  languages: string[];
  interests: string[];
  hobbies: string[];
  lifestyle: UserLifestyle;
  travelPreferences: string[];
  communicationStyle: string;
  relationshipExpectations: string;
  photos: UserPhoto[];
  verificationStatus: 'NOT_STARTED' | 'PROCESSING' | 'VERIFIED' | 'FAILED' | 'REQUIRES_REVIEW';
  verificationBadge: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  subscriptionTier: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
  subscriptionStatus: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
  subscriptionRenewsAt?: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  isOnline: boolean;
  blockedUsers: string[];
  likedUserIds: string[];
  dislikedUserIds: string[];
  favorites: string[];
  trustedContact?: TrustedContact;
  privacySettings: PrivacySettings;
  easyMode?: boolean;
}

export interface DBMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  replyToMessageId?: string;
  replyToText?: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  isScamWarning?: boolean;
  scamWarningReason?: string;
}

export interface DBConversation {
  id: string;
  participantIds: string[];
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCountByUser: Record<string, number>;
  isPinnedByUser?: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface DBMatch {
  id: string;
  userId1: string;
  userId2: string;
  compatibilityScore: number;
  commonReasons: string[];
  status: 'ACTIVE' | 'UNMATCHED';
  createdAt: string;
  isFavoriteByUser?: Record<string, boolean>;
}

export interface DBNotification {
  id: string;
  userId: string;
  type: 'match' | 'message' | 'date_reminder' | 'event_reminder' | 'verification' | 'safety' | 'subscription';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
  metadata?: any;
}

export interface DBReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  category: 'Scam/Financial' | 'Inappropriate Behavior' | 'Fake Profile / Underage' | 'Harassment' | 'Spam';
  description: string;
  evidenceSnippets: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'RESOLVED_ACTIONED' | 'DISMISSED';
  moderatorAction?: 'NONE' | 'WARNING_SENT' | 'SUSPENDED' | 'PERMANENT_BAN';
  moderatorNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DBVerificationSession {
  id: string;
  userId: string;
  status: 'NOT_STARTED' | 'PROCESSING' | 'VERIFIED' | 'FAILED' | 'REQUIRES_REVIEW';
  documentType: 'DRIVERS_LICENSE' | 'PASSPORT' | 'STATE_ID';
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  extractedName?: string;
  extractedDob?: string;
  extractedAge?: number;
  faceMatchConfidence?: number;
  rejectionReason?: string;
  startedAt: string;
  completedAt?: string;
  reviewedBy?: string;
}

export interface DBDatePlan {
  id: string;
  creatorId: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string;
  activity: string;
  locationName: string;
  address: string;
  date: string;
  time: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'RESCHEDULED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
  sharedWithTrustedContact: boolean;
  reminderMinutesBefore: number;
  checkInStatus?: 'PENDING' | 'SAFE_CONFIRMED' | 'ALERT_SENT';
  checkInDueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBEventAttendee {
  userId: string;
  name: string;
  photoUrl: string;
  status: 'GOING' | 'INTERESTED' | 'WAITLIST';
  joinedAt: string;
}

export interface DBEventMessage {
  id: string;
  eventId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  createdAt: string;
}

export interface DBEvent {
  id: string;
  title: string;
  category: 'walking' | 'book_club' | 'culinary' | 'arts' | 'gardening' | 'social';
  description: string;
  hostId: string;
  hostName: string;
  hostPhoto: string;
  locationName: string;
  address: string;
  city: string;
  date: string;
  time: string;
  maxCapacity: number;
  accessibilityNotes: string[];
  safetyApproved: boolean;
  attendees: DBEventAttendee[];
  createdAt: string;
}

export interface DBAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  targetId?: string;
  targetType?: string;
  details: string;
  timestamp: string;
}

export interface DBPaymentTransaction {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: DBUser[];
  conversations: DBConversation[];
  messages: DBMessage[];
  matches: DBMatch[];
  notifications: DBNotification[];
  reports: DBReport[];
  verificationSessions: DBVerificationSession[];
  datePlans: DBDatePlan[];
  events: DBEvent[];
  eventMessages: DBEventMessage[];
  auditLogs: DBAuditLog[];
  paymentTransactions: DBPaymentTransaction[];
  emailVerificationCodes: Record<string, { code: string; expiresAt: number }>;
  passwordResetCodes: Record<string, { code: string; expiresAt: number }>;
  revokedTokens: string[];
  pushSubscriptions: Array<{ userId: string; subscription: any; createdAt: string }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class PersistentDatabase {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading persistent database from disk, rebuilding with initial seed data:', err);
    }
    const initialData = this.generateSeedData();
    this.saveImmediate(initialData);
    return initialData;
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
    }, 100);
  }

  public saveImmediate(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving persistent database to disk:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  private generateSeedData(): DatabaseSchema {
    // Standard secure bcrypt hash for default password 'Password123!' (salt 10)
    // $2a$10$w8.gZ9bQ2X2mJ3O5B7q1.e5FzQyWnJ2k8x3v5b7y9u1i3o5p7a9s1
    // We'll use a pre-calculated valid bcrypt hash
    const DEFAULT_PW_HASH = "$2a$10$WqKz1oKzM0c3UfWqT5.8e.Hq1Z8cK9xP2mQ0xN7.mP4.s8Y0q9B2G";

    const users: DBUser[] = [
      {
        id: "user_me",
        email: "eleanor.vance@example.com",
        passwordHash: DEFAULT_PW_HASH,
        phone: "+1 (555) 234-8901",
        dateOfBirth: "1966-04-12",
        age: 60,
        role: "USER",
        firstName: "Eleanor",
        gender: "woman",
        lookingForGender: "man",
        city: "Seattle",
        state: "WA",
        country: "United States",
        distanceMiles: 0,
        bio: "Retired high school literature teacher. Widowed 4 years ago and ready for a gentle, genuine chapter. I adore morning walks at the arboretum, cozy coffee shops, watercolor painting, and planning relaxed road trips with someone kind.",
        relationshipGoals: ["companionship", "serious_relationship", "travel_companionship"],
        relationshipStatus: "widowed",
        occupation: "Retired Literature Educator",
        retirementStatus: "retired",
        education: "Master of Arts in English",
        children: "grown_children",
        languages: ["English", "French"],
        interests: ["Reading & Book Clubs", "Gardening", "Watercolor", "Classical Music", "National Parks", "Slow Cooking"],
        hobbies: ["Botanical Garden Walks", "Baking Sourdough", "Antiques Collecting"],
        lifestyle: {
          activityLevel: "moderate",
          morningOrNight: "early_bird",
          smoking: "non_smoker",
          alcohol: "social_wine",
          pets: ["Golden Retriever (Barnaby)"],
        },
        travelPreferences: ["Scenic Train Journeys", "Coastal Bed & Breakfasts", "National Parks"],
        communicationStyle: "thoughtful_messages",
        relationshipExpectations: "Looking for honesty, emotional maturity, a good sense of humor, and mutual respect. No rushing.",
        photos: [
          {
            id: "photo_e1",
            url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
            isPrimary: true,
            moderationStatus: "APPROVED",
          },
          {
            id: "photo_e2",
            url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
            isPrimary: false,
            moderationStatus: "APPROVED",
          },
        ],
        verificationStatus: "VERIFIED",
        verificationBadge: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionTier: "PREMIUM",
        subscriptionStatus: "ACTIVE",
        subscriptionRenewsAt: "2026-12-31T23:59:59Z",
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2026-08-28T00:00:00Z",
        lastActive: "Just now",
        isOnline: true,
        blockedUsers: [],
        likedUserIds: ["user_robert"],
        dislikedUserIds: [],
        favorites: ["user_robert"],
        trustedContact: {
          name: "Sarah Vance (Daughter)",
          phone: "+1 (555) 789-0123",
          email: "sarah.vance@example.com",
          relationship: "Adult Child",
          notifyOnDate: true,
        },
        privacySettings: {
          showDistance: true,
          showCityOnly: false,
          incognitoMode: false,
        },
        easyMode: false,
      },
      {
        id: "user_admin",
        email: "admin@silverharmony.org",
        passwordHash: DEFAULT_PW_HASH,
        phone: "+1 (555) 000-0001",
        dateOfBirth: "1960-01-01",
        age: 66,
        role: "ADMIN",
        firstName: "System Admin",
        gender: "other",
        city: "Seattle",
        state: "WA",
        distanceMiles: 0,
        bio: "Silver Harmony Security & Community Safety Team Administrator.",
        relationshipGoals: ["friendship"],
        relationshipStatus: "single",
        occupation: "Community Lead",
        retirementStatus: "semi_retired",
        education: "PhD",
        children: "none",
        languages: ["English"],
        interests: ["Safety", "Community Building"],
        hobbies: [],
        lifestyle: {
          activityLevel: "moderate",
          morningOrNight: "flexible",
          smoking: "non_smoker",
          alcohol: "non_drinker",
          pets: [],
        },
        travelPreferences: [],
        communicationStyle: "direct",
        relationshipExpectations: "Platform Moderation",
        photos: [
          {
            id: "photo_admin_1",
            url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
            isPrimary: true,
            moderationStatus: "APPROVED",
          }
        ],
        verificationStatus: "VERIFIED",
        verificationBadge: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionTier: "PREMIUM_PLUS",
        subscriptionStatus: "ACTIVE",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2026-08-28T00:00:00Z",
        lastActive: "Just now",
        isOnline: true,
        blockedUsers: [],
        likedUserIds: [],
        dislikedUserIds: [],
        favorites: [],
        privacySettings: {
          showDistance: false,
          showCityOnly: true,
          incognitoMode: false,
        }
      },
      {
        id: "user_robert",
        email: "robert.hayes@example.com",
        passwordHash: DEFAULT_PW_HASH,
        phone: "+1 (555) 345-6789",
        dateOfBirth: "1963-08-22",
        age: 63,
        role: "USER",
        firstName: "Robert",
        gender: "man",
        lookingForGender: "woman",
        city: "Seattle",
        state: "WA",
        country: "United States",
        distanceMiles: 4,
        bio: "Former civil engineer now spending joyous time in my woodworking shop and volunteering at the botanical gardens. I appreciate good conversation, acoustic guitar music, fresh local roast coffee, and visiting scenic lighthouses.",
        relationshipGoals: ["companionship", "serious_relationship", "activity_partner"],
        relationshipStatus: "divorced",
        occupation: "Retired Civil Engineer & Woodworker",
        retirementStatus: "retired",
        education: "Bachelor of Science in Engineering",
        children: "grown_children",
        languages: ["English"],
        interests: ["Woodworking", "Gardening", "Coffee Tasting", "Hiking & Walking", "Acoustic Music", "History Museums"],
        hobbies: ["Building Acoustic Guitars", "Restoring Classic Furniture", "Landscape Photography"],
        lifestyle: {
          activityLevel: "moderate",
          morningOrNight: "early_bird",
          smoking: "non_smoker",
          alcohol: "social_wine",
          pets: ["Rescue Labrador mix (Rusty)"],
        },
        travelPreferences: ["Scenic Coastlines", "Historical Towns", "Train Trips"],
        communicationStyle: "phone_calls_and_text",
        relationshipExpectations: "Seeking a sincere, kindhearted woman to share life's quiet beauty, laughs over dinner, and weekend outings.",
        photos: [
          {
            id: "photo_r1",
            url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
            isPrimary: true,
            moderationStatus: "APPROVED",
          },
          {
            id: "photo_r2",
            url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
            isPrimary: false,
            moderationStatus: "APPROVED",
          },
        ],
        verificationStatus: "VERIFIED",
        verificationBadge: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionTier: "PREMIUM",
        subscriptionStatus: "ACTIVE",
        createdAt: "2024-01-12T09:30:00Z",
        updatedAt: "2026-08-28T00:00:00Z",
        lastActive: "15m ago",
        isOnline: true,
        blockedUsers: [],
        likedUserIds: ["user_me"],
        dislikedUserIds: [],
        favorites: ["user_me"],
        privacySettings: {
          showDistance: true,
          showCityOnly: false,
          incognitoMode: false,
        },
      },
      {
        id: "user_arthur",
        email: "arthur.pendleton@example.com",
        passwordHash: DEFAULT_PW_HASH,
        phone: "+1 (555) 456-7890",
        dateOfBirth: "1958-11-05",
        age: 67,
        role: "USER",
        firstName: "Arthur",
        gender: "man",
        lookingForGender: "woman",
        city: "Bellevue",
        state: "WA",
        country: "United States",
        distanceMiles: 8,
        bio: "Former university history dean with an enduring curiosity for the world. You will find me at symphony matinees, perusing indie bookstores, or tending my heirloom tomato patch. Seeking thoughtful companionship.",
        relationshipGoals: ["companionship", "travel_companionship", "friendship"],
        relationshipStatus: "widowed",
        occupation: "Professor Emeritus of History",
        retirementStatus: "retired",
        education: "Doctorate in European History",
        children: "grown_children",
        languages: ["English", "German"],
        interests: ["Classical Music", "Reading & Book Clubs", "History Museums", "Gardening", "Culinary Arts", "Theater"],
        hobbies: ["Chess", "Documentary Film", "Bird Watching"],
        lifestyle: {
          activityLevel: "moderate",
          morningOrNight: "flexible",
          smoking: "non_smoker",
          alcohol: "social_wine",
          pets: ["None currently"],
        },
        travelPreferences: ["European Heritage Tours", "Historic Rail Journeys", "Art Cities"],
        communicationStyle: "thoughtful_messages",
        relationshipExpectations: "A warm and stimulating partnership based on shared intellectual curiosity, warmth, and laughter.",
        photos: [
          {
            id: "photo_a1",
            url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
            isPrimary: true,
            moderationStatus: "APPROVED",
          },
        ],
        verificationStatus: "VERIFIED",
        verificationBadge: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionTier: "FREE",
        subscriptionStatus: "ACTIVE",
        createdAt: "2024-01-20T11:00:00Z",
        updatedAt: "2026-08-28T00:00:00Z",
        lastActive: "1 hour ago",
        isOnline: false,
        blockedUsers: [],
        likedUserIds: [],
        dislikedUserIds: [],
        favorites: [],
        privacySettings: {
          showDistance: true,
          showCityOnly: false,
          incognitoMode: false,
        },
      },
      {
        id: "user_martha",
        email: "martha.greene@example.com",
        passwordHash: DEFAULT_PW_HASH,
        phone: "+1 (555) 567-8901",
        dateOfBirth: "1964-03-14",
        age: 62,
        role: "USER",
        firstName: "Martha",
        gender: "woman",
        lookingForGender: "man",
        city: "Kirkland",
        state: "WA",
        country: "United States",
        distanceMiles: 11,
        bio: "Landscape designer still happily consulting on select botanical projects. Passionate about sourdough baking, Masterpiece theater, native plant restoration, and lively dinners with friends.",
        relationshipGoals: ["serious_relationship", "companionship"],
        relationshipStatus: "divorced",
        occupation: "Botanical Landscape Consultant",
        retirementStatus: "semi_retired",
        education: "Bachelor of Landscape Architecture",
        children: "grown_children",
        languages: ["English"],
        interests: ["Gardening", "Slow Cooking", "Theater", "Nature Walks", "Art Galleries", "Pottery"],
        hobbies: ["Heirloom Seed Saving", "Watercolor Sketching"],
        lifestyle: {
          activityLevel: "active",
          morningOrNight: "early_bird",
          smoking: "non_smoker",
          alcohol: "social_wine",
          pets: ["Tabby Cat (Oliver)"],
        },
        travelPreferences: ["Botanical Gardens of the World", "Coastal Inns"],
        communicationStyle: "warm_and_frequent",
        relationshipExpectations: "Looking for an authentic partner who values honesty, outdoor strolls, and heartfelt conversation.",
        photos: [
          {
            id: "photo_m1",
            url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80",
            isPrimary: true,
            moderationStatus: "APPROVED",
          },
        ],
        verificationStatus: "VERIFIED",
        verificationBadge: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionTier: "FREE",
        subscriptionStatus: "ACTIVE",
        createdAt: "2024-02-01T14:00:00Z",
        updatedAt: "2026-08-28T00:00:00Z",
        lastActive: "3 hours ago",
        isOnline: false,
        blockedUsers: [],
        likedUserIds: [],
        dislikedUserIds: [],
        favorites: [],
        privacySettings: {
          showDistance: true,
          showCityOnly: false,
          incognitoMode: false,
        },
      },
      {
        id: "user_william",
        email: "william.sterling@example.com",
        passwordHash: DEFAULT_PW_HASH,
        phone: "+1 (555) 678-9012",
        dateOfBirth: "1961-09-18",
        age: 64,
        role: "USER",
        firstName: "William",
        gender: "man",
        lookingForGender: "woman",
        city: "Edmonds",
        state: "WA",
        country: "United States",
        distanceMiles: 14,
        bio: "Former pediatric physician who enjoys sailing on Puget Sound, cooking rustic Italian recipes, and volunteering at the local animal shelter. Looking for a bright soul to enjoy concerts and good wine.",
        relationshipGoals: ["serious_relationship", "companionship"],
        relationshipStatus: "widowed",
        occupation: "Retired Pediatrician",
        retirementStatus: "retired",
        education: "Doctor of Medicine (MD)",
        children: "grown_children",
        languages: ["English", "Italian"],
        interests: ["Sailing", "Culinary Arts", "Live Jazz", "Reading & Book Clubs", "Volunteering"],
        hobbies: ["Wooden Boat Restoration", "Italian Cooking"],
        lifestyle: {
          activityLevel: "active",
          morningOrNight: "early_bird",
          smoking: "non_smoker",
          alcohol: "social_wine",
          pets: ["Golden Retriever"],
        },
        travelPreferences: ["Mediterranean Cruises", "Wine Regions", "National Parks"],
        communicationStyle: "direct_and_warm",
        relationshipExpectations: "Kindness, mutual emotional support, and joy in each other's company.",
        photos: [
          {
            id: "photo_w1",
            url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
            isPrimary: true,
            moderationStatus: "APPROVED",
          },
        ],
        verificationStatus: "VERIFIED",
        verificationBadge: true,
        emailVerified: true,
        phoneVerified: true,
        subscriptionTier: "PREMIUM",
        subscriptionStatus: "ACTIVE",
        createdAt: "2024-02-10T16:00:00Z",
        updatedAt: "2026-08-28T00:00:00Z",
        lastActive: "Yesterday",
        isOnline: false,
        blockedUsers: [],
        likedUserIds: [],
        dislikedUserIds: [],
        favorites: [],
        privacySettings: {
          showDistance: true,
          showCityOnly: false,
          incognitoMode: false,
        },
      },
    ];

    const conversations: DBConversation[] = [
      {
        id: "conv_eleanor_robert",
        participantIds: ["user_me", "user_robert"],
        lastMessageText: "Barnaby sounds like a wonderful companion! If you ever feel like having a quiet cup of chamomile tea or coffee at the garden pavilion cafe, I would love to treat you.",
        lastMessageTimestamp: "2024-03-01T11:00:00Z",
        unreadCountByUser: {
          "user_me": 0,
          "user_robert": 0,
        },
        isPinnedByUser: {
          "user_me": true,
          "user_robert": false,
        },
        createdAt: "2024-03-01T10:00:00Z",
        updatedAt: "2024-03-01T11:00:00Z",
      },
    ];

    const messages: DBMessage[] = [
      {
        id: "msg_1",
        conversationId: "conv_eleanor_robert",
        senderId: "user_robert",
        receiverId: "user_me",
        text: "Good morning Eleanor! I noticed you enjoy watercolor and walks through the arboretum. I was just at the botanical conservatory this past Saturday looking at the rhododendrons.",
        createdAt: "2024-03-01T10:15:00Z",
        deliveredAt: "2024-03-01T10:15:05Z",
        readAt: "2024-03-01T10:20:00Z",
        status: "READ",
      },
      {
        id: "msg_2",
        conversationId: "conv_eleanor_robert",
        senderId: "user_me",
        receiverId: "user_robert",
        text: "Good morning Robert! What a pleasant coincidence. The blooming season has been lovely this year. Barnaby (my golden retriever) and I walk near there every Tuesday morning.",
        createdAt: "2024-03-01T10:30:00Z",
        deliveredAt: "2024-03-01T10:30:04Z",
        readAt: "2024-03-01T10:32:00Z",
        status: "READ",
      },
      {
        id: "msg_3",
        conversationId: "conv_eleanor_robert",
        senderId: "user_robert",
        receiverId: "user_me",
        text: "Barnaby sounds like a wonderful companion! If you ever feel like having a quiet cup of chamomile tea or coffee at the garden pavilion cafe, I would love to treat you.",
        createdAt: "2024-03-01T11:00:00Z",
        deliveredAt: "2024-03-01T11:00:06Z",
        readAt: "2024-03-01T11:05:00Z",
        status: "READ",
      },
    ];

    const matches: DBMatch[] = [
      {
        id: "match_eleanor_robert",
        userId1: "user_me",
        userId2: "user_robert",
        compatibilityScore: 94,
        commonReasons: [
          "Both seeking meaningful companionship and long-term connection",
          "Shared passion for gardening, nature walks, and botanical gardens",
          "Harmonious early-bird schedule and non-smoking lifestyle",
          "Close geographic proximity (4 miles apart in Seattle area)",
        ],
        status: "ACTIVE",
        createdAt: "2024-03-01T10:00:00Z",
        isFavoriteByUser: {
          "user_me": true,
          "user_robert": true,
        },
      },
    ];

    const notifications: DBNotification[] = [
      {
        id: "notif_1",
        userId: "user_me",
        type: "match",
        title: "New 50+ Mutual Connection!",
        description: "You and Robert Hayes share a 94% compatibility match.",
        timestamp: "10 minutes ago",
        isRead: false,
        actionTab: "matches",
      },
      {
        id: "notif_2",
        userId: "user_me",
        type: "event_reminder",
        title: "Upcoming Community Gathering",
        description: "Gentle Morning Walk & Bird Watching starts this Saturday at 9:30 AM.",
        timestamp: "2 hours ago",
        isRead: false,
        actionTab: "events",
      },
      {
        id: "notif_3",
        userId: "user_me",
        type: "verification",
        title: "Identity Verified",
        description: "Your official 50+ Trust & Verification badge is active.",
        timestamp: "1 day ago",
        isRead: true,
        actionTab: "profile",
      },
    ];

    const reports: DBReport[] = [
      {
        id: "rep_101",
        reporterId: "user_me",
        reporterName: "Eleanor Vance",
        reportedUserId: "user_suspect_1",
        reportedUserName: "David Miller",
        category: "Scam/Financial",
        description: "User claimed to be an oil rig engineer stranded abroad and asked for gift cards for emergency medical supplies.",
        evidenceSnippets: ["Can you please wire $300 via gift card? My account is frozen abroad."],
        riskLevel: "HIGH",
        status: "RESOLVED_ACTIONED",
        moderatorAction: "PERMANENT_BAN",
        moderatorNotes: "Confirmed financial solicitation violating 50+ safety code. Account permanently terminated.",
        createdAt: "2024-02-20T14:22:00Z",
        resolvedAt: "2024-02-20T14:30:00Z",
      },
    ];

    const verificationSessions: DBVerificationSession[] = [
      {
        id: "verif_me_1",
        userId: "user_me",
        status: "VERIFIED",
        documentType: "DRIVERS_LICENSE",
        documentFrontUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        selfieUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        extractedName: "Eleanor Vance",
        extractedDob: "1966-04-12",
        extractedAge: 60,
        faceMatchConfidence: 98.4,
        startedAt: "2024-01-10T10:05:00Z",
        completedAt: "2024-01-10T10:08:00Z",
        reviewedBy: "System Biometrics AI & ID Trust Engine",
      },
      {
        id: "verif_robert_1",
        userId: "user_robert",
        status: "VERIFIED",
        documentType: "DRIVERS_LICENSE",
        documentFrontUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        selfieUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        extractedName: "Robert Hayes",
        extractedDob: "1963-08-22",
        extractedAge: 63,
        faceMatchConfidence: 97.8,
        startedAt: "2024-01-12T14:50:00Z",
        completedAt: "2024-01-12T15:00:00Z",
        reviewedBy: "System Biometrics AI & ID Trust Engine",
      },
    ];

    const datePlans: DBDatePlan[] = [
      {
        id: "plan_1",
        creatorId: "user_me",
        partnerId: "user_robert",
        partnerName: "Robert Hayes",
        partnerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        activity: "Morning Coffee & Botanical Stroll",
        locationName: "Volunteer Park Conservatory & Cafe",
        address: "1400 E Galer St, Seattle, WA 98112",
        date: "This Saturday, Sep 6",
        time: "10:30 AM",
        status: "CONFIRMED",
        sharedWithTrustedContact: true,
        reminderMinutesBefore: 60,
        checkInStatus: "PENDING",
        checkInDueAt: "2026-09-06T12:30:00Z",
        createdAt: "2024-03-01T12:00:00Z",
        updatedAt: "2024-03-01T12:00:00Z",
      },
    ];

    const events: DBEvent[] = [
      {
        id: "event_1",
        title: "Gentle Morning Walk & Bird Watching",
        category: "walking",
        description: "Join fellow 50+ members for an easy, flat-paved 1.5-mile stroll through the Seattle Arboretum. Benches and rest stops along the path. Bring binoculars or simply enjoy the morning air!",
        hostId: "user_robert",
        hostName: "Robert Hayes",
        hostPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        locationName: "Washington Park Arboretum (Graham Visitors Center)",
        address: "2300 Arboretum Dr E, Seattle",
        city: "Seattle, WA",
        date: "Saturday, Sep 6, 2026",
        time: "9:30 AM - 11:00 AM",
        maxCapacity: 15,
        accessibilityNotes: ["Paved level trail", "Frequent resting benches", "Accessible restrooms on site", "Free handicap parking"],
        safetyApproved: true,
        attendees: [
          {
            userId: "user_robert",
            name: "Robert Hayes",
            photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            status: "GOING",
            joinedAt: "2024-02-01T10:00:00Z",
          },
          {
            userId: "user_me",
            name: "Eleanor Vance",
            photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            status: "GOING",
            joinedAt: "2024-02-05T11:00:00Z",
          },
          {
            userId: "user_arthur",
            name: "Arthur Pendleton",
            photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            status: "GOING",
            joinedAt: "2024-02-06T14:00:00Z",
          }
        ],
        createdAt: "2024-02-01T09:00:00Z",
      },
      {
        id: "event_2",
        title: "Heirloom Gardening & Seed Exchange Circle",
        category: "gardening",
        description: "An informal afternoon gathering at the community garden pavilion. Swap seeds, exchange organic gardening wisdom, and chat about spring plantings over herbal tea and pastries.",
        hostId: "user_martha",
        hostName: "Martha Greene",
        hostPhoto: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
        locationName: "Bellevue Botanical Garden Pavilion",
        address: "12001 Main St, Bellevue",
        city: "Bellevue, WA",
        date: "Sunday, Sep 7, 2026",
        time: "2:00 PM - 4:00 PM",
        maxCapacity: 20,
        accessibilityNotes: ["Wheelchair ramps", "Covered seating", "Assisted listening devices available"],
        safetyApproved: true,
        attendees: [
          {
            userId: "user_martha",
            name: "Martha Greene",
            photoUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
            status: "GOING",
            joinedAt: "2024-02-02T10:00:00Z",
          },
          {
            userId: "user_me",
            name: "Eleanor Vance",
            photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            status: "INTERESTED",
            joinedAt: "2024-02-10T12:00:00Z",
          }
        ],
        createdAt: "2024-02-02T08:00:00Z",
      },
      {
        id: "event_3",
        title: "Classical Chamber Music & Conversation Evening",
        category: "arts",
        description: "Enjoy an intimate string quartet performance followed by warm discussion and refreshments in the conservatory atrium.",
        hostId: "user_arthur",
        hostName: "Arthur Pendleton",
        hostPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        locationName: "Kirkland Performance Center Lounge",
        address: "350 Kirkland Ave, Kirkland",
        city: "Kirkland, WA",
        date: "Wednesday, Sep 10, 2026",
        time: "6:00 PM - 7:30 PM",
        maxCapacity: 25,
        accessibilityNotes: ["Elevator access", "Hearing loop installed", "Transit accessible"],
        safetyApproved: true,
        attendees: [
          {
            userId: "user_arthur",
            name: "Arthur Pendleton",
            photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            status: "GOING",
            joinedAt: "2024-02-03T10:00:00Z",
          }
        ],
        createdAt: "2024-02-03T09:00:00Z",
      }
    ];

    const eventMessages: DBEventMessage[] = [
      {
        id: "disc_1",
        eventId: "event_1",
        senderId: "user_robert",
        senderName: "Robert Hayes",
        senderPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        text: "Looking forward to seeing everyone on Saturday! The weather forecast is partly sunny and 68°F.",
        createdAt: "2024-03-01T15:15:00Z",
      },
      {
        id: "disc_2",
        eventId: "event_1",
        senderId: "user_arthur",
        senderName: "Arthur Pendleton",
        senderPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        text: "I'll bring my bird identification guidebook to share if anyone wants to spot the cedar waxwings.",
        createdAt: "2024-03-01T16:00:00Z",
      }
    ];

    const auditLogs: DBAuditLog[] = [
      {
        id: "log_1",
        action: "BAN_USER",
        actorId: "user_admin",
        actorEmail: "admin@silverharmony.org",
        actorRole: "ADMIN",
        targetId: "user_suspect_1",
        targetType: "USER",
        details: "Account banned due to AI Guardian detection of romance scam financial solicitation.",
        timestamp: "2024-02-20T14:30:00Z",
      },
      {
        id: "log_2",
        action: "APPROVE_VERIFICATION",
        actorId: "user_admin",
        actorEmail: "admin@silverharmony.org",
        actorRole: "ADMIN",
        targetId: "user_robert",
        targetType: "VERIFICATION_SESSION",
        details: "Manual review of driver license & live selfie confirmed. Age 63 verified.",
        timestamp: "2024-01-12T15:00:00Z",
      },
    ];

    const paymentTransactions: DBPaymentTransaction[] = [
      {
        id: "tx_1",
        userId: "user_me",
        planId: "premium_annual",
        planName: "Silver Harmony Premium (Annual)",
        amount: 119.88,
        currency: "USD",
        status: "SUCCEEDED",
        paymentMethod: "Visa ending in •••• 4242",
        invoiceUrl: "#invoice-2024-01",
        createdAt: "2024-01-10T08:05:00Z",
      },
    ];

    return {
      users,
      conversations,
      messages,
      matches,
      notifications,
      reports,
      verificationSessions,
      datePlans,
      events,
      eventMessages,
      auditLogs,
      paymentTransactions,
      emailVerificationCodes: {
        "eleanor.vance@example.com": { code: "582914", expiresAt: Date.now() + 1000 * 60 * 60 * 24 }
      },
      passwordResetCodes: {
        "eleanor.vance@example.com": { code: "582914", expiresAt: Date.now() + 1000 * 60 * 60 * 24 }
      },
      revokedTokens: [],
      pushSubscriptions: [],
    };
  }
}

export const db = new PersistentDatabase();
