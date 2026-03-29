"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Activity, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Brain
} from "lucide-react";
import { cn } from "@/lib/core/utils";
import { motion } from "framer-motion";

import { WorkspaceSwitcher } from "@/components/layout/WorkspaceSwitcher";

export function ManagerDashboard({ 
  company, 
  tasks, 
  alerts,
  escalations,
  performance,
  allProfiles,
  activeProfileId
}: { 
  company: any, 
  tasks: any[], 
  alerts: any[],
  escalations: any[],
  performance: any[],
  allProfiles: any[],
  activeProfileId: string
}) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
               {company.name} <span className="text-indigo-500">Hub</span>
             </h1>
             <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
               <ShieldCheck className="w-3 h-3" /> Antigravity Active
             </Badge>
          </div>
          <p className="text-slate-400 font-medium text-sm">Monitoring platform performance and team execution loop.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <WorkspaceSwitcher profiles={allProfiles} activeProfileId={activeProfileId} />
          <Link href="/meeting">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 rounded-2xl px-8 font-black uppercase tracking-widest text-xs h-12 transition-all hover:scale-105 active:scale-95">
              <Sparkles className="w-4 h-4 mr-2" /> Start AI Meeting
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Backlog", value: total, icon: Activity, color: "text-slate-400", bg: "bg-white/5" },
          { label: "Verified Work", value: completed, icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Active Sprint", value: inProgress, icon: Zap, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "At Risk", value: overdue, icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-none overflow-hidden relative group cursor-default">
              <div className={cn("absolute top-0 left-0 w-1 h-full", 
                kpi.label === "At Risk" ? "bg-rose-500" : 
                kpi.label === "Verified Work" ? "bg-emerald-500" : 
                kpi.label === "Active Sprint" ? "bg-indigo-500" : "bg-slate-700"
              )} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("w-4 h-4 opacity-30", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter">{kpi.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Performance Analytics */}
        <Card className="lg:col-span-2 glass-card border-none overflow-hidden rounded-3xl">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                Team Performance Analytics
              </CardTitle>
              <Badge variant="outline" className="border-white/5 bg-white/5 text-[9px] font-mono text-slate-500">Live Calibration</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="space-y-8">
              {performance.map((p, i) => (
                <div key={p.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white text-sm uppercase tracking-tight">{p.name}</span>
                      <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Lead Contributor</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-400 italic">{p.score}% Precision</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${p.score}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.1 }}
                      className="bg-linear-to-r from-indigo-600 via-indigo-500 to-cyan-400 h-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                    </motion.div>
                  </div>
                </div>
              ))}
              {performance.length === 0 && (
                <div className="text-center py-10 opacity-30 italic text-slate-400 text-sm">
                  No evaluation data collected in the current cycle.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Executive Escalations */}
        <Card className="glass-card border-none overflow-hidden rounded-3xl">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
              Executive Escalations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="space-y-4">
              {escalations.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                  <ShieldCheck className="w-10 h-10 mb-3 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">All Nominal</p>
                  <p className="text-[9px] mt-1 text-slate-400">No active escalations detected.</p>
                </div>
              ) : (
                escalations.slice(0, 5).map(esc => (
                  <Link href={`/tasks/${esc.taskId}`} key={esc.id} className="block group">
                    <div className={cn(
                      "p-4 rounded-2xl border transition-all relative overflow-hidden",
                      esc.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40' : 
                      esc.severity === 'high' ? 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40' : 
                      'bg-white/5 border-white/5 hover:border-indigo-500/30'
                    )}>
                      <div className="flex justify-between items-start mb-2">
                         <Badge variant="outline" className={cn(
                           "text-[9px] font-black uppercase tracking-widest border-none px-2",
                           esc.severity === 'critical' || esc.severity === 'high' ? 'bg-rose-500 text-white' : 'text-slate-400 bg-white/5'
                         )}>
                           {esc.severity || 'low'}
                         </Badge>
                         <span className="text-[8px] text-slate-500 font-mono font-bold uppercase">{esc.reason.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">{esc.taskTitle}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Backlog Table */}
      <Card className="glass-card border-none overflow-hidden rounded-3xl">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <div className="space-y-1">
             <CardTitle className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
               <Activity className="w-5 h-5 text-indigo-400" />
               Execution Backlog
             </CardTitle>
             <p className="text-xs text-slate-400 font-medium">Real-time task synchronization across the loop.</p>
          </div>
          <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl hover:bg-white/10 transition-colors">
            Analyze Loop Velocity
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="text-center py-20 opacity-30 grayscale">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-xs font-black uppercase tracking-widest text-white">Loop Empty</p>
              <p className="text-[10px] mt-1 text-slate-500">Trigger extraction from the Intelligence Room.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/5 bg-white/2 hover:bg-white/2">
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Task Definition</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Execution Owner</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">State</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Risk Profile</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/5">
                  {tasks.map(task => (
                    <TableRow key={task.id} className="group transition-colors hover:bg-white/3">
                      <TableCell className="px-8 py-6">
                        <Link href={`/tasks/${task.id}`}>
                          <div className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{task.title}</div>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 opacity-50">
                           <Clock className="w-3 h-3" />
                           <span className="text-[10px] font-mono text-slate-400">
                             {task.deadline ? (
                               new Date(task.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
                             ) : 'NO_DEADLINE'}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400 uppercase">
                            {(task.user?.name || task.owner || "U")[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{task.user?.name || task.owner}</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Operator</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex items-center gap-2">
                           <div className={cn("w-1.5 h-1.5 rounded-full",
                             task.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'
                           )} />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                             {task.status.replace("_", " ")}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                          task.priority === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-400'
                        )}>
                          {task.priority || 'standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <Link href={`/tasks/${task.id}`}>
                          <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-white hover:bg-indigo-500/20 font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-xl">
                            Audit Workflow <ArrowRight className="w-3 h-3 ml-1.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
