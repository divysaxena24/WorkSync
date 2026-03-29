"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/core/utils";

interface TimelineEvent {
  status: string;
  label: string;
  description: string;
  date?: Date;
  active: boolean;
  completed: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function TaskTimeline({ currentStatus, submissions }: { currentStatus: string, submissions: any[] }) {
  const latestSub = submissions[0];

  const events: TimelineEvent[] = [
    {
      status: "pending",
      label: "Task Assigned",
      description: "Intelligence extracted.",
      active: currentStatus === "todo" || currentStatus === "pending",
      completed: true,
      type: 'info'
    },
    {
      status: "in_progress",
      label: "Execution",
      description: "Work started.",
      active: currentStatus === "in_progress",
      completed: ["in_progress", "submitted", "completed", "approved", "needs_improvement"].includes(currentStatus),
      type: 'info'
    },
    {
      status: "submitted",
      label: "Submitted",
      description: latestSub ? "Proof linked." : "Awaiting GitHub.",
      active: currentStatus === "submitted",
      completed: ["submitted", "completed", "approved", "needs_improvement"].includes(currentStatus),
      type: 'info'
    },
    {
      status: "evaluated",
      label: "AI Evaluation",
      description: latestSub && latestSub.score ? `Score: ${latestSub.score}` : "Analyzing quality.",
      active: currentStatus === "submitted" && !!latestSub?.score,
      completed: !!latestSub?.score,
      type: latestSub?.evaluationStatus === 'approved' ? 'success' : latestSub?.evaluationStatus === 'needs_improvement' ? 'warning' : 'info'
    },
    {
      status: "approved",
      label: currentStatus === "needs_improvement" ? "Action Req." : "Gate Passed",
      description: currentStatus === "needs_improvement" ? "Gaps found." : "Final check.",
      active: ["completed", "approved", "needs_improvement"].includes(currentStatus),
      completed: ["completed", "approved"].includes(currentStatus),
      type: currentStatus === "needs_improvement" ? 'error' : 'success'
    }
  ];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
           <Clock className="w-4 h-4 text-indigo-500" />
           <span className="text-xs font-black uppercase tracking-widest text-white">Execution Analytics</span>
        </div>
        <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-tighter bg-white/5 border-white/10 text-slate-400">Live Telemetry</Badge>
      </div>

      <div className="relative px-4">
        {/* Horizontal Connector Line */}
        <div className="absolute top-5 left-8 right-8 h-[2px] bg-white/5 z-0" />
        
        {/* Dynamic Connected Success Line */}
        <div 
          className="absolute top-5 left-8 h-[2px] bg-indigo-500/50 z-0 transition-all duration-1000" 
          style={{ width: `${(events.filter(e => e.completed).length - 1) * (100 / (events.length - 1))}%` }}
        />

        <div className="relative flex justify-between items-start z-10">
          {events.map((event, idx) => (
            <div key={idx} className={cn(
              "flex flex-col items-center text-center group",
              idx === 0 ? "items-start text-left" : idx === events.length - 1 ? "items-end text-right" : "",
              "flex-1"
            )}>
              {/* Dot Wrapper */}
              <div className="h-10 flex items-center justify-center relative w-full mb-3">
                 <div className={cn(
                   "w-6 h-6 sm:w-8 sm:h-8 rounded-xl border-4 border-[#020617] flex items-center justify-center transition-all duration-500",
                   event.completed ? (
                     event.type === 'success' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                     event.type === 'error' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 
                     'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                   ) : event.active ? 'bg-indigo-400 animate-pulse shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'bg-white/5 border-white/5'
                 )}>
                   {event.completed ? (
                     <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                   ) : (
                     <div className={cn("w-2 h-2 rounded-full", event.active ? "bg-white" : "bg-white/20")} />
                   )}
                 </div>
              </div>

              <div className={cn(
                "w-full px-1 space-y-1 transition-opacity",
                !event.completed && !event.active ? 'opacity-30' : 'opacity-100'
              )}>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white leading-none">
                  {event.label}
                </div>
                <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold leading-tight line-clamp-2 max-w-[80px] mx-auto">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
