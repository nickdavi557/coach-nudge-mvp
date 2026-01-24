import { Supervisee } from '../types';
import { generateSynthesis as geminiGenerateSynthesis } from './gemini';

export async function createSynthesis(supervisee: Supervisee): Promise<string> {
  if (supervisee.notes.length === 0 && supervisee.documents.length === 0) {
    throw new Error('No data available to generate synthesis');
  }

  try {
    return await geminiGenerateSynthesis(supervisee);
  } catch (error) {
    console.error('Failed to generate synthesis:', error);
    throw error;
  }
}

export function generateFallbackSynthesis(supervisee: Supervisee): string {
  const noteCount = supervisee.notes.length;
  const documentCount = supervisee.documents.length;

  let synthesis = `## Summary for ${supervisee.name}\n\n`;

  synthesis += `### Overview\n`;
  synthesis += `You have recorded ${noteCount} observation note${noteCount !== 1 ? 's' : ''} `;
  synthesis += `and ${documentCount} background document${documentCount !== 1 ? 's' : ''} for ${supervisee.name}.\n\n`;

  if (noteCount > 0) {
    synthesis += `### Recent Notes\n`;
    const recentNotes = supervisee.notes.slice(-3);
    recentNotes.forEach((note) => {
      const date = new Date(note.createdAt).toLocaleDateString();
      synthesis += `- [${date}] ${note.content.slice(0, 100)}${note.content.length > 100 ? '...' : ''}\n`;
    });
    synthesis += '\n';
  }

  synthesis += `### Next Steps\n`;
  synthesis += `- Review recent observations and identify patterns\n`;
  synthesis += `- Schedule a development conversation with ${supervisee.name}\n`;
  synthesis += `- Continue capturing regular observations\n`;

  return synthesis;
}
