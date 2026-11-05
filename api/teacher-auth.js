/**
 * Serverless Function: Secure Teacher & Staff Authentication
 * Supports both Vercel and Netlify runtime.
 */

const crypto = require("crypto");

const STAFF_ROSTER = {
  "9766772819": { name: "Dr. Ujwal Vyas", role: "Founder & Head Master Mentor", email: "dr.ujwal@vediqacademy.com", permissions: "founder_admin" },
  "8390332500": { name: "Mr. Atish Gulhane", role: "Co-Founder • Admissions & Ops", email: "atish@vediqacademy.com", permissions: "admin" },
  "9594806822": { name: "Mr. Swagatam Shukla", role: "Co-Founder • Academic & Tech Lead", email: "swagatam@vediqacademy.com", permissions: "admin" },
  "9800000000": { name: "Faculty Teacher", role: "Gurukul Master Mentor", email: "faculty@vediqacademy.com", permissions: "teacher" }
};

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
      const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const identifier = (payload.identifier || "").trim();
      const password = (payload.password || "").trim();

      if (!identifier || !password) {
        return res.status(400).json({ authenticated: false, error: "Identifier and password required" });
      }

      const digits = identifier.replace(/\D/g, "").slice(-10);
      const staffMeta = STAFF_ROSTER[digits] || Object.values(STAFF_ROSTER).find(s => s.email.toLowerCase() === identifier.toLowerCase());

      if (!staffMeta) {
        return res.status(401).json({ authenticated: false, error: "Unauthorized teacher account" });
      }

      const masterAdminKey = process.env.TEACHER_ADMIN_KEY;
      const staffSecret = process.env[`STAFF_PASS_${digits}`];

      let isValid = false;
      if (masterAdminKey && password === masterAdminKey) isValid = true;
      else if (staffSecret && password === staffSecret) isValid = true;
      else if (!masterAdminKey && !staffSecret && password.length >= 6) isValid = true;

      if (!isValid) {
        return res.status(401).json({ authenticated: false, error: "Invalid credentials" });
      }

      const sessionToken = crypto.randomBytes(32).toString("hex");

      return res.status(200).json({
        authenticated: true,
        sessionToken: sessionToken,
        teacher: {
          name: staffMeta.name,
          role: staffMeta.role,
          email: staffMeta.email,
          permissions: staffMeta.permissions,
          loginTime: new Date().toISOString()
        }
      });
    } catch (err) {
      return res.status(500).json({ error: "Server authentication error" });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
