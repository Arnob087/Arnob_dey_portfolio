"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Minimize2,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  ownerName: string;
}

const GREETING_MESSAGE = (name: string): ChatMessage => ({
  id: "greeting",
  role: "bot",
  content: `Hi there! 👋 I'm ${name}'s AI assistant. Ask me anything about their skills, projects, or experience!`,
  timestamp: new Date(),
});

const SUGGESTED_QUESTIONS = [
  "What skills do you have?",
  "Tell me about your projects",
  "How can I contact you?",
  "What's your experience?",
];

const Chatbot: React.FC<ChatbotProps> = ({ ownerName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    GREETING_MESSAGE(ownerName),
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Hide notification bubble after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      const result = await apiClient.chat(trimmed);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: result.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      // If model is loading (cold start), auto-retry after delay
      if (result.loading) {
        setTimeout(async () => {
          setIsTyping(true);
          const retry = await apiClient.chat(trimmed);
          const retryMsg: ChatMessage = {
            id: `bot-retry-${Date.now()}`,
            role: "bot",
            content: retry.reply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, retryMsg]);
          setIsTyping(false);
        }, 25000);
      }
    },
    [isTyping]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (q: string) => {
    sendMessage(q);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowBubble(false);
  };

  return (
    <>
      {/* ── Chat Window ───────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">
                  AI Assistant
                </h3>
                <p className="text-indigo-200 text-[10px]">
                  Powered by Hugging Face
                </p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/70 hover:text-white p-1 transition-colors"
              aria-label="Close chat"
            >
              <Minimize2 size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mb-1">
                    <Bot size={14} className="text-indigo-600" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-2xl rounded-br-md"
                      : "bg-white text-slate-700 rounded-2xl rounded-bl-md shadow-sm border border-slate-100"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-1">
                    <User size={14} className="text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-indigo-600" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (only show at start) */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 pb-2 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestion(q)}
                    className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-slate-100 bg-white shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isTyping}
                className="flex-grow px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 disabled:opacity-50 transition-all"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shrink-0"
                aria-label="Send message"
              >
                {isTyping ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Floating Toggle Button ────────────────── */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-slate-800 text-white hover:bg-slate-700"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* ── Notification Bubble ───────────────────── */}
      {showBubble && !isOpen && (
        <div className="fixed bottom-[5.5rem] right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-500">
          <div className="bg-white px-4 py-3 rounded-2xl rounded-br-md shadow-lg border border-slate-100 max-w-[220px]">
            <p className="text-sm text-slate-700 font-medium">
              👋 Hey! Need help? Ask me anything!
            </p>
          </div>
          <button
            onClick={() => setShowBubble(false)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs hover:bg-slate-300"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default Chatbot;