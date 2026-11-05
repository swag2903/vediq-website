/**
 * Serverless Function: Official Meta WhatsApp Business Platform Webhook
 * Handles Meta Webhook Verification (GET) and Inbound AI Payment Assistant (POST)
 * Supports WhatsApp Cloud API v19.0 with strict identity isolation.
 */

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "vediq_gurukul_wa_verify_2026";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();

    // 1. Meta Webhook Verification Challenge (GET)
    if (req.method === "GET") {
      const mode = req.query?.["hub.mode"];
      const token = req.query?.["hub.verify_token"];
      const challenge = req.query?.["hub.challenge"];

      if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
        console.log("Meta WhatsApp webhook successfully verified!");
        res.setHeader("Content-Type", "text/plain");
        return res.status(200).send(challenge);
      }
      return res.status(403).json({ error: "Verification token mismatch" });
    }

    // 2. Inbound WhatsApp Message Handler (POST)
    if (req.method === "POST") {
      try {
        const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
        
        // Extract message content
        const entry = payload.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (!message || !message.text) {
          return res.status(200).json({ status: "no_text_message" });
        }

        const fromPhone = message.from; // e.g. "919800000001"
        const cleanPhone = fromPhone.replace(/\D/g, "").slice(-10); // extract 10 digits
        const userText = (message.text.body || "").trim().toLowerCase();

        console.log(`WhatsApp message from ${cleanPhone}: ${userText}`);

        // Check if message is a payment inquiry
        const isPaymentQuery = [
          "payment", "fee", "receipt", "utr", "verified", "paid",
          "fees", "chalan", "invoice", "status", "bill"
        ].some(keyword => userText.includes(keyword));

        let replyText = "";

        if (isPaymentQuery) {
          // Look up payments for this sender's phone ONLY (strict tenant isolation)
          const cloudBucket = process.env.KVDB_BUCKET_KEY || "8qFkYw5t1N4Zp3M9Xv7Y2K";
          let matchingPayments = [];
          try {
            const resp = await fetch(`https://kvdb.io/${cloudBucket}/vediq_payments_ledger`, { cache: "no-cache" });
            if (resp.ok) {
              const ledger = await resp.json().catch(() => []);
              if (Array.isArray(ledger)) {
                matchingPayments = ledger.filter(p => p.parentPhone && p.parentPhone.replace(/\D/g, "").slice(-10) === cleanPhone);
              }
            }
          } catch (e) {}

          if (matchingPayments.length > 0) {
            const latest = matchingPayments[0];
            if (latest.status === "verified") {
              replyText = `🙏 Namaste from VedIQ Academy!\n\nYour fee payment of ₹${latest.amount} for ${latest.childName} (Student ID: ${latest.studentId}) is ✅ VERIFIED.\n\n📄 Official Receipt #: ${latest.receiptNumber}\n🔗 Download Receipt: https://vediqacademy.com/api/receipt?receipt=${latest.receiptNumber}\n\nThank you for being part of VedIQ Gurukul!`;
            } else if (latest.status === "pending_verification") {
              replyText = `🙏 Namaste from VedIQ Academy!\n\nWe have received your payment submission (UTR: ${latest.utrNumber}) of ₹${latest.amount} for ${latest.childName}.\n\n⏳ Status: PENDING MASTER MENTOR VERIFICATION\nOur finance mentors verify submissions against bank credits within 2 to 4 business hours. You will receive your receipt here upon approval.`;
            } else {
              replyText = `🙏 Namaste from VedIQ Academy!\n\nYour previous submission for ₹${latest.amount} has status: ${latest.status.toUpperCase()}.\nReason: ${latest.rejectionReason || "Could not verify in bank statements"}.\nPlease re-submit your valid 12-digit UTR on vediqacademy.com/parent.html or contact our desk.`;
            }
          } else {
            replyText = `🙏 Namaste from VedIQ Academy!\n\nWe could not locate an active payment record for phone number ending in ${cleanPhone.slice(-4)}.\n\n• To pay fees: Scan our UPI QR on vediqacademy.com/parent.html\n• To submit UTR: Enter your 12-digit reference number on the Parent Portal.\n\nNeed personal help? Master Mentor Dr. Ujwal Vyas's team is available here.`;
          }
        } else {
          replyText = `🙏 Namaste! Welcome to VedIQ Academy (Bharatiya Integral Gurukul System).\n\nYou can ask about:\n• Payment & Receipt Status\n• Free 3-Day Live Demo Classes\n• 60-Minute Daily Routine (Tratak & Vedic Math)\n• Parent Portal Access\n\nVisit: vediqacademy.com`;
        }

        // Dispatch outbound WhatsApp message via Meta Cloud API
        if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_ID) {
          await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: fromPhone,
              type: "text",
              text: { body: replyText }
            })
          }).catch(err => console.warn("WhatsApp dispatch error:", err.message));
        }

        return res.status(200).json({ status: "success", reply: replyText });
      } catch (err) {
        console.error("WhatsApp webhook execution error:", err);
        return res.status(200).json({ status: "error", message: err.message });
      }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
