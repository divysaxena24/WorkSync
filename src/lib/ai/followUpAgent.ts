import Groq from "groq-sdk";
import { logAgentDecision } from "../services/agentLog";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function runFollowUpAgent(
  task: any,
  meetingSummary: string
): Promise<string> {
  const start = Date.now();

  const prompt = `You are the Meeting Follow-up Agent.
It has been 24 hours since a meeting, and this task is still unstarted.
Write a polite, 2-sentence nudge message to the task assignee to check if they need help or are blocked.

MEETING CONTEXT: ${meetingSummary}

TASK TO NUDGE:
- Title: "${task.title}"
- Assignee: ${task.owner}

Return ONLY the raw nudge message text (no quotes, no JSON). Make it sound professional but friendly.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You output nothing but the 1-2 sentence nudge message. No pleasantries like 'Here is the message'." },
      { role: "user", content: prompt }
    ],
  });

  const nudgeMessage = response.choices[0]?.message?.content?.trim() || `Hi ${task.owner}, just checking in on "${task.title}". Let me know if you are blocked!`;

  await logAgentDecision({
    agentName: "Meeting Follow-up Agent",
    agentRole: "Automatically nudges assignees on pending tasks 24h post-meeting",
    input: `Task: ${task.title}, Meeting: ${meetingSummary.substring(0, 100)}...`,
    output: nudgeMessage,
    confidence: 1.0,
    reasoning: `Drafted a context-aware nudge message for assignee ${task.owner}`,
    durationMs: Date.now() - start,
    taskId: task.id,
  });

  return nudgeMessage;
}
