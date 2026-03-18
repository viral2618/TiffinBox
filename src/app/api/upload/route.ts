import { NextRequest, NextResponse } from "next/server";
import { uploadImageToR2 } from "@/lib/cloudflare-r2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "owner-onboarding";
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }
    
    console.log(`Uploading file to folder: ${folder}`);
    
    // Upload directly to R2 from the server
    const result = await uploadImageToR2(file, folder);
    
    if (!result.success) {
      console.error("Upload failed:", result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}