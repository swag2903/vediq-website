/**
 * VedIQ Academy — Universal 24/7 AI Concierge & Smart Support Desk Engine
 * High-Performance, Apple iOS Spring Fluid Animated Floating Widget
 * Multi-turn Conversation Context + Live Google Gemini 1.5 Flash Integration
 * Deployed universally across index.html, parent.html & teacher.html
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__VEDIQ_AI_CONCIERGE_LOADED__) return;
  window.__VEDIQ_AI_CONCIERGE_LOADED__ = true;

  // Multi-Turn Conversation History (Maintains context across follow-up questions)
  const conversationHistory = [];

  // Comprehensive Conversational Intelligence Matrix (Zero-Failure Verified Knowledge)
  const CONVERSATIONAL_BRAIN = [
    {
      keywords: [
        'sign in', 'signin', 'sign-in', 'login', 'log in', 'log-in',
        'no sign-in', 'no sign in', 'dont have sign in', "don't have a sign-in",
        'cannot sign in', 'cant sign in', 'unable to sign in',
        'where to login', 'how to login', 'where is login', 'portal link',
        'parent login', 'open portal', 'dashboard access', 'login option', 'account open',
        'login nahi', 'khul nahi raha', 'sign in option'
      ],
      answer: `🛡️ <strong>Parent Portal Sign-In &amp; Access Guide:</strong><br><br>
        You can access the official Parent Portal directly at <a href="parent.html" class="text-brand-ochre font-bold underline">vediqacademy.com/parent.html</a>.<br><br>
        <strong>Available Sign-In Options:</strong><br>
        • <strong>⚡ 1-Click Google Sign-In (Recommended):</strong> Click <em>"Continue with Google"</em> for instant login without needing any password or waiting for an OTP.<br>
        • <strong>🔑 Password Login:</strong> Enter your registered email or phone and password.<br>
        • <strong>✉️ Email OTP:</strong> Request an instant 6-digit verification code sent directly to your inbox.<br>
        • <strong>📝 New to VedIQ?</strong> Click the <strong>"Sign Up / Register"</strong> tab on <a href="parent.html" class="text-brand-ochre font-bold underline">parent.html</a> to create your parent account in 30 seconds.<br><br>
        <a href="parent.html" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-ochre text-white font-bold text-xs shadow-xs hover:bg-brand-ochreHover transition">
          🚀 Open Parent Portal Sign-In Screen &rarr;
        </a>`
    },
    {
      keywords: ['otp nahi', 'otp not', 'no otp', 'receive otp', 'get otp', 'code not', 'waiting for otp', 'resend code', 'otp error', 'sms not'],
      answer: `🔐 <strong>Troubleshooting OTP Delivery:</strong><br><br>
        1. <strong>Email OTP:</strong> Please check your <em>Spam / Junk</em> or <em>Promotions</em> folder for an email from <strong>VedIQ Academy</strong>. The 6-digit code expires in 2 minutes.<br>
        2. <strong>Mobile OTP:</strong> Ensure you entered your 10-digit Indian mobile number without +91 or 0.<br>
        3. <strong>Instant 1-Click Alternative (No Waiting):</strong> On <a href="parent.html" class="text-brand-ochre font-bold underline">parent.html</a>, click <strong>"Continue with Google"</strong> to log into your child's dashboard immediately without waiting for an OTP!<br><br>
        Need immediate mentor assistance? Click <a href="https://wa.me/918390332500?text=Namaste%20VedIQ!%20I%20am%20facing%20an%20OTP%20issue." target="_blank" class="text-emerald-700 font-bold underline">WhatsApp Support Desk (+91 8390332500)</a>.`
    },
    {
      keywords: ['forgot password', 'reset password', 'change password', 'wrong password', 'incorrect password', 'password bhul gaya'],
      answer: `🔑 <strong>How to Reset Your Password:</strong><br><br>
        1. Go to <a href="parent.html" class="text-brand-ochre font-bold underline">parent.html</a>.<br>
        2. Click <button type="button" onclick="window.openForgotPasswordModal ? window.openForgotPasswordModal() : (window.location.href='parent.html')" class="text-brand-ochre font-bold underline cursor-pointer">Forgot password?</button> just below the password box.<br>
        3. Enter your registered email address to receive an official Google Firebase password reset link.<br>
        4. Alternatively, you can always sign in instantly using <strong>"Continue with Google"</strong> with zero password required.`
    },
    {
      keywords: ['register', 'registration', 'sign up', 'signup', 'create account', 'enroll', 'enrol', 'enrollment', 'admit', 'admission', 'admission process', 'how to register', 'register child', 'join gurukul', 'kaise register'],
      answer: `📝 <strong>How to Register &amp; Enroll Your Child:</strong><br><br>
        1. <strong>Book a Free 3-Day Live Demo:</strong> Experience 3 live interactive sessions with Head Master Mentor Dr. Ujwal Vyas at zero payment by clicking <a href="/#plans" class="text-brand-ochre font-bold underline">Book Free Demo</a>.<br><br>
        2. <strong>Direct Parent Portal Registration:</strong> Go to <a href="parent.html" class="text-brand-ochre font-bold underline">parent.html</a> and click the <strong>"Sign Up / Register"</strong> tab at the top. Enter Parent Name, Child's Name, Age Cohort, Mobile number, and a Password.<br><br>
        3. <strong>Instant Student ID Activation:</strong> Your child is assigned their unique Student ID and your dashboard opens immediately!<br><br>
        For direct guidance, chat with our admissions desk on <a href="https://wa.me/918390332500?text=Namaste%20VedIQ!%20I%20want%20to%20register%20my%20child." target="_blank" class="text-emerald-700 font-bold underline">WhatsApp (+91 8390332500)</a>.`
    },
    {
      keywords: ['hello', 'hi', 'hey', 'namaste', 'pranam', 'pranaam', 'good morning', 'good evening', 'good afternoon', 'hola', 'radhe', 'ram ram', 'namaskar', 'halo', 'helo', 'greetings'],
      answer: "🙏 <strong>Namaste! Warm welcome to VedIQ Academy.</strong><br><br>I am your 24/7 Gurukul AI Concierge. How may I assist you and your child today?<br><br>Feel free to ask about our <strong>Free 3-Day Live Demo</strong>, the <strong>60-Minute Daily Routine</strong>, how <strong>Tratak</strong> eliminates mobile screen addiction, <strong>Vedic Maths</strong>, <strong>Tuition Fees</strong>, or the <strong>Parent Portal</strong>."
    },
    {
      keywords: ['who are you', 'koun ho', 'kya ho', 'what is this', 'about', 'vediq kya hai', 'vediq academy kya hai', 'what is vediq', 'founders', 'founder', 'who founded'],
      answer: "🪔 <strong>VedIQ Academy (Bharatiya Integral Gurukul System):</strong><br>VedIQ Academy is India's premier scientific + Vedic brain development system for children aged 5 to 15, founded by <strong>Dr. Ujwal Vyas</strong> (Head Master Mentor), <strong>Mr. Atish Gulhane</strong> (Admissions & Ops), and <strong>Mr. Swagatam Shukla</strong>.<br><br>In just <strong>1 hour daily</strong>, we replace screen addiction, distraction, and math fear with unbroken focus, memory mastery, and cultural sanskar through live micro-batches (strict 1:8 mentor ratio)."
    },
    {
      keywords: ['tratak', 'focus', 'concentration', 'screen', 'phone', 'mobile', 'addiction', 'distract', 'attention', 'dhyan', 'padhai', 'padhta nahi', 'bhatakta'],
      answer: "🎯 <strong>Tratak Neuro-Science &amp; Screen Detox:</strong><br>Modern short-form videos flood children's developing brains with dopamine spikes every 4 seconds, causing micro-saccadic eye jitter that fragments their prefrontal cortex attention span.<br><br>During our daily 10-minute steady-gaze Tratak practice, optical nerves are stabilized, activating alpha brainwaves (8–12 Hz). Within 30 days, parents observe their child's continuous deep study span expanding from 10 minutes to <strong>45+ minutes</strong> with natural calm."
    },
    {
      keywords: ['routine', '60 min', '1 hour', 'schedule', 'kya sikhate', 'daily', 'protocol', 'stages'],
      answer: "⏰ <strong>The Calibrated 60-Minute Daily Gurukul Routine:</strong><br>• <strong>00–10m (Pranayama &amp; Breathwork):</strong> Vagus nerve reset to eliminate physical restlessness.<br>• <strong>10–20m (Tratak Flame Fixation):</strong> Reverses digital screen fatigue &amp; doubles deep focus.<br>• <strong>20–35m (Vedic Physics &amp; Panchatatva):</strong> Experiential understanding of nature, elements &amp; astronomy.<br>• <strong>35–50m (Vedic Mental Math):</strong> 16 sutras for 3-second lightning mental calculations.<br>• <strong>50–60m (Gita Sanskar &amp; Gratitude Journal):</strong> Character fortitude &amp; emotional grounding."
    },
    {
      keywords: ['fee', 'fees', 'cost', 'price', 'plan', 'tuition', 'kitna', 'charge', 'rate', 'payment'],
      answer: "💳 <strong>Simple, Transparent Tuition Plans (No Hidden Fees):</strong><br>• <strong>Basic Plan:</strong> ₹999 / month (Daily 1-hour live sessions + app portal)<br>• <strong>Standard Plan (Recommended):</strong> ₹1,499 / month (Includes physical workbook kit sent home + micro-batch of max 8 students)<br>• <strong>Premium Immersion:</strong> ₹2,499 / month (1-on-1 mentorship &amp; leadership bootcamps)<br><br>🛡️ <strong>14-Day 100% Money-Back Guarantee:</strong> Try live classes with zero risk. All UPI, cards, and netbanking accepted."
    },
    {
      keywords: ['demo', 'free class', 'trial', 'book', '3 day', 'experience', 'slot'],
      answer: "🌟 <strong>Free 3-Day Live Gurukul Demo:</strong><br>Experience 3 full days of live 1-hour Gurukul sessions with Master Mentor Dr. Ujwal Vyas with zero payment! Simply click <button onclick='window.openDemoModal ? window.openDemoModal() : window.location.href=\"/#plans\"' class='text-brand-ochre font-bold underline cursor-pointer'>Book Free 3-Day Demo</button> to reserve your child's micro-batch slot."
    },
    {
      keywords: ['parent', 'portal', 'dashboard', 'report', 'student id', 'app', 'attendance', 'tratak timer'],
      answer: "👨‍👩‍👧 <strong>Parent Progress Portal (24/7 Live):</strong><br>Track your child's Tratak gaze seconds, daily habit streaks, mental math velocity, certified report cards, and recorded course videos.<br><br>Visit <a href='parent.html' class='text-brand-ochre font-bold underline'>vediqacademy.com/parent.html</a> to sign in with Google 1-Click, Email OTP, or password."
    },
    {
      keywords: ['math', 'vedic math', 'calculation', 'speed', 'formula', 'sutra', 'hisab'],
      answer: "🧠 <strong>Vedic Mental Mathematics:</strong><br>Instead of painful long division and mechanical steps, we teach the 16 sacred Vedic Sutras (such as <em>Ekadhikena Purvena</em> and <em>Nikhilam</em>). Children calculate 3-digit multiplications, squares, and percentages mentally in 3 to 5 seconds without paper, boosting mathematical confidence tenfold!"
    },
    {
      keywords: ['age', 'cohort', '5-7', '8-11', '12-15', 'batch', 'time', 'timing', 'foundation', 'pravesh', 'daksha'],
      answer: "📅 <strong>Age Cohorts &amp; Live Batch Timings (Mon–Fri, Strict 1:8 Ratio):</strong><br>• <strong>Foundation (Ages 5–7):</strong> 4:00 PM – 5:00 PM IST<br>• <strong>Pravesh (Ages 8–11):</strong> 5:00 PM – 6:00 PM IST<br>• <strong>Daksha (Ages 12–15):</strong> 6:00 PM – 7:00 PM IST<br><br>All classes are live interactive on Zoom with personalized attention."
    },
    {
      keywords: ['teacher', 'mentor console', 'faculty', 'login teacher', 'teacher login', 'teacher portal', 'staff login', 'faculty login'],
      answer: "🔐 <strong>Teacher &amp; Master Mentor Console:</strong><br>Mentors can securely access student progress dashboards, Tratak calibration, video CMS, and class evaluations at <a href='teacher.html' class='text-brand-ochre font-bold underline'>vediqacademy.com/teacher.html</a> using verified faculty credentials."
    }
  ];

  // Configurable backend endpoint for Serverless Functions (Vercel)
  const VEDIQ_BACKEND_URL = (window.location.hostname.includes("vediqacademy.com") || window.location.hostname.includes("github.io"))
    ? "https://vediq-website-three.vercel.app"
    : "";

  /**
   * Live Gemini AI Query with Multi-Turn Context
   */
  async function queryLiveGeminiAi(prompt) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout for reliable AI generation
      
      const resp = await fetch(VEDIQ_BACKEND_URL + '/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: prompt,
          history: conversationHistory.slice(-8)
        })
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json().catch(() => ({}));
        if (data && data.ok && data.answer) {
          // Record successful turn in conversation history for multi-turn follow-ups!
          conversationHistory.push({ role: 'user', text: prompt });
          conversationHistory.push({ role: 'model', text: data.rawText || data.answer });
          return {
            isLiveAi: true,
            answer: data.answer
          };
        } else if (data && data.error === 'GEMINI_API_KEY_NOT_CONFIGURED') {
          return {
            isLiveAi: false,
            errorType: 'KEY_NOT_CONFIGURED',
            message: data.message
          };
        } else if (data && data.error) {
          return {
            isLiveAi: false,
            errorType: data.error,
            message: data.message
          };
        }
      }
    } catch (e) {
      console.warn("Live Gemini function notice:", e);
      return {
        isLiveAi: false,
        errorType: 'NETWORK_TIMEOUT',
        message: e.message
      };
    }
    return { isLiveAi: false, errorType: 'UNKNOWN' };
  }

  /**
   * Intelligent Answer Engine:
   * Prioritizes live Gemini with multi-turn conversation memory.
   * If Gemini API Key is missing or unavailable, shows clear notice and exact verified knowledge.
   */
  async function generateAiResponse(query) {
    const clean = query.trim().toLowerCase();

// 1. Query Live Gemini First with multi-turn history
    const geminiResult = await queryLiveGeminiAi(query);
    if (geminiResult && geminiResult.isLiveAi) {
      return geminiResult.answer;
    }

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

    const verifiedAnswer = (best && maxMatches > 0)
      ? best.answer
      : `🙏 Regarding <strong>"${query}"</strong>:<br><br>At VedIQ Academy, our core mission is developing lifelong focus, speed calculation, and emotional resilience in children (ages 5–15) through our calibrated 60-Minute Daily Gurukul routine.<br><br>• <strong>Free 3-Day Live Demo:</strong> Experience 3 live interactive sessions with Head Master Mentor Dr. Ujwal Vyas by clicking <a href="/#plans" class="text-brand-ochre font-bold underline">Book Free Demo</a>.<br>• <strong>Parent Portal:</strong> Access child scores, Tratak timers, and reports at <a href="parent.html" class="text-brand-ochre font-bold underline">vediqacademy.com/parent.html</a>.<br>• <strong>Mentor Desk:</strong> For immediate personal assistance, message our team on <a href="https://wa.me/918390332500" target="_blank" class="text-emerald-700 font-bold underline">WhatsApp (+91 8390332500)</a>.`;

    // 3. Meaningful Error Transparency (Requirement 9)
    if (geminiResult && geminiResult.errorType === 'KEY_NOT_CONFIGURED') {
      return `
        <div class="space-y-2.5">
          <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
            <strong>⚙️ Live Gemini AI Notice:</strong> The Academic Advisor engine is currently waiting for <code>GEMINI_API_KEY</code> in Vercel environment variables. Verified knowledge answered below:
          </div>
          <div>${verifiedAnswer}</div>
        </div>
      `;
    }

    return verifiedAnswer;
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
            <button type="button" onclick="window.triggerVediqEscalation()" title="Escalate to Support Desk" class="px-2 py-1 rounded-lg bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-white text-[10px] font-bold transition cursor-pointer">
              🚨 Escalate
            </button>
            <button type="button" onclick="window.toggleVediqAiChat(false)" class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center transition cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        <!-- Chat History Log -->
        <div id="vediqWidgetChatLog" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-white to-brand-cream/30 text-xs">
          <!-- Initial Welcome Message -->
          <div class="flex items-start gap-2 ai-chat-bubble">
            <div class="w-6 h-6 rounded-lg bg-brand-ochre text-white flex items-center justify-center text-xs shrink-0 font-bold">🪔</div>
            <div class="max-w-[88%] p-3 rounded-2xl rounded-tl-xs bg-brand-cream border border-brand-border text-brand-ink text-xs space-y-2 leading-relaxed shadow-2xs">
              <p>🙏 <strong>Namaste! Welcome to VedIQ Gurukul Support Desk.</strong></p>
              <p class="text-brand-muted text-[11px]">I am your 24/7 Academic AI Advisor. Ask me anything about our 60-Minute routine, Tratak focus science, Vedic Math, Parent Portal sign-in, or admission fees.</p>
              
              <!-- Quick Pill Shortcuts -->
              <div class="pt-1.5 flex flex-wrap gap-1.5">
                <button type="button" onclick="window.askVediqAiFromWidget('I cannot sign in')" class="px-2.5 py-1 rounded-full bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[10px] font-bold text-brand-ochre transition shadow-2xs cursor-pointer">
                  🔑 Parent Sign-In Help
                </button>
                <button type="button" onclick="window.askVediqAiFromWidget('How to register child')" class="px-2.5 py-1 rounded-full bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[10px] font-bold text-brand-ochre transition shadow-2xs cursor-pointer">
                  📝 Enroll / Register
                </button>
                <button type="button" onclick="window.askVediqAiFromWidget('What is the daily routine?')" class="px-2.5 py-1 rounded-full bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[10px] font-bold text-brand-ink transition shadow-2xs cursor-pointer">
                  ⏰ 60-Min Routine
                </button>
                <button type="button" onclick="window.askVediqAiFromWidget('What are the tuition fees?')" class="px-2.5 py-1 rounded-full bg-white hover:bg-brand-ochre hover:text-white border border-brand-border text-[10px] font-bold text-brand-ink transition shadow-2xs cursor-pointer">
                  💳 Tuition Fees
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input Form -->
        <form onsubmit="window.handleVediqWidgetSubmit(event)" class="p-2.5 sm:p-3 bg-white border-t border-brand-border flex items-center gap-2 shrink-0">
          <input type="text" id="vediqWidgetInput" placeholder="Ask about login, fees, routines..." class="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-cream/40 focus:bg-white text-xs font-semibold text-brand-ink focus:outline-none focus:border-brand-ochre transition shadow-2xs" />
          <button type="submit" class="w-10 h-10 rounded-xl bg-brand-ochre hover:bg-brand-ochreHover text-white flex items-center justify-center text-sm font-bold transition shadow-xs cursor-pointer shrink-0">
            ➤
          </button>
        </form>

      </div>
    `;
    document.body.appendChild(container);
  }

  // Toggle Chat Window
  window.toggleVediqAiChat = function (open) {
    const win = document.getElementById('vediqAiChatWindow');
    const badge = document.getElementById('vediqAiFloatingBadge');
    if (!win) return;

    if (open) {
      win.classList.remove('chat-closed');
      win.classList.add('chat-open');
      if (badge) badge.style.opacity = '0';
      setTimeout(() => {
        const inp = document.getElementById('vediqWidgetInput');
        if (inp) inp.focus();
      }, 250);
    } else {
      win.classList.remove('chat-open');
      win.classList.add('chat-closed');
      if (badge) badge.style.opacity = '1';
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