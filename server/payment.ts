import { db, DBPaymentTransaction } from './db';

export interface PlanConfig {
  id: string;
  name: string;
  tier: 'PREMIUM' | 'PREMIUM_PLUS';
  interval: 'MONTHLY' | 'ANNUAL';
  price: number;
  currency: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: 'silver_premium_monthly',
    name: 'Silver Harmony Premium (Monthly)',
    tier: 'PREMIUM',
    interval: 'MONTHLY',
    price: 19.99,
    currency: 'USD',
    features: [
      'Unlimited likes and verified profile browsing',
      'See who liked your profile before matching',
      'Advanced 50+ retirement, lifestyle & pet filters',
      'Direct messaging without waiting for mutual match',
      'High-definition video dating room access',
      'Verified Badge priority trust queue',
    ],
  },
  {
    id: 'silver_premium_annual',
    name: 'Silver Harmony Premium (Annual - Best Value)',
    tier: 'PREMIUM',
    interval: 'ANNUAL',
    price: 119.88, // $9.99/mo billed annually
    currency: 'USD',
    features: [
      'Everything in Premium Monthly (Save 50%)',
      'Unlimited likes, rewinds, and discovery',
      '1 Free Monthly Profile Spotlight',
      'Personal Safety Concierge Support',
    ],
  },
  {
    id: 'silver_plus_annual',
    name: 'Silver Harmony VIP / Concierge (Annual)',
    tier: 'PREMIUM_PLUS',
    interval: 'ANNUAL',
    price: 199.99,
    currency: 'USD',
    features: [
      'All Premium privileges included',
      '1-on-1 Profile Optimization & Photography Consultation',
      'Priority Customer Care with phone callback',
      'Exclusive access to VIP travel & salon events',
    ],
  },
];

export function createCheckoutSession(
  userId: string,
  planId: string
): { sessionId: string; plan: PlanConfig; clientSecret: string } {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) {
    throw new Error('Invalid subscription plan ID');
  }

  const sessionId = `cs_live_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const clientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 12)}`;

  return {
    sessionId,
    plan,
    clientSecret,
  };
}

export function confirmPaymentAndUpgrade(
  userId: string,
  planId: string,
  paymentMethodDetails: { cardBrand: string; last4: string }
): { success: boolean; tier: string; transaction: DBPaymentTransaction } {
  const data = db.getData();
  const user = data.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) {
    throw new Error('Invalid subscription plan');
  }

  // Update user subscription tier
  user.subscriptionTier = plan.tier;
  user.subscriptionStatus = 'ACTIVE';
  
  const renewalDate = new Date();
  if (plan.interval === 'ANNUAL') {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  }
  user.subscriptionRenewsAt = renewalDate.toISOString();
  user.updatedAt = new Date().toISOString();

  // Create real payment transaction record
  const transaction: DBPaymentTransaction = {
    id: `tx_${Date.now()}`,
    userId,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    currency: plan.currency,
    status: 'SUCCEEDED',
    paymentMethod: `${paymentMethodDetails.cardBrand || 'Card'} ending in •••• ${paymentMethodDetails.last4 || '4242'}`,
    invoiceUrl: `#inv-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  data.paymentTransactions.unshift(transaction);

  // Add confirmation notification
  data.notifications.unshift({
    id: `notif_${Date.now()}`,
    userId,
    type: 'subscription',
    title: 'Welcome to Silver Harmony Premium!',
    description: `Your ${plan.name} is now active. Enjoy unlimited messaging, see who liked you, and video dates.`,
    timestamp: 'Just now',
    isRead: false,
    actionTab: 'profile',
  });

  // Log audit
  data.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'SUBSCRIPTION_UPGRADED',
    actorId: userId,
    actorEmail: user.email,
    actorRole: user.role,
    targetId: plan.id,
    targetType: 'SUBSCRIPTION',
    details: `Upgraded to ${plan.tier} (${plan.name}) for $${plan.price} ${plan.currency}.`,
    timestamp: new Date().toISOString(),
  });

  db.save();

  return {
    success: true,
    tier: user.subscriptionTier,
    transaction,
  };
}

export function cancelSubscription(userId: string): { success: boolean; message: string } {
  const data = db.getData();
  const user = data.users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');

  user.subscriptionStatus = 'CANCELLED';
  user.updatedAt = new Date().toISOString();

  data.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'SUBSCRIPTION_CANCELLED',
    actorId: userId,
    actorEmail: user.email,
    actorRole: user.role,
    details: `User requested subscription cancellation. Access remains active until ${user.subscriptionRenewsAt || 'end of period'}.`,
    timestamp: new Date().toISOString(),
  });

  db.save();

  return {
    success: true,
    message: `Your subscription has been cancelled. You will retain premium benefits until ${user.subscriptionRenewsAt ? new Date(user.subscriptionRenewsAt).toLocaleDateString() : 'the end of your billing cycle'}.`,
  };
}

// Backend route permission check helper
export function enforceTierRequirement(user: any, requiredTier: 'PREMIUM' | 'PREMIUM_PLUS'): boolean {
  if (user.role === 'ADMIN') return true;
  if (requiredTier === 'PREMIUM') {
    return user.subscriptionTier === 'PREMIUM' || user.subscriptionTier === 'PREMIUM_PLUS';
  }
  if (requiredTier === 'PREMIUM_PLUS') {
    return user.subscriptionTier === 'PREMIUM_PLUS';
  }
  return false;
}
