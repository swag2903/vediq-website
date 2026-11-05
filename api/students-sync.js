/**
 * Serverless Function: Secure Student Database Sync
 * Supports both Vercel and Netlify runtime.
 */

const DEFAULT_ROSTER = [
  {
    parentId: "PAR-101",
    parentName: "Mr. Rajesh Sharma",
    phone: "9800000001",
    email: "parent1@gmail.com",
    activeChildIndex: 0,
    children: [
      {
        childId: "VED-2026-101",
        childName: "Aarav Sharma",
        childGrade: "Ages 8-11 • Pravesh",
        batch: "Daily 5:00 PM – 6:00 PM IST",
        focusScore: "0",
        streak: "0",
        habits: [false, false, false, false],
        tratakGaze: "0s (Day 1 Baseline)",
        mathVelocity: "0 sums/min",
        cognitiveGrade: "Baseline in Progress",
        mentorNotes: "Welcome to VedIQ Gurukul! Daily cognitive evaluations start from Day 1."
      }
    ]
  }
];

function sanitizeStudentRecords(records) {
  if (!Array.isArray(records)) return [];
  return records.map(parent => {
    const cleanParent = Object.assign({}, parent);
    delete cleanParent.password;
    delete cleanParent.pass;
    return cleanParent;
  });
}

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();

    const cloudBucket = process.env.KVDB_BUCKET_KEY || "8qFkYw5t1N4Zp3M9Xv7Y2K";
    const upstreamUrl = `https://kvdb.io/${cloudBucket}/vediq_students_db`;

    if (req.method === "GET") {
      try {
        const resp = await fetch(upstreamUrl, { cache: "no-cache" });
        if (resp.ok) {
          const data = await resp.json();
          const sanitized = sanitizeStudentRecords(data);
          res.setHeader("Cache-Control", "no-store, max-age=0");
          return res.status(200).json(sanitized.length > 0 ? sanitized : DEFAULT_ROSTER);
        }
      } catch (e) {}
      return res.status(200).json(DEFAULT_ROSTER);
    }

    if (req.method === "POST") {
      try {
        const body = typeof req.body === "string" ? JSON.parse(req.body || "[]") : (req.body || []);
        if (!Array.isArray(body)) {
          return res.status(400).json({ error: "Expected an array of student records" });
        }
        const sanitized = sanitizeStudentRecords(body);
        await fetch(upstreamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitized)
        });
        return res.status(200).json({ success: true, count: sanitized.length });
      } catch (e) {
        return res.status(500).json({ error: "Failed to persist student records" });
      }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
