import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getElCenter(el: Element): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Drive a React-controlled input */
async function typeInto(
  el: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  ms: number,
  abort: React.MutableRefObject<boolean>,
) {
  el.focus();
  const proto = el instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  for (let i = 1; i <= text.length; i++) {
    if (abort.current) return;
    setter?.call(el, text.slice(0, i));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(ms);
  }
}

// ───── Banner type ─────

interface BannerData {
  text: string;
  sub: string;
  color: string;
  trigger?: string;
}

// ───── Component ─────

export function DemoRunner() {
  const navigate = useNavigate();
  const {
    state, loadCase, triggerReflectionNudge,
    triggerPreMeetingNudge, triggerPostMeetingNudge,
    getMatchedOpportunities,
  } = useApp();

  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorClicking, setCursorClicking] = useState(false);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [bannerKey, setBannerKey] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);
  const [pathLabel, setPathLabel] = useState('');

  const abortRef = useRef(false);

  // Direct DOM ref for cursor — avoids React batching killing animation
  const cursorElRef = useRef<HTMLDivElement>(null);
  const cursorPosRef = useRef({ x: -100, y: -100 });

  // ─── Cursor: animate via direct DOM manipulation ───

  const setCursorXY = useCallback((x: number, y: number) => {
    cursorPosRef.current = { x, y };
    if (cursorElRef.current) {
      cursorElRef.current.style.left = `${x - 4}px`;
      cursorElRef.current.style.top = `${y - 2}px`;
    }
  }, []);

  const moveTo = useCallback(async (x: number, y: number, durationMs = 600) => {
    setCursorVisible(true);
    const startX = cursorPosRef.current.x <= 0 ? x : cursorPosRef.current.x;
    const startY = cursorPosRef.current.y <= 0 ? y : cursorPosRef.current.y;
    const frames = Math.max(1, Math.round(durationMs / 16));

    return new Promise<void>((resolve) => {
      let frame = 0;
      const tick = () => {
        frame++;
        if (abortRef.current || frame > frames) {
          setCursorXY(x, y);
          resolve();
          return;
        }
        const t = frame / frames;
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        setCursorXY(
          startX + (x - startX) * ease,
          startY + (y - startY) * ease,
        );
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, [setCursorXY]);

  const moveToEl = useCallback(async (el: Element, durationMs = 600) => {
    const { x, y } = getElCenter(el);
    await moveTo(x, y, durationMs);
  }, [moveTo]);

  const clickEl = useCallback(async (el: HTMLElement, pause = 400) => {
    await moveToEl(el, 600);
    setCursorClicking(true);
    await sleep(200);
    el.click();
    await sleep(100);
    setCursorClicking(false);
    await sleep(pause);
  }, [moveToEl]);

  const showBanner = useCallback((text: string, sub: string, color = 'bg-gray-900', trigger?: string) => {
    setBanner({ text, sub, color, trigger });
    setBannerKey((k) => k + 1);
  }, []);

  // ─── Query helpers ───

  const qs = (sel: string) => document.querySelector(sel) as HTMLElement | null;
  const qsAll = (sel: string) => document.querySelectorAll(sel);
  const findBtn = (text: string) =>
    Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim().includes(text),
    ) as HTMLElement | undefined;

  const waitForEl = async (sel: string, timeoutMs = 3000): Promise<HTMLElement | null> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) return el;
      await sleep(100);
    }
    return null;
  };

  // ─── Path 1: Consultant Coaching Nudges ───

  const runConsultantPath = useCallback(async () => {
    setPathLabel('Path 1 — Consultant Coaching');

    // Step 1 — load case
    setStepIndex(0);
    showBanner(
      'Loading the TechCorp case',
      'The manager enters their case code to load the team roster',
      'bg-gray-900',
    );
    navigate('/');
    await sleep(600);
    loadCase('DEMO');
    await sleep(2500);
    if (abortRef.current) return;

    // Step 2 — open Nick's profile
    setStepIndex(1);
    showBanner(
      'Opening supervisee profile',
      'Each team member has notes, documents, development opportunities, and an AI synthesis',
      'bg-gray-900',
    );
    await sleep(800);
    const nickLink = qs('a[href="/supervisee/supervisee-nick-chen"]');
    if (nickLink) await clickEl(nickLink, 300);
    navigate('/supervisee/supervisee-nick-chen');
    await sleep(2000);
    if (abortRef.current) return;

    // Step 3 — tour the profile tabs
    setStepIndex(2);
    showBanner(
      'Supervisee profile tabs',
      'Notes for observations, Development for coaching goals, Documents for context, Synthesis for AI summaries',
      'bg-gray-900',
    );
    await sleep(1500);

    // Click through each tab
    const tabOrder = ['Development', 'Documents', 'Synthesis', 'Notes'];
    for (const tabLabel of tabOrder) {
      if (abortRef.current) return;
      const tab = findBtn(tabLabel);
      if (tab) {
        await clickEl(tab, 300);
        await sleep(1800);
      }
    }
    await sleep(500);
    if (abortRef.current) return;

    // Step 4 — reflection nudge
    setStepIndex(3);
    showBanner(
      'Reflection Nudge',
      'A lightweight check-in — prompts the manager to jot down a quick observation',
      'bg-blue-700',
      'TRIGGER: Periodic reminder — it\'s been a while since you reflected on Nick Chen',
    );
    await sleep(2000);

    const nick = state.supervisees.find((s) => s.id === 'supervisee-nick-chen')
      ?? { id: 'supervisee-nick-chen', name: 'Nick Chen', track: 'GC' as const, documents: [], notes: [], developmentOpportunities: [], createdAt: new Date(), lastNudgeAt: null };

    const reflBtn = findBtn('Reflection Nudge');
    if (reflBtn) await clickEl(reflBtn, 300);
    else triggerReflectionNudge(nick);
    await sleep(1500);

    // Expand the nudge toast
    const collapsed = await waitForEl('[data-nudge-toast]', 2000);
    if (collapsed) await clickEl(collapsed, 500);
    await sleep(400);

    showBanner(
      'Manager writes a quick observation',
      'Notes are saved to the supervisee\'s profile for future coaching conversations',
      'bg-blue-700',
    );

    const textarea = await waitForEl('[data-nudge-expanded] textarea', 2000) as HTMLTextAreaElement | null;
    if (textarea) {
      await moveToEl(textarea, 400);
      await typeInto(textarea, 'Nick showed great initiative today — volunteered to lead the client workshop prep.', 30, abortRef);
    }
    await sleep(800);

    const saveBtn = document.querySelector('[data-nudge-expanded] button[type="submit"]') as HTMLElement | null;
    if (saveBtn) await clickEl(saveBtn, 500);
    await sleep(1500);
    if (abortRef.current) return;

    // Step 5 — pre-meeting nudge (auto-triggered)
    setStepIndex(4);

    const tomorrowEvent = state.calendarEvents.find((e) => {
      const d = new Date(e.startTime);
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      return d.toDateString() === tmrw.toDateString()
        && e.attendees.some((a) => a.superviseeId === 'supervisee-nick-chen')
        && e.attendees.some((a) => a.isExternal);
    });

    const eventTitle = tomorrowEvent?.title ?? 'Client Strategy Meeting';
    const matchedDOs = tomorrowEvent
      ? getMatchedOpportunities(tomorrowEvent).filter((m) => m.superviseeId === 'supervisee-nick-chen')
      : [];
    const doLabels = matchedDOs.map((m) => m.opportunityLabel).join(', ') || 'Client Communication, Executive Presence';

    showBanner(
      'Pre-Meeting Coaching Nudge',
      `CoachNudge detects "${eventTitle}" is TOMORROW and proactively nudges the manager`,
      'bg-amber-700',
      `TRIGGER: Calendar scan → meeting tomorrow with Nick Chen + external attendees\nMATCHED: ${doLabels}`,
    );
    await sleep(3500);

    if (tomorrowEvent) {
      const tips = matchedDOs.map((m) => `- **${m.opportunityLabel}**: ${m.coachingTip}`).join('\n');
      const content = `**Tomorrow: ${tomorrowEvent.title}**\n\n${nick.name} has development opportunities relevant to this meeting:\n\n${tips}\n\nTake a moment to plan how you can create space for ${nick.name} to practice these skills.`;
      triggerPreMeetingNudge(nick, tomorrowEvent, content);
    }
    await sleep(1500);

    const preToast = await waitForEl('[data-nudge-toast]', 2000);
    if (preToast) await clickEl(preToast, 400);

    showBanner(
      'Coaching prep matched to development goals',
      'The nudge shows specific tips tied to Nick\'s development opportunities for this meeting',
      'bg-amber-700',
      `MATCHED: ${doLabels} → coaching tips for "${eventTitle}"`,
    );
    await sleep(5000);

    const gotItBtn = document.querySelector('[data-nudge-expanded] button[class*="bg-amber"]') as HTMLElement | null;
    if (gotItBtn) await clickEl(gotItBtn, 500);
    await sleep(1500);
    if (abortRef.current) return;

    // Step 6 — post-meeting debrief
    setStepIndex(5);

    const pastEvent = state.calendarEvents.find((e) => {
      const d = new Date(e.endTime);
      return d < new Date()
        && e.attendees.some((a) => a.superviseeId === 'supervisee-nick-chen')
        && e.attendees.some((a) => a.isExternal);
    });

    const pastTitle = pastEvent?.title ?? 'Previous Client Meeting';

    showBanner(
      'Post-Meeting Debrief Nudge',
      `"${pastTitle}" just ended — CoachNudge asks the manager how Nick performed`,
      'bg-indigo-700',
      `TRIGGER: "${pastTitle}" ended recently with Nick Chen as attendee → prompting for debrief`,
    );
    await sleep(3500);

    if (pastEvent) {
      triggerPostMeetingNudge(nick, pastEvent);
    }
    await sleep(1500);

    const postToast = await waitForEl('[data-nudge-toast]', 2000);
    if (postToast) await clickEl(postToast, 400);
    await sleep(500);

    showBanner(
      'Manager captures meeting observations',
      'Freeform feedback gets saved as a note — building a coaching history over time',
      'bg-indigo-700',
    );
    const debriefTa = await waitForEl('[data-nudge-expanded] textarea', 2000) as HTMLTextAreaElement | null;
    if (debriefTa) {
      await moveToEl(debriefTa, 400);
      await typeInto(debriefTa, 'Nick handled the CFO questions confidently. Next time, coach him to own the full technical narrative instead of deferring.', 25, abortRef);
    }
    await sleep(800);

    const debriefSave = document.querySelector('[data-nudge-expanded] button[type="submit"]') as HTMLElement | null;
    if (debriefSave) await clickEl(debriefSave, 500);
    await sleep(2000);

    showBanner('Consultant path complete', 'Profile tour → Reflection → Pre-meeting prep → Post-meeting debrief', 'bg-green-700');
    await sleep(2500);
    if (abortRef.current) return;
  }, [state.supervisees, state.calendarEvents, loadCase, navigate, triggerReflectionNudge, triggerPreMeetingNudge, triggerPostMeetingNudge, getMatchedOpportunities, showBanner, clickEl, moveToEl, moveTo]);

  // ─── Path 2: Assistant Tracking ───

  const runAssistantPath = useCallback(async () => {
    setPathLabel('Path 2 — Executive Assistant');

    showBanner(
      'Path 2: Executive Assistant Tracking',
      'CoachNudge also tracks non-consultant team members like executive assistants',
      'bg-teal-700',
    );
    await sleep(3000);
    if (abortRef.current) return;

    // Open Linda
    setStepIndex(6);
    showBanner(
      'Opening assistant profile',
      'Assistants have their own section — notes, improvement areas, and weekly recaps',
      'bg-teal-700',
    );
    await sleep(800);
    const lindaLink = qs('a[href="/assistant/assistant-linda-martinez"]');
    if (lindaLink) await clickEl(lindaLink, 300);
    navigate('/assistant/assistant-linda-martinez');
    await sleep(2500);
    if (abortRef.current) return;

    // Add a note
    setStepIndex(7);
    showBanner(
      'Tracking assistant performance',
      'Quick notes on wins, misses, and observations — builds a history for feedback conversations',
      'bg-teal-700',
    );
    await sleep(1000);
    const noteInput = qs('input[placeholder*="performance"]') as HTMLInputElement
      ?? qs('input[placeholder*="note"]') as HTMLInputElement;
    if (noteInput) {
      await moveToEl(noteInput, 400);
      await typeInto(noteInput, 'Linda forgot to send the pre-read for tomorrow\'s client meeting — had to scramble last minute', 25, abortRef);
      await sleep(600);
      const addBtn = findBtn('Add Note');
      if (addBtn) await clickEl(addBtn, 500);
    }
    await sleep(2000);
    if (abortRef.current) return;

    // Improvement areas
    setStepIndex(8);
    showBanner(
      'Improvement areas',
      'Track specific skills the assistant is developing — scheduling, follow-ups, document prep',
      'bg-teal-700',
    );
    const impTab = findBtn('Improvement Areas');
    if (impTab) await clickEl(impTab, 500);
    await sleep(3500);
    if (abortRef.current) return;

    // Weekly recap
    setStepIndex(9);
    showBanner(
      'Weekly performance recap',
      'At the end of each week, flag missed meetings and provide overall feedback',
      'bg-teal-700',
    );
    const recapTab = findBtn('Weekly Recap');
    if (recapTab) await clickEl(recapTab, 500);
    await sleep(2000);

    // Flag a missed meeting
    const meetingBtns = qsAll('button[class*="border-gray-200"]');
    if (meetingBtns.length > 0) {
      await clickEl(meetingBtns[0] as HTMLElement, 500);
    }
    await sleep(1000);

    showBanner(
      'Writing weekly feedback',
      'Recaps are saved to the assistant\'s profile as dated performance records',
      'bg-teal-700',
    );
    const feedTa = qs('textarea[placeholder*="How did"]') as HTMLTextAreaElement | null;
    if (feedTa) {
      await moveToEl(feedTa, 400);
      await typeInto(feedTa, 'Solid week overall but follow-ups were inconsistent. Missed the client meeting pre-read. Scheduling was good — no double-bookings.', 20, abortRef);
    }
    await sleep(1200);

    const submitBtn = findBtn('Submit Weekly Recap');
    if (submitBtn) await clickEl(submitBtn, 500);
    await sleep(2500);

    showBanner('Assistant path complete', 'Notes → Improvement tracking → Weekly recaps', 'bg-green-700');
    await sleep(2500);
  }, [navigate, showBanner, clickEl, moveToEl, moveTo]);

  // ─── Orchestrator ───

  const runFullDemo = useCallback(async () => {
    abortRef.current = false;
    setIsRunning(true);
    setStepIndex(-1);
    setCursorVisible(false);
    cursorPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setCursorXY(window.innerWidth / 2, window.innerHeight / 2);

    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await sleep(1000);
    }
    setCountdown(0);
    setCursorVisible(true);

    await runConsultantPath();
    if (abortRef.current) { cleanup(); return; }

    await sleep(500);
    await runAssistantPath();

    showBanner('Demo complete!', 'CoachNudge helps managers coach consultants and track assistant performance', 'bg-gray-900');
    await sleep(3000);
    cleanup();
  }, [runConsultantPath, runAssistantPath, showBanner, setCursorXY]);

  const cleanup = () => {
    setIsRunning(false);
    setPathLabel('');
    setStepIndex(-1);
    setCursorVisible(false);
    setBanner(null);
  };

  const stopDemo = () => {
    abortRef.current = true;
    cleanup();
  };

  const STEPS = [
    { label: 'Load case & view team' },
    { label: 'Open supervisee profile' },
    { label: 'Tour profile tabs' },
    { label: 'Reflection nudge' },
    { label: 'Pre-meeting coaching nudge' },
    { label: 'Post-meeting debrief' },
    { label: 'Open assistant profile' },
    { label: 'Add performance note' },
    { label: 'View improvement areas' },
    { label: 'Submit weekly recap' },
  ];

  return (
    <>
      {/* ─── Keyframe animations ─── */}
      <style>{`
        @keyframes demo-banner-in {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes demo-trigger-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes demo-click-ring {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* ─── Animated cursor (DOM ref, no React state for position) ─── */}
      <div
        ref={cursorElRef}
        style={{
          position: 'fixed',
          left: -100,
          top: -100,
          zIndex: 100000,
          pointerEvents: 'none',
          display: cursorVisible ? 'block' : 'none',
        }}
      >
        <svg
          width="32"
          height="38"
          viewBox="0 0 28 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: cursorClicking ? 'scale(0.8)' : 'scale(1)',
            transition: 'transform 0.12s ease',
            filter: 'drop-shadow(2px 3px 5px rgba(0,0,0,0.5))',
          }}
        >
          <path
            d="M2 2L2 26L8.5 20L14 32L18 30L12.5 18.5L21 18.5L2 2Z"
            fill="white"
            stroke="black"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
        {cursorClicking && (
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(220, 38, 38, 0.5)',
              animation: 'demo-click-ring 0.4s ease-out forwards',
            }}
          />
        )}
      </div>

      {/* ─── Info banner ─── */}
      {banner && (
        <div
          key={bannerKey}
          className="fixed left-1/2"
          style={{
            top: 76,
            zIndex: 99998,
            animation: 'demo-banner-in 0.35s ease-out forwards',
            maxWidth: 580,
            width: '90vw',
          }}
        >
          <div className={`${banner.color} text-white rounded-xl px-6 py-4`}
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.35)' }}
          >
            <p className="text-base font-bold leading-snug">{banner.text}</p>
            <p className="text-sm opacity-90 mt-1 leading-snug">{banner.sub}</p>
            {banner.trigger && (
              <div
                className="mt-3 px-3 py-2 rounded-lg text-xs font-mono leading-relaxed whitespace-pre-wrap"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  animation: 'demo-trigger-pulse 2s ease-in-out infinite',
                }}
              >
                {banner.trigger}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Countdown ─── */}
      {countdown > 0 && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 100001 }}
        >
          <p className="text-white text-xl mb-4 font-medium">Starting automated demo...</p>
          <div className="text-white text-8xl font-bold animate-pulse">{countdown}</div>
        </div>
      )}

      {/* ─── Start / progress panel ─── */}
      <div className="fixed top-16 right-0 w-72" style={{ zIndex: 99997 }}>
        {!isRunning && (
          <div className="p-3">
            <button
              onClick={runFullDemo}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-bain-red to-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Run Automated Demo
            </button>
          </div>
        )}

        {isRunning && countdown === 0 && (
          <div className="m-3 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium">DEMO</span>
              </div>
              <button onClick={stopDemo} className="text-xs text-gray-400 hover:text-white">
                Stop
              </button>
            </div>

            <div className="px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {pathLabel}
              </span>
            </div>

            <div className="px-4 py-3 max-h-64 overflow-y-auto">
              {STEPS.map((step, i) => {
                const isCurrent = i === stepIndex;
                const isDone = i < stepIndex;
                const showDivider = i === 6;
                return (
                  <div key={i}>
                    {showDivider && (
                      <div className="my-2 border-t border-gray-200 pt-2">
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                          Assistant Tracking
                        </span>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 py-1 ${isCurrent ? 'font-medium' : ''}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone
                          ? 'bg-green-500'
                          : isCurrent
                            ? 'bg-bain-red animate-pulse'
                            : 'bg-gray-200'
                      }`}>
                        {isDone && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isCurrent && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-xs ${isDone ? 'text-green-600' : isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
