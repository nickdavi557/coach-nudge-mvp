import { GoogleGenerativeAI } from '@google/generative-ai';
import { Supervisee } from '../types';

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
};

const buildSuperviseeContext = (supervisee: Supervisee): string => {
  let context = `Supervisee: ${supervisee.name}\n\n`;

  if (supervisee.documents.length > 0) {
    context += 'Background Documents:\n';
    supervisee.documents.forEach((doc) => {
      context += `- ${doc.name}:\n${doc.content}\n\n`;
    });
  }

  if (supervisee.notes.length > 0) {
    context += 'Observation Notes (chronological):\n';
    supervisee.notes.forEach((note) => {
      const date = new Date(note.createdAt).toLocaleDateString();
      context += `- [${date}] ${note.content}\n`;
    });
  }

  return context;
};

export const generateCoachingNudge = async (supervisee: Supervisee): Promise<string> => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const context = buildSuperviseeContext(supervisee);

    const prompt = `You are a coaching assistant for a Bain consultant who manages junior team members. Based on the following supervisee profile and recent observations, generate ONE specific, actionable coaching suggestion.

${context}

Generate a brief coaching nudge (2-3 sentences) that:
1. References specific observations or patterns you noticed
2. Suggests a concrete action the manager could take
3. Ties to the supervisee's development goals or preferences if known

Keep the tone warm, professional, and actionable. Start with a verb (e.g., "Consider...", "Try...", "Schedule...").`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your VITE_GEMINI_API_KEY in .env');
      }
      throw new Error(`AI generation failed: ${error.message}`);
    }
    throw error;
  }
};

export const generateSynthesis = async (supervisee: Supervisee): Promise<string> => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const context = buildSuperviseeContext(supervisee);

  const prompt = `You are a coaching assistant helping a Bain consultant prepare for a development conversation with their supervisee. Based on the following profile and observations, generate a comprehensive coaching synthesis.

${context}

Generate a structured summary with the following sections:

## Key Themes
List 2-3 recurring patterns or themes you've noticed in the observations.

## Wins & Positive Moments
Highlight specific accomplishments, strengths, or positive behaviors observed.

## Growth Areas
Identify 1-2 areas where development focus could be valuable, based on the observations.

## Coaching Focus Suggestions
Provide 2-3 specific conversation topics or actions for the next coaching session.

Keep the tone constructive and development-focused. Reference specific observations where relevant.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const generateReflectionPrompt = async (supervisee: Supervisee): Promise<string> => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const recentNotes = supervisee.notes.slice(-5);
  const notesContext = recentNotes.length > 0
    ? `Recent observations:\n${recentNotes.map(n => `- ${n.content}`).join('\n')}`
    : 'No recent observations recorded.';

  const prompt = `You are a coaching assistant helping a Bain consultant reflect on their supervisee.

Supervisee: ${supervisee.name}
${notesContext}

Generate a single, thoughtful reflection prompt (one question) to help the manager think about ${supervisee.name}'s recent work or development. The question should:
1. Be specific and observation-focused
2. Help surface insights the manager might have but hasn't articulated
3. Be easy to answer in 1-2 sentences

Just return the question, nothing else.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
