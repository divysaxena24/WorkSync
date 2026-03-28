import Groq from "groq-sdk";
import { logAgentDecision } from "../agentLog";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface VelocityAnalysis {
  isAtRisk: boolean;
  confidence: number;
  reason: string;
}

export async function runVelocityAnalyzer(
  task: any,
  assigneeWorkloadCount: number,
  blockerTask: any | null
): Promise<VelocityAnalysis> {
  const start = Date.now();
  
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const prompt = `You are the Predictive Bottleneck Agent.
Evaluate if this task is at HIGH RISK of missing its deadline.

TASK DETAILS:
- Title: "${task.title}"
- Priority: ${task.priority}
- Deadline: ${task.deadline}
- Today is: ${today}

ASSIGNEE WORKLOAD:
- Assignee has ${assigneeWorkloadCount} other active tasks right now.

BLOCKER:
${blockerTask ? `- Blocked by: "${blockerTask.title}" (Status: ${blockerTask.status})` : "- No blockers"}

RULES:
1. A task is highly at risk if its deadline is very soon AND the assignee's workload is high (> 3 tasks).
2. A task is highly at risk if its blocker is not yet 'completed' AND the deadline is very soon.
3. Be realistic. If the deadline is tomorrow but the blocker is still 'todo', it's almost certainly at risk.

Return ONLY valid JSON:
{
  "isAtRisk": boolean,
  "confidence": 0.0 to 1.0,
  "reason": "1 sentence explaining why"
}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You output strict JSON evaluating task execution risk." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const result = JSON.parse(content) as VelocityAnalysis;

  await logAgentDecision({
    agentName: "Predictive Bottleneck Agent",
    agentRole: "Analyzes team velocity & dependencies to foresee risk",
    input: `Task: ${task.title}, Workload: ${assigneeWorkloadCount}, Blocker: ${blockerTask?.status || "None"}`,
    output: content,
    confidence: result.confidence || 0.8,
    reasoning: `Determined isAtRisk=${result.isAtRisk} because: ${result.reason}`,
    durationMs: Date.now() - start,
    taskId: task.id,
  });

  return result;
}
