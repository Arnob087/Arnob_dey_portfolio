import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// ~10MB file limit (base64 is ~33% larger than binary)
const MAX_BASE64_LENGTH = 14 * 1024 * 1024;

/**
 * Sanitize a filename: remove special chars, replace spaces with underscores.
 * Keeps only letters, numbers, underscores, and hyphens.
 */
function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "_")           // spaces → underscores
    .replace(/[^a-zA-Z0-9_-]/g, "") // remove special chars
    .slice(0, 100);                  // limit length
}

export async function POST(request: NextRequest) {
  // ── Auth check ──
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const cloudinaryUrl = process.env.CLOUDINARY_UPLOAD_URL;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudinaryUrl || !uploadPreset) {
    return NextResponse.json(
      { success: false, error: "Cloudinary is not configured." },
      { status: 500 }
    );
  }

  try {
    const { file, filename } = await request.json();

    // ── Validate file exists ──
    if (!file || typeof file !== "string") {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    // ── Validate file type (images + PDF) ──
    const isImage = file.startsWith("data:image/");
    const isPdf = file.startsWith("data:application/pdf");

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { success: false, error: "Only image and PDF files are allowed." },
        { status: 400 }
      );
    }

    // ── Validate file size ──
    if (file.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { success: false, error: "File too large (max 10 MB)." },
        { status: 400 }
      );
    }

    // ── Build custom public_id from filename ──
    // If filename is provided (e.g. "Arnob_Dey"), use it
    // Otherwise generate a timestamped name
    const customName = filename
      ? sanitizeFilename(filename)
      : `upload-${Date.now()}`;

    // ── Determine Cloudinary upload endpoint ──
    let uploadUrl = cloudinaryUrl;
    if (isPdf) {
      uploadUrl = cloudinaryUrl.replace("/image/upload", "/raw/upload");
    }

    // ── Upload using FormData ──
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("public_id", customName);
    formData.append("resource_type", isPdf ? "raw" : "image");

    // This is the key: when someone downloads the file,
    // Cloudinary will use this as the download filename
    if (isPdf) {
      formData.append(
        "context",
        `alt=${customName}.pdf|caption=${customName}`
      );
    }

    const cloudinaryResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!cloudinaryResponse.ok) {
      const errBody = await cloudinaryResponse.json().catch(() => ({}));
      console.error("Cloudinary error:", errBody);
      return NextResponse.json(
        { success: false, error: "Cloudinary upload failed." },
        { status: 502 }
      );
    }

    const result = await cloudinaryResponse.json();

    // For PDFs, append fl_attachment to force download with the custom filename
    let fileUrl = result.secure_url;
    if (isPdf && fileUrl) {
      // Cloudinary raw URLs look like:
      // https://res.cloudinary.com/cloud/raw/upload/v123/Arnob_Dey
      // We insert fl_attachment:filename into the URL for download
      fileUrl = fileUrl.replace(
        "/upload/",
        `/upload/fl_attachment:${customName}/`
      );
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      originalUrl: result.secure_url, // Direct link (opens in browser)
      downloadUrl: isPdf ? fileUrl : result.secure_url, // Forces download with name
      filename: isPdf ? `${customName}.pdf` : customName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed." },
      { status: 500 }
    );
  }
}