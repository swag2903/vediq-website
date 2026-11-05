# VedIQ Academy (BIGS) — Website & Portal Master Guide

> **Ancient Wisdom. Scientific Mind.**  
> **Official Domain:** [https://vediqacademy.com](https://vediqacademy.com)  
> *India's Premier Scientific + Vedic Brain Development System for Children (Ages 5–15)*

---

## 🌟 Executive Overview for Founder & Non-Technical Admin

This repository powers the complete online presence and Parent Portal for **VedIQ Academy**.

### Architecture: The "Zero-Risk Hybrid" Setup
Your website uses an industry-standard, high-reliability architecture designed so you **never have to touch your GoDaddy DNS records**:
1. **Frontend (Website & Parent UI):** Hosted 100% free on **GitHub Pages** at `https://vediqacademy.com`. Every page (`index.html`, `parent.html`, etc.) loads instantly via global CDN.
2. **Backend (Secure OTP & Student Data API):** Hosted on **Netlify Functions** (`/.netlify/functions/otp` and `/.netlify/functions/student-profile`). It securely delivers email OTPs and protects student information without requiring server maintenance or monthly hosting bills.

---

## 🔐 How Authentication Works

### 1. Parent Login (`parent.html`)
Parents can sign into their portal in three ways:
* **Email / Phone OTP (Primary):** Parents enter their registered email address or 10-digit Indian mobile number. A 6-digit cryptographic OTP is generated and delivered to their inbox via Resend / SMTP.
* **Registered Password:** Parents who have set a password can log in immediately. (Default hardcoded passwords like `password123` have been completely removed for safety).
* **Google Sign-In:** One-click instant login via Google Firebase Auth.

### 2. 30-Day "Remember Me" Persistent Session
* Parents check **"Remember me on this device for 30 days"** during login.
* The backend generates a cryptographically signed session token (`HMAC-SHA256`).
* When the parent returns, the portal automatically loads their student's dashboard **without requesting another OTP**.
* Clicking **"Sign Out"** completely destroys the session token immediately.

### 3. Student Data Protection (Zero-Trust Security)
* Student profiles and progress records are **never trusted from browser `localStorage`**.
* The portal sends the cryptographic token to `/.netlify/functions/student-profile`.
* The server verifies the token signature, checks expiration, and returns **only that specific parent's child profile**. No parent can tamper with browser memory to see another student's data.

---

## ⚙️ Backend Environment Variables (Netlify)

To activate live email delivery and security tokens, configure these environment variables in your **Netlify Site Settings** (`Site configuration` > `Environment variables`):

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `OTP_SECRET` | Secret key used to cryptographically sign OTPs and 30-day session tokens | `vediq_sec_2026_super_secure_key_#987` |
| `RESEND_API_KEY` | API Key from Resend.com to send transactional OTP emails | `re_123456789...` |
| `RESEND_FROM_EMAIL` | Sender address for OTP emails (Optional, defaults to `onboarding@resend.dev` or your verified domain) | `admissions@vediqacademy.com` |

---

## 📝 How to Update Website Content

All website files are static HTML/JS/CSS files in the main directory:

| Page / File | What It Controls |
| :--- | :--- |
| [`index.html`](file:///C:/Users/Pankaj/Documents/GitHub/vediq-website/index.html) | Main public homepage, curriculum, 1-hour protocol explorer, pricing, testimonials, lead forms |
| [`parent.html`](file:///C:/Users/Pankaj/Documents/GitHub/vediq-website/parent.html) | Parent portal login, OTP verification, student attendance, cognitive skill matrix, fee receipts |
| [`vediq-ai-concierge.js`](file:///C:/Users/Pankaj/Documents/GitHub/vediq-website/vediq-ai-concierge.js) | Interactive floating AI Concierge assistant |
| [`netlify/functions/otp.js`](file:///C:/Users/Pankaj/Documents/GitHub/vediq-website/netlify/functions/otp.js) | Serverless backend for OTP generation, email dispatch, and token signing |
| [`netlify/functions/student-profile.js`](file:///C:/Users/Pankaj/Documents/GitHub/vediq-website/netlify/functions/student-profile.js) | Secure student data delivery endpoint |

### Updating Text, Phone Numbers, or Fees
1. Open [`index.html`](file:///C:/Users/Pankaj/Documents/GitHub/vediq-website/index.html) or [`parent.html`](file:///C:/Users/Pankaj/Documents/GitHub/vediq-website/parent.html) in your editor.
2. Search (`Ctrl + F`) for the phone number or text you want to change.
3. Update the text, save the file.
4. Commit and push your changes to GitHub (see below).

---

## 🚀 How to Deploy Updates Safely

Whenever you make changes to the files on your computer, deploy them with these simple Git commands:

```bash
# 1. Check which files were modified
git status

# 2. Stage your changes
git add .

# 3. Commit with a clear summary message
git commit -m "Update homepage content and parent portal security"

# 4. Push to GitHub
git push origin main
```

Once pushed:
- **GitHub Pages** updates the live `https://vediqacademy.com` website within 60–90 seconds.
- **Netlify** automatically deploys the backend functions if linked to your repository.

---

## 🛡️ GoDaddy DNS Reference (Do NOT Change)

Your domain `vediqacademy.com` is configured on GoDaddy as follows. **Do not modify or delete these records**:

```text
Type   Name   Value               Purpose
--------------------------------------------------------------------------------------
A      @      185.199.108.153     GitHub Pages CDN Apex
A      @      185.199.109.153     GitHub Pages CDN Apex
A      @      185.199.110.153     GitHub Pages CDN Apex
A      @      185.199.111.153     GitHub Pages CDN Apex
CNAME  www    swag2903.github.io  GitHub Pages WWW Subdomain routing
```

---

## 🆘 Troubleshooting & Support

### Issue 1: "OTP not arriving in parent's inbox"
- **Cause:** `RESEND_API_KEY` is missing or Resend sandbox mode only allows sending to the registered developer email until a domain is verified.
- **Solution:** Verify your Netlify environment variables have `RESEND_API_KEY`. If using unverified free Resend, add your domain `vediqacademy.com` to Resend or use standard Gmail SMTP.

### Issue 2: "Parent sees Login Expired"
- **Cause:** The 30-day session has naturally expired or was revoked.
- **Solution:** Normal security behavior. The parent simply enters an OTP or their password again to renew their 30-day session.

---

## 📞 Leadership & Academic Support
- **Dr. Ujwal Vyas** (Head & Master Mentor): `+91 97667 72819`
- **Mr. Atish Gulhane** (Admissions & Operations Lead): `+91 83903 32500`
- **Mr. Swagatam Shukla** (Community & Academic Tech Support): `+91 95948 06822`
