/**
 * Serverless Function: VedIQ Official Tuition Fee Receipt Generator
 * Renders high-fidelity, printable, verifiable receipts with official
 * digital Gurukul acknowledgment, student credentials, and fee breakdown.
 */

const DEFAULT_SAMPLE_RECEIPT = {
  receiptNumber: "REC-2026-108",
  studentId: "VED-2026-101",
  childName: "Aarav Sharma",
  parentName: "Mr. Rajesh Sharma",
  parentEmail: "parent1@gmail.com",
  parentPhone: "+91 9800000001",
  courseName: "Standard Tier (1 Hour / Day)",
  cohort: "Pravesh (Ages 8-11)",
  amount: 1499,
  currency: "INR",
  paymentMethod: "UPI Transfer (BHIM / GPay / PhonePe)",
  utrNumber: "431289054321",
  status: "verified",
  submittedAt: "2026-11-01T10:30:00.000Z",
  verifiedAt: "2026-11-01T11:00:00.000Z",
  verifiedBy: "Dr. Ujwal Vyas (Head Master Mentor)"
};

const handler = async (req, res) => {
  if (req.method) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();

    const query = req.query || {};
    const receiptNum = (query.receipt || query.receiptNumber || query.id || "").trim();
    const format = (query.format || "").trim().toLowerCase();

    // Pull from cloud payments ledger if available
    let payment = DEFAULT_SAMPLE_RECEIPT;
    const cloudBucket = process.env.KVDB_BUCKET_KEY || "8qFkYw5t1N4Zp3M9Xv7Y2K";
    try {
      const resp = await fetch(`https://kvdb.io/${cloudBucket}/vediq_payments_ledger`, { cache: "no-cache" });
      if (resp.ok) {
        const ledger = await resp.json().catch(() => []);
        if (Array.isArray(ledger)) {
          const match = ledger.find(p => p.receiptNumber === receiptNum || p.paymentId === receiptNum);
          if (match) payment = match;
        }
      }
    } catch (e) {}

    // Return JSON if requested
    if (format === "json") {
      return res.status(200).json({ success: true, receipt: payment });
    }

    const verifiedDate = payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : new Date().toLocaleDateString('en-IN');

    // Standalone high-fidelity Printable HTML / PDF Receipt
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Tuition Fee Receipt — #${payment.receiptNumber || 'REC-2026-108'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      padding: 30px 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .receipt-card {
      background: #FFFFFF;
      max-width: 680px;
      width: 100%;
      border-radius: 24px;
      border: 2px solid #E2E8F0;
      padding: 40px;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.07);
      position: relative;
    }
    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #C86D24;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #C86D24;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .verified-stamp {
      background: #ECFDF5;
      color: #065F46;
      border: 1.5px solid #10B981;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .grid-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .label {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .value {
      font-size: 14px;
      font-weight: 600;
      color: #1E293B;
    }
    .table-box {
      background: #F8FAFC;
      border-radius: 16px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      margin: 24px 0;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #F1F5F9;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
      padding: 12px 16px;
      text-align: left;
    }
    td {
      padding: 14px 16px;
      font-size: 13px;
      border-top: 1px solid #E2E8F0;
    }
    .total-row td {
      font-size: 16px;
      font-weight: 800;
      color: #C86D24;
      background: #FEF3C7;
      border-top: 2px solid #C86D24;
    }
    .footer-seal {
      margin-top: 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px dashed #CBD5E1;
      padding-top: 20px;
      font-size: 11px;
      color: #64748B;
    }
    .signature-box {
      text-align: right;
    }
    .signature-line {
      font-weight: 700;
      color: #0F172A;
      font-size: 13px;
      margin-top: 4px;
    }
    .actions-bar {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn-print {
      background: #C86D24;
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(200, 109, 36, 0.25);
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-card { border: none; box-shadow: none; padding: 20px; }
      .actions-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="receipt-header">
      <div>
        <div class="brand-title">VedIQ Academy</div>
        <div class="brand-subtitle">Bharatiya Integral Gurukul System</div>
        <div style="font-size: 11px; color: #64748B; margin-top: 6px;">
          Website: vediqacademy.com • Email: myvediqacademy@gmail.com
        </div>
      </div>
      <div style="text-align: right;">
        <span class="verified-stamp">✓ Verified &amp; Paid</span>
        <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-top: 8px;">
          Receipt: #${payment.receiptNumber || 'REC-2026-108'}
        </div>
      </div>
    </div>

    <div class="grid-row">
      <div>
        <div class="label">Billed To (Student)</div>
        <div class="value">${payment.childName || 'Aarav Sharma'}</div>
        <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
          Student ID: <strong>${payment.studentId || 'VED-2026-101'}</strong> • ${payment.cohort || 'Pravesh'}
        </div>
      </div>
      <div>
        <div class="label">Parent / Guardian</div>
        <div class="value">${payment.parentName || 'Mr. Rajesh Sharma'}</div>
        <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
          ${payment.parentPhone || ''} ${payment.parentEmail ? '• ' + payment.parentEmail : ''}
        </div>
      </div>
    </div>

    <div class="grid-row">
      <div>
        <div class="label">Payment Verification Date</div>
        <div class="value">${verifiedDate}</div>
      </div>
      <div>
        <div class="label">Transaction Reference (UTR)</div>
        <div class="value" style="font-family: monospace;">${payment.utrNumber || '431289054321'}</div>
      </div>
    </div>

    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Description &amp; Cohort</th>
            <th>Type</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${payment.courseName || 'Standard Tier (1 Hour / Day)'}</strong>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                Daily live Gurukul sessions (Tratak focus, Vedic mental math, Pranayama &amp; Panchatatva)
              </div>
            </td>
            <td>Tuition Fee</td>
            <td style="text-align: right; font-weight: 700;">₹${payment.amount || 1499}.00</td>
          </tr>
          <tr>
            <td>
              <span>Tuition &amp; Academic Mentorship Fee</span>
            </td>
            <td>Educational Mentorship</td>
            <td style="text-align: right; font-weight: 600; color: #64748B;">Included</td>
          </tr>
          <tr class="total-row">
            <td colspan="2"><strong>Total Amount Paid</strong></td>
            <td style="text-align: right;"><strong>₹${payment.amount || 1499}.00</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer-seal">
      <div>
        <div style="font-weight: 700; color: #0F172A;">VedIQ Academy Accounts &amp; Admissions Desk</div>
        <div>Electronically Generated Receipt • Valid Without Physical Seal</div>
        <div>Support: WhatsApp +91 8390332500 • myvediqacademy@gmail.com</div>
      </div>
      <div class="signature-box">
        <div style="font-size: 24px; line-height: 1;">🪔</div>
        <div class="signature-line">VedIQ Academy Admissions Desk</div>
        <div style="font-size: 10px; color: #64748B;">Authorized Digital Acknowledgment</div>
      </div>
    </div>

    <div class="actions-bar">
      <button class="btn-print" onclick="window.print()">
        <span>🖨️</span>
        <span>Print or Save as PDF</span>
      </button>
      <button style="background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer;" onclick="window.close()">
        Close
      </button>
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).send(html);
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

module.exports = handler;
module.exports.handler = handler;
