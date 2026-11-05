/**
 * Netlify Serverless Function: Secure OTP Engine
 * Cryptographically issues and verifies OTP sessions server-side.
 */

const crypto = require("crypto");

// Server-side HMAC secret for signing OTP challenge tokens
const OTP_SECRET = process.env.OTP_SECRET || "vediq-gurukul-otp-secret-key-2026-secure";

function generateHash(code, recipient, timestamp) {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${code}:${recipient.toLowerCase()}:${timestamp}`)
    .digest("hex");
}

exports.handler = async (event) => {
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
        body: JSON.stringify({ error: "Recipient identifier is required" })
      };
    }

    // ----------------------------------------------------
    // ACTION 1: DISPATCH NEW OTP (Server-side Generation)
    // ----------------------------------------------------
    if (action === "send") {
      // Cryptographically strong 6-digit code (100000 - 999999)
      const code = crypto.randomInt(100000, 1000000).toString();
      const timestamp = Date.now();
      const expiresAt = timestamp + 2 * 60 * 1000; // 2 minutes

      const challengeHash = generateHash(code, recipient, timestamp);
      const token = Buffer.from(JSON.stringify({
        r: recipient,
        t: timestamp,
        e: expiresAt,
        h: challengeHash
      })).toString("base64");

      // Optional: Dispatch email via external email provider if API key configured
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey && recipient.includes("@")) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: "VedIQ Academy <support@vediqacademy.com>",
              to: [recipient],
              subject: `VedIQ Academy • Your Login Code is ${code}`,
              html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #E8E2D8; border-radius: 16px;">
                  <h2 style="color: #0C111D; margin-top: 0;">VedIQ Academy Security</h2>
                  <p style="color: #667085; font-size: 14px;">Your 6-digit login verification code is:</p>
                  <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #C86D24; padding: 12px 0;">${code}</div>
                  <p style="color: #667085; font-size: 12px;">This code is valid for 2 minutes. Never share this code with anyone.</p>
                </div>
              `
            })
          });
        } catch (mailErr) {
          console.warn("External email dispatch note:", mailErr);
        }
      }

      // Return challenge token to client (the actual code is NEVER sent to client)
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          token: token,
          expiresAt: expiresAt,
          message: `Verification code dispatched to ${recipient}`
        })
      };
    }

    // ----------------------------------------------------
    // ACTION 2: VERIFY OTP (Server-side Validation)
    // ----------------------------------------------------
    if (action === "verify") {
      const enteredCode = (payload.code || "").trim();
      const token = payload.token;

      if (!token || !enteredCode) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Missing token or verification code" })
        };
      }

      let parsedToken;
      try {
        parsedToken = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      } catch (e) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid verification token" })
        };
      }

      // Check recipient match
      if (parsedToken.r !== recipient) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Recipient mismatch" })
        };
      }

      // Check expiration
      if (Date.now() > parsedToken.e) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Verification code has expired. Please request a new code." })
        };
      }

      // Recompute expected hash
      const expectedHash = generateHash(enteredCode, parsedToken.r, parsedToken.t);

      if (crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(parsedToken.h))) {
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
          body: JSON.stringify({ error: "Incorrect verification code. Please check and try again." })
        };
      }
    }

    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'." })
    };
  } catch (err) {
    console.error("OTP handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
