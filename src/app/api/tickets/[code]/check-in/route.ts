import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, hasPermission, canAccessEvent } from "@/lib/auth";
import { performTicketCheckIn, getTicketByCode } from "@/lib/data-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;
    const user = await getAuthUser();

    if (!user || !hasPermission(user, "scan")) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. You must have gate scanner permission to check in tickets.",
        },
        { status: 403 },
      );
    }

    const existingTicket = await getTicketByCode(code);
    if (!existingTicket) {
      return NextResponse.json(
        { error: "Invalid ticket pass. Code not found.", status: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (!canAccessEvent(user, (existingTicket as any).eventId)) {
      return NextResponse.json(
        {
          error: `Forbidden. You are not assigned to gate check-in for the ${existingTicket.eventName || "this"} festival edition.`,
          status: "INVALID_EVENT",
        },
        { status: 403 },
      );
    }

    const deviceInfo = req.headers.get("user-agent") || "web-mobile";
    const result = await performTicketCheckIn(
      code,
      `${user.name} (${user.role})`,
      deviceInfo,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          status: result.status,
          ticket: result.ticket,
        },
        { status: result.status === "NOT_FOUND" ? 404 : 409 },
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      ticket: result.ticket,
      message: result.message,
    });
  } catch (err: any) {
    console.error("Check-in Route Exception:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;
    const ticket = await getTicketByCode(code);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({ ticket });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
