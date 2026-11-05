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

  let sender = process.env.RESEND_FROM_EMAIL || "VedIQ Academy <support@vediqacademy.com>";
  if (!sender.includes("<") && sender.includes("@")) {
    sender = `VedIQ Academy <${sender.trim()}>`;
  }
  const replyTo = process.env.RESEND_REPLY_TO || "myvediqacademy@gmail.com";

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: sender,
        reply_to: replyTo,
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

/**
 * Deliver Mobile SMS OTP via Configured Indian SMS Gateways (Fast2SMS / MSG91 / Twilio)
 */
async function sendSmsViaProvider(phoneDigits, otpCode) {
  // Provider 1: Fast2SMS (Direct Indian Quick OTP API)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const apiKey = process.env.FAST2SMS_API_KEY.trim();
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${encodeURIComponent(otpCode)}&flash=0&numbers=${encodeURIComponent(phoneDigits)}`;
      const resp = await fetch(url, { headers: { "cache-control": "no-cache" } });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data && (data.return === true || data.status_code === 200)) {
        return { success: true, provider: "Fast2SMS" };
      } else {
        const msg = (data && data.message && Array.isArray(data.message)) ? data.message.join(", ") : (data.message || `HTTP ${resp.status}`);
        return { success: false, configured: true, error: `Fast2SMS dispatch error: ${msg}` };
      }
    } catch (e) {
      return { success: false, configured: true, error: `Fast2SMS network error: ${e.message}` };
    }
  }

  // Provider 2: MSG91 (DLT Compliant India OTP Route)
  if (process.env.MSG91_AUTH_KEY) {
    try {
      const authKey = process.env.MSG91_AUTH_KEY.trim();
      const templateId = (process.env.MSG91_TEMPLATE_ID || "").trim();
      const url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(templateId)}&mobile=91${encodeURIComponent(phoneDigits)}&authkey=${encodeURIComponent(authKey)}&otp=${encodeURIComponent(otpCode)}`;
      const resp = await fetch(url, { method: "POST" });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data && (data.type === "success" || data.message === "OTP sent successfully")) {
        return { success: true, provider: "MSG91" };
      } else {
        return { success: false, configured: true, error: `MSG91 dispatch error: ${data.message || resp.status}` };
      }
    } catch (e) {
      return { success: false, configured: true, error: `MSG91 network error: ${e.message}` };
    }
  }

  // Provider 3: Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID.trim();
      const token = process.env.TWILIO_AUTH_TOKEN.trim();
      const fromNum = process.env.TWILIO_PHONE_NUMBER.trim();
      const auth = Buffer.from(`${sid}:${token}`).toString("base64");
      const form = new URLSearchParams();
      form.append("To", `+91${phoneDigits}`);
      form.append("From", fromNum);
      form.append("Body", `VedIQ Academy: Your login verification code is ${otpCode}. Valid for 2 minutes.`);

      const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: form.toString()
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data && data.sid) {
        return { success: true, provider: "Twilio" };
      } else {
        return { success: false, configured: true, error: `Twilio dispatch error: ${data.message || resp.status}` };
      }
    } catch (e) {
      return { success: false, configured: true, error: `Twilio network error: ${e.message}` };
    }
  }

  // No carrier SMS provider is configured in environment variables
  return {
    success: false,
    configured: false,
    error: "Mobile SMS gateway is not configured on the server. Please sign in instantly using 'Continue with Google', or enter your registered Email address to receive an instant OTP code."
  };
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
              success: false,
              error: `Email delivery failed: ${mailResult.error}`,
              configured: !mailResult.error.includes("not configured")
            })
          };
        }
      } else {
        const phoneDigits = recipient.replace(/\D/g, '').slice(-10);
        if (phoneDigits.length !== 10) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: "Invalid 10-digit Indian mobile number." })
          };
        }

        const smsResult = await sendSmsViaProvider(phoneDigits, code);
        if (!smsResult.success) {
          return {
            statusCode: smsResult.configured ? 502 : 503,
            headers,
            body: JSON.stringify({
              success: false,
              error: smsResult.error,
              isSmsConfigured: smsResult.configured || false
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
