import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, CheckCircle2, X, ShieldCheck } from 'lucide-react';

export const DatePlannerModal: React.FC = () => {
  const { showDatePlannerModal, setShowDatePlannerModal, dateSuggestions, activeConversation, handleSendMessage } = useApp();
  const [selectedDate, setSelectedDate] = useState<any>(dateSuggestions[0] || null);
  const [scheduledDay, setScheduledDay] = useState<string>('This Saturday Afternoon');
  const [sentInvite, setSentInvite] = useState<boolean>(false);

  if (!showDatePlannerModal) return null;

  const partner = activeConversation?.participant;

  const handleSendDateInvite = async () => {
    if (!selectedDate || !activeConversation) return;
    const inviteText = `I'd love to invite you to join me for a relaxed, safe first date at ${selectedDate.title} (${selectedDate.locationName}) ${scheduledDay}. Does that sound pleasant to you?`;
    await handleSendMessage(activeConversation.id, activeConversation.participant.id, inviteText);
    setSentInvite(true);
    setTimeout(() => {
      setSentInvite(false);
      setShowDatePlannerModal(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-xl w-full my-auto p-5 sm:p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={() => setShowDatePlannerModal(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 tap-active"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-white">
              Safe Public Date Planner {partner ? `with ${partner.firstName}` : ''}
            </h3>
            <p className="text-xs text-neutral-300">
              Curated senior-friendly venues with quiet acoustics and comfortable seating.
            </p>
          </div>
        </div>

        {sentInvite ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-white mx-auto" />
            <h4 className="text-xl font-bold font-serif text-white">
              Date Invitation Sent to {partner?.firstName}!
            </h4>
            <p className="text-xs sm:text-sm text-neutral-300">
              The invitation with venue location and accessibility details has been posted to your private chat.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                Select a Safe Public Venue:
              </label>
              <div className="space-y-2">
                {dateSuggestions.map((venue) => (
                  <div
                    key={venue.id}
                    onClick={() => setSelectedDate(venue)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all tap-active ${
                      selectedDate?.id === venue.id
                        ? 'bg-neutral-900 border-white text-white shadow-md'
                        : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm sm:text-base">{venue.title}</h4>
                      <span className="text-xs font-bold text-white bg-neutral-800 px-2 py-0.5 rounded">{venue.budget}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">📍 {venue.locationName} • {venue.address}</p>
                    <p className="text-xs text-neutral-300 mt-1">{venue.description}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-300 mt-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" />
                      <span>{venue.whySafe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                Suggested Time:
              </label>
              <select
                value={scheduledDay}
                onChange={(e) => setScheduledDay(e.target.value)}
                className="w-full bg-black border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white"
              >
                <option value="This Saturday at 11:00 AM">This Saturday at 11:00 AM (Morning Coffee & Walk)</option>
                <option value="This Sunday at 2:00 PM">This Sunday at 2:00 PM (Afternoon Tea)</option>
                <option value="Next Tuesday at 1:30 PM">Next Tuesday at 1:30 PM (Museum Stroll)</option>
                <option value="Next Thursday at 12:00 PM">Next Thursday at 12:00 PM (Lunch Date)</option>
              </select>
            </div>

            <button
              onClick={handleSendDateInvite}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-sm flex items-center justify-center gap-2 tap-active min-h-[48px]"
            >
              <Calendar className="w-4 h-4 text-black" />
              Send Invitation in Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

