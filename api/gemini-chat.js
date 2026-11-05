/**
 * Serverless Function: Gemini AI Chatbot Handler
 * Supports both Vercel and Netlify runtime.
 */

const GURUKUL_AI_SYSTEM_PROMPT = `You are the official 24/7 VedIQ Gurukul AI Academic Advisor for VedIQ Academy (co-founded by Dr. Ujwal Vyas, Mr. Atish Gulhane, Mr. Swagatam Shukla).
VedIQ Academy is India's premier Bharatiya Integral Gurukul System for children aged 5–15.
Key Facts:
- 60-Minute Daily Routine: 10m Pranayama (vagus nerve / calming), 10m Tratak steady-gaze flame fixation (reverses screen & dopamine addiction, expands deep focus from 10 to 45+ min), 15m Panchatatva Vedic physics & astronomy, 15m Vedic Mental Math (16 sutras for 3-sec mental calculations), 10m Bhagavad Gita sanskar, sleep & gratitude journal.
- Micro-Batch Mentorship: Strict 1:8 student-to-mentor ratio.
- Age Cohorts: Ages 5–7 (Foundation), Ages 8–11 (Pravesh), Ages 12–15 (Daksha).
- Tuition: Basic ₹999/mo, Standard ₹1,499/mo (includes physical workbook), Premium ₹2,499/mo. 14-day 100% money-back guarantee.
- Free 3-Day Demo: Live classes with Master Mentor Dr. Ujwal Vyas at zero cost.
- Parent Portal: Available at parent.html with Tratak gaze timers, math velocity analytics, and mentor feedback.
- Teacher Console: Available at teacher.html.
- Official Email: myvediqacademy@gmail.com.
Respond empathetically, thoughtfully, and educationally with scientific and Vedic depth. Write 1 to 2 crisp, inspiring paragraphs. Reply in English or Hinglish matching the user's prompt.`;

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ fallback: true, message: "GEMINI_API_KEY environment variable not configured" });
      }

      const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const query = (payload.query || payload.prompt || "").trim();

      if (!query) return res.status(400).json({ error: "Query is required" });

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${GURUKUL_AI_SYSTEM_PROMPT}\n\nParent/User Query: ${query}` }] }],
          generationConfig: { temperature: 0.65, maxOutputTokens: 350 }
        })
      });

      if (!resp.ok) {
        return res.status(200).json({ fallback: true, error: "Upstream AI rate limited" });
      }

      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text || !text.trim()) return res.status(200).json({ fallback: true });

      const formattedAnswer = text.trim().replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      res.setHeader("Cache-Control", "public, max-age=60");
      return res.status(200).json({ answer: formattedAnswer });
    } catch (err) {
      return res.status(200).json({ fallback: true, error: err.message });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
