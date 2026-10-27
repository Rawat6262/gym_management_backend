const nodemailer = require("nodemailer");
const crypto = require("crypto");

// -----------------------------
// One shared, pooled transporter for the whole app.
// Uses SMTP_* env vars when set (e.g. Brevo / SES / your domain's mail server),
// otherwise falls back to Gmail with EMAIL / EMAIL_PASS.
// -----------------------------
let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const auth = {
    user: process.env.SMTP_USER || process.env.EMAIL,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
  };

  transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        pool: true,
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth
      })
    : nodemailer.createTransport({ pool: true, service: "gmail", auth });

  return transporter;
};

const GYM_NAME = () => process.env.GYM_NAME || "Pro Fitness Gym";

// The From address MUST be the authenticated mailbox — a different address
// fails SPF/DMARC checks and is the #1 reason mail lands in spam.
const fromAddress = () =>
  `"${GYM_NAME()}" <${process.env.MAIL_FROM || process.env.EMAIL}>`;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[c]));

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

// -----------------------------
// Layout: plain, light HTML (no images, emojis, colored warnings or
// shouty text) plus a matching plain-text version — spam filters score
// HTML-only and image-heavy mail worse.
// -----------------------------
const layout = (title, bodyHtml) => {
  const address = process.env.GYM_ADDRESS
    ? `<br>${escapeHtml(process.env.GYM_ADDRESS)}`
    : "";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#27272a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:8px;">
        <tr><td style="padding:24px 28px 8px;font-size:18px;font-weight:bold;">${escapeHtml(GYM_NAME())}</td></tr>
        <tr><td style="padding:8px 28px 24px;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.5;color:#71717a;">
          You are receiving this email because you have an account with ${escapeHtml(GYM_NAME())}.${address}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const footerText = () =>
  `\n\n--\nYou are receiving this email because you have an account with ${GYM_NAME()}.` +
  (process.env.GYM_ADDRESS ? `\n${process.env.GYM_ADDRESS}` : "");

const rows = (pairs) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;font-size:14px;">` +
  pairs
    .map(([label, value]) =>
      `<tr><td style="padding:6px 0;color:#71717a;">${escapeHtml(label)}</td>` +
      `<td style="padding:6px 0;text-align:right;font-weight:bold;">${escapeHtml(value)}</td></tr>`)
    .join("") +
  `</table>`;

const rowsText = (pairs) => pairs.map(([label, value]) => `${label}: ${value}`).join("\n");

const send = ({ to, subject, html, text }) =>
  getTransporter().sendMail({
    from: fromAddress(),
    to,
    replyTo: process.env.MAIL_REPLY_TO || undefined,
    subject,
    html,
    text,
    headers: {
      // Unique per message so Gmail doesn't collapse repeated mails into
      // one thread (repeated identical threads look like bulk mail).
      "X-Entity-Ref-ID": crypto.randomUUID()
    }
  });

// -----------------------------
// OTP
// purpose: "signup" | "reset"
// -----------------------------
const sendOtpEmail = (email, otp, { name, purpose = "signup" } = {}) => {
  const action = purpose === "reset" ? "reset your password" : "verify your email";
  const greeting = name ? `Hi ${name},` : "Hi,";

  return send({
    to: email,
    subject: `${otp} is your ${GYM_NAME()} verification code`,
    text:
      `${greeting}\n\nUse this code to ${action}:\n\n${otp}\n\n` +
      `The code expires in 5 minutes. If you did not request it, you can ignore this email.` +
      footerText(),
    html: layout("Your verification code", `
      <p>${escapeHtml(greeting)}</p>
      <p>Use this code to ${action}:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;margin:16px 0;">${escapeHtml(otp)}</p>
      <p>The code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
    `)
  });
};

// -----------------------------
// Welcome
// needsSignup: true for admin-created members who still have to set a password
// -----------------------------
const sendWelcomeEmail = (email, { name, needsSignup = false } = {}) => {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const appUrl = process.env.APP_URL;

  const nextStep = needsSignup
    ? `Your membership has been set up. To view your plan, payments and attendance online, sign up with this email address${appUrl ? ` at ${appUrl}` : ""} to create your password.`
    : `Your account is verified. You can now log in${appUrl ? ` at ${appUrl}` : ""} to view your plan, payments and attendance.`;

  return send({
    to: email,
    subject: `Welcome to ${GYM_NAME()}`,
    text:
      `${greeting}\n\nWelcome to ${GYM_NAME()}. We are glad to have you with us.\n\n${nextStep}\n\n` +
      `If you have any questions, just reply to this email or speak to us at the front desk.\n\nSee you at the gym!` +
      footerText(),
    html: layout(`Welcome to ${GYM_NAME()}`, `
      <p>${escapeHtml(greeting)}</p>
      <p>Welcome to ${escapeHtml(GYM_NAME())}. We are glad to have you with us.</p>
      <p>${escapeHtml(nextStep)}</p>
      <p>If you have any questions, just reply to this email or speak to us at the front desk.</p>
      <p>See you at the gym!</p>
    `)
  });
};

// -----------------------------
// Plan payment receipt
// -----------------------------
const sendPaymentReceipt = (email, { name, receiptNo, planName, planPrice, amountPaid, nextDueDate, totalPending }) => {
  const pairs = [
    ["Receipt no", receiptNo],
    ["Plan", planName],
    ["Plan price", `Rs. ${planPrice}`],
    ["Amount paid", `Rs. ${amountPaid}`],
    ["Payment date", formatDate(new Date())],
    ["Next due date", formatDate(nextDueDate)],
    ["Balance due", `Rs. ${totalPending}`]
  ];
  const note = totalPending > 0
    ? `A balance of Rs. ${totalPending} is still due. You can clear it at the front desk.`
    : "You have no pending dues.";

  return send({
    to: email,
    subject: `Payment receipt ${receiptNo} - ${GYM_NAME()}`,
    text: `Hi ${name},\n\nThank you for your payment. Here are the details:\n\n${rowsText(pairs)}\n\n${note}` + footerText(),
    html: layout("Payment receipt", `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for your payment. Here are the details:</p>
      ${rows(pairs)}
      <p>${escapeHtml(note)}</p>
    `)
  });
};

// -----------------------------
// Pending dues receipt
// -----------------------------
const sendDuesReceipt = (email, { name, receiptNo, amountPaid, remainingPending }) => {
  const pairs = [
    ["Receipt no", receiptNo],
    ["Payment for", "Pending dues"],
    ["Amount paid", `Rs. ${amountPaid}`],
    ["Payment date", formatDate(new Date())],
    ["Remaining balance", `Rs. ${remainingPending}`]
  ];
  const note = remainingPending > 0
    ? `A balance of Rs. ${remainingPending} is still due.`
    : "All your dues are cleared.";

  return send({
    to: email,
    subject: `Payment receipt ${receiptNo} - ${GYM_NAME()}`,
    text: `Hi ${name},\n\nThank you for your payment. Here are the details:\n\n${rowsText(pairs)}\n\n${note}` + footerText(),
    html: layout("Payment receipt", `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thank you for your payment. Here are the details:</p>
      ${rows(pairs)}
      <p>${escapeHtml(note)}</p>
    `)
  });
};

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendPaymentReceipt,
  sendDuesReceipt
};
