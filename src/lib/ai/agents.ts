/**
 * 6-Step Autonomous Orchestration Pipeline — WorkSync (WorkSyncAI)
 * Optimized for ET AI Hackathon Track 2: Autonomous Enterprise Workflows.
 * 
 * Step 1: Contextual Cleaner (8B) - Structures raw transcript
 * Step 2: Decision Miner (8B) - Extracts key decisions
 * Step 3: Task Architect (70B) - Converts items to detailed tasks (Handles Clarification)
 * Step 4: Resource Matcher (70B) - Validates owner role/fit
 * Step 5: SLA Risk Predictor (70B) - Predicts delivery risk
 * Step 6: Final Validator (70B) - Self-correction & Audit
 */

import Groq from "groq-sdk";
import { logAgentDecision } from "../services/agentLog";
import { MODELS } from "./router";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ────────────────────────────────────────
// Types & Interfaces
// ────────────────────────────────────────

export interface MeetingSummary {
  speakers: string[];
  topics: string[];
  keyDecisions: string[];
  actionItems: string[];
  summary: string;
}

export interface ExtractedTask {
  task: string;
  owner: string;
  deadline: string | null;
  priority: "high" | "medium" | "low";
  dependsOnTaskTitle: string | null;
  needsClarification?: boolean;
  clarificationQuestion?: string;
}

export interface ValidatedTask extends ExtractedTask {
  confidence: number;
  validationNote: string;
  resourceFitScore?: number;
  slaRisk?: "low" | "medium" | "high";
}

export interface PipelineResult {
  summary: MeetingSummary;
  tasks: ValidatedTask[];
  overallConfidence: number;
  warnings: string[];
  retried: boolean;
  stepsExecuted: string[];
}

// ────────────────────────────────────────
// Step 1: Contextual Cleaner (8B)
// ────────────────────────────────────────
async function step1Cleaner(transcript: string, meetingId: string): Promise<string> {
  const model = MODELS.LOW;
  const start = Date.now();
  
  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are the Contextual Cleaner agent. Structure raw meeting transcripts into a clean narrative. Remove filler words and noise while preserving all facts and speaker intents."
      },
      { role: "user", content: transcript }
    ]
  });

  const output = response.choices[0].message.content || "";
  await logAgentDecision({
    agentName: "Contextual Cleaner",
    agentRole: "Structures raw transcripts into clean narrative",
    input: transcript.substring(0, 500),
    output: output.substring(0, 1000),
    confidence: 0.95,
    reasoning: "Performed noise reduction and structural formatting on raw audio transcript.",
    model,
    durationMs: Date.now() - start,
    meetingId
  });

  return output;
}

// ────────────────────────────────────────
// Step 2: Decision Miner (8B)
// ────────────────────────────────────────
async function step2DecisionMiner(cleanTranscript: string, meetingId: string): Promise<{ decisions: string[], topics: string[], speakers: string[] }> {
  const model = MODELS.LOW;
  const start = Date.now();

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are the Decision Miner. Extract a list of key decisions made, main topics discussed, and all speakers present. Return ONLY JSON: { \"decisions\": [], \"topics\": [], \"speakers\": [] }"
      },
      { role: "user", content: cleanTranscript }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content || "{}";
  const result = JSON.parse(content);
  
  await logAgentDecision({
    agentName: "Decision Miner",
    agentRole: "Identifies strategic commitments and topic clusters",
    input: cleanTranscript.substring(0, 500),
    output: content,
    confidence: 0.9,
    reasoning: `Found ${result.decisions?.length || 0} decisions across ${result.topics?.length || 0} topics.`,
    model,
    durationMs: Date.now() - start,
    meetingId
  });

  return result;
}

// ────────────────────────────────────────
// Step 3: Task Architect (70B)
// ────────────────────────────────────────
async function step3TaskArchitect(
  cleanTranscript: string, 
  decisions: string[], 
  teamMembers: string[], 
  meetingId: string
): Promise<ExtractedTask[]> {
  const model = MODELS.HIGH;
  const start = Date.now();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are the Task Architect. Convert meeting commitments into detailed developer tasks.
        MATCH TO TEAM: ${teamMembers.join(", ")}.
        TODAY: ${today}.
        
        CLARIFICATION RULE: If an action item's owner is missing, ambiguous (e.g., no clear owner among the 4 participants), or the objective is unclear, DO NOT guess the owner. Set "owner" to "Unassigned", set "needsClarification" to true, and provide a "clarificationQuestion" asking the team to specify who will own it.
        
        Return ONLY JSON: { "tasks": [{ "task": "...", "owner": "...", "deadline": "YYYY-MM-DD", "priority": "high|medium|low", "dependsOnTaskTitle": null, "needsClarification": false, "clarificationQuestion": null }] }`
      },
      {
        role: "user",
        content: `TRANSCRIPT: ${cleanTranscript}\nDECISIONS: ${decisions.join("; ")}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content || "{}";
  const tasks = (JSON.parse(content).tasks || []) as ExtractedTask[];

  await logAgentDecision({
    agentName: "Task Architect",
    agentRole: "Converts commitments to detailed technical tasks with ambiguity detection",
    input: cleanTranscript.substring(0, 500),
    output: content.substring(0, 2000),
    confidence: 0.85,
    reasoning: `Architected ${tasks.length} tasks. Flagged ${tasks.filter(t => t.needsClarification).length} for clarification.`,
    model,
    durationMs: Date.now() - start,
    meetingId
  });

  return tasks;
}

// ────────────────────────────────────────
// Step 4: Resource Matcher (70B)
// ────────────────────────────────────────
async function step4ResourceMatcher(tasks: ExtractedTask[], meetingId: string): Promise<ValidatedTask[]> {
  const model = MODELS.HIGH;
  const start = Date.now();

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are the Resource Matcher. For each task, evaluate if the assigned owner is the correct fit based on common dev roles. Score 0.0-1.0. Set 'resourceFitScore' property for each task."
      },
      { role: "user", content: JSON.stringify(tasks) }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content || "{}";
  const matchedTasks = (JSON.parse(content).tasks || []) as ValidatedTask[];

  await logAgentDecision({
    agentName: "Resource Matcher",
    agentRole: "Validates task-to-talent alignment",
    input: JSON.stringify(tasks).substring(0, 500),
    output: content.substring(0, 2000),
    confidence: 0.9,
    reasoning: "Assessed workforce allocation suitability for all extracted items.",
    model,
    durationMs: Date.now() - start,
    meetingId
  });

  return matchedTasks;
}

// ────────────────────────────────────────
// Step 5: SLA Risk Predictor (70B)
// ────────────────────────────────────────
async function step5SLAPredictor(tasks: ValidatedTask[], meetingId: string): Promise<ValidatedTask[]> {
  const model = MODELS.HIGH;
  const start = Date.now();

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are the SLA Risk Predictor. Evaluate each task's deadline and complexity. Assign 'slaRisk': 'low' | 'medium' | 'high'. Consider 'high' if the deadline is < 48hrs and complexity is high."
      },
      { role: "user", content: JSON.stringify(tasks) }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content || "{}";
  const riskTasks = (JSON.parse(content).tasks || []) as ValidatedTask[];

  await logAgentDecision({
    agentName: "SLA Risk Predictor",
    agentRole: "Foresees delivery delays and process bottlenecks",
    input: JSON.stringify(tasks).substring(0, 500),
    output: content.substring(0, 2000),
    confidence: 0.8,
    reasoning: "Evaluated temporal risk and delivery pressure across the sprint.",
    model,
    durationMs: Date.now() - start,
    meetingId
  });

  return riskTasks;
}

// ────────────────────────────────────────
// Step 6: Final Validator (70B)
// ────────────────────────────────────────
async function step6Validator(tasks: ValidatedTask[], transcript: string, meetingId: string): Promise<{ tasks: ValidatedTask[], overallConfidence: number, warnings: string[] }> {
  const model = MODELS.HIGH;
  const start = Date.now();

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are the Final Validator. Cross-check all tasks, resource scores, and risks against the original transcript. Remove hallucinations. Return JSON: { \"tasks\": [], \"overallConfidence\": 0.0-1.0, \"warnings\": [] }"
      },
      { role: "user", content: `TASKS: ${JSON.stringify(tasks)}\n\nTRANSCRIPT: ${transcript.substring(0, 3000)}` }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content || "{}";
  const result = JSON.parse(content);

  await logAgentDecision({
    agentName: "Final Validator",
    agentRole: "Highest-order audit of the agentic workflow pipeline",
    input: JSON.stringify(tasks).substring(0, 500),
    output: content.substring(0, 2000),
    confidence: result.overallConfidence || 0.9,
    reasoning: `Validated ${result.tasks?.length || 0} tasks with overall confidence ${result.overallConfidence}.`,
    model,
    durationMs: Date.now() - start,
    meetingId
  });

  return result;
}

// ────────────────────────────────────────
// Main Pipeline: 6-Step Autonomous Flow
// ────────────────────────────────────────
export async function runMeetingExtractionPipeline(
  transcript: string,
  teamMembers: string[],
  meetingId: string
): Promise<PipelineResult> {
  const steps: string[] = [];

  // Step 1: Cleaning
  const cleanTranscript = await step1Cleaner(transcript, meetingId);
  steps.push("Contextual Cleaner (8B)");

  // Step 2: Mining
  const { decisions, topics, speakers } = await step2DecisionMiner(cleanTranscript, meetingId);
  steps.push("Decision Miner (8B)");

  // Step 3: Architecting
  let tasks = await step3TaskArchitect(cleanTranscript, decisions, teamMembers, meetingId);
  steps.push("Task Architect (70B)");

  // Step 4: Matching
  let matchedTasks = await step4ResourceMatcher(tasks, meetingId);
  steps.push("Resource Matcher (70B)");

  // Step 5: Risk Assessment
  let riskTasks = await step5SLAPredictor(matchedTasks, meetingId);
  steps.push("SLA Risk Predictor (70B)");

  // Step 6: Final Validation
  let validation = await step6Validator(riskTasks, transcript, meetingId);
  steps.push("Final Validator (70B)");

  // Internal Logic: Self-Correction if confidence is abysmal
  let retried = false;
  if (validation.overallConfidence < 0.5) {
    retried = true;
    tasks = await step3TaskArchitect(cleanTranscript, decisions, teamMembers, meetingId);
    matchedTasks = await step4ResourceMatcher(tasks, meetingId);
    riskTasks = await step5SLAPredictor(matchedTasks, meetingId);
    validation = await step6Validator(riskTasks, transcript, meetingId);
    steps.push("Self-Correction Triggered (70B)");
  }

  return {
    summary: {
      speakers,
      topics,
      keyDecisions: decisions,
      actionItems: validation.tasks.map(t => t.task),
      summary: "Autonomous 6-Step Extraction Complete"
    },
    tasks: validation.tasks || [],
    overallConfidence: validation.overallConfidence || 0.8,
    warnings: validation.warnings || [],
    retried,
    stepsExecuted: steps
  };
}
