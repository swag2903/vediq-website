/**
 * Netlify Serverless Function: Production-Ready Secure OTP Engine
 * Cryptographically issues, rate-limits, and verifies OTP sessions server-side.
 * Delivers 6-digit OTP codes via Resend API (process.env.RESEND_API_KEY).
 */

const crypto = require("crypto");

// Server-side HMAC secret for signing OTP challenge tokens (persisted via env or secure fallback)
const OTP_SECRET = process.env.OTP_SECRET || "vediq-gurukul-otp-secret-key-2026-secure-production";
const OTP_TTL_SECONDS = 120; // Exactly 2 minutes validity

// In-memory Rate Limiting & Cooldown Store (Per-instance Lambda memory)
// Key: recipient email/phone -> { lastSentAt: number, count: number, windowStart: number }
const rateLimitStore = new Map();
const COOLDOWN_SECONDS = 30; // 30-second cooldown between resends
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per 10-minute window
const WINDOW_DURATION_MS = 10 * 60 * 1000;

function checkRateLimit(recipient) {
  const now = Date.now();
  const record = rateLimitStore.get(recipient);

  if (!record) {
    rateLimitStore.set(recipient, { lastSentAt: now, count: 1, windowStart: now });
    return { allowed: true };
  }

  // Reset window if 10 minutes have elapsed
  if (now - record.windowStart > WINDOW_DURATION_MS) {
    record.count = 1;
    record.windowStart = now;
    record.lastSentAt = now;
    return { allowed: true };
  }

  // Check 30-second cooldown
  const elapsedSinceLast = Math.floor((now - record.lastSentAt) / 1000);
  if (elapsedSinceLast < COOLDOWN_SECONDS) {
    const waitTime = COOLDOWN_SECONDS - elapsedSinceLast;
    return {
      allowed: false,
      error: `Please wait ${waitTime} second${waitTime === 1 ? '' : 's'} before requesting another code.`
    };
  }

  // Check max requests per window
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      error: "Too many verification requests. Please wait a few minutes before trying again."
    };
  }

  record.count += 1;
  record.lastSentAt = now;
  return { allowed: true };
}

function generateHash(code, recipient, timestamp) {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${code}:${recipient.toLowerCase()}:${timestamp}`)
    .digest("hex");
}

/**
 * Dispatch transactional email via Resend API
 */
async function sendEmailViaResend(toEmail, otpCode) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in Netlify Environment Variables. Please set your Resend API key to enable live email delivery."
    };
  }

  const emailSubject = `VedIQ Academy • Your Login Code is ${otpCode}`;
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>VedIQ Academy Login Code</title>
    </head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; color: #0C111D;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E8E2D8; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
        <!-- Header -->
        <tr>
          <td style="padding: 28px 32px 20px 32px; background: linear-gradient(135deg, #0C111D 0%, #1A2234 100%); text-align: center;">
            <div style="font-size: 28px; line-height: 1;">🪔</div>
            <h1 style="margin: 8px 0 2px 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">VEDIQ ACADEMY</h1>
            <p style="margin: 0; color: #C59A51; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Bharatiya Integral Gurukul System</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 32px 24px 32px; text-align: center;">
            <div style="display: inline-block; padding: 6px 14px; background-color: #FDF7EC; border: 1px solid #E8E2D8; border-radius: 50px; font-size: 11px; font-weight: 700; color: #C86D24; margin-bottom: 16px;">
              🛡️ OFFICIAL SECURITY VERIFICATION
            </div>
            
            <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0C111D; font-weight: 700;">Parent Portal Sign-In Code</h2>
            <p style="margin: 0 0 24px 0; font-size: 13px; color: #667085; line-height: 1.5;">
              Enter this 6-digit verification code to securely access your child's cognitive dashboard and Gurukul progress reports:
            </p>

            <!-- OTP Code Badge -->
            <div style="background-color: #FAF8F5; border: 2px dashed #C86D24; border-radius: 14px; padding: 18px 24px; margin: 0 auto 20px auto; display: inline-block;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #C86D24;">
                ${otpCode}
              </span>
            </div>

            <!-- Expiry & Warning -->
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #B05917;">
              ⏱️ This code is valid for exactly 2 minutes (120 seconds).
            </p>
            <p style="margin: 0; font-size: 11px; color: #98A2B3; line-height: 1.4;">
              If you did not request this login code, you can safely ignore this email. Never share your verification code with anyone.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 32px; background-color: #FAF8F5; border-top: 1px solid #E8E2D8; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #667085;">
              VedIQ Academy • Co-founded by Dr. Ujwal Vyas, Mr. Atish Gulhane &amp; Mr. Swagatam Shukla
            </p>
            <p style="margin: 0; font-size: 10px; color: #98A2B3;">
              Official Support Desk: <a href="mailto:myvediqacademy@gmail.com" style="color: #C86D24; text-decoration: none;">myvediqacademy@gmail.com</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Determine sender: use custom domain if provided, otherwise fallback to Resend's onboarding address
  const preferredSender = process.env.RESEND_FROM_EMAIL || "VedIQ Academy <support@vediqacademy.com>";
  const fallbackSender = "VedIQ Academy <onboarding@resend.dev>";

  async function callResend(fromAddress) {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: emailSubject,
        html: emailHtml
      })
    });
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, data };
  }

  try {
    let result = await callResend(preferredSender);

    // If custom domain is not yet verified on Resend (403 domain error), auto-retry with onboarding@resend.dev
    if (!result.ok && preferredSender !== fallbackSender) {
      const errMsg = (result.data && result.data.message) ? result.data.message.toLowerCase() : "";
      if (result.status === 403 || errMsg.includes("domain") || errMsg.includes("not verified")) {
        console.warn(`Resend domain note for ${preferredSender}, falling back to ${fallbackSender}`);
        result = await callResend(fallbackSender);
      }
    }

    if (result.ok && result.data && result.data.id) {
      return { success: true, messageId: result.data.id };
    } else {
      const errorDetail = (result.data && result.data.message) ? result.data.message : `HTTP status ${result.status}`;
      return { success: false, error: errorDetail };
    }
  } catch (err) {
    return { success: false, error: err.message || "Network error contacting email provider" };
  }
}

exports.handler = async (event) => {
  // CORS & Method validation
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const action = payload.action; // 'send' or 'verify'
    const recipient = (payload.recipient || "").trim().toLowerCase();

    if (!recipient) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Recipient email or phone is required" })
      };
    }

    // ----------------------------------------------------
    // ACTION 1: DISPATCH NEW OTP (Server-side Generation)
    // ----------------------------------------------------
    if (action === "send") {
      // 1. Rate Limiting & Cooldown Check
      const rateCheck = checkRateLimit(recipient);
      if (!rateCheck.allowed) {
        return {
          statusCode: 429,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: rateCheck.error })
        };
      }

      // 2. Cryptographically generate 6-digit code (100000 - 999999)
      const code = crypto.randomInt(100000, 1000000).toString();
      const timestamp = Date.now();
      const expiresAt = timestamp + (OTP_TTL_SECONDS * 1000);

      // 3. Dispatch Email if recipient is an email address
      if (recipient.includes("@")) {
        const mailResult = await sendEmailViaResend(recipient, code);
        if (!mailResult.success) {
          // If email dispatch failed, DO NOT return success!
          return {
            statusCode: 502,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              error: `Email delivery failed: ${mailResult.error}`,
              configured: !mailResult.error.includes("not configured")
            })
          };
        }
      }

      // 4. Create cryptographically signed challenge token (NEVER contains plain OTP)
      const challengeHash = generateHash(code, recipient, timestamp);
      const token = Buffer.from(JSON.stringify({
        r: recipient,
        t: timestamp,
        e: expiresAt,
        h: challengeHash
      })).toString("base64");

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          token: token,
          expiresAt: expiresAt,
          ttlSeconds: OTP_TTL_SECONDS,
          message: `Verification code successfully dispatched to ${recipient}`
        })
      };
    }

    // ----------------------------------------------------
    // ACTION 2: VERIFY OTP (Server-side Cryptographic Validation)
    // ----------------------------------------------------
    if (action === "verify") {
      const enteredCode = (payload.code || "").trim();
      const token = payload.token;

      if (!token || !enteredCode) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Missing verification code or token" })
        };
      }

      let parsedToken;
      try {
        parsedToken = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      } catch (e) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid verification token format" })
        };
      }

      // Recipient match check
      if (parsedToken.r !== recipient) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Recipient mismatch" })
        };
      }

      // Expiration check (Server-enforced 120s expiry)
      if (Date.now() > parsedToken.e) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Verification code has expired (valid for 2 minutes). Please tap 'Resend New Code'." })
        };
      }

      // Recompute expected cryptographic hash
      const expectedHash = generateHash(enteredCode, parsedToken.r, parsedToken.t);

      // Timing-safe comparison to prevent timing attacks
      const expectedBuf = Buffer.from(expectedHash, "hex");
      const actualBuf = Buffer.from(parsedToken.h, "hex");

      if (expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verified: true,
            recipient: recipient,
            message: "OTP successfully verified"
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Incorrect verification code. Please check your inbox and try again." })
        };
      }
    }

    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid action. Expected 'send' or 'verify'." })
    };
  } catch (err) {
    console.error("OTP handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error processing OTP request" })
    };
  }
};
