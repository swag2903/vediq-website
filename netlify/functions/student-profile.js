/**
 * Netlify Serverless Function: Secure Student Profile & Progress Datastore
 * Enforces cryptographic Bearer token validation so parents can access ONLY their own children.
 * Rejects untrusted client storage tampering and protects student data.
 */

const crypto = require("crypto");

// Secret used to sign and verify parent session tokens
const OTP_SECRET = process.env.OTP_SECRET || process.env.SESSION_SECRET || "vediq-gurukul-otp-secret-key-2026-secure-production";

// Fallback in-memory student datastore (can sync with KVDB / Firebase Firestore)
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
        mentorNotes: "Aarav demonstrated exceptional optical stillness during today's Tratak flame fixation. Prefrontal cortex focus sustained for 20 continuous minutes without distraction."
      },
      {
        childId: "VED-2026-102",
        childName: "Diya Sharma",
        childGrade: "Ages 5-7 • Foundation",
        batch: "Daily 4:00 PM – 5:00 PM IST",
        focusScore: "92",
        streak: "9",
        habits: [true, true, true, true],
        tratakGaze: "2 min 10 sec",
        mathVelocity: "18 sums/min",
        cognitiveGrade: "Grade A+ (High Focus)",
        mentorNotes: "Diya completed her daily Panchatatva Vedic physics exploration with enthusiasm. Rapid improvement in numerical memory and visual pattern recall."
      }
    ]
  }
];

function verifyToken(token) {
  if (!token) return null;
  try {
    const jsonStr = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);

    // Check expiration
    if (!payload.e || Date.now() > payload.e) {
      return null;
    }

    // Verify cryptographic signature
    const expectedHash = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(`${payload.n}:${payload.sub}:${payload.t}:${payload.e}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedHash, "hex");
    const actualBuf = Buffer.from(payload.h, "hex");

    if (expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return payload; // Valid session!
    }
  } catch (e) {
    return null;
  }
  return null;
}

exports.handler = async (event) => {
  // CORS Headers allowing cross-domain communication from GitHub Pages & custom domain
  const origin = event.headers.origin || "*";
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // 1. Extract Bearer Token from Authorization Header
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  const session = verifyToken(token);
  if (!session) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Unauthorized: Invalid or expired session token. Please log in again." })
    };
  }

  const verifiedIdentifier = session.sub.toLowerCase(); // The authenticated parent's email or phone

  try {
    // 2. Fetch parent record matching ONLY this verified identity
    let parentProfile = studentRecords.find(p => 
      (p.email && p.email.toLowerCase() === verifiedIdentifier) ||
      (p.phone && p.phone === verifiedIdentifier) ||
      (p.parentId && p.parentId.toLowerCase() === verifiedIdentifier)
    );

    // If new user authenticated via OTP for first time, create their Gurukul parent profile container
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

    // 3. ACTION: UPDATE PROFILE (Saving daily sadhana habits, Tratak scores, or adding a child)
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (body.action === "update") {
        if (body.profile && typeof body.profile === "object") {
          // Allow parent to update only their own child records
          if (Array.isArray(body.profile.children)) {
            parentProfile.children = body.profile.children.slice(0, 4); // Max 4 children per family
          }
          if (body.profile.parentName) parentProfile.parentName = body.profile.parentName;
          if (typeof body.profile.activeChildIndex === "number") {
            parentProfile.activeChildIndex = body.profile.activeChildIndex;
          }
        }
      }
    }

    // 4. Return sanitized profile strictly for this authenticated parent
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        profile: {
          parentId: parentProfile.parentId,
          parentName: parentProfile.parentName,
          email: parentProfile.email,
          phone: parentProfile.phone,
          activeChildIndex: parentProfile.activeChildIndex || 0,
          children: parentProfile.children || []
        }
      })
    };
  } catch (err) {
    console.error("Student profile endpoint error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error retrieving student profile" })
    };
  }
};
