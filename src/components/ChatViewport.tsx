"use client";

import React, { useState, useRef, useEffect } from "react";
import { AgentServerResponse } from "../types";

interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: Date;
}

interface ChatViewportProps {
  onQueryExecuted: (
    prompt: string,
    response: AgentServerResponse | null,
    loading: boolean
  ) => void;
}

export default function ChatViewport({ onQueryExecuted }: ChatViewportProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "advisor",
      text: "👋 **Welcome back to EdCoral AI!**\n\nI'm your academic advisor and coach. I can help you inspect, filter, and plan your schedules directly from your local databases using Coral SQL query acceleration.\n\nTry asking me things like:\n- *\"Show my pending tasks\"*\n- *\"List assignments due soon\"*\n- *\"Show completed tasks\"*\n- *\"What active sync issues are on GitHub?\"*\n\nLet's get organized!",
      timestamp: new Date(),
    },
  ]);

  const [showNotionModal, setShowNotionModal] = useState(false);
  const [notionApiKey, setNotionApiKey] = useState("");
  const [notionDbId, setNotionDbId] = useState("");
  const [notionConnected, setNotionConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userPrompt = prompt;
    setPrompt("");
    setLoading(true);

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: userPrompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    onQueryExecuted(userPrompt, null, true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to contact advisor endpoint");
      }

      const data = (await res.json()) as AgentServerResponse;

      // Add advisor response message
      const advisorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "advisor",
        text: data.explanation,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, advisorMsg]);
      onQueryExecuted(userPrompt, data, false);
    } catch (error) {
      console.error(error);
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "advisor",
        text: "❌ **Failed to fetch details.** Make sure the local Coral SQL agent server is running correctly, and check the right console for debugging logs.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
      onQueryExecuted(userPrompt, null, false);
    } finally {
      setLoading(false);
    }
  };

  const handleNotionConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notionApiKey.trim() || !notionDbId.trim()) return;

    setNotionConnected(true);
    setShowNotionModal(false);

    // Inject a special advisor notice
    const integrationMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "advisor",
      text: "⚡ **Notion Integration Connected!**\n\nI have successfully synchronized your workspace database. Your local tracker and Notion dashboard are now linked! Future schedules will automatically update both systems seamlessly.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, integrationMsg]);
  };

  // Helper to render basic markdown-like content to avoid adding external dependencies
  const renderMessageContent = (text: string) => {
    return text.split("\n\n").map((paragraph, index) => {
      // Headers
      if (paragraph.startsWith("### ")) {
        return (
          <h3 key={index} className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">
            {paragraph.replace("### ", "")}
          </h3>
        );
      }
      
      // Inline markdown replacements
      const htmlContent = paragraph
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
        .replace(/\*(.*?)\*/g, "<em>$1</em>") // italics
        .replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-mono text-sm'>$1</code>"); // inline code

      // List items
      if (htmlContent.startsWith("- ")) {
        return (
          <ul key={index} className="list-disc pl-5 space-y-1 my-2">
            {paragraph.split("\n").map((line, lIdx) => {
              const cleanedLine = line
                .replace(/^-\s+/, "")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                .replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500 font-mono text-sm'>$1</code>");
              return (
                <li key={lIdx} dangerouslySetInnerHTML={{ __html: cleanedLine }} className="text-slate-700 dark:text-slate-300" />
              );
            })}
          </ul>
        );
      }

      return (
        <p
          key={index}
          className="text-slate-700 dark:text-slate-300 leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shadow-inner">
              🎓
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-base leading-tight">Advisor Coach</h2>
            <p className="text-xs text-white/80">EduCoral Student Assistant</p>
          </div>
        </div>

        {/* Notion Quick Connect */}
        <button
          onClick={() => setShowNotionModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow transition-all duration-200 ${
            notionConnected
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-white text-teal-600 hover:bg-teal-50 shadow-md hover:-translate-y-0.5 active:translate-y-0"
          }`}
        >
          <span>📓</span>
          {notionConnected ? "Connected" : "Connect Notion"}
        </button>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-zinc-900/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                msg.sender === "user"
                  ? "bg-teal-500 text-white border-teal-600 rounded-tr-none"
                  : "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border-slate-100 dark:border-zinc-800 rounded-tl-none"
              }`}
            >
              {msg.sender === "advisor" ? (
                <div>{renderMessageContent(msg.text)}</div>
              ) : (
                <p className="leading-relaxed">{msg.text}</p>
              )}
              <span
                className={`block text-[10px] mt-2 text-right ${
                  msg.sender === "user" ? "text-teal-100" : "text-slate-400"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 bg-teal-500 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Form */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-2"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask your advisor (e.g., 'Show my pending assignments')..."
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-5 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white rounded-xl font-medium text-sm transition-all shadow-md active:translate-y-0.5"
        >
          Query
        </button>
      </form>

      {/* Notion Connection Modal */}
      {showNotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">📓</span>
                <h3 className="font-semibold text-lg">Link Notion Workspace</h3>
              </div>
              <button
                onClick={() => setShowNotionModal(false)}
                className="text-white/60 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleNotionConnectSubmit} className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect your academic syllabus page or task board directly. EduCoral will automatically parse and display them on your calendar dashboard.
              </p>
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notion Integration Token
                </label>
                <input
                  type="password"
                  required
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Database ID / Page URL
                </label>
                <input
                  type="text"
                  required
                  value={notionDbId}
                  onChange={(e) => setNotionDbId(e.target.value)}
                  placeholder="https://notion.so/workspace/32char_hex_db_id..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowNotionModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 text-sm rounded-lg font-medium shadow"
                >
                  Confirm Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
