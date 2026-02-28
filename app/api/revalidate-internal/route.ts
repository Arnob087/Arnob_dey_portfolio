import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // ── Auth check — only admins can trigger revalidation ──
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    revalidatePath("/", "page");
    revalidatePath("/projects", "page");

    return NextResponse.json({
      success: true,
      revalidated: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { success: false, error: "Revalidation failed." },
      { status: 500 }
    );
  }
}