"use client";

import React, { useState } from "react";
import ChatViewport from "../components/ChatViewport";
import SqlConsole from "../components/SqlConsole";
import { AgentServerResponse } from "../types";

export default function Dashboard() {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentResponse, setCurrentResponse] = useState<AgentServerResponse | null>(null);
  const [currentLoading, setCurrentLoading] = useState(false);

  const handleQueryExecuted = (
    prompt: string,
    response: AgentServerResponse | null,
    loading: boolean
  ) => {
    setCurrentPrompt(prompt);
    setCurrentResponse(response);
    setCurrentLoading(loading);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans">
      {/* Navbar header */}
      <header className="sticky top-0 z-35 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow shadow-teal-500/20">
            📊
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-zinc-50 leading-tight">
              EduCoral AI
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Dual-Viewport Academic Planner SQL Agent
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 dark:bg-teal-500/5 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>Coral Node: Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
            <span>💻</span>
            <span>TypeScript Native</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Viewport Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-76px)] overflow-hidden">
        {/* Left Viewport: Advisor Chat */}
        <div className="h-full overflow-hidden">
          <ChatViewport onQueryExecuted={handleQueryExecuted} />
        </div>

        {/* Right Viewport: Coral SQL Logs */}
        <div className="h-full overflow-hidden">
          <SqlConsole
            prompt={currentPrompt}
            response={currentResponse}
            loading={currentLoading}
          />
        </div>
      </main>
    </div>
  );
}
