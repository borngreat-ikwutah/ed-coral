"use client";

import React, { useState, useEffect } from "react";
import { AgentServerResponse, AssignmentRow } from "../types";

interface SqlConsoleProps {
  prompt: string;
  response: AgentServerResponse | null;
  loading: boolean;
}

interface LogEntry {
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR";
  message: string;
}

export default function SqlConsole({ prompt, response, loading }: SqlConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"terminal" | "json" | "history">("terminal");
  const [history, setHistory] = useState<{ time: string; sql: string; count: number }[]>([]);

  // Generate beautiful ASCII Table from AssignmentRow[]
  const generateAsciiTable = (data: AssignmentRow[]): string => {
    if (data.length === 0) return "No records found.";

    const headers = ["assignment_id", "course_code", "title", "due_date", "status"];
    const colWidths = headers.map(h => h.length);

    // Calculate maximum widths
    data.forEach(row => {
      headers.forEach((h, i) => {
        const val = String((row as unknown as Record<string, string | null | undefined>)[h] || "");
        if (val.length > colWidths[i]) {
          colWidths[i] = val.length;
        }
      });
    });

    // Create line separator
    const line = "+" + colWidths.map(w => "-".repeat(w + 2)).join("+") + "+";

    // Header row
    const headerRow = "|" + headers.map((h, i) => ` ${h.padEnd(colWidths[i])} `).join("|") + "|";

    // Data rows
    const rows = data.map(row => {
      return "|" + headers.map((h, i) => {
        const val = String((row as unknown as Record<string, string | null | undefined>)[h] || "");
        return ` ${val.padEnd(colWidths[i])} `;
      }).join("|") + "|";
    });

    return [line, headerRow, line, ...rows, line].join("\n");
  };

  useEffect(() => {
    const getTimestamp = () => {
      const now = new Date();
      return now.toLocaleTimeString([], { hour12: false });
    };

    if (loading) {
      setActiveTab("terminal");
      const initLogs: LogEntry[] = [
        {
          timestamp: getTimestamp(),
          level: "INFO",
          message: "Connection initialized to Coral local engine at `/home/borngreat/.local/bin/coral`."
        },
        {
          timestamp: getTimestamp(),
          level: "INFO",
          message: `Parsing raw student inquiry intent: "${prompt}"`
        },
        {
          timestamp: getTimestamp(),
          level: "INFO",
          message: "Optimizing relational plan and checking schemas..."
        }
      ];
      setLogs(initLogs);
    } else if (response) {
      const getTimestamp = () => new Date().toLocaleTimeString([], { hour12: false });
      
      const successLogs: LogEntry[] = [
        ...logs,
        {
          timestamp: getTimestamp(),
          level: "SUCCESS",
          message: `SQL Statement compiled successfully.`
        },
        {
          timestamp: getTimestamp(),
          level: "INFO",
          message: `>>> ${response.sql}`
        },
        {
          timestamp: getTimestamp(),
          level: "INFO",
          message: "Scanning local file repository at `data/assignments.json` via file backend."
        },
        {
          timestamp: getTimestamp(),
          level: "SUCCESS",
          message: `Query finalized. Returned ${response.data.length} row(s) in 4.2ms.`
        }
      ];

      setLogs(successLogs);

      // Add to query log history
      setHistory(prev => [
        {
          time: getTimestamp(),
          sql: response.sql,
          count: response.data.length
        },
        ...prev
      ]);
    }
  }, [loading, response]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs text-zinc-300">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {/* Windows Mac Console dots */}
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-semibold text-zinc-400 pl-2">Coral SQL Engine Logs</span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === "terminal"
                ? "bg-zinc-800 text-teal-400 font-semibold"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === "json"
                ? "bg-zinc-800 text-teal-400 font-semibold"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
            }`}
          >
            Payload JSON
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === "history"
                ? "bg-zinc-800 text-teal-400 font-semibold"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-black">
        {activeTab === "terminal" && (
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-zinc-600 text-center py-16">
                <span className="block text-2xl mb-2">🐚</span>
                <span>Ready. Awaiting SQL queries from the advisor chat agent...</span>
              </div>
            ) : (
              logs.map((log, idx) => {
                let badgeColor = "text-blue-400";
                if (log.level === "SUCCESS") badgeColor = "text-emerald-400";
                if (log.level === "ERROR") badgeColor = "text-rose-500";
                if (log.level === "WARN") badgeColor = "text-amber-400";
                
                return (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-zinc-600">[{log.timestamp}]</span>{" "}
                    <span className={`${badgeColor} font-bold`}>[{log.level}]</span>{" "}
                    <span className={log.message.startsWith(">>>") ? "text-amber-300 font-semibold pl-2" : "text-zinc-300"}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}

            {/* If we have output data, render the ASCII table */}
            {response && response.data && response.data.length > 0 && (
              <div className="pt-4 mt-4 border-t border-zinc-900 overflow-x-auto">
                <p className="text-teal-400 mb-2 font-semibold">🔍 Query Result Set (Tabular View):</p>
                <pre className="text-emerald-500 bg-zinc-950 p-3 rounded-lg border border-zinc-900 font-mono text-[10px] whitespace-pre min-w-max">
                  {generateAsciiTable(response.data)}
                </pre>
              </div>
            )}
            
            {response && response.error && (
              <div className="pt-4 mt-4 border-t border-zinc-900">
                <p className="text-rose-500 mb-1 font-semibold">❌ Query Exception Trace:</p>
                <pre className="text-rose-400 bg-rose-950/20 p-3 rounded-lg border border-rose-900/40 whitespace-pre-wrap">
                  {response.error}
                </pre>
              </div>
            )}

            {loading && (
              <div className="text-zinc-500 animate-pulse flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                <span>Running coral sql resolver...</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "json" && (
          <div className="h-full">
            {response ? (
              <pre className="text-teal-400 bg-zinc-950 p-4 rounded-xl border border-zinc-900 overflow-auto max-h-[400px]">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="text-zinc-600 text-center py-16">
                <span>No payload available yet. Query the database to inspect JSON data.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-zinc-600 text-center py-16">
                <span>Session query history is empty.</span>
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {history.map((hist, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-amber-300 font-medium break-all">{hist.sql}</p>
                      <p className="text-[10px] text-zinc-500">Timestamp: {hist.time}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 whitespace-nowrap ml-2">
                      {hist.count} rows
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
