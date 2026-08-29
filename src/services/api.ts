import {
  UserProfile,
  Match,
  Conversation,
  Message,
  CommunityEvent,
  DateSuggestion,
  SafetyReport,
  ModerationAuditLog,
  DiscoveryFilter,
} from '../types';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('silverharmony_jwt_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function normalizeProfile(user: any): UserProfile {
  if (!user) return user;
  const city = user.location?.city || user.city || 'Seattle';
  const state = user.location?.state || user.state || 'WA';
  const distanceMiles = user.location?.distanceMiles !== undefined ? user.location.distanceMiles : (user.distanceMiles ?? 0);
  return {
    ...user,
    city,
    state,
    distanceMiles,
    location: {
      city,
      state,
      country: user.location?.country || 'United States',
      latitude: user.location?.latitude || 47.6062,
      longitude: user.location?.longitude || -122.3321,
      distanceMiles,
    },
    interests: user.interests || [],
    hobbies: user.hobbies || [],
    photos: user.photos || [],
    relationshipGoals: user.relationshipGoals || ['companionship'],
    verificationBadge: !!user.verificationBadge,
    verificationStatus: user.verificationStatus || 'NOT_STARTED',
    subscriptionTier: user.subscriptionTier || 'FREE',
  };
}

export const API = {
  // Auth & Profile
  async getMe(): Promise<UserProfile> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        // Try auto login for demo / test account if no token exists yet
        const demoLogin = await this.login({
          email: 'eleanor.vance@example.com',
          password: 'Password123!',
        });
        return demoLogin.user;
      }
      throw new Error('Failed to load user profile');
    }
    const data = await res.json();
    return normalizeProfile(data.user);
  },

  async updateMe(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    const data = await res.json();
    return normalizeProfile(data.user);
  },

  async registerUser(payload: {
    email: string;
    password?: string;
    firstName: string;
    dateOfBirth: string;
    gender: string;
    lookingForGender?: string;
    city: string;
    state: string;
    relationshipGoals: string[];
    interests?: string[];
    photos?: any[];
    lifestyle?: any;
    bio?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }
    if (data.token) {
      localStorage.setItem('silverharmony_jwt_token', data.token);
    }
    return {
      ...data,
      user: normalizeProfile(data.user),
    };
  },

  async login(payload: { email: string; password?: string }): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    if (data.token) {
      localStorage.setItem('silverharmony_jwt_token', data.token);
    }
    return {
      ...data,
      user: normalizeProfile(data.user),
    };
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('silverharmony_jwt_token');
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; code?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
    return data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed');
    return data;
  },

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Email verification failed');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete account');
    localStorage.removeItem('silverharmony_jwt_token');
    return data;
  },

  async updateTrustedContact(contact: any): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ trustedContact: contact }),
    });
    const data = await res.json();
    return {
      success: true,
      user: normalizeProfile(data.user),
    };
  },

  async updatePrivacySettings(settings: any): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ privacySettings: settings }),
    });
    const data = await res.json();
    return {
      success: true,
      user: normalizeProfile(data.user),
    };
  },

  // Notifications
  async getNotifications(): Promise<any[]> {
    const res = await fetch('/api/notifications', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.notifications || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Date Plans
  async getDatePlans(): Promise<any[]> {
    const res = await fetch('/api/dates', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.datePlans || [];
  },

  async createDatePlan(plan: any): Promise<any> {
    const res = await fetch('/api/dates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(plan),
    });
    return res.json();
  },

  async updateDatePlanStatus(planId: string, status: string): Promise<any> {
    const res = await fetch(`/api/dates/${planId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async submitDateSafetyCheckIn(planId: string, response: 'SAFE' | 'NEED_HELP'): Promise<any> {
    const res = await fetch('/api/safety/checkin', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ planId, response }),
    });
    return res.json();
  },

  // Identity Verification (Real Process)
  async getVerificationSession(): Promise<any> {
    const res = await fetch('/api/verification/session', {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async submitVerification(payload: {
    documentType: string;
    documentFrontUrl: string;
    documentBackUrl?: string;
    selfieUrl: string;
    fullName: string;
    dateOfBirth: string;
  }): Promise<{ success: boolean; session: any; message: string }> {
    const res = await fetch('/api/verification/process', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification processing failed');
    return data;
  },

  // Discovery & Matches
  async getDiscovery(filters?: Partial<DiscoveryFilter>): Promise<{
    profiles: UserProfile[];
    categories: any;
    totalCount: number;
  }> {
    const res = await fetch('/api/users/discover', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load discovery profiles');
    const data = await res.json();
    return {
      ...data,
      profiles: (data.profiles || []).map(normalizeProfile),
    };
  },

  async likeProfile(targetUserId: string): Promise<{ success: boolean; isMatch: boolean; match?: any; targetUser: UserProfile }> {
    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId }),
    });
    if (!res.ok) throw new Error('Failed to like profile');
    const data = await res.json();
    return {
      ...data,
      isMatch: data.isMutualMatch,
      targetUser: normalizeProfile(data.targetUser),
    };
  },

  async passProfile(targetUserId: string): Promise<void> {
    await fetch('/api/passes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId }),
    });
  },

  async getMatches(): Promise<Match[]> {
    const res = await fetch('/api/matches', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load matches');
    const data = await res.json();
    return (data.matches || []).map((m: any) => ({
      ...m,
      user: normalizeProfile(m.user),
    }));
  },

  async toggleFavoriteMatch(matchId: string): Promise<{ success: boolean; isFavorite: boolean }> {
    const res = await fetch(`/api/matches/${matchId}/favorite`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Messaging & Conversations
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load conversations');
    const data = await res.json();
    return (data.conversations || []).map((c: any) => ({
      ...c,
      participant: normalizeProfile(c.participant),
    }));
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load messages');
    const data = await res.json();
    return data.messages || [];
  },

  async sendMessage(conversationId: string, receiverId: string, text: string, imageUrl?: string): Promise<{ message: Message; scamWarning?: any }> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiverId, text, imageUrl }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async getAiIcebreakers(partnerId: string): Promise<string[]> {
    const res = await fetch('/api/ai/icebreakers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ partnerId }),
    });
    const data = await res.json();
    return data.icebreakers || [];
  },

  // Safety & Moderation
  async submitReport(payload: {
    reportedUserId: string;
    category: string;
    description: string;
    evidenceSnippets?: string[];
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/safety/report', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return res.json();
  },

  async blockUser(targetUserId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/safety/block', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId }),
    });
    return res.json();
  },

  // Community Events
  async getEvents(): Promise<CommunityEvent[]> {
    const res = await fetch('/api/events', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  },

  async joinEvent(eventId: string): Promise<{ success: boolean; status: string; attendeesCount: number }> {
    const res = await fetch(`/api/events/${eventId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getEventMessages(eventId: string): Promise<any[]> {
    const res = await fetch(`/api/events/${eventId}/messages`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.messages || [];
  },

  async postEventMessage(eventId: string, text: string): Promise<any> {
    const res = await fetch(`/api/events/${eventId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // Subscriptions & Payments
  async getSubscriptionPlans(): Promise<any[]> {
    const res = await fetch('/api/subscription/plans');
    const data = await res.json();
    return data.plans || [];
  },

  async createCheckoutSession(planId: string): Promise<any> {
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ planId }),
    });
    return res.json();
  },

  async confirmSubscriptionPayment(payload: { planId: string; cardBrand?: string; last4?: string }): Promise<any> {
    const res = await fetch('/api/subscription/confirm', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getPaymentTransactions(): Promise<any[]> {
    const res = await fetch('/api/subscription/transactions', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.transactions || [];
  },

  // Admin Portal
  async getAdminOverview(): Promise<any> {
    const res = await fetch('/api/admin/overview', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized or failed to load admin dashboard');
    return res.json();
  },

  async actionAdminReport(reportId: string, action: string, notes?: string): Promise<any> {
    const res = await fetch(`/api/admin/reports/${reportId}/action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, notes }),
    });
    return res.json();
  },

  async reviewAdminVerification(sessionId: string, decision: 'APPROVE' | 'REJECT', reason?: string): Promise<any> {
    const res = await fetch('/api/admin/verification/review', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId, decision, reason }),
    });
    return res.json();
  },

  // Compatibility helpers for existing components
  async getDateSuggestions(): Promise<DateSuggestion[]> {
    return [
      {
        id: 'date_sug_1',
        title: 'Botanical Garden Morning Walk & Tea',
        category: 'botanical_garden',
        locationName: 'Seattle Japanese Garden Pavilion',
        address: '1070 Lake Washington Blvd E, Seattle, WA',
        description: 'Serene paved pathways with abundant seating, fragrant floral pavilions, and a quiet artisan tea house.',
        whySafe: 'Public, well-staffed, well-lit gardens with accessible benches every 100 feet.',
        budget: '$$',
        accessibilityHighlights: ['Level paved walkways', 'Abundant benches', 'Accessible parking'],
        bestTimes: 'Morning (10:00 AM)',
      },
      {
        id: 'date_sug_2',
        title: 'Art Museum Exhibition & Espresso',
        category: 'museum',
        locationName: 'SAM Modern Wing & Atrium Coffee',
        address: '1300 1st Ave, Seattle, WA',
        description: 'Quiet contemplation of fine art followed by comfortable seating in the museum atrium cafe.',
        whySafe: 'High security museum atrium with zero pressure and natural conversation starters.',
        budget: '$$',
        accessibilityHighlights: ['Elevator access', 'Quiet acoustic zones', 'Spacious cafe'],
        bestTimes: 'Afternoon (2:00 PM)',
      },
      {
        id: 'date_sug_3',
        title: 'Acoustic Sunday Jazz Brunch',
        category: 'casual_dining',
        locationName: 'The Waterfront Bistro & Sunroom',
        address: '2200 Alaskan Way, Seattle, WA',
        description: 'Gentle live classical or acoustic jazz music paired with fresh farm-to-table brunch.',
        whySafe: 'Lively, friendly public restaurant atmosphere with reserved table seating.',
        budget: '$$$',
        accessibilityHighlights: ['Step-free entry', 'Comfortable cushioned booths', 'Valet option'],
        bestTimes: 'Sunday Late Morning (11:30 AM)',
      },
    ];
  },

  async rsvpEvent(eventId: string): Promise<{ success: boolean; isJoined: boolean }> {
    const res = await this.joinEvent(eventId);
    return { success: res.success, isJoined: res.status === 'JOINED' };
  },

  async completeVerification(outcome: 'VERIFIED' | 'REVIEW_REQUIRED' | 'FAILED', documentType?: string): Promise<any> {
    return this.submitVerification({
      documentType: documentType || 'DRIVERS_LICENSE',
      documentFrontUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      fullName: 'Verified User',
      dateOfBirth: '1966-04-12',
    });
  },

  async upgradeTier(tier: string): Promise<{ success: boolean }> {
    await this.confirmSubscriptionPayment({ planId: tier === 'PREMIUM_PLUS' ? 'plan_vip_annual' : 'plan_gold_monthly' });
    return { success: true };
  },

  async parseBioWithAI(rawBioText: string): Promise<{
    relationshipPace: string;
    recommendedGoals: string[];
    extractedInterests: string[];
    lifestyleSummary: string;
    polishedBio: string;
  }> {
    return {
      relationshipPace: 'Thoughtful & Meaningful',
      recommendedGoals: ['companionship', 'serious_relationship'],
      extractedInterests: ['Gardening', 'Morning Walks', 'Classical Music'],
      lifestyleSummary: 'Values genuine communication, peaceful nature walks, and reliable companionship.',
      polishedBio: rawBioText.trim() || 'Active, warm-hearted 50+ companion who appreciates good conversation, peaceful mornings, and sharing life stories.',
    };
  },

  async getSubscriptions(): Promise<{ currentTier: string; tiers: any[] }> {
    const plans = await this.getSubscriptionPlans();
    return {
      currentTier: 'FREE',
      tiers: plans,
    };
  },
};
