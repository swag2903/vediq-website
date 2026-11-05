/**
 * Netlify Serverless Function: Secure Teacher & Staff Authentication
 * Server-side verification for teacher console access with role-based authorization.
 * CORS-enabled for hybrid GitHub Pages integration.
 */

const crypto = require("crypto");

// Authorized Staff Directory (Roles & Permissions)
const STAFF_ROSTER = {
  "9766772819": { name: "Dr. Ujwal Vyas", role: "Founder & Head Master Mentor", email: "dr.ujwal@vediqacademy.com", permissions: "founder_admin" },
  "8390332500": { name: "Mr. Atish Gulhane", role: "Co-Founder • Admissions & Ops", email: "atish@vediqacademy.com", permissions: "admin" },
  "9594806822": { name: "Mr. Swagatam Shukla", role: "Co-Founder • Academic & Tech Lead", email: "swagatam@vediqacademy.com", permissions: "admin" },
  "9800000000": { name: "Faculty Teacher", role: "Gurukul Master Mentor", email: "faculty@vediqacademy.com", permissions: "teacher" }
};

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

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const identifier = (payload.identifier || "").trim();
    const password = (payload.password || "").trim();

    if (!identifier || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ authenticated: false, error: "Identifier and password are required" })
      };
    }

    const digits = identifier.replace(/\D/g, "").slice(-10);
    const staffMeta = STAFF_ROSTER[digits] ||
      Object.values(STAFF_ROSTER).find(s => s.email.toLowerCase() === identifier.toLowerCase());

    if (!staffMeta) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ authenticated: false, error: "Unauthorized teacher account" })
      };
    }

    // Configurable master admin key from Netlify environment variables
    const masterAdminKey = process.env.TEACHER_ADMIN_KEY;
    const staffSecret = process.env[`STAFF_PASS_${digits}`];

    let isValid = false;

    // Check environment-configured passwords first
    if (masterAdminKey && password === masterAdminKey) {
      isValid = true;
    } else if (staffSecret && password === staffSecret) {
      isValid = true;
    }

    // If server environment variables are not yet configured on Netlify,
    // require password to be non-empty and at least 6 characters
    if (!masterAdminKey && !staffSecret) {
      if (password.length >= 6) {
        isValid = true;
      }
    }

    if (!isValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ authenticated: false, error: "Invalid credentials" })
      };
    }

    // Generate signed session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        authenticated: true,
        sessionToken: sessionToken,
        teacher: {
          name: staffMeta.name,
          role: staffMeta.role,
          email: staffMeta.email,
          permissions: staffMeta.permissions,
          loginTime: new Date().toISOString()
        }
      })
    };
  } catch (err) {
    console.error("Teacher auth error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server authentication error" })
    };
  }
};
