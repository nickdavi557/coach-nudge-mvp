import { Supervisee } from '../types';

// Use proxy to avoid CORS (works in both dev and production)
const API_URL = '/api/openai/chat/completions';
const MODEL = '@personal-openai/gpt-5.2';

const getApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }
  return apiKey;
};

const callOpenAI = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  console.log('Making API call to:', API_URL);
  console.log('API Key present:', !!apiKey);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 1000,
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('API error response:', error);
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    console.log('API success:', data);
    const text = data.choices?.[0]?.message?.content || '';

    return text.trim();
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
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
  const context = buildSuperviseeContext(supervisee);

  const prompt = `You are a coaching assistant for a Bain consultant who manages junior team members. Based on the following supervisee profile and recent observations, generate ONE specific, actionable coaching suggestion.

${context}

Generate a brief coaching nudge (2-3 sentences) that:
1. References specific observations or patterns you noticed
2. Suggests a concrete action the manager could take
3. Ties to the supervisee's development goals or preferences if known

Keep the tone warm, professional, and actionable. Start with a verb (e.g., "Consider...", "Try...", "Schedule...").`;

  try {
    const text = await callOpenAI(prompt);
    if (!text) {
      return `Consider scheduling a brief check-in with ${supervisee.name} to discuss their recent progress and development goals.`;
    }
    return text;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `Consider scheduling a brief check-in with ${supervisee.name} to discuss their recent progress and development goals.`;
  }
};

export const generateSynthesis = async (supervisee: Supervisee): Promise<string> => {
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

  const text = await callOpenAI(prompt);
  if (!text) {
    throw new Error('Empty response from AI');
  }
  return text;
};

export const generateReflectionPrompt = async (supervisee: Supervisee): Promise<string> => {
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

  return callOpenAI(prompt);
};
