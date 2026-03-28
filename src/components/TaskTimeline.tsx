"use client";

import { CheckCircle2, Circle, Clock, MessageSquare, AlertCircle, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      description: "Intelligence extracted from meeting and assigned to owner.",
      active: currentStatus === "todo" || currentStatus === "pending",
      completed: true,
      type: 'info'
    },
    {
      status: "in_progress",
      label: "Execution Started",
      description: "Developer has acknowledged and started work.",
      active: currentStatus === "in_progress",
      completed: ["in_progress", "submitted", "completed", "approved", "needs_improvement"].includes(currentStatus),
      type: 'info'
    },
    {
      status: "submitted",
      label: "Work Submitted",
      description: latestSub ? `GitHub ${latestSub.submissionType} linked for evaluation.` : "Awaiting GitHub proof of work.",
      active: currentStatus === "submitted",
      completed: ["submitted", "completed", "approved", "needs_improvement"].includes(currentStatus),
      type: 'info'
    },
    {
      status: "evaluated",
      label: "AI Evaluation",
      description: latestSub && latestSub.score ? `Score: ${latestSub.score}/100 - ${latestSub.feedback.substring(0, 60)}...` : "System is analyzing code quality and task alignment.",
      active: currentStatus === "submitted" && !!latestSub?.score,
      completed: !!latestSub?.score,
      type: latestSub?.evaluationStatus === 'approved' ? 'success' : latestSub?.evaluationStatus === 'needs_improvement' ? 'warning' : 'info'
    },
    {
      status: "approved",
      label: currentStatus === "needs_improvement" ? "Action Required" : "Gate Passed",
      description: currentStatus === "needs_improvement" 
        ? "AI identified gaps. Re-execution required." 
        : currentStatus === "completed" || currentStatus === "approved" 
          ? "Execution verified. Task closed." 
          : "Final verification pending.",
      active: ["completed", "approved", "needs_improvement"].includes(currentStatus),
      completed: ["completed", "approved"].includes(currentStatus),
      type: currentStatus === "needs_improvement" ? 'error' : 'success'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" /> Execution Timeline
        </h3>
        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-tighter">Real-time tracking</Badge>
      </div>

      <div className="relative space-y-0">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

        {events.map((event, idx) => (
          <div key={idx} className={`relative pl-10 pb-8 last:pb-0 transition-opacity ${!event.completed && !event.active ? 'opacity-40' : 'opacity-100'}`}>
            {/* Dot */}
            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 transition-colors ${
              event.completed ? (event.type === 'success' ? 'bg-green-500' : event.type === 'error' ? 'bg-red-500' : 'bg-indigo-600') : 
              event.active ? 'bg-indigo-400 animate-pulse' : 'bg-slate-200'
            }`}>
              {event.completed ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Circle className="w-3 h-3 text-white fill-current" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black uppercase tracking-widest ${event.active ? 'text-indigo-600' : 'text-slate-900'}`}>
                  {event.label}
                </span>
                {event.active && <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] h-4">ACTIVE</Badge>}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
