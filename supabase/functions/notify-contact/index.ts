// deno-lint-ignore-file
// @ts-nocheck - Deno Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "sriteja.245@gmail.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@beyondcoding.in";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const submission: ContactSubmission = await req.json();

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not set, skipping email");
      return new Response(
        JSON.stringify({ message: "Email notification skipped - no API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send notification email to admin
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `beyondCoding Contact <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `New Contact: ${submission.subject || 'No Subject'} - from ${submission.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
              .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
              .field { margin-bottom: 20px; }
              .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
              .value { font-size: 16px; color: #1e293b; }
              .message-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; }
              .footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px; }
              .reply-btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">∞ New Contact Form Submission</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">beyondCoding</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From</div>
                  <div class="value"><strong>${submission.name}</strong></div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${submission.email}" style="color: #6366f1;">${submission.email}</a></div>
                </div>
                <div class="field">
                  <div class="label">Subject</div>
                  <div class="value">${submission.subject || 'No subject provided'}</div>
                </div>
                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${submission.message}</div>
                </div>
                <a href="mailto:${submission.email}?subject=Re: ${submission.subject || 'Your message to beyondCoding'}" class="reply-btn">
                  Reply to ${submission.name}
                </a>
              </div>
              <div class="footer">
                This email was sent from the beyondCoding contact form.
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const err = error as Error;
    console.error("Error in notify-contact:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
