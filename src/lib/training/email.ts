import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Ekagra Training <training@ekagra.in>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://internal-medical-training.vercel.app";

// ── Enrollment confirmation ───────────────────────────────────────────────────

export async function sendEnrollmentEmail({
  to,
  learnerName,
  courseTitle,
  courseId,
  expiresAt,
}: {
  to: string;
  learnerName: string;
  courseTitle: string;
  courseId: string;
  expiresAt: string | null;
}) {
  const courseUrl = `${SITE_URL}/courses/${courseId}`;
  const deadline = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `You've been enrolled in "${courseTitle}"`,
    html: enrollmentHtml({ learnerName, courseTitle, courseUrl, deadline }),
  });
}

// ── Deadline reminder ─────────────────────────────────────────────────────────

export async function sendDeadlineReminderEmail({
  to,
  learnerName,
  courseTitle,
  courseId,
  expiresAt,
  daysLeft,
}: {
  to: string;
  learnerName: string;
  courseTitle: string;
  courseId: string;
  expiresAt: string;
  daysLeft: number;
}) {
  const courseUrl = `${SITE_URL}/courses/${courseId}`;
  const deadline = new Date(expiresAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Reminder: "${courseTitle}" is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
    html: reminderHtml({ learnerName, courseTitle, courseUrl, deadline, daysLeft }),
  });
}

// ── Certificate issued ────────────────────────────────────────────────────────

export async function sendCertificateEmail({
  to,
  learnerName,
  courseTitle,
  certificateId,
}: {
  to: string;
  learnerName: string;
  courseTitle: string;
  certificateId: string;
}) {
  const certUrl = `${SITE_URL}/certificates/${certificateId}`;

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Certificate issued — "${courseTitle}"`,
    html: certificateHtml({ learnerName, courseTitle, certUrl }),
  });
}

// ── HTML templates ────────────────────────────────────────────────────────────

function emailShell(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f5;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:100%">
  <tr><td style="background:#002f65;padding:28px 32px">
    <p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.3px">Ekagra Advanced Wound and Foot Care Hospital</p>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:13px">Internal Medical Training</p>
  </td></tr>
  <tr><td style="padding:32px">${content}</td></tr>
  <tr><td style="background:#f6feff;padding:20px 32px;border-top:1px solid #d5e9ed">
    <p style="margin:0;font-size:12px;color:#526b78">This email was sent by the Ekagra Internal Medical Training platform. Do not reply to this email.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function enrollmentHtml({ learnerName, courseTitle, courseUrl, deadline }: {
  learnerName: string; courseTitle: string; courseUrl: string; deadline: string | null;
}) {
  return emailShell(`
    <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#002f65">You're enrolled</p>
    <p style="margin:0 0 24px;color:#526b78;font-size:15px">Hi ${learnerName}, you've been enrolled in a new training course.</p>
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#f6feff;border-radius:12px;border:1px solid #d5e9ed;margin-bottom:24px">
      <tr><td>
        <p style="margin:0;font-size:13px;color:#526b78;font-weight:500;text-transform:uppercase;letter-spacing:0.08em">Course</p>
        <p style="margin:4px 0 0;font-size:17px;font-weight:600;color:#002f65">${courseTitle}</p>
        ${deadline ? `<p style="margin:8px 0 0;font-size:13px;color:#b45309;font-weight:500">⏰ Deadline: ${deadline}</p>` : ""}
      </td></tr>
    </table>
    <a href="${courseUrl}" style="display:inline-block;background:#007c8b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">Start course →</a>
  `);
}

function reminderHtml({ learnerName, courseTitle, courseUrl, deadline, daysLeft }: {
  learnerName: string; courseTitle: string; courseUrl: string; deadline: string; daysLeft: number;
}) {
  const urgency = daysLeft <= 2 ? "#9d2c25" : daysLeft <= 7 ? "#b45309" : "#007c8b";
  return emailShell(`
    <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#002f65">Training deadline reminder</p>
    <p style="margin:0 0 24px;color:#526b78;font-size:15px">Hi ${learnerName}, this is a reminder to complete your training.</p>
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#fff8f0;border-radius:12px;border:1px solid #f5c07a;margin-bottom:24px">
      <tr><td>
        <p style="margin:0;font-size:13px;color:#526b78;font-weight:500;text-transform:uppercase;letter-spacing:0.08em">Course</p>
        <p style="margin:4px 0 0;font-size:17px;font-weight:600;color:#002f65">${courseTitle}</p>
        <p style="margin:8px 0 0;font-size:14px;font-weight:600;color:${urgency}">Due ${deadline} — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining</p>
      </td></tr>
    </table>
    <a href="${courseUrl}" style="display:inline-block;background:#007c8b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">Continue training →</a>
  `);
}

function certificateHtml({ learnerName, courseTitle, certUrl }: {
  learnerName: string; courseTitle: string; certUrl: string;
}) {
  return emailShell(`
    <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#002f65">🎓 Certificate issued</p>
    <p style="margin:0 0 24px;color:#526b78;font-size:15px">Congratulations ${learnerName}! You've completed your training and earned a certificate.</p>
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#f0fdf4;border-radius:12px;border:1px solid #a3dbbe;margin-bottom:24px">
      <tr><td>
        <p style="margin:0;font-size:13px;color:#526b78;font-weight:500;text-transform:uppercase;letter-spacing:0.08em">Course completed</p>
        <p style="margin:4px 0 0;font-size:17px;font-weight:600;color:#145c36">${courseTitle}</p>
      </td></tr>
    </table>
    <a href="${certUrl}" style="display:inline-block;background:#007c8b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">View certificate →</a>
  `);
}
