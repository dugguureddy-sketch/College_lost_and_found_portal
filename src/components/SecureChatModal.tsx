import React, { useState, useEffect, useRef } from 'react';
import { Item, User, ChatMessage } from '../types';
import { getChatMessages, sendChatMessage } from '../utils/storage';
import { MessageSquare, Send, Shield, Lock, X, Check, MapPin, UserCheck, Sparkles } from 'lucide-react';

interface SecureChatModalProps {
  item: Item;
  currentUser: User;
  onClose: () => void;
}

const SAFE_HANDOVER_PROMPTS = [
  'Can we meet at the Central Library Security Desk?',
  'I am near the Academic Block Room 102 with your item.',
  'Please bring your College ID card for quick verification.',
  'I have deposited the item in Security Locker #B-14.',
];

export const SecureChatModal: React.FC<SecureChatModalProps> = ({
  item,
  currentUser,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTypingSimulated, setIsTypingSimulated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUser.id === item.userId;
  const recipientId = isOwner ? 'user-102' : item.userId;
  const recipientName = isOwner ? (item.userName || 'Campus Custodian') : 'Item Owner (Anonymous)';

  const loadMessages = () => {
    const allChats = getChatMessages(item.id);
    setMessages(allChats);
  };

  useEffect(() => {
    loadMessages();
  }, [item.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingSimulated]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg = sendChatMessage({
      itemId: item.id,
      itemTitle: item.title,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role === 'admin' || currentUser.role === 'security' ? 'Security Staff' : 'Campus Member',
      recipientId,
      text,
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate an intelligent automated response if sending first message
    if (messages.length < 3) {
      setIsTypingSimulated(true);
      setTimeout(() => {
        setIsTypingSimulated(false);
        const autoReply = sendChatMessage({
          itemId: item.id,
          itemTitle: item.title,
          senderId: recipientId,
          senderName: isOwner ? 'Officer Miller (Security Desk)' : item.userName || 'Finder',
          senderRole: isOwner ? 'Security Staff' : 'Student Finder',
          recipientId: currentUser.id,
          text: `Got your message! I will be available at ${item.location} Security Desk. You can verify and pick it up anytime today.`,
        });
        setMessages((prev) => [...prev, autoReply]);
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in">
      <div className="bg-white border-2 border-orange-200 rounded-3xl max-w-xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl relative text-slate-800 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-orange-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl relative z-10">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-xl shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-slate-900">
                  Anonymous Secure Handover Chat
                </h3>
                <span className="flex items-center space-x-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Encrypted</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                Item: <strong className="text-slate-700">{item.title}</strong> • Phone numbers masked for privacy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-orange-50/80 border-b border-orange-100 px-4 py-2 flex items-center justify-between text-xs text-orange-900">
          <span className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Campus Safety Guideline: Always arrange physical handoffs at official Security Desks.</span>
          </span>
        </div>

        {/* Chat Messages Container */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-orange-200">
              <Sparkles className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700">Start the Secure Handover Conversation</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Coordinate pickup time, desk locker location, and ID verification without exchanging personal numbers.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1 flex items-center space-x-1">
                    <span>{isMe ? 'You' : msg.senderName}</span>
                    {msg.senderRole && (
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-1 rounded-xs">
                        {msg.senderRole}
                      </span>
                    )}
                  </span>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm font-medium shadow-2xs ${
                      isMe
                        ? 'bg-orange-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        isMe ? 'text-orange-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {isTypingSimulated && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-3 py-2 w-fit">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce delay-200" />
              <span className="text-[11px] font-medium text-slate-500">{recipientName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Handover Chips */}
        <div className="p-2.5 bg-white border-t border-orange-100 overflow-x-auto flex items-center space-x-1.5 scrollbar-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 px-1">
            Quick Prompts:
          </span>
          {SAFE_HANDOVER_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-semibold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-xl whitespace-nowrap transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-orange-100 rounded-b-3xl flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Type a secure handover message..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
