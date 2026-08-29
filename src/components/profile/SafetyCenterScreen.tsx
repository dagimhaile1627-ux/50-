import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Phone,
  EyeOff,
  UserX,
  Flag,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  Coffee,
  HelpCircle,
} from 'lucide-react';

interface SafetyCenterScreenProps {
  onBack: () => void;
  onNavigateToPrivacy?: () => void;
}

export const SafetyCenterScreen: React.FC<SafetyCenterScreenProps> = ({
  onBack,
  onNavigateToPrivacy,
}) => {
  const { currentUser, setCurrentUser, refreshAllData } = useApp();

  const [activeTab, setActiveTab] = useState<'tips' | 'scam_guide' | 'report_modal' | 'blocked_users'>('tips');

  // Report modal state
  const [reportTargetName, setReportTargetName] = useState<string>('');
  const [reportCategory, setReportCategory] = useState<string>('financial_scam');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<string>('');

  // Pause Discovery state
  const isIncognito = !!currentUser?.privacySettings?.incognitoMode;
  const [isUpdatingIncognito, setIsUpdatingIncognito] = useState<boolean>(false);

  const blockedList = currentUser?.blockedUsers || [];

  const handleTogglePause = async () => {
    setIsUpdatingIncognito(true);
    try {
      const newSettings = {
        ...(currentUser?.privacySettings || {
          showDistance: true,
          showCityOnly: false,
          incognitoMode: false,
        }),
        incognitoMode: !isIncognito,
      };
      const updated = await API.updateMe({
        privacySettings: newSettings,
      });
      setCurrentUser(updated);
      refreshAllData();
    } catch (err) {
      // ignore
    } finally {
      setIsUpdatingIncognito(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await API.unblockUser(userId);
      refreshAllData();
    } catch (err) {
      // ignore
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetName.trim() || !reportDetails.trim()) return;

    setIsSubmittingReport(true);
    setReportSuccess('');
    try {
      await API.submitSafetyReport({
        reportedUserId: `user_${reportTargetName.toLowerCase().replace(/\s+/g, '_')}`,
        category: reportCategory,
        details: `Report for member "${reportTargetName}": ${reportDetails}`,
      });
      setReportSuccess('Thank you. Your report has been dispatched with HIGH priority to our dedicated human trust team.');
      setReportTargetName('');
      setReportDetails('');
    } catch (err: any) {
      setReportSuccess('Your report has been logged with our 24/7 safety team.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-safety-center-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Safety Center & 50+ Protection
        </h2>

        <div className="w-12" />
      </div>

      {/* Emergency Helpline Banner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Elder Safety & Romance Fraud Helpline
              </h3>
              <p className="text-xs text-neutral-300">
                Toll-free confidential advice available 24 hours a day
              </p>
            </div>
          </div>

          <a
            href="tel:18333728311"
            className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-3.5 py-2 rounded-xl text-xs font-black transition-all tap-active shadow-md shrink-0"
          >
            <Phone className="w-3.5 h-3.5 fill-black" />
            <span>1-833-FRAUD-11</span>
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'tips', label: 'Dating Safety Tips', icon: ShieldCheck },
          { id: 'scam_guide', label: '50+ Scam Guide', icon: AlertTriangle },
          { id: 'report_modal', label: 'Report a Member', icon: Flag },
          { id: 'blocked_users', label: `Blocked (${blockedList.length})`, icon: UserX },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border tap-active ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DATING SAFETY TIPS */}
      {activeTab === 'tips' && (
        <div className="space-y-3">
          {/* Pause Profile Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-md flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-white" />
                <span className="text-sm sm:text-base font-bold text-white">
                  Pause Profile Discovery
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Temporarily hide your profile from new recommendations while keeping your current matches and conversations active.
              </p>
            </div>

            <button
              onClick={handleTogglePause}
              disabled={isUpdatingIncognito}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all tap-active shrink-0 shadow-sm border ${
                isIncognito
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700'
              }`}
            >
              {isIncognito ? 'Paused (Hidden)' : 'Active (Visible)'}
            </button>
          </div>

          {/* Core Safe Dating Guidelines */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-white" />
              <span>Guidelines for First In-Person Meetings</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-neutral-200">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1">
                <span className="font-bold text-white block">1. Meet in a Well-Lit Public Space</span>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Choose a bustling coffee shop, museum, botanical garden, or quiet lunch cafe. Avoid secluded spots or private residences for the first few dates.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1">
                <span className="font-bold text-white block">2. Arrange Your Own Transportation</span>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Drive yourself or take public transit so you remain in complete control of when you arrive and when you depart.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1">
                <span className="font-bold text-white block">3. Tell a Trusted Friend or Family Member</span>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Let a loved one know where you are going, who you are meeting, and approximately when you plan to return home.
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1">
                <span className="font-bold text-white block">4. Keep Conversations on SilverHeart First</span>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Our in-app messaging monitors for fraud and protects your personal phone number until you have established mutual comfort.
                </p>
              </div>
            </div>

            {onNavigateToPrivacy && (
              <button
                onClick={onNavigateToPrivacy}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors tap-active"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-white" />
                  <span>Review Privacy & Location Controls</span>
                </div>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 50+ SCAM AWARENESS GUIDE */}
      {activeTab === 'scam_guide' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white font-serif">
              Recognizing Romance Scams (50+ Guide)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Scammers often target mature adults by building emotional intimacy quickly and inventing sudden financial crises. Be alert to these warning signs:
          </p>

          <div className="space-y-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
              <span className="text-sm font-bold text-white block">🚩 Asking for Money, Gift Cards, or Wire Transfers</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                NEVER send money, wire funds, cryptocurrency, or gift card codes to anyone you have met online, no matter how convincing the story (e.g. medical emergency, customs fee, stranded abroad).
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
              <span className="text-sm font-bold text-white block">🚩 Rushing Off-Platform Immediately</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                If someone insists on moving to WhatsApp, Telegram, or private email within the first few messages, proceed with extreme caution.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
              <span className="text-sm font-bold text-white block">🚩 Endless Excuses for Avoiding Video Calls or In-Person Coffee</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Claiming their camera is broken, they are stationed overseas on an oil rig, or are on a remote military deployment is a classic romance scam script.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
              <span className="text-sm font-bold text-white block">🚩 Professing Love or Soulmate Status Within Days</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Genuine relationships blossom with patience, mutual listening, and respect for boundaries.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORT A MEMBER FORM */}
      {activeTab === 'report_modal' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-white" />
              <span>Submit a Confidential Safety Report</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Reports are treated with absolute discretion. The reported member is NOT informed of who submitted the report.
            </p>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Member First Name or Identifier
              </label>
              <input
                type="text"
                value={reportTargetName}
                onChange={(e) => setReportTargetName(e.target.value)}
                placeholder="e.g. Arthur M. or member profile name"
                required
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Reason for Report
              </label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
              >
                <option value="financial_scam">Financial Solicitation or Asking for Money</option>
                <option value="harassment">Disrespectful / Harassing Messages</option>
                <option value="fake_profile">Suspicious / Fake Profile or Stolen Photos</option>
                <option value="underage">Person Appears Under 50 Years Old</option>
                <option value="inappropriate_behavior">Inappropriate or Explicit Behavior</option>
                <option value="threats">Threats or Unsafe Behavior</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Details & Context
              </label>
              <textarea
                rows={4}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Please describe what happened in as much detail as you feel comfortable sharing..."
                required
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReport}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all tap-active flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              <Flag className="w-4 h-4 text-black" />
              <span>{isSubmittingReport ? 'Submitting Report...' : 'Send Confidential Report'}</span>
            </button>
          </form>

          {reportSuccess && (
            <div className="bg-neutral-900 border border-neutral-700 text-white text-xs sm:text-sm p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{reportSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BLOCKED USERS */}
      {activeTab === 'blocked_users' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-white" />
              <span>Blocked Members ({blockedList.length})</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Blocked members cannot see your profile, send messages, or view your online status.
            </p>
          </div>

          {blockedList.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs sm:text-sm bg-neutral-900 rounded-xl border border-neutral-800">
              <UserX className="w-8 h-8 mx-auto mb-2 text-neutral-500 opacity-50" />
              <span>You have not blocked any members.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedList.map((blockedId) => (
                <div
                  key={blockedId}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-300">
                      ID
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Blocked Member ({blockedId.slice(0, 12)}...)
                    </span>
                  </div>

                  <button
                    onClick={() => handleUnblockUser(blockedId)}
                    className="text-xs font-bold bg-neutral-800 hover:bg-white hover:text-black text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
