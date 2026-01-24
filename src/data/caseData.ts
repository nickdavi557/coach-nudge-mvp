import { CaseTeam } from '../types';
import { generateId } from '../utils/helpers';

// Helper to create dates relative to now
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// Pre-populated case teams
const caseTeams: Record<string, CaseTeam> = {
  'DEMO': {
    caseCode: 'DEMO',
    caseName: 'TechCorp Digital Transformation',
    supervisees: [
      {
        id: generateId(),
        name: 'Nick Chen',
        track: 'GC',
        documents: [
          {
            id: generateId(),
            name: 'Coaching Preferences',
            content: `I'm energized by appreciation and public recognition. I prefer feedback to be direct but kind. I learn best through hands-on experience. Personality: ENFP, high energy, creative thinker. Development goals: Improve structured communication, get better at managing up.`,
            uploadedAt: daysAgo(14),
          },
        ],
        notes: [
          {
            id: generateId(),
            content: 'Nick did a great job on the market sizing slide - showed real creativity in approaching the problem from multiple angles',
            createdAt: daysAgo(5),
            source: 'manual',
          },
          {
            id: generateId(),
            content: "Noticed Nick seemed frustrated in the team meeting when his idea wasn't picked up. Should follow up on how to navigate group dynamics better.",
            createdAt: daysAgo(3),
            source: 'nudge',
          },
          {
            id: generateId(),
            content: 'Nick stayed late to help the AC with her Excel model - good mentorship instinct and team spirit',
            createdAt: daysAgo(1),
            source: 'manual',
          },
        ],
        createdAt: daysAgo(14),
        lastNudgeAt: daysAgo(3),
      },
      {
        id: generateId(),
        name: 'Sarah Park',
        track: 'GC',
        documents: [
          {
            id: generateId(),
            name: 'Development Goals',
            content: `Focus areas for this year: 1) Building executive presence in client meetings, 2) Improving data visualization skills, 3) Taking more ownership of workstreams. Prefers written feedback first, then verbal discussion. Values work-life balance.`,
            uploadedAt: daysAgo(21),
          },
        ],
        notes: [
          {
            id: generateId(),
            content: 'Sarah led the client workshop with confidence - big improvement from last quarter',
            createdAt: daysAgo(4),
            source: 'manual',
          },
          {
            id: generateId(),
            content: 'Need to help Sarah with prioritization - she tends to over-commit and then stress about deadlines',
            createdAt: daysAgo(2),
            source: 'nudge',
          },
        ],
        createdAt: daysAgo(21),
        lastNudgeAt: daysAgo(2),
      },
      {
        id: generateId(),
        name: 'Marcus Johnson',
        track: 'AIS',
        documents: [
          {
            id: generateId(),
            name: 'Technical Background',
            content: `ML Engineer background, 3 years at Google before Bain. Strong in Python, SQL, and cloud infrastructure. Learning consulting soft skills. Prefers detailed technical discussions. Development goals: Client communication, translating technical concepts for non-technical stakeholders, building executive presence.`,
            uploadedAt: daysAgo(10),
          },
        ],
        notes: [
          {
            id: generateId(),
            content: 'Marcus built an impressive demand forecasting model - client was blown away by the accuracy',
            createdAt: daysAgo(6),
            source: 'manual',
          },
          {
            id: generateId(),
            content: 'In the client presentation, Marcus got too deep into technical details. Need to coach on audience calibration.',
            createdAt: daysAgo(2),
            source: 'manual',
          },
        ],
        createdAt: daysAgo(10),
        lastNudgeAt: null,
      },
    ],
  },
  'DEMO1': {
    caseCode: 'DEMO1',
    caseName: 'ACME Corp Cost Optimization',
    supervisees: [
      {
        id: generateId(),
        name: 'Emily Zhang',
        track: 'GC',
        documents: [
          {
            id: generateId(),
            name: 'Coaching Notes',
            content: `Strong analytical skills, detail-oriented. Sometimes struggles with ambiguity. Prefers clear direction but wants to grow in handling open-ended problems. ISTJ personality. Development goals: Comfort with ambiguity, stakeholder management.`,
            uploadedAt: daysAgo(7),
          },
        ],
        notes: [],
        createdAt: daysAgo(7),
        lastNudgeAt: null,
      },
      {
        id: generateId(),
        name: 'David Kim',
        track: 'AIS',
        documents: [
          {
            id: generateId(),
            name: 'Background',
            content: `Data scientist with expertise in NLP and optimization. PhD from Stanford. First consulting role. Very strong technically but still learning the consulting toolkit. Development goals: Structuring problems, client relationship building, working in teams.`,
            uploadedAt: daysAgo(7),
          },
        ],
        notes: [],
        createdAt: daysAgo(7),
        lastNudgeAt: null,
      },
    ],
  },
};

export function getCaseTeam(caseCode: string): CaseTeam | null {
  const normalizedCode = caseCode.toUpperCase().trim();
  return caseTeams[normalizedCode] || null;
}

export function isValidCaseCode(caseCode: string): boolean {
  const normalizedCode = caseCode.toUpperCase().trim();
  return normalizedCode in caseTeams;
}

export function getAvailableCaseCodes(): string[] {
  return Object.keys(caseTeams);
}
