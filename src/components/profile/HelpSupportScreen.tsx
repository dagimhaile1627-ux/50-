import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  HelpCircle,
  BookOpen,
  Mail,
  Bug,
  ShieldCheck,
  CreditCard,
  Trash2,
  Phone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface HelpSupportScreenProps {
  onBack: () => void;
  onNavigateToSafety?: () => void;
  onNavigateToSettings?: () => void;
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack,
  onNavigateToSafety,
  onNavigateToSettings,
}) => {
  const { currentUser, setCurrentUser } = useApp();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Contact support form
  const [supportSubject, setSupportSubject] = useState<string>('general');
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [isSendingTicket, setIsSendingTicket] = useState<boolean>(false);
  const [ticketSuccess, setTicketSuccess] = useState<string>('');

  const faqs = [
    {
      q: 'How does matching work on SilverHeart?',
      a: 'We focus on meaningful compatibility rather than rapid swiping. When you tap Like on a profile, they are notified. If you both like each other, a mutual match is formed, unlocking private, direct messaging.',
    },
    {
      q: 'Is my exact home address or phone number visible to others?',
      a: 'Never. Your exact address, phone number, and email remain private. Other members only see your approximate distance (e.g. "About 8 miles away") and your chosen city and state.',
    },
    {
      q: 'How do I know other members are truly 50 or older?',
      a: 'SilverHeart enforces date-of-birth validation during sign up and offers government ID and photo selfie verification to verify age and genuine identity with a verified badge.',
    },
    {
      q: 'Are essential safety tools free?',
      a: 'Yes, 100%. Reporting suspicious behavior, blocking accounts, identity checks, and communicating with mutual matches are always free of charge.',
    },
    {
      q: 'How do I pause my profile if I want to take a break?',
      a: 'You can pause discovery at any time under Safety Center or Privacy Controls. Existing conversations will remain safe and accessible while hiding your card from new discovery.',
    },
  ];

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setIsSendingTicket(true);
    setTicketSuccess('');
    setTimeout(() => {
      setIsSendingTicket(false);
      setTicketSuccess('Support ticket created (#SH-' + Math.floor(100000 + Math.random() * 900000) + '). Our support team will reply within 24 hours to ' + (currentUser?.email || 'your email') + '.');
      setSupportMessage('');
    }, 1000);
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-help-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Help & Member Support
        </h2>

        <div className="w-12" />
      </div>

      {/* 1. HOW IT WORKS GUIDE */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-white" />
          <span>How SilverHeart Works (3 Simple Steps)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-white text-black font-black flex items-center justify-center text-xs">
              1
            </div>
            <span className="font-bold text-white block">Discover & Like</span>
            <p className="text-neutral-400 leading-relaxed">
              Explore profiles tailored to your values, interests, and preferred local distance.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-white text-black font-black flex items-center justify-center text-xs">
              2
            </div>
            <span className="font-bold text-white block">Connect & Chat</span>
            <p className="text-neutral-400 leading-relaxed">
              When interest is mutual, start a thoughtful conversation with zero pressure.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-white text-black font-black flex items-center justify-center text-xs">
              3
            </div>
            <span className="font-bold text-white block">Meet Safely</span>
            <p className="text-neutral-400 leading-relaxed">
              Use our public meetup suggestions and emergency contact check-ins for relaxed dates.
            </p>
          </div>
        </div>
      </div>

      {/* 2. FREQUENTLY ASKED QUESTIONS */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-white" />
          <span>Frequently Asked Questions for 50+ Adults</span>
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:bg-neutral-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CONTACT SUPPORT FORM */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-white" />
            <span>Contact SilverHeart Support</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Our friendly support specialists are ready to assist you with any questions.
          </p>
        </div>

        <form onSubmit={handleSendTicket} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Topic
            </label>
            <select
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
            >
              <option value="general">General Question</option>
              <option value="technical">Technical Issue / App Glitch</option>
              <option value="verification">Verification Assistance</option>
              <option value="billing">Subscription & Billing Help</option>
              <option value="safety">Safety & Fraud Report Assistance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Your Message
            </label>
            <textarea
              rows={4}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="How can our support team help you today? Please include any details..."
              required
              className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSendingTicket}
            className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all tap-active flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
          >
            <Mail className="w-4 h-4 text-black" />
            <span>{isSendingTicket ? 'Submitting Ticket...' : 'Send Message to Support'}</span>
          </button>
        </form>

        {ticketSuccess && (
          <div className="bg-neutral-900 border border-neutral-700 text-white text-xs sm:text-sm p-3.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{ticketSuccess}</span>
          </div>
        )}
      </div>

      {/* 4. EMERGENCY & ACCOUNT SHORTCUTS */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
          Helpful Quick Links
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {onNavigateToSafety && (
            <button
              onClick={onNavigateToSafety}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left flex items-center gap-2.5 transition-colors tap-active"
            >
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Safety Center</span>
                <span className="text-[11px] text-neutral-400">Scam guides & fraud helpline</span>
              </div>
            </button>
          )}

          {onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-left flex items-center gap-2.5 transition-colors tap-active"
            >
              <CreditCard className="w-4 h-4 text-white shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">Account Security</span>
                <span className="text-[11px] text-neutral-400">Password, email & data controls</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
