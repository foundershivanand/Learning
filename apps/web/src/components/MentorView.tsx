'use client';

import React, { useState } from 'react';
import { Send, ShieldAlert, Sparkles, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}

export function MentorView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'mentor',
      text: 'I am not here to validate your feelings. I am here to ensure you do not fool yourself. Your primary weakness is cadence discipline under tight constraints. State what you plan to practice today, or ask for a debrief.',
      timestamp: '06:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'You are over-explaining. Condense that thought into one single premise. Why did you hesitate during your last challenge?';
      if (userMsg.text.toLowerCase().includes('tired') || userMsg.text.toLowerCase().includes('busy')) {
        reply = 'Excuses do not reduce the performance gap. High-stakes situations do not pause for your fatigue. Execute a 60-second micro-drill right now or log +1 training debt.';
      } else if (userMsg.text.toLowerCase().includes('chess')) {
        reply = 'Your tactical calculation is acceptable, but your blindfold visualization breaks down after move 4. Stop moving impulsively. Calculate forcing candidate moves: checks, captures, threats.';
      } else if (userMsg.text.toLowerCase().includes('communication')) {
        reply = 'Your sentence length is too long. When under pressure, you default to verbal crutches ("basically", "like"). In your next attempt, hold silence instead of filling pauses.';
      }

      const mentorMsg: ChatMessage = {
        id: `men-${Date.now()}`,
        sender: 'mentor',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, mentorMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] pb-20 pt-2">
      {/* Header */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4 shadow-sm flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-mentor-danger/20 border border-mentor-danger/50 flex items-center justify-center text-mentor-danger">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Adversarial Mentor</h2>
            <div className="text-[11px] text-mentor-muted">Zero Empty Praise • Extreme Accountability</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mentor-danger/20 text-mentor-danger uppercase">
          Ruthless Mode
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-1 pr-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-mentor-accent text-black font-bold text-xs' 
                : 'bg-mentor-border text-mentor-danger'
            }`}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-mentor-accent to-[#d48e00] text-black font-semibold rounded-tr-none'
                : 'bg-mentor-surface border border-mentor-border text-gray-200 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
              <div className={`text-[9px] mt-1 text-right ${
                msg.sender === 'user' ? 'text-black/60' : 'text-gray-500'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-mentor-muted ml-10">
            <span className="w-1.5 h-1.5 rounded-full bg-mentor-danger animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-mentor-danger animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-mentor-danger animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-mentor-surface border border-mentor-border p-1.5 rounded-2xl shadow-lg"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask for an excuse audit or debrief..."
            className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-mentor-accent text-black disabled:opacity-30 disabled:pointer-events-none hover:brightness-110 active:scale-95 transition-all"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
