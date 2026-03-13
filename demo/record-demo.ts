/**
 * Playwright demo recorder for CoachNudge MVP.
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. Run:  npx tsx demo/record-demo.ts
 *
 * Produces a .webm video in demo/recordings/.
 */

import { chromium, type Page } from 'playwright';

const BASE = 'http://localhost:5173';
const VIEWPORT = { width: 1280, height: 720 };

// ─── Helpers ───

async function pause(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Inject a banner overlay into the live DOM (visible in video). */
async function showBanner(
  page: Page,
  text: string,
  sub: string,
  bgColor: string,
  trigger?: string,
) {
  await page.evaluate(
    ({ text, sub, bgColor, trigger }) => {
      let el = document.getElementById('pw-demo-banner');
      if (!el) {
        el = document.createElement('div');
        el.id = 'pw-demo-banner';
        Object.assign(el.style, {
          position: 'fixed',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: '99998',
          maxWidth: '580px',
          width: '90vw',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: '0',
          pointerEvents: 'none',
        });
        document.body.appendChild(el);
      }
      el.innerHTML = `<div style="background:${bgColor};color:#fff;border-radius:12px;padding:16px 24px;box-shadow:0 8px 30px rgba(0,0,0,0.35)">
        <p style="font-size:16px;font-weight:700;line-height:1.3;margin:0">${text}</p>
        <p style="font-size:14px;opacity:0.9;margin:4px 0 0;line-height:1.3">${sub}</p>
        ${
          trigger
            ? `<div style="margin-top:12px;padding:8px 12px;border-radius:8px;font-size:12px;font-family:monospace;line-height:1.5;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);white-space:pre-wrap">${trigger}</div>`
            : ''
        }
      </div>`;
      // Force reflow then fade in
      void el.offsetHeight;
      el.style.opacity = '1';
    },
    { text, sub, bgColor, trigger },
  );
}

async function hideBanner(page: Page) {
  await page.evaluate(() => {
    const el = document.getElementById('pw-demo-banner');
    if (el) el.style.opacity = '0';
  });
}

/** Inject a step progress panel on the right side. */
async function showProgress(page: Page, steps: string[], currentIdx: number, sectionLabel: string) {
  await page.evaluate(
    ({ steps, currentIdx, sectionLabel }) => {
      let el = document.getElementById('pw-demo-progress');
      if (!el) {
        el = document.createElement('div');
        el.id = 'pw-demo-progress';
        Object.assign(el.style, {
          position: 'fixed',
          top: '68px',
          right: '8px',
          zIndex: '99997',
          width: '260px',
          pointerEvents: 'none',
        });
        document.body.appendChild(el);
      }
      const html = steps
        .map((label, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const dotColor = done ? '#22c55e' : active ? '#dc2626' : '#d1d5db';
          const textColor = done ? '#16a34a' : active ? '#111827' : '#9ca3af';
          const weight = active ? '600' : '400';
          const checkSvg = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><path d="M5 13l4 4L19 7"/></svg>`;
          const innerDot = active ? `<div style="width:6px;height:6px;border-radius:50%;background:white"></div>` : '';
          return `<div style="display:flex;align-items:center;gap:8px;padding:3px 0">
            <div style="width:14px;height:14px;border-radius:50%;background:${dotColor};display:flex;align-items:center;justify-content:center;flex-shrink:0${active ? ';animation:pulse 1.5s infinite' : ''}">${done ? checkSvg : innerDot}</div>
            <span style="font-size:11px;color:${textColor};font-weight:${weight}">${label}</span>
          </div>`;
        })
        .join('');

      el.innerHTML = `<div style="background:white;border-radius:8px;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden">
        <div style="background:#111827;color:white;padding:6px 12px;display:flex;align-items:center;gap:8px">
          <div style="width:6px;height:6px;border-radius:50%;background:#ef4444;animation:pulse 1.5s infinite"></div>
          <span style="font-size:11px;font-weight:500">DEMO</span>
        </div>
        <div style="padding:6px 12px;border-bottom:1px solid #f3f4f6">
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">${sectionLabel}</span>
        </div>
        <div style="padding:8px 12px">${html}</div>
      </div>
      <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}</style>`;
    },
    { steps, currentIdx, sectionLabel },
  );
}

// ─── Main demo script ───

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: {
      dir: './demo/recordings',
      size: VIEWPORT,
    },
  });

  const page = await context.newPage();

  // Handle any dialog that might pop up
  page.on('dialog', (d) => d.dismiss());

  // Navigate to demo mode
  await page.goto(`${BASE}/?pw=true`);
  await page.waitForLoadState('networkidle');
  await pause(1000);

  const CONSULTANT_STEPS = [
    'Load case & view team',
    'Open supervisee profile',
    'Tour profile tabs',
    'Reflection nudge',
    'Pre-meeting coaching nudge',
    'Post-meeting debrief',
  ];

  const ASSISTANT_STEPS = [
    'Open assistant profile',
    'Add performance note',
    'View improvement areas',
    'Submit weekly recap',
  ];

  // ─── PATH 1: CONSULTANT ───

  // Step 0 — load case
  await showProgress(page, CONSULTANT_STEPS, 0, 'Consultant Coaching');
  await showBanner(page, 'Loading the TechCorp case', 'The manager enters their case code to load the team roster', '#111827');
  await pause(1500);

  // Type DEMO into the case code input
  const caseInput = page.locator('input[placeholder*="DEMO"], input[placeholder*="case"], input[placeholder*="Case"]').first();
  await caseInput.click();
  await caseInput.type('DEMO', { delay: 100 });
  await pause(500);

  // Click the load button
  const loadBtn = page.getByRole('button', { name: /load/i }).first();
  await loadBtn.click();
  await pause(2500);

  // Step 1 — open Nick's profile
  await showProgress(page, CONSULTANT_STEPS, 1, 'Consultant Coaching');
  await showBanner(page, 'Opening supervisee profile', 'Each team member has notes, documents, development opportunities, and an AI synthesis', '#111827');
  await pause(1000);

  // Click sidebar link visually, then navigate with param preserved
  await page.click('a[href="/supervisee/supervisee-nick-chen"]', { force: true });
  // Re-navigate to preserve ?pw=true (sidebar Links drop query params)
  await page.goto(`${BASE}/supervisee/supervisee-nick-chen?pw=true`);
  await page.waitForSelector('h1:has-text("Nick Chen")');
  await pause(1500);

  // Step 2 — tour profile tabs
  await showProgress(page, CONSULTANT_STEPS, 2, 'Consultant Coaching');
  await showBanner(
    page,
    'Supervisee profile tabs',
    'Notes for observations, Development for coaching goals, Documents for context, Synthesis for AI summaries',
    '#111827',
  );
  await pause(1500);

  for (const tabName of ['Development', 'Documents', 'Synthesis', 'Notes']) {
    const tab = page.getByRole('button', { name: new RegExp(tabName) }).first();
    await tab.click();
    await pause(2000);
  }
  await pause(500);

  // Step 3 — reflection nudge
  await showProgress(page, CONSULTANT_STEPS, 3, 'Consultant Coaching');
  await showBanner(
    page,
    'Reflection Nudge',
    'A lightweight check-in — prompts the manager to jot down a quick observation',
    '#1d4ed8',
    "TRIGGER: Periodic reminder — it's been a while since you reflected on Nick Chen",
  );
  await pause(2000);

  // Click the button visually, then also trigger via bridge as backup
  await page.getByRole('button', { name: 'Reflection Nudge' }).click({ force: true });
  await pause(500);

  // Ensure nudge was triggered via bridge if button didn't work
  await page.evaluate(() => {
    const d = (window as any).__demo;
    if (!d || d.state.activeNudge) return; // already triggered
    const nick = d.state.supervisees.find((s: any) => s.id === 'supervisee-nick-chen');
    if (nick) d.triggerReflectionNudge(nick);
  });
  await pause(1500);

  // Expand nudge toast
  const toast = page.locator('[data-nudge-toast]');
  await toast.waitFor({ timeout: 5000 });
  await toast.click({ force: true });
  await pause(500);

  await showBanner(
    page,
    'Manager writes a quick observation',
    "Notes are saved to the supervisee's profile for future coaching conversations",
    '#1d4ed8',
  );

  // Type into the nudge textarea
  const nudgeTextarea = page.locator('[data-nudge-expanded] textarea');
  await nudgeTextarea.waitFor({ timeout: 3000 });
  await nudgeTextarea.click();
  await nudgeTextarea.type(
    'Nick showed great initiative today — volunteered to lead the client workshop prep.',
    { delay: 25 },
  );
  await pause(800);

  // Save
  await page.locator('[data-nudge-expanded] button[type="submit"]').click({ force: true });
  await pause(2000);

  // Step 4 — pre-meeting nudge (programmatic trigger via bridge)
  await showProgress(page, CONSULTANT_STEPS, 4, 'Consultant Coaching');
  await showBanner(
    page,
    'Pre-Meeting Coaching Nudge',
    'CoachNudge detects a meeting TOMORROW with Nick Chen and external clients',
    '#b45309',
    'TRIGGER: Calendar scan → meeting tomorrow with Nick Chen + external attendees\nMATCHED: Client Communication, Executive Presence',
  );
  await pause(3500);

  // Trigger pre-meeting nudge via the window bridge
  await page.evaluate(() => {
    const d = (window as any).__demo;
    if (!d) return;
    const nick = d.state.supervisees.find((s: any) => s.id === 'supervisee-nick-chen');
    if (!nick) return;
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const event = d.state.calendarEvents.find((e: any) => {
      const dt = new Date(e.startTime);
      return dt.toDateString() === tmrw.toDateString()
        && e.attendees.some((a: any) => a.superviseeId === 'supervisee-nick-chen')
        && e.attendees.some((a: any) => a.isExternal);
    });
    if (!event) return;
    const matches = d.getMatchedOpportunities(event).filter((m: any) => m.superviseeId === 'supervisee-nick-chen');
    const tips = matches.map((m: any) => `- **${m.opportunityLabel}**: ${m.coachingTip}`).join('\n');
    const content = `**Tomorrow: ${event.title}**\n\n${nick.name} has development opportunities relevant to this meeting:\n\n${tips}\n\nTake a moment to plan how you can create space for ${nick.name} to practice these skills.`;
    d.triggerPreMeetingNudge(nick, event, content);
  });
  await pause(1500);

  // Expand
  const preToast = page.locator('[data-nudge-toast]');
  await preToast.waitFor({ timeout: 5000 });
  await preToast.click({ force: true });
  await pause(500);

  await showBanner(
    page,
    'Coaching prep matched to development goals',
    "The nudge shows specific tips tied to Nick's development opportunities for this meeting",
    '#b45309',
    'MATCHED: Client Communication, Executive Presence → coaching tips for upcoming client meeting',
  );
  await pause(5000);

  // Dismiss with "Got it" or complete button
  const gotItBtn = page.locator('[data-nudge-expanded] button').filter({ hasText: /got it/i }).first();
  if (await gotItBtn.isVisible()) {
    await gotItBtn.click();
  } else {
    // fallback: click any action button in the nudge
    const amberBtn = page.locator('[data-nudge-expanded] button[class*="bg-amber"]').first();
    if (await amberBtn.isVisible()) await amberBtn.click();
  }
  await pause(2000);

  // Step 5 — post-meeting debrief
  await showProgress(page, CONSULTANT_STEPS, 5, 'Consultant Coaching');
  await showBanner(
    page,
    'Post-Meeting Debrief Nudge',
    '"TechCorp Stakeholder Alignment" just ended — CoachNudge asks how Nick performed',
    '#4338ca',
    'TRIGGER: Meeting ended recently with Nick Chen as attendee → prompting for debrief',
  );
  await pause(3500);

  // Trigger post-meeting nudge
  await page.evaluate(() => {
    const d = (window as any).__demo;
    if (!d) return;
    const nick = d.state.supervisees.find((s: any) => s.id === 'supervisee-nick-chen');
    if (!nick) return;
    const past = d.state.calendarEvents.find((e: any) => {
      const dt = new Date(e.endTime);
      return dt < new Date()
        && e.attendees.some((a: any) => a.superviseeId === 'supervisee-nick-chen')
        && e.attendees.some((a: any) => a.isExternal);
    });
    if (past) d.triggerPostMeetingNudge(nick, past);
  });
  await pause(1500);

  const postToast = page.locator('[data-nudge-toast]');
  await postToast.waitFor({ timeout: 5000 });
  await postToast.click({ force: true });
  await pause(500);

  await showBanner(
    page,
    'Manager captures meeting observations',
    'Freeform feedback gets saved as a note — building a coaching history over time',
    '#4338ca',
  );

  const debriefTa = page.locator('[data-nudge-expanded] textarea');
  await debriefTa.waitFor({ timeout: 3000 });
  await debriefTa.click();
  await debriefTa.type(
    'Nick handled the CFO questions confidently. Next time, coach him to own the full technical narrative instead of deferring.',
    { delay: 20 },
  );
  await pause(800);

  await page.locator('[data-nudge-expanded] button[type="submit"]').click({ force: true });
  await pause(2000);

  await showBanner(page, 'Consultant path complete', 'Profile tour → Reflection → Pre-meeting prep → Post-meeting debrief', '#15803d');
  await pause(3000);

  // ─── PATH 2: ASSISTANT ───

  await showBanner(
    page,
    'Path 2: Executive Assistant Tracking',
    'CoachNudge also tracks non-consultant team members like executive assistants',
    '#0f766e',
  );
  await showProgress(page, ASSISTANT_STEPS, 0, 'Assistant Tracking');
  await pause(3000);

  // Open Linda
  await showProgress(page, ASSISTANT_STEPS, 0, 'Assistant Tracking');
  await showBanner(
    page,
    'Opening assistant profile',
    'Assistants have their own section — notes, improvement areas, and weekly recaps',
    '#0f766e',
  );
  await pause(1000);

  await page.click('a[href="/assistant/assistant-linda-martinez"]', { force: true });
  await page.goto(`${BASE}/assistant/assistant-linda-martinez?pw=true`);
  await page.waitForSelector('h1:has-text("Linda")');
  await pause(2000);

  // Add a note
  await showProgress(page, ASSISTANT_STEPS, 1, 'Assistant Tracking');
  await showBanner(
    page,
    'Tracking assistant performance',
    'Quick notes on wins, misses, and observations — builds a history for feedback conversations',
    '#0f766e',
  );
  await pause(1000);

  const noteInput = page.locator('input[placeholder*="performance"], input[placeholder*="note"]').first();
  if (await noteInput.isVisible()) {
    await noteInput.click();
    await noteInput.type(
      "Linda forgot to send the pre-read for tomorrow's client meeting — had to scramble last minute",
      { delay: 20 },
    );
    await pause(500);
    await page.getByRole('button', { name: /add note/i }).click();
  }
  await pause(2000);

  // Improvement areas
  await showProgress(page, ASSISTANT_STEPS, 2, 'Assistant Tracking');
  await showBanner(
    page,
    'Improvement areas',
    'Track specific skills the assistant is developing — scheduling, follow-ups, document prep',
    '#0f766e',
  );
  const impTab = page.getByRole('button', { name: /improvement/i }).first();
  await impTab.click();
  await pause(3500);

  // Weekly recap
  await showProgress(page, ASSISTANT_STEPS, 3, 'Assistant Tracking');
  await showBanner(
    page,
    'Weekly performance recap',
    'At the end of each week, flag missed meetings and provide overall feedback',
    '#0f766e',
  );
  const recapTab = page.getByRole('button', { name: /weekly recap/i }).first();
  await recapTab.click();
  await pause(2000);

  // Flag a missed meeting (click first meeting toggle button)
  const meetingToggle = page.locator('button').filter({ has: page.locator('.border-2.border-gray-300') }).first();
  if (await meetingToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await meetingToggle.click();
    await pause(800);
  }

  await showBanner(
    page,
    'Writing weekly feedback',
    "Recaps are saved to the assistant's profile as dated performance records",
    '#0f766e',
  );

  const feedTa = page.locator('textarea[placeholder*="How did"]').first();
  if (await feedTa.isVisible()) {
    await feedTa.click();
    await feedTa.type(
      'Solid week overall but follow-ups were inconsistent. Missed the client meeting pre-read. Scheduling was good — no double-bookings.',
      { delay: 18 },
    );
  }
  await pause(800);

  const submitRecap = page.getByRole('button', { name: /submit weekly recap/i });
  if (await submitRecap.isEnabled()) {
    await submitRecap.click();
  }
  await pause(2500);

  await showBanner(page, 'Assistant path complete', 'Notes → Improvement tracking → Weekly recaps', '#15803d');
  await pause(3000);

  // ─── DONE ───

  await showBanner(
    page,
    'Demo complete!',
    'CoachNudge helps managers coach consultants and track assistant performance',
    '#111827',
  );
  await pause(3000);
  await hideBanner(page);
  await pause(1000);

  // Close context to finalize video
  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const path = await video.path();
    console.log(`\n✅ Demo video saved to: ${path}\n`);
  } else {
    console.log('\n⚠️  No video path available.\n');
  }
}

main().catch((err) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
