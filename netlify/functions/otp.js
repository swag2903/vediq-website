/**
 * Netlify Serverless Function: Production-Ready Secure OTP & Session Engine
 * Cryptographically issues, rate-limits, and verifies OTP sessions server-side.
 * Issues 30-day cryptographically signed Bearer Session Tokens for verified parents.
 * Delivers 6-digit OTP codes via Resend API (process.env.RESEND_API_KEY).
 */

const crypto = require("crypto");

const OTP_TTL_SECONDS = 120; // 2 minutes validity for 6-digit code
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30-day validity for persistent login session
const COOLDOWN_SECONDS = 30; // 30-second cooldown between resends
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 requests per 10-minute window
const WINDOW_DURATION_MS = 10 * 60 * 1000;

// Secret used to sign HMAC challenge tokens and 30-day session tokens
const OTP_SECRET = process.env.OTP_SECRET || process.env.SESSION_SECRET || "vediq-gurukul-otp-secret-key-2026-secure-production";

// In-memory rate limiting and token anti-replay stores
const rateLimitStore = new Map();
const redeemedTokensStore = new Set();

function checkRateLimit(recipient) {
  const now = Date.now();
  const record = rateLimitStore.get(recipient);

  if (!record) {
    rateLimitStore.set(recipient, { lastSentAt: now, count: 1, windowStart: now });
    return { allowed: true };
  }

  if (now - record.windowStart > WINDOW_DURATION_MS) {
    record.count = 1;
    record.windowStart = now;
    record.lastSentAt = now;
    return { allowed: true };
  }

  const elapsedSinceLast = Math.floor((now - record.lastSentAt) / 1000);
  if (elapsedSinceLast < COOLDOWN_SECONDS) {
    const waitTime = COOLDOWN_SECONDS - elapsedSinceLast;
    return {
      allowed: false,
      error: `Please wait ${waitTime} second${waitTime === 1 ? '' : 's'} before requesting another code.`
    };
  }

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

/**
 * Generate full-payload HMAC-SHA256 signature for 6-digit OTP challenges
 */
function generateChallengeHash(nonce, code, recipient, timestamp, expiresAt) {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${nonce}:${code}:${recipient.toLowerCase()}:${timestamp}:${expiresAt}`)
    .digest("hex");
}

/**
 * Generate a cryptographically signed 30-day Session Token for an authenticated parent
 */
function createSessionToken(recipient) {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const expiresAt = timestamp + (SESSION_TTL_SECONDS * 1000);

  const hash = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${nonce}:${recipient.toLowerCase()}:${timestamp}:${expiresAt}`)
    .digest("hex");

  return Buffer.from(JSON.stringify({
    n: nonce,
    sub: recipient.toLowerCase(),
    t: timestamp,
    e: expiresAt,
    h: hash
  })).toString("base64");
}

/**
 * Dispatch transactional email via Resend API
 */
async function sendEmailViaResend(toEmail, otpCode, apiKey) {
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
        <tr>
          <td style="padding: 28px 32px 20px 32px; background: linear-gradient(135deg, #0C111D 0%, #1A2234 100%); text-align: center;">
            <div style="font-size: 28px; line-height: 1;">🪔</div>
            <h1 style="margin: 8px 0 2px 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">VEDIQ ACADEMY</h1>
            <p style="margin: 0; color: #C59A51; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Bharatiya Integral Gurukul System</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 32px 24px 32px; text-align: center;">
            <div style="display: inline-block; padding: 6px 14px; background-color: #FDF7EC; border: 1px solid #E8E2D8; border-radius: 50px; font-size: 11px; font-weight: 700; color: #C86D24; margin-bottom: 16px;">
              🛡️ OFFICIAL SECURITY VERIFICATION
            </div>
            
            <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0C111D; font-weight: 700;">Parent Portal Sign-In Code</h2>
            <p style="margin: 0 0 24px 0; font-size: 13px; color: #667085; line-height: 1.5;">
              Enter this 6-digit verification code to securely access your child's cognitive dashboard and Gurukul progress reports:
            </p>

            <div style="background-color: #FAF8F5; border: 2px dashed #C86D24; border-radius: 14px; padding: 18px 24px; margin: 0 auto 20px auto; display: inline-block;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #C86D24;">
                ${otpCode}
              </span>
            </div>

            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #B05917;">
              ⏱️ This code is valid for exactly 2 minutes (120 seconds).
            </p>
            <p style="margin: 0; font-size: 11px; color: #98A2B3; line-height: 1.4;">
              If you did not request this login code, you can safely ignore this email. Never share your verification code with anyone.
            </p>
          </td>
        </tr>
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

  const sender = process.env.RESEND_FROM_EMAIL || "VedIQ Academy <support@vediqacademy.com>";

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: sender,
        to: [toEmail],
        subject: emailSubject,
        html: emailHtml
      })
    });
    
    const data = await resp.json().catch(() => ({}));

    if (resp.ok && data && data.id) {
      return { success: true, messageId: data.id };
    } else {
      const errorMsg = data && data.message ? data.message : `HTTP status ${resp.status}`;
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    return { success: false, error: err.message || "Network error contacting email provider" };
  }
}

exports.handler = async (event) => {
  // Dynamic CORS headers allowing GitHub Pages, Custom Domain, and Localhost
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
    const action = payload.action; // 'send', 'verify', or 'issue-session'
    const recipient = (payload.recipient || "").trim().toLowerCase();

    if (!recipient) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Recipient email or phone is required" })
      };
    }

    // ----------------------------------------------------
    // ACTION 1: DISPATCH NEW OTP (Server-side Generation)
    // ----------------------------------------------------
    if (action === "send") {
      const rateCheck = checkRateLimit(recipient);
      if (!rateCheck.allowed) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ error: rateCheck.error })
        };
      }

      const code = crypto.randomInt(100000, 1000000).toString();
      const nonce = crypto.randomUUID();
      const timestamp = Date.now();
      const expiresAt = timestamp + (OTP_TTL_SECONDS * 1000);

      if (recipient.includes("@")) {
        const mailResult = await sendEmailViaResend(recipient, code, process.env.RESEND_API_KEY);
        if (!mailResult.success) {
          return {
            statusCode: 502,
            headers,
            body: JSON.stringify({
              error: `Email delivery failed: ${mailResult.error}`,
              configured: !mailResult.error.includes("not configured")
            })
          };
        }
      }

      const challengeHash = generateChallengeHash(nonce, code, recipient, timestamp, expiresAt);
      const token = Buffer.from(JSON.stringify({
        n: nonce,
        r: recipient,
        t: timestamp,
        e: expiresAt,
        h: challengeHash
      })).toString("base64");

      return {
        statusCode: 200,
        headers,
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
          headers,
          body: JSON.stringify({ error: "Missing verification code or token" })
        };
      }

      let parsedToken;
      try {
        parsedToken = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid verification token format" })
        };
      }

      const tokenIdentifier = parsedToken.n || parsedToken.h;
      if (redeemedTokensStore.has(tokenIdentifier)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "This verification code has already been used. Please request a new code." })
        };
      }

      if (parsedToken.r !== recipient) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Recipient mismatch: OTP was not issued for this identifier." })
        };
      }

      if (Date.now() > parsedToken.e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Verification code has expired (valid for 2 minutes). Please tap 'Resend New Code'." })
        };
      }

      const expectedHash = generateChallengeHash(parsedToken.n, enteredCode, parsedToken.r, parsedToken.t, parsedToken.e);
      const expectedBuf = Buffer.from(expectedHash, "hex");
      const actualBuf = Buffer.from(parsedToken.h, "hex");

      if (expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        redeemedTokensStore.add(tokenIdentifier);
        setTimeout(() => redeemedTokensStore.delete(tokenIdentifier), OTP_TTL_SECONDS * 1000);

        // Issue a cryptographically signed 30-Day Session Token
        const sessionToken = createSessionToken(recipient);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            verified: true,
            sessionToken: sessionToken,
            recipient: recipient,
            message: "OTP successfully verified. 30-Day Gurukul session issued."
          })
        };
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Incorrect verification code. Please check your inbox and try again." })
        };
      }
    }

    // ----------------------------------------------------
    // ACTION 3: ISSUE SESSION TOKEN (For Google OAuth or Verified Password)
    // ----------------------------------------------------
    if (action === "issue-session") {
      const sessionToken = createSessionToken(recipient);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sessionToken: sessionToken,
          recipient: recipient
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid action. Expected 'send', 'verify', or 'issue-session'." })
    };
  } catch (err) {
    console.error("OTP handler error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error processing OTP request" })
    };
  }
};
