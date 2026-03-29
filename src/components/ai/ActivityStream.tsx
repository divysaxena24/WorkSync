"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const LOG_TEMPLATES = [
  { type: "info", icon: Terminal, color: "text-blue-400", prefix: "SYSTEM" },
  { type: "ai", icon: Cpu, color: "text-purple-400", prefix: "AGENT" },
  { type: "verify", icon: ShieldCheck, color: "text-emerald-400", prefix: "AUDIT" },
  { type: "warn", icon: AlertTriangle, color: "text-amber-400", prefix: "RISK" },
  { type: "trigger", icon: Zap, color: "text-primary", prefix: "HBNET" },
];

const MOCK_MESSAGES = [
  "Inbound request received from client buffer NODE_72",
  "Cleaning contextual noise... [success]",
  "Extracted task intent: 'Refactor auth-service logic'",
  "Assigned confidence score: 0.982 (High)",
  "Cross-referencing workload for @divyanshu...",
  "Optimal matching identified: Slot availability in 2h",
  "Pushing synchronization to database cluster...",
  "Validation loop triggered by AuditorAgent",
  "Consistency verified in 12ms",
  "Sending task notification to employee execution hub",
];

interface LogEntry {
  id: string;
  template: typeof LOG_TEMPLATES[0];
  message: string;
  time: string;
}

export function ActivityStream() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate some initial logs
    const initialLogs = MOCK_MESSAGES.slice(0, 5).map((msg, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      template: LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)],
      message: msg,
      time: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    }));
    setLogs(initialLogs);

    // Stream logs periodically
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = {
          id: Math.random().toString(36).substr(2, 9),
          template: LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)],
          message: MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)],
          time: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
        };
        const updated = [...prev, newLog];
        return updated.length > 20 ? updated.slice(1) : updated;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black/20 font-mono text-[10px] glass-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-bold tracking-widest uppercase">System Nexus Feed</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] text-primary font-bold">
          LIVE
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto hud-scrollbar p-4 space-y-3"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 group"
            >
              <div className="flex flex-col items-center pt-0.5">
                <div className={cn("p-1 rounded bg-white/5", log.template.color)}>
                  <log.template.icon className="w-3 h-3" />
                </div>
                <div className="w-px flex-1 bg-white/5 my-1" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn("font-bold tracking-tight px-1 rounded bg-white/5 text-[9px]", log.template.color)}>
                    {log.template.prefix}
                  </span>
                  <span className="text-muted-foreground/30 font-bold">{log.time}</span>
                </div>
                <p className="text-muted-foreground font-medium truncate group-hover:text-foreground transition-colors group-hover:whitespace-normal">
                  {log.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground font-mono">
          <span>THROUGHPUT</span>
          <span className="text-emerald-500">OPTIMAL</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute inset-0 bg-primary/30"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
