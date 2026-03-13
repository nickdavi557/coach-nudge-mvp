import { CaseTeam, CalendarEvent, DevelopmentOpportunity, Assistant, AssistantImprovementArea } from '../types';
import { generateId } from '../utils/helpers';

// Helper to create dates relative to now
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number, hour: number = 9, minute: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};
// Stable IDs so calendar events can reference supervisees
const NICK_ID = 'supervisee-nick-chen';
const SARAH_ID = 'supervisee-sarah-park';
const MARCUS_ID = 'supervisee-marcus-johnson';
const EMILY_ID = 'supervisee-emily-zhang';
const DAVID_ID = 'supervisee-david-kim';

const nickDOs: DevelopmentOpportunity[] = [
  { id: 'client-communication', label: 'Client Communication', description: 'Speaking with and presenting to clients' },
  { id: 'executive-presence', label: 'Executive Presence', description: 'Building gravitas and confidence in senior settings' },
];

const sarahDOs: DevelopmentOpportunity[] = [
  { id: 'executive-presence', label: 'Executive Presence', description: 'Building gravitas and confidence in senior settings' },
  { id: 'stakeholder-management', label: 'Stakeholder Management', description: 'Managing relationships with senior stakeholders' },
  { id: 'data-storytelling', label: 'Data Storytelling', description: 'Translating data insights into compelling narratives' },
];

const marcusDOs: DevelopmentOpportunity[] = [
  { id: 'client-communication', label: 'Client Communication', description: 'Speaking with and presenting to clients' },
  { id: 'technical-translation', label: 'Technical Translation', description: 'Explaining technical concepts to non-technical audiences' },
  { id: 'public-speaking', label: 'Public Speaking', description: 'Presenting to groups or leading workshops' },
];

const emilyDOs: DevelopmentOpportunity[] = [
  { id: 'problem-structuring', label: 'Problem Structuring', description: 'Breaking down ambiguous problems into clear frameworks' },
  { id: 'stakeholder-management', label: 'Stakeholder Management', description: 'Managing relationships with senior stakeholders' },
];

const davidDOs: DevelopmentOpportunity[] = [
  { id: 'client-communication', label: 'Client Communication', description: 'Speaking with and presenting to clients' },
  { id: 'technical-translation', label: 'Technical Translation', description: 'Explaining technical concepts to non-technical audiences' },
  { id: 'team-collaboration', label: 'Team Collaboration', description: 'Working effectively across team boundaries' },
];

// Pre-populated case teams
const caseTeams: Record<string, CaseTeam> = {
  'DEMO': {
    caseCode: 'DEMO',
    caseName: 'TechCorp Digital Transformation',
    supervisees: [
      {
        id: NICK_ID,
        name: 'Nick Chen',
        track: 'GC',
        developmentOpportunities: nickDOs,
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
        id: SARAH_ID,
        name: 'Sarah Park',
        track: 'GC',
        developmentOpportunities: sarahDOs,
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
        id: MARCUS_ID,
        name: 'Marcus Johnson',
        track: 'AIS',
        developmentOpportunities: marcusDOs,
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
        id: EMILY_ID,
        name: 'Emily Zhang',
        track: 'GC',
        developmentOpportunities: emilyDOs,
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
        id: DAVID_ID,
        name: 'David Kim',
        track: 'AIS',
        developmentOpportunities: davidDOs,
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

// Calendar events for each case - simulates an Outlook calendar
const caseCalendarEvents: Record<string, CalendarEvent[]> = {
  'DEMO': [
    // Tomorrow - Client meeting with Nick and external stakeholders
    {
      id: generateId(),
      title: 'TechCorp Q2 Strategy Review',
      description: 'Quarterly review with TechCorp leadership team. Will present digital transformation roadmap and discuss next phase priorities.',
      startTime: daysFromNow(1, 10, 0),
      endTime: daysFromNow(1, 11, 30),
      eventType: 'client-meeting',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Nick Chen', email: 'nick.chen@bain.com', isExternal: false, superviseeId: NICK_ID },
        { name: 'Jennifer Walsh', email: 'j.walsh@techcorp.com', isExternal: true },
        { name: 'David Torres', email: 'd.torres@techcorp.com', isExternal: true },
      ],
      location: 'TechCorp HQ - Board Room',
      matchedOpportunities: [],
    },
    // Tomorrow - Workshop with Sarah presenting
    {
      id: generateId(),
      title: 'Data Insights Workshop',
      description: 'Interactive workshop presenting analytics findings to TechCorp product team. Sarah will present the customer segmentation analysis.',
      startTime: daysFromNow(1, 14, 0),
      endTime: daysFromNow(1, 15, 30),
      eventType: 'workshop',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Sarah Park', email: 'sarah.park@bain.com', isExternal: false, superviseeId: SARAH_ID },
        { name: 'Lisa Chen', email: 'l.chen@techcorp.com', isExternal: true },
        { name: 'Mike Roberts', email: 'm.roberts@techcorp.com', isExternal: true },
        { name: 'Amy Liu', email: 'a.liu@techcorp.com', isExternal: true },
      ],
      location: 'Virtual - Teams',
      matchedOpportunities: [],
    },
    // Day after tomorrow - Marcus presenting technical solution to client
    {
      id: generateId(),
      title: 'ML Model Demo for TechCorp CTO',
      description: 'Marcus will demo the demand forecasting model to TechCorp CTO and engineering leads.',
      startTime: daysFromNow(2, 11, 0),
      endTime: daysFromNow(2, 12, 0),
      eventType: 'presentation',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Marcus Johnson', email: 'marcus.johnson@bain.com', isExternal: false, superviseeId: MARCUS_ID },
        { name: 'Raj Patel', email: 'r.patel@techcorp.com', isExternal: true },
        { name: 'Sandra Kim', email: 's.kim@techcorp.com', isExternal: true },
      ],
      location: 'TechCorp HQ - Innovation Lab',
      matchedOpportunities: [],
    },
    // Today - already happened internal review
    {
      id: generateId(),
      title: 'Case Team Standup',
      description: 'Daily standup to align on workstreams and blockers.',
      startTime: daysFromNow(0, 9, 0),
      endTime: daysFromNow(0, 9, 30),
      eventType: 'team-standup',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Nick Chen', email: 'nick.chen@bain.com', isExternal: false, superviseeId: NICK_ID },
        { name: 'Sarah Park', email: 'sarah.park@bain.com', isExternal: false, superviseeId: SARAH_ID },
        { name: 'Marcus Johnson', email: 'marcus.johnson@bain.com', isExternal: false, superviseeId: MARCUS_ID },
      ],
      location: 'Bain Office - Room 4B',
      matchedOpportunities: [],
    },
    // 3 days out - Nick in a client negotiation
    {
      id: generateId(),
      title: 'Vendor Contract Discussion',
      description: 'Meeting with TechCorp procurement to discuss vendor selection for the cloud migration workstream.',
      startTime: daysFromNow(3, 15, 0),
      endTime: daysFromNow(3, 16, 0),
      eventType: 'client-meeting',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Nick Chen', email: 'nick.chen@bain.com', isExternal: false, superviseeId: NICK_ID },
        { name: 'Patricia Holmes', email: 'p.holmes@techcorp.com', isExternal: true },
      ],
      location: 'Virtual - Zoom',
      matchedOpportunities: [],
    },
    // 4 days out - Sarah one-on-one with a client stakeholder
    {
      id: generateId(),
      title: 'Sarah <> Lisa Chen Sync',
      description: 'Sarah to independently manage relationship with TechCorp product lead for customer insights workstream.',
      startTime: daysFromNow(4, 10, 0),
      endTime: daysFromNow(4, 10, 45),
      eventType: 'client-meeting',
      attendees: [
        { name: 'Sarah Park', email: 'sarah.park@bain.com', isExternal: false, superviseeId: SARAH_ID },
        { name: 'Lisa Chen', email: 'l.chen@techcorp.com', isExternal: true },
      ],
      location: 'Virtual - Teams',
      matchedOpportunities: [],
    },
    // Yesterday - already passed
    {
      id: generateId(),
      title: 'TechCorp Stakeholder Alignment',
      description: 'Alignment session with CFO and VP Engineering on budget allocation for Phase 2.',
      startTime: daysFromNow(-1, 14, 0),
      endTime: daysFromNow(-1, 15, 0),
      eventType: 'client-meeting',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Nick Chen', email: 'nick.chen@bain.com', isExternal: false, superviseeId: NICK_ID },
        { name: 'Sarah Park', email: 'sarah.park@bain.com', isExternal: false, superviseeId: SARAH_ID },
        { name: 'Robert Chen', email: 'r.chen@techcorp.com', isExternal: true },
        { name: 'Maria Santos', email: 'm.santos@techcorp.com', isExternal: true },
      ],
      location: 'TechCorp HQ - Executive Suite',
      matchedOpportunities: [],
    },
    // 5 days out - team standup
    {
      id: generateId(),
      title: 'Weekly Case Team Review',
      description: 'Weekly review of case progress, upcoming deliverables, and resource allocation.',
      startTime: daysFromNow(5, 9, 0),
      endTime: daysFromNow(5, 10, 0),
      eventType: 'internal-review',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Nick Chen', email: 'nick.chen@bain.com', isExternal: false, superviseeId: NICK_ID },
        { name: 'Sarah Park', email: 'sarah.park@bain.com', isExternal: false, superviseeId: SARAH_ID },
        { name: 'Marcus Johnson', email: 'marcus.johnson@bain.com', isExternal: false, superviseeId: MARCUS_ID },
      ],
      location: 'Bain Office - Room 4B',
      matchedOpportunities: [],
    },
  ],
  'DEMO1': [
    {
      id: generateId(),
      title: 'ACME Cost Model Review',
      description: 'Present cost optimization findings to ACME CFO and finance team.',
      startTime: daysFromNow(1, 9, 0),
      endTime: daysFromNow(1, 10, 30),
      eventType: 'presentation',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Emily Zhang', email: 'emily.zhang@bain.com', isExternal: false, superviseeId: EMILY_ID },
        { name: 'David Kim', email: 'david.kim@bain.com', isExternal: false, superviseeId: DAVID_ID },
        { name: 'Thomas Wright', email: 't.wright@acme.com', isExternal: true },
        { name: 'Karen Lee', email: 'k.lee@acme.com', isExternal: true },
      ],
      location: 'ACME Tower - 12th Floor',
      matchedOpportunities: [],
    },
    {
      id: generateId(),
      title: 'David <> ACME Data Team Sync',
      description: 'David to walk ACME data engineering team through the optimization pipeline.',
      startTime: daysFromNow(2, 14, 0),
      endTime: daysFromNow(2, 15, 0),
      eventType: 'client-meeting',
      attendees: [
        { name: 'David Kim', email: 'david.kim@bain.com', isExternal: false, superviseeId: DAVID_ID },
        { name: 'James Park', email: 'j.park@acme.com', isExternal: true },
        { name: 'Nina Sharma', email: 'n.sharma@acme.com', isExternal: true },
      ],
      location: 'Virtual - Zoom',
      matchedOpportunities: [],
    },
    {
      id: generateId(),
      title: 'Case Team Standup',
      description: 'Daily alignment on workstreams.',
      startTime: daysFromNow(0, 9, 0),
      endTime: daysFromNow(0, 9, 30),
      eventType: 'team-standup',
      attendees: [
        { name: 'You', email: 'manager@bain.com', isExternal: false },
        { name: 'Emily Zhang', email: 'emily.zhang@bain.com', isExternal: false, superviseeId: EMILY_ID },
        { name: 'David Kim', email: 'david.kim@bain.com', isExternal: false, superviseeId: DAVID_ID },
      ],
      location: 'Bain Office - Room 2A',
      matchedOpportunities: [],
    },
  ],
};

// Assistant IDs
const LINDA_ID = 'assistant-linda-martinez';
const PRIYA_ID = 'assistant-priya-sharma';

const caseAssistants: Record<string, Assistant[]> = {
  'DEMO': [
    {
      id: LINDA_ID,
      name: 'Linda Martinez',
      email: 'linda.martinez@bain.com',
      improvementAreas: [
        { id: 'scheduling', label: 'Scheduling & Calendar Management', description: 'Proactive scheduling, avoiding conflicts, buffer time between meetings' },
        { id: 'follow-ups', label: 'Follow-up & Reminders', description: 'Tracking action items, sending timely reminders, closing loops' },
        { id: 'document-prep', label: 'Document & Meeting Prep', description: 'Pre-reads, agendas, materials ready before meetings' },
      ] as AssistantImprovementArea[],
      notes: [
        {
          id: generateId(),
          content: 'Linda double-booked the TechCorp strategy review with an internal team sync. Caught it the night before but caused scrambling.',
          createdAt: daysAgo(5),
          source: 'manual' as const,
        },
        {
          id: generateId(),
          content: 'Good job preparing the pre-read packet for the stakeholder alignment meeting — client commented on how organized we were.',
          createdAt: daysAgo(3),
          source: 'manual' as const,
        },
        {
          id: generateId(),
          content: 'Missed sending the follow-up email after the vendor discussion. Had to send it myself a day late.',
          createdAt: daysAgo(1),
          source: 'manual' as const,
        },
      ],
      expectedMeetingIds: [], // will be populated after calendar events are created
      createdAt: daysAgo(30),
    },
  ],
  'DEMO1': [
    {
      id: PRIYA_ID,
      name: 'Priya Sharma',
      email: 'priya.sharma@bain.com',
      improvementAreas: [
        { id: 'prioritization', label: 'Prioritization & Judgment', description: 'Knowing what to escalate vs handle, managing competing priorities' },
        { id: 'proactiveness', label: 'Proactiveness', description: 'Anticipating needs before being asked, staying ahead of the calendar' },
        { id: 'communication', label: 'Communication & Gatekeeping', description: 'Triaging requests, clear written communication, managing expectations' },
      ] as AssistantImprovementArea[],
      notes: [
        {
          id: generateId(),
          content: 'Priya proactively blocked prep time before the ACME Cost Model Review — great anticipation of my needs.',
          createdAt: daysAgo(2),
          source: 'manual' as const,
        },
      ],
      expectedMeetingIds: [],
      createdAt: daysAgo(14),
    },
  ],
};

export function getCaseAssistants(caseCode: string): Assistant[] {
  const normalizedCode = caseCode.toUpperCase().trim();
  return caseAssistants[normalizedCode] || [];
}

export function getCaseTeam(caseCode: string): CaseTeam | null {
  const normalizedCode = caseCode.toUpperCase().trim();
  return caseTeams[normalizedCode] || null;
}

export function getCaseCalendarEvents(caseCode: string): CalendarEvent[] {
  const normalizedCode = caseCode.toUpperCase().trim();
  return caseCalendarEvents[normalizedCode] || [];
}

export function isValidCaseCode(caseCode: string): boolean {
  const normalizedCode = caseCode.toUpperCase().trim();
  return normalizedCode in caseTeams;
}

export function getAvailableCaseCodes(): string[] {
  return Object.keys(caseTeams);
}
