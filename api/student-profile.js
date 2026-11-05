/**
 * Serverless Function: Secure Student Profile & Progress Datastore
 * Works on Vercel and Netlify.
 * Enforces cryptographic Bearer token validation so parents can access ONLY their own children.
 */

const crypto = require("crypto");

const OTP_SECRET = process.env.OTP_SECRET || process.env.SESSION_SECRET || "vediq-gurukul-otp-secret-key-2026-secure-production";

let studentRecords = [
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
        focusScore: "88",
        streak: "14",
        habits: [true, true, true, false],
        tratakGaze: "3 min 20 sec",
        mathVelocity: "24 sums/min",
        cognitiveGrade: "Grade A+ (Distinction with Honors)",
        mentorNotes: "Aarav demonstrated exceptional optical stillness during today's Tratak flame fixation."
      }
    ]
  }
];

function verifyToken(token) {
  if (!token) return null;
  try {
    const jsonStr = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);

    if (!payload.e || Date.now() > payload.e) return null;

    const expectedHash = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(`${payload.n}:${payload.sub}:${payload.t}:${payload.e}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedHash, "hex");
    const actualBuf = Buffer.from(payload.h, "hex");

    if (expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return payload;
    }
  } catch (e) {
    return null;
  }
  return null;
}

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();

    const authHeader = req.headers.authorization || req.headers.Authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    const session = verifyToken(token);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized: Invalid or expired session token." });
    }

    const verifiedIdentifier = session.sub.toLowerCase();

    try {
      let parentProfile = studentRecords.find(p => 
        (p.email && p.email.toLowerCase() === verifiedIdentifier) ||
        (p.phone && p.phone === verifiedIdentifier) ||
        (p.parentId && p.parentId.toLowerCase() === verifiedIdentifier)
      );

      if (!parentProfile) {
        const isEmail = verifiedIdentifier.includes("@");
        parentProfile = {
          parentId: "PAR-" + Math.floor(1000 + Math.random() * 9000),
          parentName: isEmail ? ("Parent (" + verifiedIdentifier.split("@")[0] + ")") : "Gurukul Parent",
          phone: isEmail ? "" : verifiedIdentifier,
          email: isEmail ? verifiedIdentifier : "",
          activeChildIndex: 0,
          children: []
        };
        studentRecords.push(parentProfile);
      }

      if (req.method === "POST") {
        const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
        if (body.action === "update" && body.profile) {
          if (Array.isArray(body.profile.children)) {
            parentProfile.children = body.profile.children.slice(0, 4);
          }
          if (body.profile.parentName) parentProfile.parentName = body.profile.parentName;
          if (typeof body.profile.activeChildIndex === "number") {
            parentProfile.activeChildIndex = body.profile.activeChildIndex;
          }
        }
      }

      return res.status(200).json({
        success: true,
        profile: {
          parentId: parentProfile.parentId,
          parentName: parentProfile.parentName,
          email: parentProfile.email,
          phone: parentProfile.phone,
          activeChildIndex: parentProfile.activeChildIndex || 0,
          children: parentProfile.children || []
        }
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
