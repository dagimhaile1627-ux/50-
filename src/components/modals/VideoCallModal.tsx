import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const VideoCallModal: React.FC = () => {
  const { showVideoDateModal, setShowVideoDateModal, activeConversation, setShowSafetyReportModal } = useApp();
  const [micOn, setMicOn] = useState<boolean>(true);
  const [videoOn, setVideoOn] = useState<boolean>(true);
  const [promptIndex, setPromptIndex] = useState<number>(0);

  if (!showVideoDateModal) return null;

  const partner = activeConversation?.participant || {
    firstName: 'Robert',
    age: 63,
    photos: [{ url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80' }],
    location: { city: 'Seattle', state: 'WA' },
  };

  const conversationPrompts = [
    "What was the most memorable trip or adventure of your life?",
    "If you could have a quiet afternoon doing anything, what would you choose?",
    "What kind of music or favorite vinyl record puts you in the best mood?",
    "What are you most looking forward to in this chapter of life?",
  ];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-2xl w-full h-[90vh] max-h-[640px] flex flex-col justify-between overflow-hidden shadow-2xl relative">
        {/* Top Floating Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          <div className="bg-black/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-700 flex items-center gap-2 text-xs sm:text-sm text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="font-bold">{partner.firstName}, {partner.age}</span>
            <span className="text-neutral-300 text-xs flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Verified
            </span>
          </div>

          <button
            onClick={() => setShowSafetyReportModal({ open: true, targetUser: activeConversation?.participant })}
            className="bg-black/90 hover:bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors tap-active"
            title="Safety & Report Incident"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span>Safety Alert</span>
          </button>
        </div>

        {/* Video Stage */}
        <div className="relative flex-1 bg-neutral-900 overflow-hidden flex items-center justify-center">
          {videoOn ? (
            <img
              src={partner.photos?.[0]?.url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'}
              alt={partner.firstName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-center space-y-2">
              <VideoOff className="w-12 h-12 text-neutral-600 mx-auto" />
              <p className="text-sm text-neutral-400">Camera is paused</p>
            </div>
          )}

          {/* Self PiP View */}
          <div className="absolute bottom-4 right-4 w-28 h-36 sm:w-32 sm:h-44 rounded-2xl overflow-hidden border-2 border-white bg-black shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
              alt="You"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-1 left-2 text-[10px] text-white font-bold bg-black/70 px-1.5 py-0.5 rounded">
              You
            </div>
          </div>
        </div>

        {/* Conversation Starter Prompt */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-3 text-center relative z-10">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2 text-xs text-white">
            <div className="flex items-center gap-1.5 text-left">
              <Sparkles className="w-4 h-4 shrink-0 text-white" />
              <span className="italic font-medium text-neutral-200">
                "{conversationPrompts[promptIndex]}"
              </span>
            </div>
            <button
              onClick={() => setPromptIndex((prev) => (prev + 1) % conversationPrompts.length)}
              className="text-[11px] bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-2 py-1 rounded shrink-0 border border-neutral-600 tap-active"
            >
              Next Topic →
            </button>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="bg-neutral-950 p-4 flex items-center justify-center gap-4 shrink-0 z-10 border-t border-neutral-800">
          {/* Mute Button */}
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-3.5 rounded-full border transition-all tap-active ${
              micOn ? 'bg-neutral-900 text-white border-neutral-700' : 'bg-white text-black border-white'
            }`}
            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-black" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-3.5 rounded-full border transition-all tap-active ${
              videoOn ? 'bg-neutral-900 text-white border-neutral-700' : 'bg-white text-black border-white'
            }`}
            title={videoOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6 text-black" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={() => setShowVideoDateModal(false)}
            id="btn-end-video-call"
            className="bg-white hover:bg-neutral-200 text-black font-bold p-3.5 rounded-full shadow-lg transition-transform hover:scale-105 tap-active"
            title="End Video Date"
          >
            <PhoneOff className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};

