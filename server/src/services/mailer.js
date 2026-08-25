import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const BRAND = {
  name: 'Precise Timing Transports',
  tagline: 'On Time. Every Time.',
  blueDark: '#082138',
  blue: '#12518d',
  blueSoft: '#eef4fb',
  gold: '#d4af37',
  text: '#1d2b3a',
  muted: '#5c6f82',
  border: '#dfe8f1',
};

let transporter;

export function isMailerConfigured() {
  return Boolean(env.EMAIL_USER && env.EMAIL_APP_PASSWORD);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_APP_PASSWORD },
    });
  }
  return transporter;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function infoRow(label, value) {
  if (value == null || String(value).trim() === '') return '';
  return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid ${BRAND.border};font:600 12px/1.4 Arial,Helvetica,sans-serif;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid ${BRAND.border};font:600 14px/1.5 Arial,Helvetica,sans-serif;color:${BRAND.text};vertical-align:top;word-break:break-word;">${escapeHtml(value)}</td>
    </tr>`;
}

function quickActions({ email, phone }) {
  const buttons = [];
  if (email) {
    buttons.push(
      `<a href="mailto:${escapeHtml(email)}" style="display:inline-block;margin:0 6px 8px 0;padding:11px 22px;background:${BRAND.blue};color:#ffffff;font:700 13px Arial,Helvetica,sans-serif;text-decoration:none;border-radius:24px;">&#9993;&nbsp; Reply by Email</a>`
    );
  }
  if (phone) {
    const clean = String(phone).replace(/[^+\d]/g, '');
    buttons.push(
      `<a href="sms:${escapeHtml(clean)}" style="display:inline-block;margin:0 6px 8px 0;padding:11px 22px;background:${BRAND.blueDark};color:#ffffff;font:700 13px Arial,Helvetica,sans-serif;text-decoration:none;border-radius:24px;">&#128172;&nbsp; Text Customer</a>`
    );
  }
  if (!buttons.length) return '';
  return `<div style="padding:18px 24px 6px;text-align:center;">${buttons.join('')}</div>`;
}

function transcriptSection(transcript) {
  if (!transcript?.length) return '';
  const bubbles = transcript
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => {
      const isUser = m.role === 'user';
      return `
        <tr><td style="padding:4px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            ${isUser ? '' : '<td style="width:18%;"></td>'}
            <td style="background:${isUser ? BRAND.blueSoft : BRAND.blue};color:${isUser ? BRAND.text : '#ffffff'};border-radius:12px;padding:10px 14px;font:400 13px/1.55 Arial,Helvetica,sans-serif;word-break:break-word;">
              <span style="display:block;font:700 10px Arial,Helvetica,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:${isUser ? BRAND.blue : '#bcd6ef'};padding-bottom:3px;">${isUser ? 'Customer' : 'AI Assistant'}</span>
              ${escapeHtml(m.content)}
            </td>
            ${isUser ? '<td style="width:18%;"></td>' : ''}
          </tr></table>
        </td></tr>`;
    })
    .join('');

  return `
    <div style="padding:8px 24px 4px;">
      <p style="margin:14px 0 8px;font:800 12px Arial,Helvetica,sans-serif;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.08em;">&#128221; Chat conversation</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafd;border:1px solid ${BRAND.border};border-radius:12px;padding:10px;">
        ${bubbles}
      </table>
    </div>`;
}

/**
 * Branded, mobile-responsive lead notification email (inline CSS only so it
 * renders correctly in Gmail, Outlook, and Apple Mail).
 */
function buildLeadEmailHtml({ heading, badge, rows, transcript, contact, footNote }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#eef2f7;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(footNote || heading)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 10px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(8,33,56,0.12);">

          <!-- Header -->
          <tr><td style="background:linear-gradient(115deg,${BRAND.blueDark},${BRAND.blue});background-color:${BRAND.blueDark};padding:28px 24px;text-align:center;">
            <p style="margin:0;font:800 20px Georgia,'Times New Roman',serif;color:#ffffff;">Precise Timing <span style="color:${BRAND.gold};">Transports</span></p>
            <p style="margin:6px 0 0;font:600 11px Arial,Helvetica,sans-serif;color:#a9c4de;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(BRAND.tagline)}</p>
          </td></tr>

          <!-- Badge + heading -->
          <tr><td style="padding:26px 24px 6px;text-align:center;">
            <span style="display:inline-block;padding:6px 16px;background:${BRAND.blueSoft};border:1px solid ${BRAND.border};color:${BRAND.blue};font:800 11px Arial,Helvetica,sans-serif;letter-spacing:0.1em;text-transform:uppercase;border-radius:20px;">${escapeHtml(badge)}</span>
            <h1 style="margin:14px 0 4px;font:800 22px Georgia,'Times New Roman',serif;color:${BRAND.text};">${escapeHtml(heading)}</h1>
            <p style="margin:0;font:400 13px Arial,Helvetica,sans-serif;color:${BRAND.muted};">Received ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })} (Cincinnati time)</p>
          </td></tr>

          <!-- Quick actions -->
          <tr><td>${quickActions(contact || {})}</td></tr>

          <!-- Details table -->
          <tr><td style="padding:14px 24px 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
              ${rows}
            </table>
          </td></tr>

          <!-- Transcript (chatbot leads) -->
          <tr><td>${transcriptSection(transcript)}</td></tr>

          <!-- Footer -->
          <tr><td style="padding:22px 24px 26px;text-align:center;">
            <p style="margin:0 0 4px;font:400 12px Arial,Helvetica,sans-serif;color:${BRAND.muted};">${escapeHtml(footNote || 'Respond within 48 hours to keep the customer promise.')}</p>
            <p style="margin:0;font:400 11px Arial,Helvetica,sans-serif;color:#93a5b7;">Automated notification from the ${escapeHtml(BRAND.name)} website &amp; AI assistant.</p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function buildPlainText(rowsData, transcript) {
  const lines = rowsData
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`);
  if (transcript?.length) {
    lines.push('', '--- Chat conversation ---');
    for (const m of transcript) {
      if (m?.content) lines.push(`${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`);
    }
  }
  return lines.join('\n');
}

async function send({ subject, html, text, replyTo, attachments }) {
  if (!isMailerConfigured()) {
    console.warn('Mailer not configured (EMAIL_USER / EMAIL_APP_PASSWORD missing) — skipping email');
    return { sent: false, reason: 'not_configured' };
  }
  const to = env.EMAIL_NOTIFY_TO || env.EMAIL_USER;
  const info = await getTransporter().sendMail({
    from: `"${BRAND.name} Leads" <${env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
    ...(attachments?.length
      ? {
          attachments: attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
          })),
        }
      : {}),
  });
  return { sent: true, messageId: info.messageId };
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Website contact / quote form submission. */
export async function sendContactFormEmail(form, attachments = []) {
  const rowsData = [
    ['Name / Business', form.name],
    ['Service needed', form.service],
    ['Email', form.email],
    ['Phone', form.phone],
    ['Pickup address', form.pickup],
    ['Drop-off address', form.dropoff],
    ['Flights of stairs', form.stairs],
    ['Preferred move date', form.date],
    ['Additional details', form.details],
    [
      'Attached files',
      attachments.length
        ? attachments.map((a) => `${a.filename} (${formatBytes(a.size)})`).join(', ')
        : '',
    ],
  ];

  const html = buildLeadEmailHtml({
    badge: 'Website quote request',
    heading: 'New Quote Request',
    rows: rowsData.map(([k, v]) => infoRow(k, v)).join(''),
    contact: { email: form.email, phone: form.phone },
    footNote: attachments.length
      ? `Submitted through the website quote form — ${attachments.length} file(s) attached to this email.`
      : 'Submitted through the Request a FREE Quote form on the website.',
  });

  const who = form.name || form.email || 'Website visitor';
  return send({
    subject: `New Quote Request — ${who}${form.service ? ` (${form.service})` : ''}${attachments.length ? ` · ${attachments.length} 📎` : ''}`,
    html,
    text: buildPlainText(rowsData),
    replyTo: form.email || undefined,
    attachments,
  });
}

/** Chatbot lead captured / updated by the AI assistant. */
export async function sendChatbotLeadEmail({ lead, transcript, isUpdate }) {
  const meta = lead.metadata || {};
  const rowsData = [
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Pickup address', lead.pickup_address],
    ['Drop-off address', lead.dropoff_address],
    ['Move date', lead.move_date],
    ['Move size', lead.move_size],
    ['Intent', meta.intentType],
    ['Notes', lead.notes],
    ['Lead ID', lead.id],
  ];

  const html = buildLeadEmailHtml({
    badge: isUpdate ? 'Chatbot lead — updated info' : 'New chatbot lead',
    heading: isUpdate ? 'Chatbot Lead Updated' : 'New Lead from AI Assistant',
    rows: rowsData.map(([k, v]) => infoRow(k, v)).join(''),
    transcript,
    contact: { email: lead.email, phone: lead.phone },
    footNote: 'Captured automatically by the AI chat assistant on the website.',
  });

  const who = lead.name || lead.phone || lead.email || 'Website visitor';
  return send({
    subject: `${isUpdate ? 'Updated' : 'New'} Chatbot Lead — ${who}`,
    html,
    text: buildPlainText(rowsData, transcript),
    replyTo: lead.email || undefined,
  });
}
