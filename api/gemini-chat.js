/**
 * Serverless Function: Gemini AI Chatbot Handler
 * Supports multi-turn conversation history, robust system instructions,
 * cascading model fallbacks (gemini-3.5-flash-lite, gemini-3.8-flash, gemini-3.6-flash, gemini-2.5-flash),
 * Google Interactions API + generateContent dual support, per-model timeouts, and transparent diagnostics.
 * Compatible with Vercel and Netlify runtime.
 */

const GURUKUL_AI_SYSTEM_PROMPT = `You are the official 24/7 VedIQ Gurukul AI Academic Advisor for VedIQ Academy (vediqacademy.com).
Founders & Leadership:
- Dr. Ujwal Vyas: Co-Founder & Head Master Mentor (Ph.D. / Ayurvedic Scholar).
- Mr. Atish Gulhane: Co-Founder • Admissions & Operations.
- Mr. Swagatam Shukla: Co-Founder.

Core Educational System (Bharatiya Integral Gurukul System - BIGS):
- Focus: India's premier scientific Vedic cognitive development system for children aged 5 to 15.
- 60-Minute Daily Sadhana Routine:
  * 00–10m: Pranayama & Breathwork (vagus nerve stimulation, eliminates physical restlessness).
  * 10–20m: Tratak Steady-Gaze Flame Fixation (reverses mobile screen & dopamine addiction, expands deep study focus from 10 to 45+ minutes with zero eye strain).
  * 20–35m: Panchatatva & Vedic Physics (nature principles, astronomy, element dynamics).
  * 35–50m: Vedic Mental Mathematics (16 sacred sutras like Ekadhikena Purvena for 3-second mental multiplication, squaring, and speed math without paper).
  * 50–60m: Bhagavad Gita Sanskar & Gratitude Journal (moral character, emotional fortitude, sleep hygiene).

Age Cohorts & Live Zoom Batches (Monday to Friday, Strict 1:8 Micro-Batch Ratio):
- Foundation (Ages 5–7): 4:00 PM – 5:00 PM IST
- Pravesh (Ages 8–11): 5:00 PM – 6:00 PM IST
- Daksha (Ages 12–15): 6:00 PM – 7:00 PM IST

Tuition Plans & Fees (14-Day 100% Money-Back Guarantee, NO hidden charges):
- Basic Tier: ₹999 / month (Daily 1-hour live batch + digital portal).
- Standard Tier (Most Popular): ₹1,499 / month (Daily live batch + physical workbook kit delivered home + 1:8 mentor ratio).
- Premium Immersion: ₹2,499 / month (1-on-1 mentorship sessions + leadership masterclasses).
- Free 3-Day Demo: Full 3 live days with Master Mentor Dr. Ujwal Vyas at zero payment.

Navigation & Portal Assistance:
- Parent Portal: Available at vediqacademy.com/parent.html.
  * Instant 1-Click Login: Click "Continue with Google" (no password or OTP required).
  * Email OTP / Password: Enter registered email/phone.
  * Registration: Click the "Sign Up / Register" tab on parent.html to enroll a child.
  * Dashboard features: Tratak gaze timer, math velocity scores, habit streaks, certified report cards, course video recordings, and UPI fee receipts.
- Teacher Console: Available at vediqacademy.com/teacher.html (authorized faculty only).
- Direct Human Support & Admissions Escalation:
  * WhatsApp Admissions: +91 8390332500 / +91 9766772819
  * Official Email: myvediqacademy@gmail.com

Conversational Behavioral Guidelines:
1. GREETINGS: For "Hello", "Hi", "Namaste", "Pranam" or similar, respond warmly, naturally and briefly in 1-2 friendly sentences. Do not dump a giant promotional wall of text on a simple greeting.
2. PORTAL & SIGN-IN QUESTIONS: If user asks about sign-in, cannot login, where is the login button, or OTP issues, guide them directly to vediqacademy.com/parent.html and mention Google 1-Click login as the easiest immediate solution.
3. CONVERSATION CONTEXT: Understand follow-up questions and pronoun references ("how much does that cost?", "what about my 9-year-old?", "can we reschedule?") based on earlier messages in the chat.
4. ACCURACY: NEVER invent or hallucinate discounts, alternate fees, or outside curriculum.
5. TONE: Empathetic, culturally respectful, academically authoritative, and concise (1 to 2 crisp paragraphs, optionally using bullet points for readability). Respond in English or Hinglish matching the user's language.`;

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash"
];

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

    try {
      const rawKey = process.env.GEMINI_API_KEY || "";
      const apiKey = rawKey.trim();

      if (!apiKey) {
        return res.status(200).json({
          ok: false,
          error: "GEMINI_API_KEY_NOT_CONFIGURED",
          message: "Gemini AI API Key is not set in Vercel environment variables."
        });
      }

      const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const query = (payload.query || payload.prompt || payload.message || "").trim();
      const rawHistory = Array.isArray(payload.history) ? payload.history : [];

      if (!query && rawHistory.length === 0) {
        return res.status(400).json({ ok: false, error: "Query is required" });
      }

      // Format conversation history for Gemini API (max last 8 turns)
      const contents = [];
      const historySlice = rawHistory.slice(-8);
      for (const turn of historySlice) {
        const isModel = turn.role === "model" || turn.role === "assistant" || turn.sender === "bot";
        const role = isModel ? "model" : "user";
        const text = (turn.text || turn.content || turn.message || "").trim();
        if (text) {
          contents.push({ role, parts: [{ text }] });
        }
      }

      // Append current user query if not already the last turn
      if (query) {
        if (!contents.length || contents[contents.length - 1].role !== "user" || contents[contents.length - 1].parts[0].text !== query) {
          contents.push({ role: "user", parts: [{ text: query }] });
        }
      }

      const requestBody = {
        system_instruction: {
          parts: [{ text: GURUKUL_AI_SYSTEM_PROMPT }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 600
        }
      };

      let successData = null;
      let successfulModel = null;
      let lastErrorStatus = null;
      let lastErrorBody = null;

      // Cascading model evaluation with 7-second timeout per attempt
      for (const modelName of CANDIDATE_MODELS) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        try {
          const timeoutSignal = (typeof AbortSignal !== "undefined" && AbortSignal.timeout)
            ? AbortSignal.timeout(7000)
            : undefined;

          let resp = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify(requestBody),
            signal: timeoutSignal
          });

          // Fallback if system_instruction rejected by older endpoint proxy
          if (!resp.ok && resp.status === 400) {
            const fallbackContents = contents.map((c, idx) => {
              if (idx === 0 && c.role === "user") {
                return {
                  role: "user",
                  parts: [{ text: `${GURUKUL_AI_SYSTEM_PROMPT}\n\nUser Question: ${c.parts[0].text}` }]
                };
              }
              return c;
            });

            resp = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
              },
              body: JSON.stringify({
                contents: fallbackContents,
                generationConfig: { temperature: 0.65, maxOutputTokens: 600 }
              }),
              signal: timeoutSignal
            });
          }

          if (resp.ok) {
            const data = await resp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              successData = text.trim();
              successfulModel = modelName;
              break;
            }
          } else {
            lastErrorStatus = resp.status;
            lastErrorBody = await resp.text().catch(() => "");
            console.warn(`Model ${modelName} (:generateContent) returned status ${resp.status}`);

            // If 404 or 400, also try the Google Interactions API endpoint for Gemini 3
            if (resp.status === 404 || resp.status === 400) {
              try {
                const interactionsResp = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                  },
                  body: JSON.stringify({
                    model: modelName,
                    system_instruction: { parts: [{ text: GURUKUL_AI_SYSTEM_PROMPT }] },
                    input: query
                  }),
                  signal: timeoutSignal
                });

                if (interactionsResp.ok) {
                  const intData = await interactionsResp.json();
                  const intText = intData.steps?.[0]?.content?.[0]?.text || intData.output?.text;
                  if (intText && intText.trim()) {
                    successData = intText.trim();
                    successfulModel = `${modelName}-interactions`;
                    break;
                  }
                }
              } catch (intErr) {
                // Ignore interactions fallback error
              }
            }
          }
        } catch (callErr) {
          lastErrorBody = callErr.message;
          console.warn(`Model ${modelName} fetch notice:`, callErr.message);
        }
      }

      if (!successData) {
        console.error("All Gemini candidate models failed. Last error:", lastErrorStatus, lastErrorBody);
        return res.status(200).json({
          ok: false,
          error: "UPSTREAM_GEMINI_ERROR",
          status: lastErrorStatus || 502,
          message: "Google Gemini API upstream failure.",
          details: lastErrorBody
        });
      }

      // Clean format with safe HTML line breaks and bold tags
      const formattedAnswer = successData
        .replace(/\n\n+/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      res.setHeader("Cache-Control", "no-cache");
      return res.status(200).json({
        ok: true,
        answer: formattedAnswer,
        rawText: successData,
        model: successfulModel
      });
    } catch (err) {
      console.error("Gemini serverless function exception:", err);
      return res.status(200).json({
        ok: false,
        error: "SERVERLESS_EXCEPTION",
        message: err.message || "Internal serverless execution failure"
      });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
