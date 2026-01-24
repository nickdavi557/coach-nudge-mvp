import { Supervisee } from '../types';
import { generateCoachingNudge, generateReflectionPrompt } from './gemini';

export async function createCoachingNudge(supervisee: Supervisee): Promise<string> {
  try {
    return await generateCoachingNudge(supervisee);
  } catch (error) {
    console.error('Failed to generate coaching nudge:', error);
    // Fallback to generic prompt
    return `Consider scheduling a brief check-in with ${supervisee.name} to discuss their recent work and development goals.`;
  }
}

export async function createReflectionPrompt(supervisee: Supervisee): Promise<string> {
  try {
    return await generateReflectionPrompt(supervisee);
  } catch (error) {
    console.error('Failed to generate reflection prompt:', error);
    // Fallback to generic prompts
    const genericPrompts = [
      `How has ${supervisee.name} been performing on their current project?`,
      `Have you noticed any growth areas or wins for ${supervisee.name} recently?`,
      `What's one thing ${supervisee.name} did well this week?`,
      `Is there anything ${supervisee.name} might be struggling with?`,
    ];
    return genericPrompts[Math.floor(Math.random() * genericPrompts.length)];
  }
}
