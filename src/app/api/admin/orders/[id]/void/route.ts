import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, canManageContent } from "@/lib/auth";
import { voidOrderWithTickets } from "@/lib/data-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json(
      { error: "Forbidden. Voiding orders requires administrative permissions." },
      { status: 403 },
    );
  }

  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason?.trim();
    const releaseInventory = body.releaseInventory ?? true;
    const notifyCustomer = body.notifyCustomer ?? true;

    if (!reason) {
      return NextResponse.json(
        { error: "A clear void reason is mandatory (e.g. Cardholder Dispute, Suspected Fraud, etc.)." },
        { status: 400 },
      );
    }

    const result = await voidOrderWithTickets(
      id,
      reason,
      `${user.name} (${user.email})`,
      releaseInventory,
      notifyCustomer,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      ticketsVoided: result.ticketsVoided,
    });
  } catch (err: any) {
    console.error("Error in void order route:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
