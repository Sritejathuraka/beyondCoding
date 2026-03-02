// Follow this type definition strictly
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://beyondcoding.in";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "hello@beyondcoding.in";

interface ContentPayload {
  contentType: "article" | "course";
  contentId: string;
  title: string;
  description: string;
  url: string;
}

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: ContentPayload = await req.json();
    const { contentType, contentId, title, description, url } = payload;

    if (!contentType || !contentId || !title) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create admin Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if we already sent notification for this content
    const { data: existingNotification } = await supabase
      .from("notification_log")
      .select("id")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .single();

    if (existingNotification) {
      return new Response(
        JSON.stringify({ message: "Notification already sent" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all verified subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email, name")
      .eq("verified", true)
      .is("unsubscribed_at", null);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers to notify" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log the notification attempt
    await supabase.from("notification_log").insert({
      content_type: contentType,
      content_id: contentId,
      subscriber_count: subscribers.length,
      status: "pending",
    });

    // Send emails via Resend
    const contentTypeLabel = contentType === "article" ? "📝 New Article" : "📚 New Course";
    const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;

    // Batch send to all subscribers
    const emailPromises = subscribers.map((subscriber) => {
      const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
      
      return fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `beyondCoding <${FROM_EMAIL}>`,
          to: subscriber.email,
          subject: `${contentTypeLabel}: ${title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; margin: 0;">
                  <span style="color: #9ca3af;">beyond</span>
                  <span style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Coding</span>
                </h1>
              </div>
              
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <p style="color: #8B5CF6; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">${contentTypeLabel}</p>
                <h2 style="font-size: 22px; margin: 0 0 12px 0; color: #ffffff;">${title}</h2>
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">${description}</p>
                <a href="${fullUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
                  Read Now →
                </a>
              </div>
              
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #333;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  You're receiving this because you subscribed to beyondCoding.<br>
                  <a href="${unsubscribeUrl}" style="color: #8B5CF6; text-decoration: underline;">Unsubscribe</a>
                </p>
              </div>
            </body>
            </html>
          `,
        }),
      });
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter((r) => r.status === "fulfilled").length;

    // Update notification log
    await supabase
      .from("notification_log")
      .update({ status: successCount > 0 ? "sent" : "failed" })
      .eq("content_type", contentType)
      .eq("content_id", contentId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount}/${subscribers.length} emails`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
