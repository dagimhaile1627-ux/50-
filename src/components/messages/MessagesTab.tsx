import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  ShieldAlert,
  ShieldCheck,
  Video,
  Calendar,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowLeft,
  CheckCheck,
} from 'lucide-react';
import { Message } from '../../types';
import { API } from '../../services/api';
import { realtimeClient } from '../../services/realtimeClient';

export const MessagesTab: React.FC = () => {
  const {
    currentUser,
    conversations,
    activeConversation,
    setActiveConversation,
    handleSendMessage,
    setShowSafetyReportModal,
    setShowVideoDateModal,
    setShowDatePlannerModal,
    setSelectedProfileDetail,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [scamAlertBanner, setScamAlertBanner] = useState<{ level: 'MEDIUM' | 'HIGH'; reason: string } | null>(null);
  const [aiIcebreakers, setAiIcebreakers] = useState<string[]>([
    "What's your favorite travel memory or dream destination?",
    "How do you like to spend a peaceful Sunday morning?",
    "What kind of books, music, or passions bring you joy?",
    "Do you have a favorite local spot for morning coffee?",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  // Realtime listeners for incoming messages & typing indicators
  useEffect(() => {
    const unsubMsg = realtimeClient.on('NEW_MESSAGE', (payload: any) => {
      const msg = payload.message;
      if (msg && activeConversation && (msg.conversationId === activeConversation.id || msg.senderId === activeConversation.participant.id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    const unsubTypingStart = realtimeClient.on('TYPING_START', (payload: any) => {
      if (activeConversation && payload.conversationId === activeConversation.id) {
        setIsPartnerTyping(true);
      }
    });

    const unsubTypingStop = realtimeClient.on('TYPING_STOP', (payload: any) => {
      if (activeConversation && payload.conversationId === activeConversation.id) {
        setIsPartnerTyping(false);
      }
    });

    return () => {
      unsubMsg();
      unsubTypingStart();
      unsubTypingStop();
    };
  }, [activeConversation]);

  // Load messages for active conversation
  useEffect(() => {
    if (activeConversation) {
      API.getMessages(activeConversation.id).then((msgs) => {
        setMessages(msgs);
        const risky = msgs.find((m) => m.flaggedRisk === 'HIGH' || m.flaggedRisk === 'MEDIUM');
        if (risky) {
          setScamAlertBanner({
            level: risky.flaggedRisk as any,
            reason: risky.riskReason || 'Caution: Suspicious financial or off-platform patterns detected in this chat.',
          });
        } else {
          setScamAlertBanner(null);
        }
      });

      // Load AI icebreakers
      API.getAiIcebreakers(activeConversation.participant.id)
        .then((tips) => {
          if (tips && tips.length > 0) setAiIcebreakers(tips);
        })
        .catch(() => {});
    }
  }, [activeConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!activeConversation || !currentUser) return;

    realtimeClient.sendTypingStart(activeConversation.participant.id, activeConversation.id);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      realtimeClient.sendTypingStop(activeConversation.participant.id, activeConversation.id);
    }, 2000);
  };

  const onSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConversation || !currentUser) return;

    setSending(true);
    setInputText('');

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    realtimeClient.sendTypingStop(activeConversation.participant.id, activeConversation.id);

    // Optimistic local update
    const tempMsg: Message = {
      id: `temp_${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      receiverId: activeConversation.participant.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    const sent = await handleSendMessage(
      activeConversation.id,
      activeConversation.participant.id,
      text.trim()
    );

    if (sent) {
      if (sent.flaggedRisk === 'HIGH' || sent.flaggedRisk === 'MEDIUM') {
        setScamAlertBanner({
          level: sent.flaggedRisk as any,
          reason: sent.riskReason || 'AI Guardian Safety Warning',
        });
      }
      setTimeout(async () => {
        const msgs = await API.getMessages(activeConversation.id);
        setMessages(msgs);
      }, 500);
    }
    setSending(false);
  };

  // If no conversation is active on mobile, show conversation list
  if (!activeConversation) {
    return (
      <div className="space-y-4 pb-8 text-white">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-white" />
            Protected Messages
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300">
            End-to-end monitored by AI Relationship Guardian to safeguard against romance scams and fraud.
          </p>
        </div>

        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 shadow-md tap-active"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={conv.participant.photos[0]?.url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'}
                      alt={conv.participant.firstName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    {conv.participant.verificationBadge && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white text-black rounded-full p-0.5 border border-black">
                        <ShieldCheck className="w-3.5 h-3.5 text-black" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base sm:text-lg truncate">
                        {conv.participant.firstName}, {conv.participant.age}
                      </h4>
                      {conv.unreadCount > 0 && (
                        <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Connected! Say hello and start a conversation.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {conv.lastMessage
                      ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
            <Lock className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Conversations Yet</h3>
            <p className="text-neutral-300 text-sm max-w-md mx-auto">
              Once you connect with someone in Discover or Matches, you can exchange secure messages here with full scam guardian protection.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Active Chat Screen
  const partner = activeConversation.participant;

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] min-h-[520px] bg-black border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl text-white">
      {/* Chat Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setActiveConversation(null)}
            className="text-white hover:bg-neutral-800 p-1.5 rounded-lg tap-active"
            title="Back to conversation list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={() => setSelectedProfileDetail(partner)}
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
          >
            <div className="relative shrink-0">
              <img
                src={partner.photos[0]?.url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'}
                alt={partner.firstName}
                className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                referrerPolicy="no-referrer"
              />
              {partner.verificationBadge && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 border border-black">
                  <ShieldCheck className="w-2.5 h-2.5 text-black" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm sm:text-base truncate">
                  {partner.firstName}, {partner.age}
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-200 border border-neutral-600 px-1.5 py-0.2 rounded font-bold hidden sm:inline">
                  Verified 50+
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 truncate">
                📍 {partner.location?.city || partner.city || 'Seattle'}, {partner.location?.state || partner.state || 'WA'}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons (Video Date, Date Planner, Safety/Report) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowVideoDateModal(true)}
            id="btn-chat-video-call"
            className="bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 tap-active min-h-[40px]"
            title="Start Private Video Date"
          >
            <Video className="w-4 h-4 text-white" />
            <span className="hidden md:inline">Video</span>
          </button>

          <button
            onClick={() => setShowDatePlannerModal(true)}
            id="btn-chat-plan-date"
            className="bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1 tap-active min-h-[40px]"
            title="Suggest Safe Public Date"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span className="hidden md:inline">Safe Date</span>
          </button>

          <button
            onClick={() => setShowSafetyReportModal({ open: true, targetUser: partner })}
            id="btn-chat-report-user"
            className="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-neutral-800 tap-active min-h-[40px]"
            title="Report or Block User"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Relationship Guardian Scam Warning Banner */}
      {scamAlertBanner && (
        <div className="bg-neutral-900 border-b-2 border-white px-4 py-3 flex items-start gap-3 text-white shrink-0">
          <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1 flex-1">
            <p className="font-bold text-white">
              AI Relationship Guardian Warning:
            </p>
            <p className="text-neutral-200">
              {scamAlertBanner.reason}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setShowSafetyReportModal({ open: true, targetUser: partner })}
                className="bg-white hover:bg-neutral-200 text-black font-bold text-xs px-3 py-1 rounded"
              >
                Report & Block User
              </button>
              <button
                onClick={() => setScamAlertBanner(null)}
                className="text-xs text-neutral-300 underline hover:text-white"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
        {/* Trust badge intro */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-center space-y-1 text-xs text-neutral-300 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-white" />
            Verified Safe Space for 50+
          </div>
          <p>
            Both you and {partner.firstName} have confirmed age 50+ and verified identities.
          </p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id || msg.senderId === 'user_me';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm sm:text-base leading-relaxed ${
                  isMe
                    ? 'bg-white text-black font-medium rounded-br-none shadow-md'
                    : 'bg-neutral-900 text-white border border-neutral-750 rounded-bl-none shadow-md'
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`text-[10px] mt-1 flex items-center justify-end gap-1 font-semibold ${
                    isMe ? 'text-neutral-700' : 'text-neutral-400'
                  }`}
                >
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 text-black" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time typing indicator */}
        {isPartnerTyping && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 italic bg-neutral-900/60 px-3 py-1.5 rounded-full w-fit">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>{partner.firstName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Icebreakers (Elder friendly topics) */}
      <div className="px-3 py-2 bg-neutral-950 border-t border-neutral-850 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
        <span className="text-[11px] text-neutral-400 shrink-0 font-bold">Icebreakers:</span>
        {aiIcebreakers.map((topic, i) => (
          <button
            key={i}
            onClick={() => onSend(topic)}
            className="text-[11px] font-medium whitespace-nowrap bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded-full border border-neutral-750 transition-colors shrink-0 tap-active"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <div className="bg-neutral-900 border-t border-neutral-800 p-3 flex items-center gap-2 shrink-0">
        <input
          type="text"
          id="input-chat-message"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={`Type a message to ${partner.firstName}...`}
          className="flex-1 bg-black border border-neutral-700 text-white px-4 py-3 rounded-xl text-sm sm:text-base placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
        />

        <button
          onClick={() => onSend()}
          disabled={!inputText.trim() || sending}
          id="btn-send-chat-message"
          className="bg-white hover:bg-neutral-200 disabled:opacity-40 text-black p-3 rounded-xl shadow-md font-bold flex items-center justify-center transition-all min-w-[48px] min-h-[48px] tap-active"
          title="Send message"
        >
          <Send className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
};
