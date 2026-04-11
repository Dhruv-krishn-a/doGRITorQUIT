import nodemailer from "nodemailer";

const domain = (process.env.NEXTAUTH_URL || "https://www.dogritorquit.in").replace(/\/+$/, "");
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? "587");
const smtpSecure = String(process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || smtpPort === 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "Do Grit <no-reply@dogritorquit.in>";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM."
    );
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

function appFrame(title: string, body: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827">
      <h2 style="font-size:24px;line-height:1.2;margin:0 0 12px;font-weight:800;text-transform:uppercase">${title}</h2>
      <div style="font-size:15px;line-height:1.6;color:#374151">${body}</div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="font-size:11px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin:0;font-weight:900;font-style:italic">© 2026 grit.io</p>
    </div>
  `;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const tx = getTransporter();
  await tx.sendMail({
    from: smtpFrom,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/verify?token=${encodeURIComponent(token)}`;
  const html = appFrame(
    "Verify Your Email",
    `
      <p>Please verify your email to activate your account.</p>
      <p style="margin:20px 0">
        <a href="${confirmLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">Verify Email</a>
      </p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create this account, you can ignore this email.</p>
    `
  );
  await sendEmail({
    to: email,
    subject: "Verify your Do Grit account",
    html,
    text: `Verify your email: ${confirmLink}`,
  });
};

export const sendFeedbackEmail = async (params: {
  email: string;
  message: string;
  platform: string;
  type: string;
  metadata?: any;
}) => {
  const html = appFrame(
    "New Feedback Received",
    `
      <p>A user has submitted feedback from the <strong>${params.platform}</strong> platform.</p>
      <ul style="padding-left:18px">
        <li><strong>From:</strong> ${params.email}</li>
        <li><strong>Type:</strong> ${params.type}</li>
        <li><strong>Platform:</strong> ${params.platform}</li>
      </ul>
      <p style="margin:20px 0; padding:15px; background:#f3f4f6; border-radius:8px; font-style:italic">
        "${params.message}"
      </p>
      ${params.metadata ? `<p><strong>Technical Context:</strong> <pre style="font-size:10px">${JSON.stringify(params.metadata, null, 2)}</pre></p>` : ""}
    `
  );
  await sendEmail({
    to: "dogritorquit@gmail.com",
    subject: `[${params.platform.toUpperCase()}] ${params.type}: New Feedback`,
    html,
    text: `Feedback from ${params.email} on ${params.platform}: ${params.message}`,
  });
};

export const sendMagicLinkEmail = async (email: string, magicLink: string) => {
  const html = appFrame(
    "Sign In Link",
    `
      <p>Click the button below to sign in.</p>
      <p style="margin:20px 0">
        <a href="${magicLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">Sign In</a>
      </p>
      <p>This login link is valid for 10 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
    `
  );
  await sendEmail({
    to: email,
    subject: "Your sign-in link",
    html,
    text: `Sign in: ${magicLink}`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const html = appFrame(
    "Reset Password",
    `
      <p>We received a password reset request for your account.</p>
      <p style="margin:20px 0">
        <a href="${resetLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">Reset Password</a>
      </p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, secure your account immediately.</p>
    `
  );
  await sendEmail({
    to: email,
    subject: "Reset your password",
    html,
    text: `Reset your password: ${resetLink}`,
  });
};

export const sendNewLoginAlertEmail = async (params: {
  email: string;
  time: Date;
  ip?: string | null;
  userAgent?: string | null;
  locationHint?: string | null;
}) => {
  const secureLink = `${domain}/forgot-password`;
  const html = appFrame(
    "New Login Detected",
    `
      <p>We noticed a login from a new device or location.</p>
      <ul style="padding-left:18px">
        <li><strong>Time:</strong> ${params.time.toISOString()}</li>
        <li><strong>Device:</strong> ${params.userAgent ?? "Unknown"}</li>
        <li><strong>IP:</strong> ${params.ip ?? "Unknown"}</li>
        <li><strong>Location:</strong> ${params.locationHint ?? "Unknown"}</li>
      </ul>
      <p style="margin:20px 0">
        <a href="${secureLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">Not You? Secure Account</a>
      </p>
    `
  );
  await sendEmail({
    to: params.email,
    subject: "Security alert: new login detected",
    html,
    text: `New login detected at ${params.time.toISOString()} from IP ${params.ip ?? "unknown"}.`,
  });
};

export const sendSuspiciousActivityEmail = async (params: {
  email: string;
  reason: string;
  time: Date;
  ip?: string | null;
  userAgent?: string | null;
  locationHint?: string | null;
}) => {
  const secureLink = `${domain}/forgot-password`;
  const html = appFrame(
    "Suspicious Activity Detected",
    `
      <p>We detected unusual authentication activity on your account.</p>
      <ul style="padding-left:18px">
        <li><strong>What happened:</strong> ${params.reason}</li>
        <li><strong>Time:</strong> ${params.time.toISOString()}</li>
        <li><strong>Device:</strong> ${params.userAgent ?? "Unknown"}</li>
        <li><strong>IP:</strong> ${params.ip ?? "Unknown"}</li>
        <li><strong>Location:</strong> ${params.locationHint ?? "Unknown"}</li>
      </ul>
      <p style="margin:20px 0">
        <a href="${secureLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">Reset Password</a>
      </p>
    `
  );
  await sendEmail({
    to: params.email,
    subject: "Security warning: suspicious activity",
    html,
    text: `Suspicious activity detected (${params.reason}) at ${params.time.toISOString()}.`,
  });
};
