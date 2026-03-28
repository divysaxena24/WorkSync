/**
 * AI Code Evaluation Engine for ANTIGRAVITY (WorkSyncAI)
 * Uses Groq (Llama 3) to judge whether code fulfills a task.
 */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface EvaluationResponse {
  score: number;
  status: "approved" | "needs_improvement";
  summary: string;
  issues: string[];
  suggestions: string[];
  managerSuggestion: string;
  completionConfidence: number;
}

import { GitHubWork } from "../github";

export async function evaluateSubmission(
  taskTitle: string,
  taskDescription: string,
  work: GitHubWork
): Promise<EvaluationResponse | null> {
  try {
    const prompt = `
      You are the ULTIMATE GATEKEEPER and RUTHLESS CHIEF ARCHITECT. 
      Your mission is to verify if the code fulfills the ASSIGNED TASK with zero deviations.

      THE LAW (TASK SPECIFICATION):
      - TITLE: ${taskTitle}
      - DESCRIPTION: ${taskDescription || "N/A"}
      
      THE PROOF (SUBMISSION):
      - DEV LABEL: ${work.title}
      - DEV DESCRIPTION: ${work.description}
      - CODE CHANGES (DIFF):
      ${work.diff.substring(0, 25000)}
      
      STRICT EVALUATION RULES:
      1. THE SPEC IS ABSOLUTE: If a requirement is in the DESCRIPTION but missing in the CODE, it is a CRITICAL FAILURE.
      2. NO SCOPE CREEP: Do not reward features that weren't asked for. Note them as "Unsolicited Changes" which may introduce bugs.
      3. LOGICAL CORRECTNESS: Does the code actually work? Check for edge cases, null pointers, and logical fallacies.
      4. MISSION ALIGNMENT: Does this PR directly advance the goal of '${taskTitle}'?

      VERDICT REQUIREMENTS:
      - "status" MUST be "needs_improvement" if ANY core requirement from the DESCRIPTION is missing.
      - "status" MUST be "needs_improvement" if the "score" is below 80.
      - "summary" MUST start with a clear "PASS" or "FAIL" assessment against the original mission.

      OUTPUT JSON FORMAT:
      {
        "score": number (0-100),
        "status": "approved" | "needs_improvement",
        "summary": "BRUTAL technical dissection. Compare the CODE against the DESCRIPTION line-by-line.",
        "issues": ["List specifically which requirements were MISSED or implementation flaws found"],
        "suggestions": ["STRICTLY limited to fixing the missed requirements or quality issues within the original scope"],
        "managerSuggestion": "DEFINTIVE ONE-LINE: 'REJECT: Missing core logic' or 'APPROVE: Task fully fulfilled'",
        "completionConfidence": number (0-1)
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a ruthless, precision-focused Chief Architect. You treat the task description as absolute law. You have zero tolerance for missed requirements or unsolicited scope creep.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    return JSON.parse(content) as EvaluationResponse;
  } catch (error) {
    console.error("AI Evaluation failed", error);
    return null;
  }
}
