import { Supervisee, Document, Note } from '../types';
import { generateId } from '../utils/helpers';

export function createDemoSupervisee(): Supervisee {
  const superviseeId = generateId();
  const now = new Date();

  const documents: Document[] = [
    {
      id: generateId(),
      name: 'Coaching Preferences',
      content: `I'm energized by appreciation and public recognition. I prefer feedback to be direct but kind. I learn best through hands-on experience. Personality: ENFP, high energy, creative thinker. Development goals: Improve structured communication, get better at managing up.`,
      uploadedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  ];

  const notes: Note[] = [
    {
      id: generateId(),
      content:
        'Nick did a great job on the market sizing slide - showed real creativity in approaching the problem from multiple angles',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      source: 'manual',
    },
    {
      id: generateId(),
      content:
        "Noticed Nick seemed frustrated in the team meeting when his idea wasn't picked up. Should follow up on how to navigate group dynamics better.",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      source: 'nudge',
    },
    {
      id: generateId(),
      content:
        'Nick stayed late to help the AC with her Excel model - good mentorship instinct and team spirit',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      source: 'manual',
    },
  ];

  return {
    id: superviseeId,
    name: 'Nick Chen',
    documents,
    notes,
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    lastNudgeAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  };
}

export function createSecondDemoSupervisee(): Supervisee {
  const superviseeId = generateId();
  const now = new Date();

  const documents: Document[] = [
    {
      id: generateId(),
      name: 'Development Goals',
      content: `Focus areas for this year: 1) Building executive presence in client meetings, 2) Improving data visualization skills, 3) Taking more ownership of workstreams. Prefers written feedback first, then verbal discussion. Values work-life balance.`,
      uploadedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
  ];

  const notes: Note[] = [
    {
      id: generateId(),
      content:
        'Sarah led the client workshop with confidence - big improvement from last quarter',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      source: 'manual',
    },
    {
      id: generateId(),
      content:
        'Need to help Sarah with prioritization - she tends to over-commit and then stress about deadlines',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      source: 'nudge',
    },
  ];

  return {
    id: superviseeId,
    name: 'Sarah Park',
    documents,
    notes,
    createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
    lastNudgeAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  };
}
