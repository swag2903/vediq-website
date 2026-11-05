/**
 * Netlify Serverless Function: Gemini AI Chatbot Handler
 * Securely mediates AI queries to Google Gemini without exposing API keys on the frontend.
 * CORS-enabled for cross-domain GitHub Pages requests.
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

exports.handler = async (event) => {
  const origin = event.headers.origin || "*";
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ fallback: true, message: "GEMINI_API_KEY environment variable not configured" })
      };
    }

    const payload = JSON.parse(event.body || "{}");
    const query = (payload.query || payload.prompt || "").trim();

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Query is required" })
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${GURUKUL_AI_SYSTEM_PROMPT}\n\nParent/User Query: ${query}` }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 350
        }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.warn("Gemini API upstream error:", resp.status, errText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ fallback: true, error: "Upstream AI rate limited or unavailable" })
      };
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || !text.trim()) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ fallback: true })
      };
    }

    const formattedAnswer = text.trim().replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Cache-Control": "public, max-age=60"
      },
      body: JSON.stringify({ answer: formattedAnswer })
    };
  } catch (err) {
    console.error("Gemini function error:", err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ fallback: true, error: err.message })
    };
  }
};
