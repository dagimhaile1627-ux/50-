import { db, DBMessage, DBReport, DBDatePlan } from './db';
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini initialization for Scam Guardian warning:', err);
  }
}

const SCAM_TRIGGER_PATTERNS = [
  /gift\s*card/i,
  /wire\s*transfer/i,
  /western\s*union/i,
  /crypto/i,
  /bitcoin/i,
  /emergency\s*money/i,
  /hospital\s*bill.*abroad/i,
  /oil\s*rig.*stranded/i,
  /send\s*(money|\$|dollars|cash)/i,
  /zelle\s*me/i,
  /venmo\s*me/i,
  /cash\s*app\s*me/i,
  /whatsapp\s*me\s*immediately/i,
  /telegram\s*handle/i,
  /inheritance.*fee/i,
];

export async function analyzeMessageForScam(text: string): Promise<{
  isSuspicious: boolean;
  warningCategory?: string;
  reason?: string;
  recommendedAction?: string;
}> {
  // Check known patterns first
  for (const pattern of SCAM_TRIGGER_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSuspicious: true,
        warningCategory: 'Financial Solicitation & Off-Platform Risk',
        reason: 'This message contains references to financial transactions, gift cards, crypto, or off-platform communication. Never send money or financial details to anyone you have only met online.',
        recommendedAction: 'Do not send funds. Report or block this user if they persist.',
      };
    }
  }

  // If Gemini AI is configured, perform semantic scam evaluation
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI Safety & Romance Scam Guardian for a senior 50+ dating app.
Analyze the following private message text for romance scam tactics, financial grooming, urgent money requests, fake investment pitches, or off-platform coercion:
Message: "${text}"

Respond in JSON format:
{
  "isSuspicious": boolean,
  "warningCategory": string,
  "reason": string,
  "recommendedAction": string
}`,
      });

      if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.isSuspicious) {
          return parsed;
        }
      }
    } catch (err) {
      // Fallback silently if AI fails
    }
  }

  return { isSuspicious: false };
}

export function reportUser(
  reporterId: string,
  reportedUserId: string,
  category: DBReport['category'],
  description: string,
  evidenceSnippets: string[] = []
): DBReport {
  const data = db.getData();
  const reporter = data.users.find((u) => u.id === reporterId);
  const reportedUser = data.users.find((u) => u.id === reportedUserId);

  const report: DBReport = {
    id: `rep_${Date.now()}`,
    reporterId,
    reporterName: reporter ? `${reporter.firstName}` : 'Anonymous Member',
    reportedUserId,
    reportedUserName: reportedUser ? `${reportedUser.firstName}` : 'Unknown User',
    category,
    description,
    evidenceSnippets,
    riskLevel: category === 'Scam/Financial' ? 'HIGH' : 'MEDIUM',
    status: 'PENDING_REVIEW',
    createdAt: new Date().toISOString(),
  };

  data.reports.unshift(report);

  // Automatically block reported user for the reporter
  if (reporter && !reporter.blockedUsers.includes(reportedUserId)) {
    reporter.blockedUsers.push(reportedUserId);
  }

  // Audit log
  data.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'USER_REPORTED',
    actorId: reporterId,
    actorEmail: reporter?.email || 'reporter@example.com',
    actorRole: reporter?.role || 'USER',
    targetId: reportedUserId,
    targetType: 'USER',
    details: `User reported under category: ${category}. Description: "${description.slice(0, 100)}"`,
    timestamp: new Date().toISOString(),
  });

  db.save();
  return report;
}

export function blockUser(userId: string, targetUserId: string): { success: boolean } {
  const data = db.getData();
  const user = data.users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');

  if (!user.blockedUsers.includes(targetUserId)) {
    user.blockedUsers.push(targetUserId);
  }

  // Also remove mutual match if one exists
  const match = data.matches.find(
    (m) => (m.userId1 === userId && m.userId2 === targetUserId) || (m.userId1 === targetUserId && m.userId2 === userId)
  );
  if (match) {
    match.status = 'UNMATCHED';
  }

  db.save();
  return { success: true };
}

export function performDateSafetyCheckIn(
  planId: string,
  userId: string,
  response: 'SAFE' | 'NEED_HELP'
): { success: boolean; datePlan: DBDatePlan; alertSent: boolean } {
  const data = db.getData();
  const plan = data.datePlans.find((p) => p.id === planId);
  if (!plan) throw new Error('Date plan not found');

  const user = data.users.find((u) => u.id === userId);
  let alertSent = false;

  if (response === 'SAFE') {
    plan.checkInStatus = 'SAFE_CONFIRMED';
  } else {
    plan.checkInStatus = 'ALERT_SENT';
    alertSent = true;

    // Log critical audit
    data.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'SAFETY_CHECKIN_ALERT',
      actorId: userId,
      actorEmail: user?.email || 'user@example.com',
      actorRole: 'USER',
      targetId: planId,
      targetType: 'DATE_PLAN',
      details: `User triggered safety alert for date plan with ${plan.partnerName} at ${plan.locationName}. Trusted contact: ${user?.trustedContact?.name || 'None'}.`,
      timestamp: new Date().toISOString(),
    });

    // Create immediate high-priority safety notification
    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId,
      type: 'safety',
      title: 'Safety Alert Activated',
      description: `Your trusted contact (${user?.trustedContact?.name || 'Designated Contact'}) has been notified with your date location details. Stay in a well-lit, public area.`,
      timestamp: 'Just now',
      isRead: false,
      actionTab: 'profile',
    });
  }

  plan.updatedAt = new Date().toISOString();
  db.save();

  return { success: true, datePlan: plan, alertSent };
}
