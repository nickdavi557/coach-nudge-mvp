# CoachNudge: MVP Specification Document
## Bain & Company Hackathon

---

## Overview

**CoachNudge** is a lightweight coaching companion for busy supervisors. It helps consultants maintain consistent, personalized coaching relationships with their supervisees by:

1. Storing supervisee preferences, personality assessments, and working styles
2. Prompting quick reflections ("How is Nick doing?") to capture thoughts before they're forgotten
3. Delivering AI-generated coaching nudges based on supervisee profiles and past notes
4. Synthesizing notes into actionable summaries for PD sessions, case-ends, or ad-hoc review

---

## User Personas

**Primary User:** Bain consultant supervising 1-4 junior team members on a case

**Pain Points:**
- Too busy to remember to check in on coaching goals
- Forgets small observations that would be useful during formal reviews
- Generic coaching advice doesn't account for individual preferences
- No easy way to recall what was discussed or observed over time

---

## Core Features

### 1. Supervisee Management

**Add a Supervisee**
- Minimum required: Name only
- Optional: Upload documents (PPT or text) containing:
  - Coaching preferences ("I prefer direct feedback")
  - Personality/working style assessments (DISC, Myers-Briggs, custom)
  - Development goals
  - Any other relevant context

**Edit/Remove Supervisee**
- Update name, add/remove documents
- Delete supervisee and all associated data

**Data Storage**
- Persist between sessions using browser localStorage or IndexedDB
- Store: name, uploaded document content (parsed to text), notes, timestamps

---

### 2. Quick Reflection Nudges

**Purpose:** Capture fleeting observations before they're forgotten

**UX:**
- Non-intrusive modal/toast that slides in
- Shows: supervisee name + prompt (e.g., "How is Sarah doing this week? Anything notable?")
- Free-text input field
- Actions: Submit, Snooze (15min/1hr/tomorrow), Dismiss

**Frequency Logic (Smart Defaults):**
| Supervisees | Nudges per Week |
|-------------|-----------------|
| 1           | 2               |
| 2           | 3-4             |
| 3           | 5-6             |
| 4           | 7 (max 1/day/person) |

**Demo Mode:**
- Button to manually trigger a nudge for demo purposes
- Accelerated timing option (nudge every 30 seconds)

---

### 3. Coaching Nudges

**Purpose:** Proactive reminders to coach in ways aligned with supervisee preferences

**Sources for Nudge Generation:**
- Uploaded personality/preference documents
- Past reflection notes
- Time since last interaction

**Example Nudges:**
- "Nick mentioned he's energized by appreciation. Consider recognizing his work on the client deck."
- "You noted last week that Sarah struggled with stakeholder management. Maybe give her a small opportunity to practice."
- "It's been 5 days since you logged anything about Alex. Quick check-in?"

**UX:**
- Card-style notification with the nudge text
- Actions: Mark as Done, Snooze, Dismiss
- Shows which supervisee it relates to

**AI Generation:**
- Use Gemini API to generate contextual nudges
- Input: supervisee profile + recent notes + time context
- Output: 1-2 sentence actionable suggestion

---

### 4. Notes & Synthesis

**Notes View (per Supervisee):**
- Chronological list of all reflection entries
- Timestamps
- Ability to add a note manually (not just via nudge)
- Edit/delete existing notes

**Synthesis Feature:**
- Button: "Generate Summary"
- AI-generated synthesis including:
  - Key themes observed
  - Wins and positive moments
  - Growth areas / concerns
  - Suggested coaching focus areas
- Use cases: case-end review, bi-weekly PD prep, ad-hoc

**AI Generation:**
- Input: all notes for supervisee + their profile documents
- Output: narrative summary (not bullet-heavy)

---

## Technical Architecture

### Stack
- **Frontend:** React (single-page app)
- **Styling:** Tailwind CSS
- **Storage:** Browser localStorage/IndexedDB for persistence
- **AI:** Claude API for nudge generation and synthesis

### Data Model

```typescript
interface Supervisee {
  id: string;
  name: string;
  documents: Document[];
  notes: Note[];
  createdAt: Date;
  lastNudgeAt: Date;
}

interface Document {
  id: string;
  name: string;
  content: string; // parsed text from PPT/text file
  uploadedAt: Date;
}

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  source: 'nudge' | 'manual';
}

interface Nudge {
  id: string;
  superviseeId: string;
  type: 'reflection' | 'coaching';
  content: string;
  status: 'pending' | 'completed' | 'snoozed' | 'dismissed';
  createdAt: Date;
  snoozedUntil?: Date;
}
```

### Key Components

```
App
├── Header (logo, settings)
├── Sidebar
│   └── SuperviseeList
│       └── SuperviseeCard (name, quick stats)
├── MainContent
│   ├── Dashboard (overview, recent activity)
│   ├── SuperviseeDetail
│   │   ├── ProfileSection (name, documents)
│   │   ├── NotesSection (chronological notes)
│   │   └── SynthesisSection (generate/view summary)
│   └── AddSupervisee (form + document upload)
├── NudgeModal (reflection prompts)
├── CoachingNudgeCard (coaching suggestions)
└── DemoControls (trigger nudges, reset data)
```

---

## Demo Data

Pre-populated supervisee for immediate demo capability:

**Nick Chen**
- Personality: ENFP, high energy, creative thinker
- Preferences: "I'm energized by appreciation and public recognition. I prefer feedback to be direct but kind. I learn best through hands-on experience."
- Development goals: "Improve structured communication, get better at managing up"
- Sample notes:
  - "Nick did a great job on the market sizing slide - showed real creativity"
  - "Noticed Nick seemed frustrated in the team meeting when his idea wasn't picked up"
  - "Nick stayed late to help the AC with her Excel model - good mentorship instinct"

---

## User Flow

### First-Time User
1. Land on dashboard → see empty state with "Add your first supervisee"
2. Add supervisee (name only or with documents)
3. Optionally explore demo data (Nick)
4. Start receiving nudges based on configured frequency

### Returning User
1. See dashboard with supervisee cards
2. Receive nudge → respond or snooze
3. Click into supervisee → view notes, generate synthesis
4. Add new observations manually

### Demo Flow (for Hackathon)
1. Show pre-populated "Nick" with existing notes
2. Trigger reflection nudge manually → enter new note
3. Trigger coaching nudge → show AI-generated suggestion
4. Generate synthesis → show comprehensive summary
5. Add new supervisee live → show document upload

---

## Out of Scope (Future Enhancements)

- Calendar integration for PD session reminders
- Microsoft Teams integration for in-flow nudges
- Multi-device sync (would require backend)
- Manager/admin view across multiple supervisors
- Analytics on coaching frequency/quality
- Export to PowerPoint for formal reviews

---

## Success Metrics (Post-Hackathon)

- Time to log a reflection: < 20 seconds
- User engagement: % of nudges responded to vs. dismissed
- Synthesis quality: user satisfaction rating
- Adoption: supervisors actively using for 2+ supervisees

---

## Open Questions for Hackathon

1. Should nudges appear on a schedule even when the app isn't open? (Would require notifications/service worker)
2. How much customization of nudge frequency should be exposed?
3. Should there be a "quiet hours" setting?
4. Team name / branding for the demo?
