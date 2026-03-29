"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldCheck, 
  LayoutDashboard,
  Brain,
  ArrowRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/core/utils";
import { motion } from "framer-motion";

export function EmployeeDashboard({ 
  user, 
  tasks,
  allProfiles,
  activeProfileId
}: { 
  user: any, 
  tasks: any[],
  allProfiles: any[],
  activeProfileId: string
}) {
  const todo = tasks.filter(t => t.status === "todo" || t.status === "pending");
  const inProgress = tasks.filter(t => t.status === "in_progress" || t.status === "needs_improvement" || t.status === "submitted");
  const done = tasks.filter(t => t.status === "completed" || t.status === "approved");

  const TaskCard = ({ task }: { task: any }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="glass-card mb-4 border-none shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer group relative overflow-hidden">
        <div className={cn("absolute top-0 right-0 w-1.5 h-full opacity-60", 
          task.priority === 'high' ? 'bg-rose-500' : 
          task.status === 'completed' || task.status === 'approved' ? 'bg-emerald-500' : 'bg-indigo-500'
        )} />
        <CardContent className="p-5 space-y-3">
          <Link href={`/tasks/${task.id}`} className="group-hover:translate-x-1 transition-transform block">
            <div className="font-black text-white uppercase tracking-tight text-sm leading-tight group-hover:text-indigo-400 transition-colors">
              {task.title}
            </div>
          </Link>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "text-[9px] font-black uppercase tracking-widest border-none px-2 py-0.5",
                task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-500'
              )}>
                {task.priority || 'standard'}
              </Badge>
              {task.deadline && (
                <div className="flex items-center gap-1 opacity-40">
                  <Clock className="w-3 h-3" />
                  <span className="text-[9px] text-slate-400 font-mono font-bold">
                    {new Date(task.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              )}
            </div>
            
            <ShieldCheck className="w-3 h-3 text-emerald-500/30 group-hover:text-emerald-500 transition-colors" />
          </div>
          
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest pt-2 border-t border-white/5 flex items-center justify-between">
            <span>Execution Protocol</span>
            <div className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
              Submit Link <ArrowRight className="w-2.5 h-2.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
            My <span className="text-indigo-500">Mission</span> Deck
          </h1>
          <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
            Welcome back, <span className="text-indigo-400 font-bold uppercase">{user.name}</span>! Current task load: {tasks.length} items.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-4 bg-white/2 border border-white/5 px-4 py-2 rounded-2xl">
           <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Uptime</span>
             <span className="text-xs font-mono font-bold text-emerald-500">99.98% OK</span>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <Activity className="w-5 h-5 text-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {[
          { label: "Execution Backlog", tasks: todo, color: "text-slate-500", icon: LayoutDashboard },
          { label: "Active Loop", tasks: inProgress, color: "text-indigo-400", icon: Zap },
          { label: "Verified Assets", tasks: done, color: "text-emerald-400", icon: CheckCircle2 },
        ].map((col, i) => (
          <div key={col.label} className="space-y-6">
            <h2 className={cn("text-xs font-black uppercase tracking-[0.25em] flex items-center justify-between px-2", col.color)}>
              <div className="flex items-center gap-2">
                <col.icon className="w-4 h-4" />
                {col.label}
              </div>
              <Badge variant="outline" className="border-white/5 bg-white/5 text-[10px] text-slate-500 font-mono">{col.tasks.length}</Badge>
            </h2>
            
            <div className="bg-slate-950/20 backdrop-blur-sm border border-white/5 p-4 rounded-3xl min-h-[400px]">
              {col.tasks.length > 0 ? (
                col.tasks.map(t => <TaskCard key={t.id} task={t} />)
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center space-y-3 grayscale">
                   <ShieldCheck className="w-10 h-10 text-white" />
                   <div className="text-[10px] font-black uppercase tracking-widest text-white">Queue Clear</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
