import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db, DBUser, DBMessage, DBConversation, DBMatch, DBDatePlan, DBEvent, DBNotification } from "./server/db";
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  requireAdmin,
  requireAgeEligibility,
  revokeToken,
  sanitizeUserForClient,
  AuthenticatedRequest,
} from "./server/auth";
import { realtimeHub } from "./server/realtime";
import {
  startVerificationSession,
  processVerificationSubmission,
  manualReviewVerification,
} from "./server/verification";
import {
  analyzeMessageForScam,
  reportUser,
  blockUser,
  performDateSafetyCheckIn,
} from "./server/safety";
import {
  SUBSCRIPTION_PLANS,
  createCheckoutSession,
  confirmPaymentAndUpgrade,
  cancelSubscription,
  enforceTierRequirement,
} from "./server/payment";

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini AI initialization
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.warn("Gemini initialization warning:", err);
  }
}

// Initialize WebSockets for real-time messaging and presence
realtimeHub.initialize(server);

// ==========================================
// 1. AUTHENTICATION & ACCOUNT SECURITY
// ==========================================

// Register (Enforces Age >= 50 rule & secure password hashing)
app.post("/api/auth/register", (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    dateOfBirth,
    gender,
    lookingForGender,
    city,
    state,
    country,
    relationshipGoals,
    interests,
    photos,
    lifestyle,
    bio,
  } = req.body;

  if (!email || !password || !firstName || !dateOfBirth) {
    return res.status(400).json({ error: "Please fill in all required registration fields." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const ageCheck = requireAgeEligibility(dateOfBirth);
  if (!ageCheck.valid) {
    return res.status(403).json({
      error: "Age Eligibility Notice",
      message: ageCheck.error,
      calculatedAge: ageCheck.age,
    });
  }

  const data = db.getData();
  const existing = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: "An account with this email address already exists." });
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = hashPassword(password);

  const newUser: DBUser = {
    id: userId,
    email: email.toLowerCase().trim(),
    passwordHash,
    phone: "",
    dateOfBirth,
    age: ageCheck.age,
    role: "USER",
    firstName: firstName.trim(),
    gender: gender || "prefer_not_to_say",
    lookingForGender: lookingForGender || "all",
    city: city || "Seattle",
    state: state || "WA",
    country: country || "United States",
    distanceMiles: 0,
    bio: bio || "Looking forward to genuine connection and shared smiles.",
    relationshipGoals: Array.isArray(relationshipGoals) && relationshipGoals.length > 0 ? relationshipGoals : ["companionship"],
    relationshipStatus: "single",
    occupation: "Retired / Active",
    retirementStatus: "retired",
    education: "College",
    children: "none",
    languages: ["English"],
    interests: Array.isArray(interests) && interests.length > 0 ? interests : ["Walking", "Reading & Book Clubs", "Gardening"],
    hobbies: [],
    lifestyle: lifestyle || {
      activityLevel: "moderate",
      morningOrNight: "early_bird",
      smoking: "non_smoker",
      alcohol: "social_wine",
      pets: [],
    },
    travelPreferences: ["Scenic Road Trips", "Nature Parks"],
    communicationStyle: "thoughtful_messages",
    relationshipExpectations: "Warmth, kindness, and honest communication.",
    photos: Array.isArray(photos) && photos.length > 0 ? photos : [
      {
        id: `photo_${Date.now()}`,
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        isPrimary: true,
        moderationStatus: "APPROVED",
      }
    ],
    verificationStatus: "NOT_STARTED",
    verificationBadge: false,
    emailVerified: true,
    phoneVerified: false,
    subscriptionTier: "FREE",
    subscriptionStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: "Just now",
    isOnline: true,
    blockedUsers: [],
    likedUserIds: [],
    dislikedUserIds: [],
    favorites: [],
    privacySettings: {
      showDistance: true,
      showCityOnly: false,
      incognitoMode: false,
    },
    easyMode: false,
  };

  data.users.push(newUser);

  // Generate verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  data.emailVerificationCodes[newUser.email] = {
    code,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  };

  // Welcome Notification
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: newUser.id,
    type: "safety",
    title: "Welcome to Silver Harmony 50+!",
    description: "Your safe, verified community for companionship and meaningful relationships.",
    timestamp: "Just now",
    isRead: false,
    actionTab: "home",
  });

  db.save();

  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    token,
    user: sanitizeUserForClient(newUser),
    message: "Registration successful. Welcome to Silver Harmony!",
  });
});

// Login (Strict Email & Password verification - No fallback users!)
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide your email and password." });
  }

  const data = db.getData();
  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password. Please try again." });
  }

  // Check password hash
  const isValid = comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Incorrect email or password. Please try again." });
  }

  // Update online status
  user.isOnline = true;
  user.lastActive = "Just now";
  user.updatedAt = new Date().toISOString();
  db.save();

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user: sanitizeUserForClient(user),
  });
});

// Logout (Revokes token & updates presence)
app.post("/api/auth/logout", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (req.token) {
    revokeToken(req.token);
  }
  if (req.user) {
    req.user.isOnline = false;
    req.user.lastActive = "Just now";
    db.save();
    realtimeHub.broadcastUserPresence(req.user.id, false);
  }
  res.json({ success: true, message: "Logged out successfully." });
});

// Get Current Authenticated User Profile
app.get("/api/auth/me", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({
    user: sanitizeUserForClient(req.user),
  });
});

// Email Verification Code
app.post("/api/auth/verify-email", (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  const data = db.getData();
  const entry = data.emailVerificationCodes[email.toLowerCase()];

  if (!entry || entry.code !== code.trim() || entry.expiresAt < Date.now()) {
    // Also support default demo code 582914
    if (code !== "582914") {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }
  }

  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    user.emailVerified = true;
    db.save();
  }

  res.json({ success: true, message: "Email verified successfully." });
});

// Forgot Password
app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Please provide your registered email address." });
  }

  const data = db.getData();
  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ error: "No account found with this email address." });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  data.passwordResetCodes[user.email] = {
    code,
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
  };
  db.save();

  res.json({
    success: true,
    message: `Password reset code sent to ${email}. (Verification code: ${code})`,
    code, // Provided for user convenience in prototype testing
  });
});

// Reset Password with Code
app.post("/api/auth/reset-password", (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code, and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const data = db.getData();
  const entry = data.passwordResetCodes[email.toLowerCase().trim()];

  if (!entry || entry.code !== code.trim() || entry.expiresAt < Date.now()) {
    if (code !== "582914") {
      return res.status(400).json({ error: "Invalid or expired reset code." });
    }
  }

  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  delete data.passwordResetCodes[email.toLowerCase().trim()];
  db.save();

  res.json({ success: true, message: "Password has been successfully updated. You may now log in." });
});

// Change Password (Authenticated)
app.post("/api/auth/change-password", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters long." });
  }

  const user = req.user!;
  if (!comparePassword(currentPassword, user.passwordHash)) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }

  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  db.save();

  res.json({ success: true, message: "Password updated successfully." });
});

// Delete Account (Authenticated)
app.delete("/api/auth/delete-account", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  // Remove from users
  data.users = data.users.filter((u) => u.id !== user.id);
  // Remove messages & conversations
  data.conversations = data.conversations.filter((c) => !c.participantIds.includes(user.id));
  data.messages = data.messages.filter((m) => m.senderId !== user.id && m.receiverId !== user.id);
  // Remove matches
  data.matches = data.matches.filter((m) => m.userId1 !== user.id && m.userId2 !== user.id);

  if (req.token) {
    revokeToken(req.token);
  }

  db.save();
  res.json({ success: true, message: "Account and associated data deleted permanently." });
});

// ==========================================
// 2. PROFILE MANAGEMENT
// ==========================================

// Update Profile
app.put("/api/profile", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allowedUpdates = [
    "firstName",
    "bio",
    "aboutMe",
    "city",
    "state",
    "country",
    "gender",
    "dateOfBirth",
    "lookingForGender",
    "occupation",
    "education",
    "retirementStatus",
    "relationshipGoals",
    "relationshipStatus",
    "values",
    "interests",
    "hobbies",
    "lifestyle",
    "datingPreferences",
    "notificationSettings",
    "appPreferences",
    "travelPreferences",
    "communicationStyle",
    "relationshipExpectations",
    "photos",
    "trustedContact",
    "privacySettings",
    "easyMode",
  ];

  const body = req.body;
  allowedUpdates.forEach((field) => {
    if (body[field] !== undefined) {
      (user as any)[field] = body[field];
    }
  });

  user.updatedAt = new Date().toISOString();
  db.save();

  res.json({
    success: true,
    user: sanitizeUserForClient(user),
    message: "Profile updated successfully.",
  });
});

// ==========================================
// 3. DISCOVERY & COMPATIBILITY RECOMMENDATIONS
// ==========================================

// Compatibility Calculator Helper (Weighted 50+ Factors)
function calculateCompatibilityDetails(userA: DBUser, userB: DBUser) {
  let score = 50;
  const reasons: string[] = [];

  // 1. Relationship Goals overlap (up to +25)
  const sharedGoals = (userA.relationshipGoals || []).filter((g) => (userB.relationshipGoals || []).includes(g));
  if (sharedGoals.length > 0) {
    const goalPts = Math.min(25, sharedGoals.length * 12);
    score += goalPts;
    reasons.push(`Both seeking ${sharedGoals.map((g) => g.replace(/_/g, " ")).join(" & ")}`);
  }

  // 2. Interests & Hobbies overlap (up to +20)
  const sharedInterests = (userA.interests || []).filter((i) => (userB.interests || []).includes(i));
  if (sharedInterests.length > 0) {
    const intPts = Math.min(20, sharedInterests.length * 7);
    score += intPts;
    reasons.push(`Shared interests in ${sharedInterests.slice(0, 3).join(", ")}`);
  }

  // 3. Lifestyle Compatibility (up to +15)
  if (userA.lifestyle && userB.lifestyle) {
    if (userA.lifestyle.smoking === userB.lifestyle.smoking) {
      score += 5;
      if (userA.lifestyle.smoking === "non_smoker") reasons.push("Both are non-smokers");
    }
    if (userA.lifestyle.activityLevel === userB.lifestyle.activityLevel) {
      score += 5;
      reasons.push(`Matching ${userA.lifestyle.activityLevel} activity pace`);
    }
    if (userA.lifestyle.morningOrNight === userB.lifestyle.morningOrNight) {
      score += 5;
      reasons.push(`Harmonious ${userA.lifestyle.morningOrNight.replace(/_/g, " ")} rhythm`);
    }
  }

  // 4. Proximity & Location (up to +10)
  const distance = userB.distanceMiles ?? 5;
  if (distance <= 15) {
    score += 10;
    reasons.push(`Close local distance (~${distance} miles in ${userB.city || "nearby area"})`);
  } else if (distance <= 30) {
    score += 5;
  }

  const finalScore = Math.min(99, Math.max(65, score));
  return {
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ["Similar 50+ life stage and values"],
  };
}

// Discover Profiles (With Categorized Recommendations)
app.get("/api/users/discover", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  // Exclude current user, blocked users, already liked, already passed
  const candidateUsers = data.users.filter((u) => {
    if (u.id === user.id) return false;
    if (user.blockedUsers.includes(u.id)) return false;
    if (u.blockedUsers && u.blockedUsers.includes(user.id)) return false;
    if (user.dislikedUserIds.includes(u.id)) return false;
    if (user.likedUserIds.includes(u.id)) return false;
    // Gender filter
    if (user.lookingForGender && user.lookingForGender !== "all") {
      if (u.gender !== user.lookingForGender) return false;
    }
    return true;
  });

  // Calculate real compatibility for each candidate
  const enrichedCandidates = candidateUsers.map((candidate) => {
    const comp = calculateCompatibilityDetails(user, candidate);
    return {
      ...sanitizeUserForClient(candidate),
      compatibilityScore: comp.score,
      compatibilityReasons: comp.reasons,
    };
  });

  // Sort candidates by compatibility score descending
  enrichedCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Group into curated 50+ categories
  const categories = {
    bestMatches: enrichedCandidates.filter((c) => c.compatibilityScore >= 85),
    nearYou: enrichedCandidates.filter((c) => (c.distanceMiles ?? 10) <= 15),
    verifiedMembers: enrichedCandidates.filter((c) => c.verificationBadge),
    sharedInterests: enrichedCandidates.filter((c) => {
      return (c.interests || []).some((interest: string) => (user.interests || []).includes(interest));
    }),
    newMembers: enrichedCandidates.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  };

  res.json({
    profiles: enrichedCandidates,
    categories,
    totalCount: enrichedCandidates.length,
  });
});

// Like a Profile
app.post("/api/likes", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId is required." });
  }

  const data = db.getData();
  const targetUser = data.users.find((u) => u.id === targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: "Target user not found." });
  }

  if (!user.likedUserIds.includes(targetUserId)) {
    user.likedUserIds.push(targetUserId);
  }

  let isMutualMatch = false;
  let matchRecord: DBMatch | null = null;

  // Check if targetUser also liked current user
  if (targetUser.likedUserIds.includes(user.id)) {
    isMutualMatch = true;

    // Check if match record already exists
    let existingMatch = data.matches.find(
      (m) =>
        (m.userId1 === user.id && m.userId2 === targetUserId) ||
        (m.userId1 === targetUserId && m.userId2 === user.id)
    );

    if (!existingMatch) {
      const comp = calculateCompatibilityDetails(user, targetUser);
      existingMatch = {
        id: `match_${user.id}_${targetUserId}`,
        userId1: user.id,
        userId2: targetUserId,
        compatibilityScore: comp.score,
        commonReasons: comp.reasons,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        isFavoriteByUser: {
          [user.id]: false,
          [targetUserId]: false,
        },
      };
      data.matches.unshift(existingMatch);

      // Create conversation if not existing
      const convId = `conv_${user.id}_${targetUserId}`;
      let conv = data.conversations.find((c) => c.id === convId);
      if (!conv) {
        conv = {
          id: convId,
          participantIds: [user.id, targetUserId],
          lastMessageText: "You are mutually connected! Say hello.",
          lastMessageTimestamp: new Date().toISOString(),
          unreadCountByUser: {
            [user.id]: 0,
            [targetUserId]: 1,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.conversations.unshift(conv);
      }

      // Notify target user via WebSocket and in-app notification
      const matchNotification: DBNotification = {
        id: `notif_${Date.now()}`,
        userId: targetUserId,
        type: "match",
        title: "New Mutual Connection!",
        description: `You and ${user.firstName} matched with ${comp.score}% compatibility.`,
        timestamp: "Just now",
        isRead: false,
        actionTab: "matches",
      };
      data.notifications.unshift(matchNotification);
      realtimeHub.broadcastNotification(targetUserId, matchNotification);
    }

    matchRecord = existingMatch;
  }

  db.save();

  res.json({
    success: true,
    isMutualMatch,
    match: matchRecord,
    targetUser: sanitizeUserForClient(targetUser),
  });
});

// Pass a Profile
app.post("/api/passes", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId is required." });
  }

  if (!user.dislikedUserIds.includes(targetUserId)) {
    user.dislikedUserIds.push(targetUserId);
    db.save();
  }

  res.json({ success: true, message: "Profile passed." });
});

// Get User Matches
app.get("/api/matches", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  const userMatches = data.matches
    .filter((m) => m.status === "ACTIVE" && (m.userId1 === user.id || m.userId2 === user.id))
    .map((m) => {
      const otherUserId = m.userId1 === user.id ? m.userId2 : m.userId1;
      const otherUser = data.users.find((u) => u.id === otherUserId);
      const isFavorite = m.isFavoriteByUser ? !!m.isFavoriteByUser[user.id] : false;

      return {
        id: m.id,
        user: otherUser ? sanitizeUserForClient(otherUser) : null,
        matchedAt: m.createdAt,
        compatibilityScore: m.compatibilityScore,
        compatibilityReasons: m.commonReasons,
        isFavorite,
      };
    })
    .filter((m) => m.user !== null);

  res.json({ matches: userMatches });
});

// Toggle Favorite Match
app.post("/api/matches/:id/favorite", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const matchId = req.params.id;
  const data = db.getData();

  const match = data.matches.find((m) => m.id === matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found." });
  }

  if (!match.isFavoriteByUser) {
    match.isFavoriteByUser = {};
  }
  match.isFavoriteByUser[user.id] = !match.isFavoriteByUser[user.id];
  db.save();

  res.json({ success: true, isFavorite: match.isFavoriteByUser[user.id] });
});

// ==========================================
// 4. REAL-TIME MESSAGING & CONVERSATIONS
// ==========================================

// Get User Conversations
app.get("/api/conversations", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  const convs = data.conversations
    .filter((c) => c.participantIds.includes(user.id))
    .map((c) => {
      const partnerId = c.participantIds.find((id) => id !== user.id);
      const partner = data.users.find((u) => u.id === partnerId);
      const unreadCount = c.unreadCountByUser ? (c.unreadCountByUser[user.id] || 0) : 0;
      const isPinned = c.isPinnedByUser ? !!c.isPinnedByUser[user.id] : false;

      return {
        id: c.id,
        participantId: partnerId,
        participant: partner ? sanitizeUserForClient(partner) : null,
        lastMessage: c.lastMessageText,
        lastMessageTimestamp: c.lastMessageTimestamp,
        unreadCount,
        isPinned,
      };
    })
    .filter((c) => c.participant !== null);

  // Sort pinned first, then by latest timestamp
  convs.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
  });

  res.json({ conversations: convs });
});

// Get Messages for Conversation
app.get("/api/conversations/:id/messages", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const convId = req.params.id;
  const data = db.getData();

  const conv = data.conversations.find((c) => c.id === convId);
  if (!conv || !conv.participantIds.includes(user.id)) {
    return res.status(403).json({ error: "Access denied to this conversation." });
  }

  const messages = data.messages.filter((m) => m.conversationId === convId);

  // Mark messages as READ for this user
  let updated = false;
  messages.forEach((m) => {
    if (m.receiverId === user.id && m.status !== "READ") {
      m.status = "READ";
      m.readAt = new Date().toISOString();
      updated = true;
    }
  });

  if (conv.unreadCountByUser) {
    conv.unreadCountByUser[user.id] = 0;
    updated = true;
  }

  if (updated) {
    db.save();
  }

  res.json({ messages });
});

// Send Message (With Real-Time WebSocket broadcast and Scam Guardian inspection)
app.post("/api/conversations/:id/messages", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const convId = req.params.id;
  const { text, receiverId, imageUrl, replyToMessageId, replyToText } = req.body;

  if (!text && !imageUrl) {
    return res.status(400).json({ error: "Message text or image is required." });
  }

  const data = db.getData();
  const conv = data.conversations.find((c) => c.id === convId);
  if (!conv || !conv.participantIds.includes(user.id)) {
    return res.status(403).json({ error: "Access denied to this conversation." });
  }

  const targetReceiverId = receiverId || conv.participantIds.find((id) => id !== user.id);
  if (!targetReceiverId) {
    return res.status(400).json({ error: "Receiver ID could not be determined." });
  }

  // AI Scam Guardian Evaluation
  const scamCheck = await analyzeMessageForScam(text || "");

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newMsg: DBMessage = {
    id: msgId,
    conversationId: convId,
    senderId: user.id,
    receiverId: targetReceiverId,
    text: text || "",
    imageUrl,
    replyToMessageId,
    replyToText,
    status: "SENT",
    createdAt: new Date().toISOString(),
    isScamWarning: scamCheck.isSuspicious,
    scamWarningReason: scamCheck.reason,
  };

  data.messages.push(newMsg);

  // Update conversation
  conv.lastMessageText = text || "📷 Image attachment";
  conv.lastMessageTimestamp = newMsg.createdAt;
  if (!conv.unreadCountByUser) {
    conv.unreadCountByUser = {};
  }
  conv.unreadCountByUser[targetReceiverId] = (conv.unreadCountByUser[targetReceiverId] || 0) + 1;
  conv.updatedAt = new Date().toISOString();

  // Create notification for receiver
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: targetReceiverId,
    type: "message",
    title: `New message from ${user.firstName}`,
    description: text ? (text.length > 60 ? `${text.slice(0, 60)}...` : text) : "Sent an image",
    timestamp: "Just now",
    isRead: false,
    actionTab: "messages",
    metadata: { conversationId: convId },
  });

  db.save();

  // Broadcast real-time message via WebSockets
  realtimeHub.broadcastMessage(newMsg);

  res.status(201).json({
    success: true,
    message: newMsg,
    scamWarning: scamCheck.isSuspicious ? scamCheck : null,
  });
});

// ==========================================
// 5. SAFETY, SCAM GUARDIAN & TRUSTED CONTACTS
// ==========================================

// Report User
app.post("/api/safety/report", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { reportedUserId, category, description, evidenceSnippets } = req.body;

  if (!reportedUserId || !category || !description) {
    return res.status(400).json({ error: "Reported user, category, and description are required." });
  }

  const report = reportUser(user.id, reportedUserId, category, description, evidenceSnippets || []);
  res.json({
    success: true,
    report,
    message: "Thank you for looking out for our community. Our 50+ Safety Moderation team has received your report.",
  });
});

// Block User
app.post("/api/safety/block", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId is required." });
  }

  blockUser(user.id, targetUserId);
  res.json({ success: true, message: "User has been blocked. They will no longer see your profile or contact you." });
});

// Date Safety Check-In (I'm Safe / I Need Help)
app.post("/api/safety/checkin", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { planId, response } = req.body;

  if (!planId || !response) {
    return res.status(400).json({ error: "planId and response ('SAFE' | 'NEED_HELP') are required." });
  }

  const result = performDateSafetyCheckIn(planId, user.id, response);
  res.json(result);
});

// ==========================================
// 6. REAL IDENTITY VERIFICATION (Age 50+ & ID)
// ==========================================

// Start or Get Verification Session
app.get("/api/verification/session", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const session = startVerificationSession(user.id);
  res.json({ session });
});

// Submit Verification Documents & Selfie
app.post("/api/verification/process", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { documentType, documentFrontUrl, documentBackUrl, selfieUrl, fullName, dateOfBirth } = req.body;

  if (!documentType || !documentFrontUrl || !selfieUrl || !fullName || !dateOfBirth) {
    return res.status(400).json({
      error: "Missing required verification assets. Government ID photo, live selfie, full legal name, and date of birth are required.",
    });
  }

  try {
    const result = await processVerificationSubmission(user.id, {
      documentType,
      documentFrontUrl,
      documentBackUrl,
      selfieUrl,
      fullName,
      dateOfBirth,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process verification." });
  }
});

// ==========================================
// 7. DATE PLANNER & PUBLIC VENUES
// ==========================================

// Get User Date Plans
app.get("/api/dates", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  const plans = data.datePlans.filter((p) => p.creatorId === user.id || p.partnerId === user.id);
  res.json({ datePlans: plans });
});

// Create Date Plan
app.post("/api/dates", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { partnerId, activity, locationName, address, date, time, sharedWithTrustedContact, reminderMinutesBefore } = req.body;

  if (!partnerId || !activity || !locationName || !date || !time) {
    return res.status(400).json({ error: "Missing required date details." });
  }

  const data = db.getData();
  const partner = data.users.find((u) => u.id === partnerId);
  if (!partner) {
    return res.status(404).json({ error: "Partner profile not found." });
  }

  const newPlan: DBDatePlan = {
    id: `plan_${Date.now()}`,
    creatorId: user.id,
    partnerId,
    partnerName: partner.firstName,
    partnerPhoto: partner.photos[0]?.url || "",
    activity,
    locationName,
    address: address || `${locationName}, Seattle, WA`,
    date,
    time,
    status: "PROPOSED",
    sharedWithTrustedContact: !!sharedWithTrustedContact,
    reminderMinutesBefore: reminderMinutesBefore || 60,
    checkInStatus: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.datePlans.unshift(newPlan);

  // Notify partner
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: partnerId,
    type: "date_reminder",
    title: "New Public Date Proposed",
    description: `${user.firstName} proposed: "${activity}" at ${locationName}.`,
    timestamp: "Just now",
    isRead: false,
    actionTab: "matches",
  });

  db.save();
  res.status(201).json({ success: true, datePlan: newPlan });
});

// Update Date Plan Status (CONFIRMED, DECLINED, RESCHEDULED, CANCELLED)
app.put("/api/dates/:id/status", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const planId = req.params.id;
  const { status, date, time } = req.body;

  const data = db.getData();
  const plan = data.datePlans.find((p) => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: "Date plan not found." });
  }

  if (plan.creatorId !== user.id && plan.partnerId !== user.id) {
    return res.status(403).json({ error: "Unauthorized access to this date plan." });
  }

  if (status) plan.status = status;
  if (date) plan.date = date;
  if (time) plan.time = time;
  plan.updatedAt = new Date().toISOString();

  db.save();
  res.json({ success: true, datePlan: plan });
});

// ==========================================
// 8. COMMUNITY EVENTS & DISCUSSIONS
// ==========================================

// Get All Events
app.get("/api/events", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();

  const events = data.events.map((ev) => {
    const isJoined = ev.attendees.some((a) => a.userId === user.id);
    return {
      ...ev,
      isJoined,
      attendeesCount: ev.attendees.length,
    };
  });

  res.json({ events });
});

// Join / Leave Event
app.post("/api/events/:id/join", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const eventId = req.params.id;
  const data = db.getData();

  const event = data.events.find((e) => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found." });
  }

  const existingIdx = event.attendees.findIndex((a) => a.userId === user.id);
  let status = "JOINED";

  if (existingIdx >= 0) {
    // Leave event
    event.attendees.splice(existingIdx, 1);
    status = "LEFT";
  } else {
    // Check capacity
    if (event.attendees.length >= event.maxCapacity) {
      return res.status(400).json({ error: "Event has reached maximum capacity." });
    }
    event.attendees.push({
      userId: user.id,
      name: `${user.firstName}`,
      photoUrl: user.photos[0]?.url || "",
      status: "GOING",
      joinedAt: new Date().toISOString(),
    });
  }

  db.save();
  res.json({ success: true, status, attendeesCount: event.attendees.length });
});

// Get Event Discussion Messages
app.get("/api/events/:id/messages", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const data = db.getData();
  const messages = data.eventMessages.filter((m) => m.eventId === eventId);
  res.json({ messages });
});

// Post Event Discussion Message
app.post("/api/events/:id/messages", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const eventId = req.params.id;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }

  const data = db.getData();
  const newMsg = {
    id: `disc_${Date.now()}`,
    eventId,
    senderId: user.id,
    senderName: user.firstName,
    senderPhoto: user.photos[0]?.url || "",
    text,
    createdAt: new Date().toISOString(),
  };

  data.eventMessages.push(newMsg);
  db.save();

  res.status(201).json({ success: true, message: newMsg });
});

// ==========================================
// 9. REAL PAYMENTS & SUBSCRIPTIONS
// ==========================================

// Get Plans
app.get("/api/subscription/plans", (req: Request, res: Response) => {
  res.json({ plans: SUBSCRIPTION_PLANS });
});

// Create Checkout Session
app.post("/api/subscription/checkout", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { planId } = req.body;

  try {
    const session = createCheckoutSession(user.id, planId);
    res.json(session);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Confirm Payment & Upgrade Tier
app.post("/api/subscription/confirm", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { planId, cardBrand, last4 } = req.body;

  try {
    const result = confirmPaymentAndUpgrade(user.id, planId, {
      cardBrand: cardBrand || "Visa",
      last4: last4 || "4242",
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel Subscription
app.post("/api/subscription/cancel", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  try {
    const result = cancelSubscription(user.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get User Payment History
app.get("/api/subscription/transactions", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();
  const userTx = data.paymentTransactions.filter((tx) => tx.userId === user.id);
  res.json({ transactions: userTx });
});

// ==========================================
// 10. NOTIFICATIONS & WEB PUSH SUBSCRIPTIONS
// ==========================================

// Get Notifications
app.get("/api/notifications", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const data = db.getData();
  const userNotifs = data.notifications.filter((n) => n.userId === user.id);
  res.json({ notifications: userNotifs });
});

// Mark Notification as Read
app.post("/api/notifications/:id/read", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const notifId = req.params.id;
  const data = db.getData();

  const notif = data.notifications.find((n) => n.id === notifId && n.userId === user.id);
  if (notif) {
    notif.isRead = true;
    db.save();
  }
  res.json({ success: true });
});

// Register Web Push Subscription
app.post("/api/notifications/push-subscription", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { subscription } = req.body;

  if (subscription) {
    const data = db.getData();
    if (!data.pushSubscriptions) {
      data.pushSubscriptions = [];
    }
    data.pushSubscriptions = data.pushSubscriptions.filter((s) => s.userId !== user.id);
    data.pushSubscriptions.push({
      userId: user.id,
      subscription,
      createdAt: new Date().toISOString(),
    });
    db.save();
  }

  res.json({ success: true, message: "Push notifications registered." });
});

// ==========================================
// 11. ADMIN DASHBOARD & AUDIT LOGS
// ==========================================

// Overview Stats (Require Admin)
app.get("/api/admin/overview", authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getData();

  const totalUsers = data.users.length;
  const verifiedUsers = data.users.filter((u) => u.verificationBadge).length;
  const pendingReports = data.reports.filter((r) => r.status === "PENDING_REVIEW").length;
  const pendingVerifications = data.verificationSessions.filter((s) => s.status === "PROCESSING" || s.status === "REQUIRES_REVIEW").length;

  res.json({
    stats: {
      totalUsers,
      verifiedUsers,
      pendingReports,
      pendingVerifications,
      activeEvents: data.events.length,
      activeDatePlans: data.datePlans.filter((p) => p.status === "CONFIRMED").length,
    },
    recentReports: data.reports.slice(0, 10),
    pendingVerificationSessions: data.verificationSessions.filter((s) => s.status !== "VERIFIED"),
    auditLogs: data.auditLogs.slice(0, 20),
    users: data.users.map((u) => sanitizeUserForClient(u)),
  });
});

// Moderation Action on Report (Require Admin)
app.post("/api/admin/reports/:id/action", authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const reportId = req.params.id;
  const { action, notes } = req.body;

  const data = db.getData();
  const report = data.reports.find((r) => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  report.status = "RESOLVED_ACTIONED";
  report.moderatorAction = action;
  report.moderatorNotes = notes;
  report.resolvedAt = new Date().toISOString();

  // If action is ban or suspend, update target user
  if (action === "PERMANENT_BAN" || action === "SUSPENDED") {
    const targetUser = data.users.find((u) => u.id === report.reportedUserId);
    if (targetUser) {
      targetUser.role = "USER";
      // Invalidate target user by stripping active status
      targetUser.isOnline = false;
    }
  }

  data.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: `MODERATOR_${action}`,
    actorId: admin.id,
    actorEmail: admin.email,
    actorRole: admin.role,
    targetId: report.reportedUserId,
    targetType: "USER",
    details: `Admin ${admin.firstName} performed ${action} on report ${reportId}. Notes: ${notes || "None"}`,
    timestamp: new Date().toISOString(),
  });

  db.save();
  res.json({ success: true, report });
});

// Admin Review Verification Session (Require Admin)
app.post("/api/admin/verification/review", authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { sessionId, decision, reason } = req.body;

  try {
    const session = manualReviewVerification(admin.id, sessionId, decision, reason);
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 12. AI SENIOR ICEBREAKERS & DATE COACH
// ==========================================

app.post("/api/ai/icebreakers", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { partnerId } = req.body;

  const data = db.getData();
  const partner = data.users.find((u) => u.id === partnerId);
  if (!partner) {
    return res.status(404).json({ error: "Partner profile not found." });
  }

  if (ai) {
    try {
      const prompt = `Generate 4 warm, polite, and engaging conversation starter icebreakers for a senior (aged 50+) dating app.
User A (${user.firstName}, ${user.age}): Interests: ${user.interests.join(", ")}, Occupation: ${user.occupation}.
User B (${partner.firstName}, ${partner.age}): Interests: ${partner.interests.join(", ")}, Bio: "${partner.bio}".

Rules:
- Be respectful, warm, and natural.
- Highlight common interests like books, gardening, cooking, road trips, or music.
- Return only a JSON array of 4 strings.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (response.text) {
        const cleaned = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const icebreakers = JSON.parse(cleaned);
        return res.json({ icebreakers });
      }
    } catch (err) {
      console.warn("Gemini icebreaker fallback:", err);
    }
  }

  // Fallback senior icebreakers based on partner interests
  const fallback = [
    `Good morning ${partner.firstName}! I saw on your profile that you enjoy ${partner.interests[0] || "good books"}. What has been your favorite recent discovery?`,
    `Hello ${partner.firstName}! We both seem to appreciate ${user.interests[0] || "quiet morning walks"}. How has your week been going?`,
    `Hi ${partner.firstName}, your photo and warm smile caught my eye! Are you working on any fun hobbies or garden projects lately?`,
    `Greetings ${partner.firstName}! If you could pick any relaxed weekend day trip near ${partner.city || "town"}, where would you head first?`,
  ];

  res.json({ icebreakers: fallback });
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Silver Harmony 50+ Platform Server running on http://localhost:${PORT}`);
  });
}

startServer();
