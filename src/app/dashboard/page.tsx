import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/core/neon";
import { ManagerDashboard } from "./ManagerDashboard";
import { EmployeeDashboard } from "./EmployeeDashboard";


export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await searchParams;
  const { u } = resolvedParams;

  try {
    const allProfiles = await sql`
      SELECT u.*, row_to_json(c.*) as company
      FROM "User" u
      LEFT JOIN "Company" c ON u."companyId" = c.id
      WHERE u."clerkId" = ${userId}
      ORDER BY u."createdAt" DESC
    `;
    
    if (allProfiles.length === 0) {
      redirect("/onboarding");
    }

    const dbUser: any = u 
      ? allProfiles.find((p: any) => p.id === u) || allProfiles[0]
      : allProfiles[0];

    if (!dbUser.companyId || !dbUser.company) {
      redirect("/onboarding");
    }

    const allTasks = await sql`
      SELECT t.*, 
             (SELECT row_to_json(u.*) FROM "User" u WHERE u.id = t."ownerId") as user,
             (SELECT row_to_json(e.*) FROM "Evaluation" e WHERE e."taskId" = t.id) as evaluation,
             (SELECT row_to_json(b.*) FROM "Task" b WHERE b.id = t."blockedById") as blocker
      FROM "Task" t
      WHERE t."ownerId" IN (SELECT id FROM "User" WHERE "companyId" = ${dbUser.companyId})
         OR t."meetingId" IN (SELECT id FROM "Meeting" WHERE "companyId" = ${dbUser.companyId})
    `;

    const taskIds = allTasks.map((t: any) => t.id);
    const escalations = taskIds.length > 0 ? await sql`
      SELECT e.*, t.title as "taskTitle"
      FROM "task_escalations" e
      JOIN "Task" t ON e."taskId" = t.id
      WHERE e."companyId" = ${dbUser.companyId}
      ORDER BY e."createdAt" DESC
      LIMIT 10
    ` : [];

    const alerts = taskIds.length > 0 ? await sql`
      SELECT * FROM "Alert"
      WHERE "taskId" = ANY(${taskIds})
      ORDER BY "sentAt" DESC
      LIMIT 10
    ` : [];

    const performanceMap: Record<string, { total: number, scores: number[] }> = {};
    allTasks.forEach((task: any) => {
      const name = task.user?.name || task.owner;
      if (!performanceMap[name]) performanceMap[name] = { total: 0, scores: [] };
      performanceMap[name].total++;
      if (task.evaluation) {
        performanceMap[name].scores.push(task.evaluation.score);
      }
    });

    const performance = Object.entries(performanceMap).map(([name, stats]) => ({
      name,
      score: stats.scores.length > 0
        ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
        : 0
    })).sort((a, b) => b.score - a.score);

    if (dbUser.role === "MANAGER") {
      return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
          <ManagerDashboard
            company={dbUser.company}
            tasks={allTasks}
            alerts={alerts}
            escalations={escalations}
            performance={performance}
            allProfiles={JSON.parse(JSON.stringify(allProfiles))}
            activeProfileId={dbUser.id}
          />
        </div>
      );
    } else {
      const myTasks = allTasks.filter((t: any) => t.ownerId === dbUser.id);
      return (
        <div className="min-h-screen bg-slate-50 p-8">
          <EmployeeDashboard 
            user={dbUser} 
            tasks={myTasks} 
            allProfiles={JSON.parse(JSON.stringify(allProfiles))}
            activeProfileId={dbUser.id}
          />
        </div>
      );
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
           <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
           </div>
           <h1 className="text-2xl font-bold text-slate-900 mb-2">WorkSync is syncing...</h1>
           <p className="text-slate-600 mb-6">We're having trouble reaching the database. Please try refreshing or check back in a minute.</p>
           <a href="/dashboard" className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all">
             Try Again
           </a>
        </div>
      </div>
    );
  }
}
