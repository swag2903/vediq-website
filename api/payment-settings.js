/**
 * Serverless Function: VedIQ Payment Settings Engine
 * Supports reading active payment methods & dynamic UPI QR configuration,
 * and secure admin updates without website redeployment.
 */

// Default verified payment configuration
const DEFAULT_PAYMENT_SETTINGS = {
  activeGateway: "upi_qr", // "upi_qr" | "razorpay" | "both"
  upiId: "vediqacademy@upi",
  payeeName: "VedIQ Academy",
  qrImageUrl: "", // If empty, dynamically generated from UPI URI
  instructions: "1. Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM.\n2. Complete the exact fee transfer.\n3. Note down the 12-digit UPI Reference / UTR Number from your banking app.\n4. Enter the 12-digit UTR below and submit for Master Mentor verification.",
  courseFees: {
    foundation: 999,
    standard: 1499,
    premium: 2499
  },
  razorpay: {
    enabled: false,
    keyId: "",
    currency: "INR"
  },
  lastUpdated: new Date().toISOString()
};

// In-memory cache for serverless invocation speed
let cachedSettings = null;

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();

    const cloudBucket = process.env.KVDB_BUCKET_KEY || "8qFkYw5t1N4Zp3M9Xv7Y2K";
    const settingsUrl = `https://kvdb.io/${cloudBucket}/vediq_payment_settings`;

    // 1. GET: Public & Parent Portal configuration retrieval
    if (req.method === "GET") {
      try {
        const resp = await fetch(settingsUrl, { cache: "no-cache" });
        if (resp.ok) {
          const remoteSettings = await resp.json().catch(() => null);
          if (remoteSettings && remoteSettings.upiId) {
            cachedSettings = Object.assign({}, DEFAULT_PAYMENT_SETTINGS, remoteSettings);
          }
        }
      } catch (e) {
        console.warn("Payment settings remote read fallback:", e.message);
      }

      const active = cachedSettings || DEFAULT_PAYMENT_SETTINGS;
      res.setHeader("Cache-Control", "public, max-age=30");
      return res.status(200).json(active);
    }

    // 2. POST: Secure Admin Settings Update
    if (req.method === "POST") {
      const authHeader = req.headers.authorization || "";
      const expectedAdminKey = process.env.TEACHER_ADMIN_KEY || "vediq-gurukul-mentor-master-key-2026";

      // Verify Admin Authorization (Strict Zero-Trust)
      const token = authHeader.replace("Bearer ", "").trim();
      if (!token || token !== expectedAdminKey) {
        return res.status(401).json({ error: "Unauthorized: Admin credentials required to alter payment configurations." });
      }

      try {
        const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
        const updated = Object.assign({}, cachedSettings || DEFAULT_PAYMENT_SETTINGS, {
          activeGateway: payload.activeGateway || "upi_qr",
          upiId: (payload.upiId || DEFAULT_PAYMENT_SETTINGS.upiId).trim(),
          payeeName: (payload.payeeName || DEFAULT_PAYMENT_SETTINGS.payeeName).trim(),
          qrImageUrl: (payload.qrImageUrl || "").trim(),
          instructions: payload.instructions || DEFAULT_PAYMENT_SETTINGS.instructions,
          courseFees: Object.assign({}, DEFAULT_PAYMENT_SETTINGS.courseFees, payload.courseFees || {}),
          razorpay: Object.assign({}, DEFAULT_PAYMENT_SETTINGS.razorpay, payload.razorpay || {}),
          lastUpdated: new Date().toISOString()
        });

        // Persist to remote cloud datastore
        try {
          await fetch(settingsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
          });
        } catch (err) {
          console.warn("Settings remote save notice:", err.message);
        }

        cachedSettings = updated;
        return res.status(200).json({ success: true, settings: updated });
      } catch (err) {
        return res.status(400).json({ error: err.message || "Invalid payload format" });
      }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
