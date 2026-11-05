/**
 * Netlify Serverless Function: Secure Student Database Sync
 * Mediates persistence for student records and shields backend datastores from direct client exposure.
 */

// Default initial roster
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
    // Strip any plaintext passwords
    const cleanParent = Object.assign({}, parent);
    delete cleanParent.password;
    delete cleanParent.pass;
    return cleanParent;
  });
}

exports.handler = async (event) => {
  const method = event.httpMethod;
  const cloudBucket = process.env.KVDB_BUCKET_KEY || "8qFkYw5t1N4Zp3M9Xv7Y2K";
  const upstreamUrl = `https://kvdb.io/${cloudBucket}/vediq_students_db`;

  // 1. GET: Fetch students
  if (method === "GET") {
    try {
      const resp = await fetch(upstreamUrl, { cache: "no-cache" });
      if (resp.ok) {
        const data = await resp.json();
        const sanitized = sanitizeStudentRecords(data);
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0"
          },
          body: JSON.stringify(sanitized.length > 0 ? sanitized : DEFAULT_ROSTER)
        };
      }
    } catch (e) {
      console.warn("Upstream fetch note:", e);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEFAULT_ROSTER)
    };
  }

  // 2. POST: Save students
  if (method === "POST") {
    try {
      const body = JSON.parse(event.body || "[]");
      if (!Array.isArray(body)) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Expected an array of student records" })
        };
      }

      const sanitized = sanitizeStudentRecords(body);

      // Save to upstream storage securely on server
      await fetch(upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized)
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, count: sanitized.length })
      };
    } catch (e) {
      console.error("Save error:", e);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to persist student records" })
      };
    }
  }

  return {
    statusCode: 405,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Method Not Allowed" })
  };
};
