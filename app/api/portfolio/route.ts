import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTION_NAME, DOC_ID } from "@/lib/mongodb";
import { INITIAL_DATA } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { sanitizePortfolioData } from "@/lib/sanitize";

// GET — public, no auth required
export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);
    const document = await collection.findOne({ doc_id: DOC_ID });

    if (document) {
      const { _id, doc_id, updatedAt, ...cleanData } = document;
      return NextResponse.json({ success: true, data: cleanData });
    }

    return NextResponse.json({ success: true, data: INITIAL_DATA });
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data." },
      { status: 500 }
    );
  }
}

// PUT — admin only, requires valid session
export async function PUT(request: NextRequest) {
  // ── Auth check ──
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const rawBody = await request.json();

    // ── Sanitize all input ──
    const sanitized = sanitizePortfolioData(rawBody);
    if (!sanitized) {
      return NextResponse.json(
        { success: false, error: "Invalid data format." },
        { status: 400 }
      );
    }

    if (!sanitized.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.updateOne(
      { doc_id: DOC_ID },
      {
        $set: {
          ...sanitized,
          doc_id: DOC_ID,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const success =
      result.matchedCount > 0 ||
      result.upsertedId !== null ||
      result.modifiedCount > 0;

    if (success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Database update failed." },
      { status: 500 }
    );
  } catch (error) {
    console.error("PUT /api/portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update data." },
      { status: 500 }
    );
  }
}