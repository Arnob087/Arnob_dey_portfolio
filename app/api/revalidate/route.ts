import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// External webhook — uses secret for auth
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.REVALIDATION_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Not configured." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (body.secret !== secret) {
      return NextResponse.json(
        { success: false, error: "Invalid secret." },
        { status: 401 }
      );
    }

    revalidatePath("/", "page");
    revalidatePath("/projects", "page");

    return NextResponse.json({ success: true, revalidated: true });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed." },
      { status: 500 }
    );
  }
}