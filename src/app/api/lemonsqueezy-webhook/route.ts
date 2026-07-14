import { NextResponse } from "next/server";

/**
 * Lemon Squeezy Webhook Handler
 * 接收订单通知 → 自动发送报告填写链接给客户
 *
 * 在 Lemon Squeezy 后台设置 Webhook URL:
 * https://yourdomain.com/api/lemonsqueezy-webhook
 * 事件: order_created
 * 签名密钥: 在 Lemon Squeezy Settings > Webhooks 中获取
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = request.headers.get("x-event-name");

    // Only handle order_created events
    if (event !== "order_created") {
      return NextResponse.json({ received: true });
    }

    const orderData = body.data;
    const customerEmail = orderData?.attributes?.user_email;
    const customerName = orderData?.attributes?.user_name || "there";
    const productName = orderData?.attributes?.first_order_item?.product_name || "your Blueprint";

    if (!customerEmail) {
      return NextResponse.json({ error: "No customer email" }, { status: 400 });
    }

    // Build the order form URL with pre-filled product
    const orderFormUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173"}/order`;

    // Send email to customer with the order form link
    // (Using Resend - same as generate-report)
    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    const FROM_EMAIL = process.env.FROM_EMAIL || "hello@orientaldestiny.com";

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `Oriental Aesthetic <${FROM_EMAIL}>`,
          to: [customerEmail],
          subject: `Thank you for your order — Complete your ${productName}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="font-weight: 400; color: #2B2318;">Thank you, ${customerName}!</h1>
              <p style="color: #3A342C; line-height: 1.7;">
                Your order for <strong>${productName}</strong> has been confirmed.
              </p>
              <p style="color: #3A342C; line-height: 1.7;">
                To create your personalized report, please complete the birth information form:
              </p>
              <a href="${orderFormUrl}" style="display: inline-block; background: #26382c; color: #fff; padding: 14px 28px; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; margin: 16px 0;">
                Complete Your Form →
              </a>
              <p style="color: #8A8178; font-size: 12px; margin-top: 24px;">
                Once submitted, your personalized Five Elements Blueprint will be delivered within 3–5 business days.
              </p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
