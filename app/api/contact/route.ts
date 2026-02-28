import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeString, isValidEmail } from "@/lib/sanitize";

function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limit: max 3 emails per 10 minutes per IP
  const limit = checkRateLimit(`contact:${ip}`, {
    max: 3,
    windowSeconds: 600,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many messages. Try again in ${limit.retryAfterSeconds}s.`,
      },
      { status: 429 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const toEmail = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { success: false, error: "Email service is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 320);
    const message = sanitizeString(body.message, 5000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address." },
        { status: 400 }
      );
    }

    const safeName = sanitizeHtml(name);
    const safeEmail = sanitizeHtml(email);
    const safeMessage = sanitizeHtml(message);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Portfolio Contact <${fromEmail}>`,
        to: [toEmail],
        reply_to: email,
        subject: `New Contact Message from ${safeName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#333;border-bottom:2px solid #4f46e5;padding-bottom:10px;">📬 New Portfolio Inquiry</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <tr><td style="padding:8px;font-weight:bold;color:#555;">Name:</td><td style="padding:8px;">${safeName}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;color:#555;">Email:</td><td style="padding:8px;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px;">
              <p style="font-weight:bold;color:#555;margin-bottom:8px;">Message:</p>
              <p style="color:#333;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
            </div>
            <hr style="margin-top:24px;border:none;border-top:1px solid #e5e7eb;"/>
            <p style="font-size:12px;color:#9ca3af;">Sent from your portfolio contact form.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("Resend error:", response.status, errorBody);
      return NextResponse.json(
        { success: false, error: "Email sending failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email." },
      { status: 500 }
    );
  }
}