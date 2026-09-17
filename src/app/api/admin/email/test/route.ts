import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSuperAdmin } from "@/lib/auth";
import {
  testPostmarkServer,
  sendPostmarkEmail,
  getPostmarkConfig,
} from "@/lib/email";

export async function GET() {
  const user = await getAuthUser();
  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getPostmarkConfig();
  const serverStatus = await testPostmarkServer();

  return NextResponse.json({
    config: {
      tokenConfigured: Boolean(config.token),
      tokenMasked: config.token
        ? `${config.token.slice(0, 8)}...${config.token.slice(-4)}`
        : "None",
      fromEmail: config.fromEmail,
      messageStream: config.messageStream,
    },
    serverStatus,
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !isSuperAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { to, fromEmail, subject } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required." },
        { status: 400 },
      );
    }

    const testSubject =
      subject || "⚡ Postmark Email Server Test - No Limit Fest";
    const testHtml = `
      <div style="font-family: sans-serif; background-color: #0A0D18; color: #FFFFFF; padding: 30px; border-radius: 12px;">
        <h2 style="color: #FF5722; margin: 0 0 10px 0;">Postmark Delivery Confirmed!</h2>
        <p style="color: #E2E8F0; font-size: 15px; line-height: 1.6;">
          This is a verified test email sent through the <strong>Postmark REST API</strong> from your <strong>No Limit Fest Backoffice</strong>.
        </p>
        <div style="background-color: #161C2E; padding: 15px; border-radius: 8px; border: 1px solid #2B3553; font-size: 13px; color: #94A3B8;">
          <strong>Server Stream:</strong> Outbound Transactional<br/>
          <strong>Timestamp:</strong> ${new Date().toUTCString()}<br/>
          <strong>Triggered By:</strong> ${user.name} (${user.email})
        </div>
      </div>
    `;

    const result = await sendPostmarkEmail({
      to,
      fromEmail,
      subject: testSubject,
      htmlBody: testHtml,
      tag: "admin-test-email",
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      errorCode: result.errorCode,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process test email request." },
      { status: 500 },
    );
  }
}
