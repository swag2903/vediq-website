/**
 * VedIQ Academy — Universal 24/7 AI Concierge & Smart Support Desk Engine
 * High-Performance, Apple iOS Spring Fluid Animated Floating Widget
 * Deployed universally across index.html, parent.html & teacher.html
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__VEDIQ_AI_CONCIERGE_LOADED__) return;
  window.__VEDIQ_AI_CONCIERGE_LOADED__ = true;

  // Gurukul Knowledge Prompt for Gemini
  const GURUKUL_AI_SYSTEM_PROMPT = `You are the official 24/7 VedIQ Gurukul AI Academic Advisor for VedIQ Academy (co-founded by Dr. Ujwal Vyas, Mr. Atish Gulhane, Mr. Swagatam Shukla).
VedIQ Academy is India's premier Bharatiya Integral Gurukul System for children aged 5–15.
Key Facts:
- 60-Minute Daily Routine: 10m Pranayama (vagus nerve calming), 10m Tratak steady-gaze flame fixation (reverses screen & dopamine addiction, expands deep focus from 10 to 45+ min), 15m Panchatatva Vedic physics & astronomy, 15m Vedic Mental Math (16 sutras for 3-sec mental calculations), 10m Bhagavad Gita sanskar, sleep & gratitude journal.
- Micro-Batch Mentorship: Strict 1:8 student-to-mentor ratio.
- Age Cohorts: Ages 5–7 (Foundation), Ages 8–11 (Pravesh), Ages 12–15 (Daksha).
- Tuition: Basic ₹999/mo, Standard ₹1,499/mo (includes workbook), Premium ₹2,499/mo. 14-day 100% money-back guarantee.
- Free 3-Day Demo: Live classes with Master Mentor Dr. Ujwal Vyas at zero cost.
- Parent Portal: Available at parent.html with Tratak gaze timers, math velocity analytics, and voice mentor feedback.
- Teacher Console: Available at teacher.html.
- Official Email: myvediqacademy@gmail.com.
Respond empathetically, thoughtfully, and educationally. Write 1 to 2 crisp, inspiring paragraphs. Reply in English or Hinglish matching the user's prompt.`;

  // Comprehensive Conversational Intelligence Matrix (Zero-Failure Fallback)
  const CONVERSATIONAL_BRAIN = [
    {
      keywords: ['hello', 'hi', 'hey', 'namaste', 'pranam', 'pranaam', 'good morning', 'good evening', 'good afternoon', 'hola', 'radhe', 'ram ram', 'namaskar', 'halo', 'helo'],
      answer: "🙏 <strong>Namaste! Welcome to VedIQ Academy.</strong><br><br>I am your 24/7 Gurukul AI Concierge. How can I help you and your child today?<br><br>Feel free to ask about our <strong>Free 3-Day Live Demo</strong>, the <strong>60-Minute Daily Routine</strong>, how <strong>Tratak</strong> eliminates mobile screen addiction, <strong>Vedic Maths</strong>, <strong>Tuition Fees</strong>, or the <strong>Parent Portal</strong>."
    },
    {
      keywords: ['who are you', 'koun ho', 'kya ho', 'what is this', 'about', 'vediq kya hai', 'vediq academy kya hai', 'what is vediq'],
      answer: "🪔 <strong>VedIQ Academy (Bharatiya Integral Gurukul System):</strong><br>VedIQ Academy is India's premier scientific + Vedic brain development system for children aged 5 to 15, founded by Dr. Ujwal Vyas, Mr. Atish Gulhane, and Mr. Swagatam Shukla.<br><br>In just <strong>1 hour daily</strong>, we replace screen addiction, distraction, and math fear with unbroken focus, memory mastery, and cultural sanskar through live micro-batches (1:8 mentor ratio)."
    },
    {
      keywords: ['tratak', 'focus', 'concentration', 'screen', 'phone', 'mobile', 'addiction', 'distract', 'attention', 'dhyan', 'padhai', 'padhta nahi', 'bhatakta'],
      answer: "🎯 <strong>Tratak Neuro-Science & Screen Detox:</strong><br>Modern short videos and reels flood children's brains with dopamine spikes every 4 seconds, causing micro-saccadic eye jitter that fragments their prefrontal cortex attention span.<br><br>During our daily 10-minute steady-gaze Tratak practice, optical nerves are stabilized, activating alpha brainwaves (8–12 Hz). Within 30 days, parents observe their child's continuous deep study span expanding from 10 minutes to <strong>45+ minutes</strong> with natural calm."
    },
    {
      keywords: ['routine', '60 min', '1 hour', 'schedule', 'kya sikhate', 'daily', 'protocol', 'stages'],
      answer: "⏰ <strong>The Calibrated 60-Minute Daily Gurukul Routine:</strong><br>• <strong>00–10m (Pranayama & Breathwork):</strong> Vagus nerve reset to eliminate physical restlessness.<br>• <strong>10–20m (Tratak Flame Fixation):</strong> Reverses digital screen fatigue & doubles focus.<br>• <strong>20–35m (Vedic Physics & Panchatatva):</strong> Experiential understanding of nature, elements & astronomy.<br>• <strong>35–50m (Vedic Mental Math):</strong> 16 sutras for 3-second lightning calculations.<br>• <strong>50–60m (Gita Sanskar & Gratitude Journal):</strong> Character fortitude & emotional grounding."
    },
    {
      keywords: ['fee', 'fees', 'cost', 'price', 'plan', 'tuition', 'kitna', 'charge', 'rate', 'payment'],
      answer: "💳 <strong>Simple, Transparent Tuition Plans:</strong><br>• <strong>Basic Plan:</strong> ₹999 / month (Daily 1-hour live sessions + app)<br>• <strong>Standard Plan (Recommended):</strong> ₹1,499 / month (Includes physical workbook kit sent home + micro-batch of max 8 students)<br>• <strong>Premium Immersion:</strong> ₹2,499 / month (1-on-1 mentorship & leadership bootcamps)<br><br>🛡️ <strong>14-Day 100% Money-Back Guarantee:</strong> Try live classes with zero risk. All UPI, cards, and netbanking accepted."
    },
    {
      keywords: ['demo', 'free class', 'trial', 'book', '3 day', 'experience', 'slot'],
      answer: "🌟 <strong>Free 3-Day Live Gurukul Demo:</strong><br>You can experience 3 full days of live 1-hour Gurukul sessions with Master Mentor Dr. Ujwal Vyas with zero payment! Simply click <button onclick='window.openDemoModal ? window.openDemoModal() : window.location.href=\"/#plans\"' class='text-brand-ochre font-bold underline cursor-pointer'>Book Free 3-Day Demo</button> to reserve your child's micro-batch slot."
    },
    {
      keywords: ['parent', 'portal', 'login', 'dashboard', 'report', 'password', 'otp', 'sign in', 'app'],
      answer: "👨‍👩‍👧 <strong>Parent Progress Portal (24/7 Live):</strong><br>Track your child's Tratak gaze seconds, daily habit streaks, mental math velocity, and weekly mentor remarks from Dr. Ujwal Vyas.<br><br>Visit <a href='parent.html' class='text-brand-ochre font-bold underline'>vediqacademy.com/parent.html</a> to sign in with Google 1-Click, Email OTP, or password."
    },
    {
      keywords: ['math', 'vedic math', 'calculation', 'speed', 'formula', 'sutra', 'hisab'],
      answer: "🧠 <strong>Vedic Mental Mathematics:</strong><br>Instead of painful long division and mechanical steps, we teach the 16 sacred Vedic Sutras (such as <em>Ekadhikena Purvena</em> and <em>Nikhilam</em>). Children calculate 3-digit multiplications, squares, and percentages mentally in 3 to 5 seconds without paper, boosting mathematical confidence tenfold!"
    },
    {
      keywords: ['age', 'cohort', '5-7', '8-11', '12-15', 'batch', 'time', 'timing', 'foundation', 'pravesh', 'daksha'],
      answer: "📅 <strong>Age Cohorts & Live Batch Timings (Mon–Fri, 1:8 Ratio):</strong><br>• <strong>Foundation (Ages 5–7):</strong> 4:00 PM – 5:00 PM IST<br>• <strong>Pravesh (Ages 8–11):</strong> 5:00 PM – 6:00 PM IST<br>• <strong>Daksha (Ages 12–15):</strong> 6:00 PM – 7:00 PM IST<br><br>All classes are live interactive on Zoom with personalized attention."
    },
    {
      keywords: ['teacher', 'mentor console', 'faculty', 'login teacher', 'teacher login', 'teacher portal', 'staff login', 'faculty login'],
      answer: "🔐 <strong>Teacher & Master Mentor Console:</strong><br>Mentors can securely access student progress dashboards, Tratak calibration, and class evaluations at <a href='teacher.html' class='text-brand-ochre font-bold underline'>vediqacademy.com/teacher.html</a> using verified faculty credentials."
    }
  ];

  // Secure Gemini AI Call (Via Netlify Serverless Function — Zero Frontend Key Exposure)
  async function queryLiveGeminiAi(prompt) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch('/.netlify/functions/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ query: prompt })
      });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.answer) {
          return data.answer;
        }
      }
    } catch (e) {
      console.warn("Live AI serverless response notice, using Gurukul brain:", e);
    }
    return null;
  }

  // Answer matching engine
  async function generateAiResponse(query) {
    const clean = query.trim().toLowerCase();

    // 1. Try Gemini first
    const geminiResult = await queryLiveGeminiAi(query);
    if (geminiResult) return geminiResult;

    // 2. Fallback to comprehensive conversational brain
    let best = null;
    let maxMatches = 0;
    for (const item of CONVERSATIONAL_BRAIN) {
      let matches = 0;
      for (const kw of item.keywords) {
        if (clean.includes(kw)) matches++;
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        best = item;
      }
    }

    if (best && maxMatches > 0) {
      return best.answer;
    }

    // 3. Empathetic default answer
    return `Namaste! 🙏 Regarding <strong>"${query}"</strong>: At VedIQ Academy, our core focus is developing lifelong concentration, memory speed, and emotional resilience in children (ages 5–15) through our calibrated 60-Minute Daily Gurukul ritual.<br><br>We invite you to experience this in our <strong>Free 3-Day Live Demo</strong> with Master Mentor Dr. Ujwal Vyas, or message our admissions desk directly for personalized cohort guidance.`;
  }

  // Inject Styles for iOS Fluid Spring Animation & Floating Elements
  function injectStyles() {
    if (document.getElementById('vediq-ai-concierge-styles')) return;
    const style = document.createElement('style');
    style.id = 'vediq-ai-concierge-styles';
    style.innerHTML = `
      :root {
        --ios-spring: cubic-bezier(0.32, 0.72, 0, 1);
        --ios-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      #vediqAiFloatingBadge {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, opacity 0.25s ease;
        will-change: transform;
      }
      #vediqAiFloatingBadge:hover {
        transform: translateY(-5px) scale(1.03);
        box-shadow: 0 16px 36px -6px rgba(200, 109, 36, 0.35), 0 0 1px 1px rgba(200, 109, 36, 0.3);
      }
      #vediqAiFloatingBadge:active {
        transform: scale(0.92);
      }
      #vediqAiChatWindow {
        transition: transform 0.42s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.28s ease, visibility 0.28s;
        will-change: transform, opacity;
        transform-origin: bottom right;
      }
      #vediqAiChatWindow.chat-open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
      }
      #vediqAiChatWindow.chat-closed {
        transform: scale(0.12) translate(50px, 50px);
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
      }
      .ai-chat-bubble {
        animation: iosBubbleIn 0.3s var(--ios-spring) forwards;
      }
      @keyframes iosBubbleIn {
        from { opacity: 0; transform: translateY(12px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  // Inject Floating Widget DOM Elements
  function injectWidgetDOM() {
    if (document.getElementById('vediqAiFloatingContainer')) return;

    const container = document.createElement('div');
    container.id = 'vediqAiFloatingContainer';
    container.innerHTML = `
      <!-- 1. Floating Collapsed Badge (Pulsing Gurukul Lamp + Live Status - Stacked Safely Above Bottom Bars) -->
      <div id="vediqAiFloatingBadge" onclick="window.toggleVediqAiChat(true)" class="fixed bottom-20 lg:bottom-22 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-950 text-white shadow-2xl border border-amber-500/40 cursor-pointer backdrop-blur-md">
        <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-brand-ochre to-amber-400 text-white text-sm shadow-sm">
          🪔
          <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse"></span>
        </div>
        <div class="text-left pr-1">
          <div class="text-[11px] font-bold text-white flex items-center gap-1.5 leading-none">
            <span>VedIQ AI Desk</span>
            <span class="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold uppercase">Live</span>
          </div>
          <div class="text-[9px] text-amber-300 font-medium mt-1 leading-none">Ask doubts &amp; assistance &rarr;</div>
        </div>
      </div>

      <!-- 2. Expanded Floating Chat Window (Apple iOS Spring Bubble) -->
      <div id="vediqAiChatWindow" class="chat-closed fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 w-[94vw] max-w-[390px] h-[550px] max-h-[84vh] bg-white rounded-3xl border border-brand-border shadow-2xl flex flex-col overflow-hidden">
        
        <!-- Header -->
        <div class="px-4 py-3.5 bg-brand-ink text-white flex items-center justify-between border-b border-brand-borderDark shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-brand-ochre text-white flex items-center justify-center text-sm font-bold shadow-xs">
              🪔
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider">VedIQ AI Concierge</h3>
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p class="text-[10px] text-brand-gold">Instant Vedic &amp; Admission Resolution</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="window.triggerVediqEscalation()" class="px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap" title="Directly escalate to Support Desk">
              <span>🚨 Escalate to Support Desk</span>
            </button>
            <button type="button" onclick="window.toggleVediqAiChat(false)" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center transition cursor-pointer" title="Close Chat">
              ✕
            </button>
          </div>
        </div>

        <!-- Quick Suggestion Topic Chips -->
        <div class="px-3 py-2 bg-brand-cream/80 border-b border-brand-border flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 no-scrollbar">
          <button type="button" onclick="window.askVediqAiFromWidget('What is the 60-minute daily Gurukul routine?')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[11px] font-semibold text-brand-ink transition shrink-0 cursor-pointer shadow-2xs">
            ⏰ 60-Min Routine
          </button>
          <button type="button" onclick="window.askVediqAiFromWidget('How does Tratak reduce screen addiction?')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[11px] font-semibold text-brand-ink transition shrink-0 cursor-pointer shadow-2xs">
            🎯 Tratak Focus
          </button>
          <button type="button" onclick="window.askVediqAiFromWidget('What are the tuition fees and demo class details?')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[11px] font-semibold text-brand-ink transition shrink-0 cursor-pointer shadow-2xs">
            💳 Fees &amp; Demo
          </button>
          <button type="button" onclick="window.askVediqAiFromWidget('How do I log into the Parent Portal?')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[11px] font-semibold text-brand-ink transition shrink-0 cursor-pointer shadow-2xs">
            👨‍👩‍👧 Parent Portal
          </button>
        </div>

        <!-- Chat Conversation Scroll Area -->
        <div id="vediqWidgetChatLog" class="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-white to-brand-cream/30 text-xs">
          <!-- Initial Welcome Message -->
          <div class="flex items-start gap-2">
            <div class="w-6 h-6 rounded-lg bg-brand-ochre text-white flex items-center justify-center text-xs shrink-0 font-bold">🪔</div>
            <div class="max-w-[88%] p-3 rounded-2xl rounded-tl-xs bg-brand-cream border border-brand-border text-brand-ink text-xs space-y-1.5 leading-relaxed shadow-2xs">
              <p class="font-bold text-brand-ochre text-[11px]">Namaste! Welcome to VedIQ Support Desk.</p>
              <p>I am your 24/7 Gurukul AI Concierge. Ask me anything about our 3-Day Demo, 60-minute daily routine, Tratak focus drills, or parent portal.</p>
            </div>
          </div>
        </div>

        <!-- Chat Input Form -->
        <form onsubmit="window.handleVediqWidgetSubmit(event)" class="p-2.5 bg-white border-t border-brand-border flex items-center gap-2 shrink-0">
          <input type="text" id="vediqWidgetInput" placeholder="Type your doubt or question..." class="flex-1 px-3 py-2 rounded-xl border border-brand-border bg-brand-cream/40 focus:bg-white text-xs font-semibold text-brand-ink focus:outline-none focus:border-brand-ochre" />
          <button type="submit" class="px-3.5 py-2 bg-brand-ochre hover:bg-brand-ochreHover text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 shrink-0 cursor-pointer">
            <span>Send</span>
            <span>&rarr;</span>
          </button>
        </form>

      </div>
    `;
    document.body.appendChild(container);
  }

  // Toggle Window
  window.toggleVediqAiChat = function (open) {
    const win = document.getElementById('vediqAiChatWindow');
    const badge = document.getElementById('vediqAiFloatingBadge');
    if (!win) return;

    if (open) {
      win.classList.remove('chat-closed');
      win.classList.add('chat-open');
      if (badge) badge.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        const inp = document.getElementById('vediqWidgetInput');
        if (inp) inp.focus();
      }, 250);
    } else {
      win.classList.remove('chat-open');
      win.classList.add('chat-closed');
      if (badge) badge.classList.remove('opacity-0', 'pointer-events-none');
    }
  };

  // Quick Ask Helper
  window.askVediqAiFromWidget = function (query) {
    const inp = document.getElementById('vediqWidgetInput');
    if (inp) inp.value = query;
    window.handleVediqWidgetSubmit(new Event('submit'));
  };

  // Append user bubble in widget
  function appendWidgetUser(text) {
    const log = document.getElementById('vediqWidgetChatLog');
    if (!log) return;
    const div = document.createElement('div');
    div.className = "flex items-start justify-end gap-2 ai-chat-bubble";
    div.innerHTML = `
      <div class="max-w-[85%] p-3 rounded-2xl rounded-tr-xs bg-brand-ink text-white text-xs leading-relaxed shadow-xs">
        ${text}
      </div>
      <div class="w-6 h-6 rounded-lg bg-brand-slate text-brand-gold flex items-center justify-center text-xs shrink-0 font-bold">👤</div>
    `;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  // Append AI indicator in widget
  function appendWidgetTyping() {
    const log = document.getElementById('vediqWidgetChatLog');
    if (!log) return;
    const div = document.createElement('div');
    div.id = "vediqWidgetTyping";
    div.className = "flex items-start gap-2 ai-chat-bubble";
    div.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-brand-ochre text-white flex items-center justify-center text-xs shrink-0 font-bold">🪔</div>
      <div class="p-2.5 rounded-2xl rounded-tl-xs bg-brand-cream border border-brand-border text-brand-muted text-xs flex items-center gap-1.5 shadow-2xs">
        <span class="w-1.5 h-1.5 rounded-full bg-brand-ochre animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-brand-ochre animate-bounce" style="animation-delay: 0.15s"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-brand-ochre animate-bounce" style="animation-delay: 0.3s"></span>
        <span class="ml-1 font-semibold text-[10px] text-brand-ink">Gurukul AI is answering...</span>
      </div>
    `;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function removeWidgetTyping() {
    const el = document.getElementById('vediqWidgetTyping');
    if (el) el.remove();
  }

  // Append AI message in widget
  function appendWidgetAi(html, showFeedback = true, rawQuery = "") {
    removeWidgetTyping();
    const log = document.getElementById('vediqWidgetChatLog');
    if (!log) return;

    let feedbackHtml = '';
    if (showFeedback) {
      feedbackHtml = `
        <div class="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[10px] text-brand-muted">
          <span>Was this helpful?</span>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="this.parentElement.innerHTML='<span class=\\'text-emerald-700 font-bold\\'>✓ Thank you!</span>'" class="hover:text-emerald-700 font-bold cursor-pointer">👍 Yes</button>
            <span>•</span>
            <button type="button" onclick="window.triggerVediqEscalation('${encodeURIComponent(rawQuery)}')" class="hover:text-rose-600 font-semibold cursor-pointer">👎 No, Escalate to Support Desk</button>
          </div>
        </div>
      `;
    }

    const div = document.createElement('div');
    div.className = "flex items-start gap-2 ai-chat-bubble";
    div.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-brand-ochre text-white flex items-center justify-center text-xs shrink-0 font-bold">🪔</div>
      <div class="max-w-[88%] p-3 rounded-2xl rounded-tl-xs bg-brand-cream border border-brand-border text-brand-ink text-xs space-y-2 leading-relaxed shadow-2xs">
        <div>${html}</div>
        ${feedbackHtml}
      </div>
    `;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  // Escalation Handler (Triggered ONLY on explicit user dissatisfaction / request)
  window.triggerVediqEscalation = function (customReason = "") {
    const ticketId = "VED-SUP-" + Math.floor(1000 + Math.random() * 9000);
    const reasonText = customReason ? decodeURIComponent(customReason) : "Parent inquiry unresolved by AI";

    // Dispatch background ticket to official inbox
    try {
      fetch("https://formsubmit.co/ajax/myvediqacademy@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `🚨 [SUPPORT DESK TICKET ${ticketId}] Issue Escalated`,
          ticket_id: ticketId,
          issue_summary: reasonText,
          timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          official_desk: "myvediqacademy@gmail.com"
        })
      }).catch(() => {});
    } catch (e) {}

    const escalationHtml = `
      <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-left">
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">Escalation Ticket</span>
          <span class="font-mono text-xs font-bold text-rose-800">${ticketId}</span>
        </div>
        <h4 class="font-bold text-xs text-rose-950">Connecting You to Official Support Desk</h4>
        <p class="text-[11px] text-rose-900 leading-snug">
          Your issue has been logged to <strong>myvediqacademy@gmail.com</strong>. Our Master Mentors Dr. Ujwal Vyas, Mr. Atish Gulhane &amp; Mr. Swagatam Shukla are directly notified.
        </p>
        <div class="pt-1 flex flex-col gap-1.5">
          <a href="https://wa.me/919766772819?text=Namaste!%20My%20ticket%20is%20${ticketId}.%20Issue:%20${encodeURIComponent(reasonText)}" target="_blank" class="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1.5">
            <span>💬 Message Support Desk on WhatsApp &rarr;</span>
          </a>
          <a href="mailto:myvediqacademy@gmail.com?subject=Ticket%20${ticketId}&body=Hello%20VedIQ%20Support%20Desk,%0A%0ATicket:%20${ticketId}%0AQuery:%20${encodeURIComponent(reasonText)}" class="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 font-bold text-[10px] transition text-center">
            ✉️ Email Support Desk
          </a>
        </div>
      </div>
    `;

    appendWidgetAi(escalationHtml, false);
  };

  // Submit Handler for Widget
  window.handleVediqWidgetSubmit = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const inp = document.getElementById('vediqWidgetInput');
    if (!inp) return;
    const raw = inp.value.trim();
    if (!raw) return;
    inp.value = '';

    appendWidgetUser(raw);

    // Check if user is explicitly saying to escalate
    const lower = raw.toLowerCase();
    const explicitWords = [
      'not solved', 'did not solve', "didn't solve", 'useless', 'not working',
      'talk to human', 'human', 'talk to someone', 'call me', 'complaint',
      'refund', 'escalate', 'fraud', 'worst'
    ];
    if (explicitWords.some(w => lower.includes(w))) {
      appendWidgetTyping();
      setTimeout(() => {
        removeWidgetTyping();
        window.triggerVediqEscalation(raw);
      }, 400);
      return;
    }

    appendWidgetTyping();
    const reply = await generateAiResponse(raw);
    appendWidgetAi(reply, true, raw);
  };

  // Expose global answer generator so in-page chat in index.html can also use it
  window.vediqGenerateAiAnswer = generateAiResponse;

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectStyles();
      injectWidgetDOM();
    });
  } else {
    injectStyles();
    injectWidgetDOM();
  }

})();
