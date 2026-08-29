import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, CheckCircle2, UserX } from 'lucide-react';
import { API } from '../../services/api';

export const SafetyReportModal: React.FC = () => {
  const { showSafetyReportModal, setShowSafetyReportModal, handleBlockUser } = useApp();
  const [category, setCategory] = useState<string>('Scam/Financial');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!showSafetyReportModal.open) return null;

  const targetUser = showSafetyReportModal.targetUser;

  const categories = [
    'Scam/Financial',
    'Fake Profile',
    'Harassment',
    'Inappropriate Content',
    'Pressure off-platform',
    'Underage Concern',
    'Other',
  ];

  const handleSubmit = async () => {
    if (!targetUser) return;
    setSubmitting(true);
    try {
      await API.submitReport({
        reportedUserId: targetUser.id,
        category,
        description: description.trim() || `User reported for ${category}.`,
        evidenceSnippets: [],
      });
      await handleBlockUser(targetUser.id);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={() => setShowSafetyReportModal({ open: false })}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 tap-active"
        >
          <X className="w-6 h-6" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-white">
                  Report & Block {targetUser?.firstName || 'Member'}
                </h3>
                <p className="text-xs text-neutral-300">
                  Your report is strictly confidential and reviewed by our trust team.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                  Select Reason for Concern:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all tap-active ${
                        category === cat
                          ? 'bg-neutral-900 text-white border-white shadow'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                  Additional Details (Optional):
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened (e.g. asked for money, suspicious links, disrespectful behavior)..."
                  className="w-full bg-black border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white placeholder:text-neutral-500"
                />
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 space-y-1">
                <p className="text-white font-bold flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-white" />
                  Immediate Protection:
                </p>
                <p>
                  Submitting will instantly block this user. They will no longer be able to message you, view your profile, or appear in discovery.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-sm flex items-center justify-center gap-2 tap-active min-h-[48px]"
              >
                <ShieldAlert className="w-4 h-4 text-black" />
                {submitting ? 'Submitting Report...' : 'Submit Report & Block User'}
              </button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-white mx-auto" />
            <h4 className="text-xl font-bold font-serif text-white">
              Report Submitted & User Blocked
            </h4>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-sm mx-auto">
              Thank you for keeping our 50+ community safe. Our Trust & Safety team has received the report and is reviewing it.
            </p>
            <button
              onClick={() => setShowSafetyReportModal({ open: false })}
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3 rounded-xl transition-colors tap-active min-h-[44px]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

