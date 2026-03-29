/**
 * Model Router — WorkSync AI
 * 
 * Implements cost-efficient architecture by routing tasks between
 * Llama 3.1 8B (Instant) for structural/cleaning tasks 
 * and Llama 3.3 70B (Versatile) for complex reasoning logic.
 */

export type ModelComplexity = 'low' | 'high';

export const MODELS = {
  LOW: 'llama-3.1-8b-instant',
  HIGH: 'llama-3.3-70b-versatile',
} as const;

/**
 * Maps a task type to a model complexity for automated routing.
 */
export function getModelForComplexity(complexity: ModelComplexity): string {
  return complexity === 'low' ? MODELS.LOW : MODELS.HIGH;
}

/**
 * Intelligent Router: Automatically picks a model based on the agent's goal.
 */
export function routeAgentGoal(goal: string): string {
  const lowComplexityGoals = [
    'clean', 'summarize', 'transcript', 'format', 'minify', 'decision_log', 'notify'
  ];

  const lowerGoal = goal.toLowerCase();
  const isLow = lowComplexityGoals.some(keyword => lowerGoal.includes(keyword));

  return isLow ? MODELS.LOW : MODELS.HIGH;
}
