import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/core/neon";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TaskSubmissionForm } from "@/components/tasks/TaskSubmissionForm";
import { TaskStatusControl } from "@/components/tasks/TaskStatusControl";
import { TaskTimeline } from "@/components/tasks/TaskTimeline";
import { SubmissionActions } from "@/components/tasks/SubmissionActions";
import { SubtaskManager } from "@/components/tasks/SubtaskManager";
import { ResourceOptimization } from "@/components/ai/ResourceOptimization";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Code, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  GitPullRequest,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play,
  Sparkles,
  Bot,
  Brain
} from "lucide-react";
import Link from "next/link";

export default async function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { taskId } = await params;

  // 0. Fetch current user
  const curUsers = await sql`SELECT id, role FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1`;
  const currentUser = curUsers[0] as any;

  // 1. Fetch Task, User, Submissions, and Blocker
  const tasks = await sql`
    SELECT t.*, 
           (SELECT row_to_json(u.*) FROM "User" u WHERE u.id = t."ownerId") as user,
           (SELECT row_to_json(m.*) FROM "Meeting" m WHERE m.id = t."meetingId") as meeting,
           (SELECT row_to_json(b.*) FROM "Task" b WHERE b.id = t."blockedById") as blocker
    FROM "Task" t
    WHERE t.id = ${taskId}
    LIMIT 1
  `;
  const task: any = tasks[0];

  if (!task) redirect("/dashboard");

  const submissions = await sql`
    SELECT * FROM "task_submissions"
    WHERE "taskId" = ${taskId}
    ORDER BY "createdAt" DESC
  `;

  // Fetch agent decision logs for this task
  let agentLogs: any[] = [];
  try {
    agentLogs = await sql`
      SELECT * FROM "AgentDecisionLog"
      WHERE "taskId" = ${taskId} OR "meetingId" = ${task.meetingId}
      ORDER BY "createdAt" ASC
    `;
  } catch (error: any) { 
    console.error("[AGENT_LOG_QUERY_ERROR]", error.message);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'approved': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'needs_improvement': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'submitted': return 'bg-blue-500 hover:bg-blue-600';
      case 'in_progress': return 'bg-indigo-500 hover:bg-indigo-600';
      case 'pending': return 'bg-slate-500 hover:bg-slate-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-indigo-500/30">
      {/* Header */}
      <div className="bg-white/2 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest leading-none">Command Hub</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sync Status: Nominal</span>
            </div>
            <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1">
              {task.priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Title & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <Badge variant="outline" className="text-[10px] font-black tracking-widest bg-white/5 border-none px-2 py-0.5 text-slate-500 uppercase">Mission Archive</Badge>
               <span className="text-[10px] text-slate-600 font-mono">ID: {task.id.slice(0, 12)}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
              {task.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <TaskStatusControl taskId={task.id} currentStatus={task.status} />
             <div className="h-10 w-px bg-white/10 mx-2 hidden md:block" />
             <Badge className={`${getStatusColor(task.status)} border-none px-6 py-3 text-xs font-black tracking-[0.2em] shadow-xl shadow-indigo-500/20`}>
               {task.status.replace('_', ' ').toUpperCase()}
             </Badge>
          </div>
        </div>

        {/* MISSION STATUS HUD (New Horizontal HUD) */}
        <Card className="glass-card border-none bg-indigo-500/[0.02] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/5">
             {/* Gatekeeper Detail */}
             <div className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                   <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Status Protocol</div>
                   <div className="text-sm font-black text-white uppercase">Gatekeeper Active</div>
                   <div className="text-[10px] text-slate-500 font-bold mt-0.5">Verifying mission alignment</div>
                </div>
             </div>

             {/* Expanded Horizontal Timeline */}
             <div className="md:col-span-3 p-6 flex items-center bg-white/[0.01]">
                <TaskTimeline currentStatus={task.status} submissions={submissions} />
             </div>
          </div>
        </Card>

        {/* MAIN MISSION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Specification & Submissions (Wide) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Task Context/Description */}
            <Card className="glass-card border-none overflow-hidden group">
              <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-white/5">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500" /> Technical Specification
                </CardTitle>
                <div className="flex items-center gap-4">
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Resource Fit</span>
                      <span className="text-xs font-black text-white">{Math.round((task.resourceFitScore || 0) * 100)}% Match</span>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-8 text-xl font-bold text-white leading-relaxed border-b border-white/5 bg-white/[0.01]">
                  {task.description || "Refer to the meeting intelligence for full mission objectives."}
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                    <div className="p-6 hover:bg-white/[0.02] transition-colors">
                       <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><User className="w-3 h-3" /> Designated Owner</div>
                       <div className="text-sm font-black text-white uppercase">{task.user?.name || task.owner}</div>
                    </div>
                    <div className="p-6 hover:bg-white/[0.02] transition-colors">
                       <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Deployment Deadline</div>
                       <div className="text-sm font-black text-white uppercase">{task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'ASAP'}</div>
                    </div>
                    <div className="p-6 hover:bg-white/[0.02] transition-colors">
                       <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Risk Threshold</div>
                       <div className={`text-sm font-black uppercase tracking-wide flex items-center gap-2 ${task.slaRisk === 'high' ? 'text-rose-400' : task.slaRisk === 'medium' ? 'text-orange-400' : 'text-emerald-400'}`}>
                         {task.slaRisk?.toUpperCase() || 'LOW'} EXPOSURE
                       </div>
                    </div>
                 </div>

                 {task.needsClarification && (
                   <div className="m-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 ring-1 ring-amber-500/10">
                     <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                       </div>
                       <div>
                         <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Active Clarification Loop</div>
                         <p className="text-sm text-amber-100 font-bold mt-1.5 italic">"{task.clarificationQuestion}"</p>
                       </div>
                     </div>
                   </div>
                 )}
              </CardContent>
            </Card>

            {/* Atomic Decomposition (Moved to Main for spacing) */}
            <SubtaskManager taskId={task.id} />

            {/* Evaluation History Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                   <History className="w-3.5 h-3.5" /> Intelligence Feed
                 </h3>
                 <Badge variant="outline" className="text-[9px] text-slate-600 border-white/5">{submissions.length} Records</Badge>
              </div>

              {submissions.length === 0 ? (
                <Card className="glass-card border-none p-12 text-center">
                  <Code className="w-12 h-12 text-white/5 mx-auto mb-4" />
                  <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Awaiting Primary Submission</div>
                </Card>
              ) : (
                submissions.map((sub: any) => (
                   <Card key={sub.id} className="glass-card border-none overflow-hidden hover:bg-white/[0.02] transition-colors">
                      <div className="p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                           <div className="flex items-center gap-5">
                              <div className={cn(
                                "w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all",
                                sub.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/5'
                              )}>
                                 <div className="text-[10px] uppercase leading-none mb-1">Score</div>
                                 <div className="text-2xl leading-none">{sub.score || '--'}</div>
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1.5">
                                  <span className="text-sm font-black text-white uppercase tracking-tight">{sub.submissionType} DEPLOYMENT</span>
                                  <Badge className={cn(
                                    "px-2 py-0.5 text-[9px] font-black uppercase border-none",
                                    sub.evaluationStatus === 'approved' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
                                  )}>
                                     {sub.evaluationStatus}
                                  </Badge>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-3">
                                  <span>{new Date(sub.createdAt).toLocaleString()}</span>
                                  {sub.updatedAt && new Date(sub.updatedAt).getTime() > new Date(sub.createdAt).getTime() + 1000 && (
                                    <Badge variant="outline" className="text-[8px] border-indigo-500/30 text-indigo-400 font-black">REVISED</Badge>
                                  )}
                                </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <SubmissionActions 
                                 submissionId={sub.id} 
                                 initialUrl={sub.githubUrl} 
                                 initialNote={sub.submission_note || ""} 
                                 isOwner={sub.userId === currentUser.id}
                                 isManager={currentUser.role === 'MANAGER'}
                              />
                              <Button asChild variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-black uppercase h-9 shadow-sm">
                                <a href={sub.githubUrl} target="_blank" rel="noreferrer">
                                   <ExternalLink className="w-3.5 h-3.5 mr-2" /> REPO TRACE
                                </a>
                              </Button>
                           </div>
                        </div>

                        {/* AI Insight Stack */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Technical Analysis */}
                           <div className="md:col-span-2 p-5 rounded-2xl bg-indigo-500/[0.03] border border-white/5 relative group/tech">
                              <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                 <Sparkles className="w-3.5 h-3.5" /> AI Quality Assessment
                              </div>
                              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {sub.feedback || "Agent is processing current deployment artifacts..."}
                              </div>
                           </div>

                           {/* Insight & Issues */}
                           {sub.manager_suggestion && (
                             <div className="p-5 rounded-2xl bg-emerald-500/[0.03] border border-white/5">
                                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Manager Directive</div>
                                <div className="text-sm font-bold italic text-white">"{sub.manager_suggestion}"</div>
                             </div>
                           )}

                           {sub.issues && (
                              <div className="p-5 rounded-2xl bg-rose-500/[0.03] border border-white/5">
                                 <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> Integrity Gaps
                                 </div>
                                 <ul className="space-y-2">
                                    {(typeof sub.issues === 'string' ? JSON.parse(sub.issues) : sub.issues).map((issue: string, i: number) => (
                                      <li key={i} className="text-[10px] font-bold text-slate-400 flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                        {issue}
                                      </li>
                                    ))}
                                 </ul>
                              </div>
                           )}
                        </div>
                      </div>
                   </Card>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Deployment & Intelligence (Narrow) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Task Submission Dispatch */}
            {task.status !== 'completed' && task.ownerId === (await sql`SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1`)[0]?.id && (
              <Card className="glass-card border-none bg-indigo-600/[0.03] shadow-2xl shadow-indigo-500/10">
                <CardHeader>
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4" /> Dispatch Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskSubmissionForm taskId={task.id} />
                </CardContent>
              </Card>
            )}

            {/* AI Decision Trail - Re-styled for compactness */}
            <Card className="glass-card border-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-500" /> Decision Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {agentLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 italic text-xs font-bold uppercase tracking-widest">Awaiting Logs</div>
                ) : (
                  agentLogs.map((log: any) => (
                    <div key={log.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2.5 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                             <Brain className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white leading-none mb-0.5">{log.agentName}</div>
                            <div className="text-[8px] font-mono text-slate-500 leading-none">{log.model || "Optimized"}</div>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-600 font-mono tracking-tighter">{log.durationMs}ms</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-3 group-hover:line-clamp-none transition-all">{log.reasoning}</p>
                      <div className="pt-1 flex items-center gap-2">
                        <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${Math.round(log.confidence * 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-500">{Math.round(log.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Secondary Utilities */}
            <div className="space-y-6">
               <ResourceOptimization taskId={task.id} />
               
               <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sync: Operational</span>
                     </div>
                     <span className="text-[8px] font-mono text-slate-600">V.1.0.84</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500 font-black uppercase tracking-widest">Priority Index</span>
                       <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-black px-2 py-0">{task.priority.toUpperCase()}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500 font-black uppercase tracking-widest">Visibility</span>
                       <span className="text-white font-black">AUTHORIZED ONLY</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
