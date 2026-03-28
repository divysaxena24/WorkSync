// Simple Notification System using Resend API via native fetch
// No npm install required for this tier 2 feature.

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Helper to send email
async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn("No RESEND_API_KEY set. Simulating email send:", { to, subject });
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "WorkSync AI <notifications@resend.dev>", // using Resend's default test domain
        to,
        subject,
        html
      })
    });

    if (!res.ok) {
      console.error("Resend API Error:", await res.text());
    } else {
      console.log(`Email sent to ${to} for subject: ${subject}`);
    }
  } catch (e) {
    console.error("Failed to send email via Resend:", e);
  }
}

export async function sendTaskAssignmentEmail(userEmail: string, userName: string, taskTitle: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">New Task Assignment</h2>
      <p>Hi ${userName},</p>
      <p>A new task has been assigned to you by WorkSync AI based on a recent meeting.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
        <strong>Task:</strong> ${taskTitle}
      </div>
      <p>Please log in to your WorkSync dashboard to view details and execute this task.</p>
    </div>
  `;
  await sendEmail(userEmail, `New Task Assigned: ${taskTitle}`, html);
}

export async function sendRiskAlertEmail(userEmail: string, userName: string, taskTitle: string, reason: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
      <h2 style="color: #ef4444;">Task Bottleneck Risk Detected</h2>
      <p>Hi ${userName},</p>
      <p>Our autonomous AI agent has flagged a potential bottleneck execution risk for one of your tasks.</p>
      <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
        <strong>Task:</strong> ${taskTitle}<br/>
        <strong style="color: #b91c1c; display: block; margin-top: 10px;">AI Analysis:</strong> ${reason}
      </div>
      <p>Please review this task to prevent missing the deadline.</p>
    </div>
  `;
  await sendEmail(userEmail, `⚠️ Risk Alert: ${taskTitle}`, html);
}

export async function sendFollowUpNudge(userEmail: string, userName: string, taskTitle: string, nudgeMessage: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Meeting Follow-up</h2>
      <p>Hi ${userName},</p>
      <p>A quick autonomous follow-up regarding a pending task from yesterday's meeting:</p>
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
        <strong>Task:</strong> ${taskTitle}<br/>
        <p style="margin-top: 10px; font-style: italic;">"${nudgeMessage}"</p>
      </div>
      <p>Feel free to jump into WorkSync to update the status if you're already on it!</p>
    </div>
  `;
  await sendEmail(userEmail, `Follow-up on: ${taskTitle}`, html);
}
