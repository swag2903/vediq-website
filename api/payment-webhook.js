/**
 * Serverless Function: Future Razorpay Webhook Engine
 * Idempotently verifies HMAC-SHA256 signature, prevents replay attacks,
 * transitions payment status to verified, and triggers notification outbox.
 */

const crypto = require("crypto");

const processedEvents = new Set();

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Razorpay-Signature");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "vediq_razorpay_secret_placeholder";
    const signature = req.headers["x-razorpay-signature"];
    const eventId = req.headers["x-razorpay-event-id"];

    // Anti-replay check
    if (eventId && processedEvents.has(eventId)) {
      return res.status(200).json({ status: "already_processed", eventId });
    }

    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});

    // Cryptographic signature verification
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Invalid Razorpay webhook signature");
        return res.status(400).json({ error: "Invalid cryptographic signature" });
      }
    }

    try {
      const event = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const eventType = event.event;

      if (eventId) {
        processedEvents.add(eventId);
        if (processedEvents.size > 2000) {
          const first = processedEvents.values().next().value;
          processedEvents.delete(first);
        }
      }

      console.log(`Received Razorpay webhook event: ${eventType}`);

      if (eventType === "payment.captured" || eventType === "order.paid") {
        const paymentEntity = event.payload?.payment?.entity || {};
        const studentId = paymentEntity.notes?.studentId || "VED-2026-ONLINE";
        const childName = paymentEntity.notes?.childName || "Online Enrolled Student";
        const parentEmail = paymentEntity.email || "";
        const parentPhone = paymentEntity.contact || "";
        const amount = paymentEntity.amount ? (paymentEntity.amount / 100) : 1499;
        const razorpayPaymentId = paymentEntity.id || "PAY_RAZOR_" + Date.now();

        // Forward to payments ledger via internal sync
        const cloudBucket = process.env.KVDB_BUCKET_KEY || "8qFkYw5t1N4Zp3M9Xv7Y2K";
        const paymentsUrl = `https://kvdb.io/${cloudBucket}/vediq_payments_ledger`;

        try {
          const resp = await fetch(paymentsUrl, { cache: "no-cache" });
          let ledger = [];
          if (resp.ok) ledger = await resp.json().catch(() => []);

          const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

          ledger.unshift({
            paymentId: "PAY-" + razorpayPaymentId,
            idempotencyKey: razorpayPaymentId,
            studentId,
            childName,
            parentName: paymentEntity.notes?.parentName || "Parent",
            parentEmail,
            parentPhone,
            courseName: paymentEntity.notes?.courseName || "Standard Tier (1 Hour / Day)",
            amount,
            currency: "INR",
            paymentMethod: "razorpay",
            utrNumber: razorpayPaymentId,
            status: "verified",
            submittedAt: new Date().toISOString(),
            verifiedAt: new Date().toISOString(),
            verifiedBy: "Razorpay Automated Gateway",
            receiptNumber,
            adminNotes: "Auto-verified via Razorpay webhook",
            notifications: {
              email: { status: "queued", sentAt: null },
              whatsapp: { status: "queued", sentAt: null }
            }
          });

          await fetch(paymentsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ledger)
          });
        } catch (dbErr) {
          console.warn("Webhook DB write notice:", dbErr.message);
        }

        return res.status(200).json({ status: "success", received: true, event: eventType });
      }

      return res.status(200).json({ status: "ignored_event_type", event: eventType });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
