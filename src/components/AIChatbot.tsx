"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Trash2 } from "lucide-react";

interface Message {
  sender: "student" | "ai";
  text: string;
  timestamp: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "### Welcome to Google AI Overview Assistant!\nAsk me any question (e.g. *\"Best coffee spots\"* or *\"Software Engineer salaries in India\"*), and I will pull a live **Google AI Overview** from SerpApi.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputVal.trim();
    if (!query || loading) return;

    // Append user message
    const userMsg: Message = {
      sender: "student",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: "ai",
          text: `**Error:** ${data.error || "Failed to retrieve overview."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "**Network Error:** Failed to establish connection with AI Overview endpoint.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "ai",
        text: "### Welcome to Google AI Overview Assistant!\nAsk me any question (e.g. *\"Best coffee spots\"* or *\"Software Engineer salaries in India\"*), and I will pull a live **Google AI Overview** from SerpApi.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Safe inline markdown parser
  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let idx = 0;
    
    while (remaining.length > 0) {
      const boldStart = remaining.indexOf("**");
      const linkStart = remaining.indexOf("[");
      
      if (boldStart === -1 && linkStart === -1) {
        parts.push(remaining);
        break;
      }
      
      if (boldStart !== -1 && (linkStart === -1 || boldStart < linkStart)) {
        if (boldStart > 0) {
          parts.push(remaining.substring(0, boldStart));
        }
        const boldEnd = remaining.indexOf("**", boldStart + 2);
        if (boldEnd === -1) {
          parts.push(remaining.substring(boldStart));
          break;
        }
        const boldText = remaining.substring(boldStart + 2, boldEnd);
        parts.push(<strong key={`b-${idx++}`} className="font-bold text-white">{boldText}</strong>);
        remaining = remaining.substring(boldEnd + 2);
      } else {
        if (linkStart > 0) {
          parts.push(remaining.substring(0, linkStart));
        }
        const labelEnd = remaining.indexOf("]", linkStart);
        const urlStart = remaining.indexOf("(", labelEnd);
        const urlEnd = remaining.indexOf(")", urlStart);
        
        if (labelEnd === -1 || urlStart === -1 || urlEnd === -1 || urlStart !== labelEnd + 1) {
          parts.push(remaining.substring(linkStart, linkStart + 1));
          remaining = remaining.substring(linkStart + 1);
          continue;
        }
        
        const label = remaining.substring(linkStart + 1, labelEnd);
        const url = remaining.substring(urlStart + 1, urlEnd);
        parts.push(
          <a 
            key={`l-${idx++}`} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors break-all"
          >
            {label}
          </a>
        );
        remaining = remaining.substring(urlEnd + 1);
      }
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const content = line;
      
      if (content.startsWith("### ")) {
        return <h3 key={lineIdx} className="text-xs font-bold text-cyan-400 mt-2 mb-1.5 font-sans flex items-center gap-1.5">{parseInline(content.slice(4))}</h3>;
      }
      if (content.startsWith("## ")) {
        return <h2 key={lineIdx} className="text-sm font-bold text-zinc-100 mt-3 mb-2 font-sans">{parseInline(content.slice(3))}</h2>;
      }
      if (content.startsWith("# ")) {
        return <h1 key={lineIdx} className="text-base font-bold text-white mt-3 mb-2 font-sans">{parseInline(content.slice(2))}</h1>;
      }
      if (content.startsWith("- ") || content.startsWith("* ")) {
        return <li key={lineIdx} className="text-xs text-zinc-300 ml-3.5 list-disc mt-1 leading-relaxed">{parseInline(content.slice(2))}</li>;
      }
      if (content.trim() === "") {
        return <div key={lineIdx} className="h-1.5" />;
      }
      return <p key={lineIdx} className="text-xs text-zinc-300 leading-relaxed mt-1">{parseInline(content)}</p>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_25px_rgba(6,182,212,0.35)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.5)] flex items-center justify-center cursor-pointer group z-50 overflow-hidden"
      >
        {/* Glow pulsing effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isOpen ? (
          <X className="h-6 w-6 text-white stroke-[2.5]" />
        ) : (
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-8rem)] rounded-3xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-lg flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-slide-up z-50 font-sans overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-900 bg-gradient-to-r from-zinc-900/50 to-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-cyan-500/15 to-purple-500/15 border border-cyan-500/20 p-2 rounded-xl">
                <Sparkles className="h-4.5 w-4.5 text-cyan-400 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 leading-none">
                  Google AI Overview
                </h3>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1 mt-1 leading-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> Live SerpApi Agent
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear Chat History"
                className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900/60 transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 select-text scrollbar-thin scrollbar-thumb-zinc-800/80 scrollbar-track-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "student" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* Avatar icon */}
                {msg.sender === "ai" && (
                  <div className="h-7.5 w-7.5 rounded-lg bg-cyan-950/50 border border-cyan-900/40 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                )}

                <div className="space-y-1">
                  <div
                    className={`p-4.5 rounded-2xl text-xs leading-relaxed border ${
                      msg.sender === "student"
                        ? "bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-400/20 text-black font-bold shadow-md shadow-cyan-500/5 rounded-tr-sm"
                        : "bg-zinc-900/40 border-zinc-905 text-zinc-300 rounded-tl-sm"
                    }`}
                  >
                    {msg.sender === "ai" ? renderMarkdown(msg.text) : msg.text}
                  </div>
                  <div
                    className={`text-[9px] text-zinc-500 font-semibold tracking-wide ${
                      msg.sender === "student" ? "text-right" : ""
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="h-7.5 w-7.5 rounded-lg bg-cyan-950/50 border border-cyan-900/40 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                </div>
                <div className="bg-zinc-900/40 border-zinc-905 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-zinc-900/80 bg-zinc-950 flex items-center gap-2.5"
          >
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Ask AI Overview (e.g. Coffee spots...)"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-500 text-zinc-200 px-4 py-3 rounded-2-xl outline-none transition-all text-xs font-semibold"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="h-10 w-10 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black flex items-center justify-center rounded-xl transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md shadow-cyan-500/10"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
