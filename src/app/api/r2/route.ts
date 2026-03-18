import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/cloudflare-r2";

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, folder } = await req.json();
    if (!fileName || !fileType) {
      return NextResponse.json({ success: false, error: "Missing fileName or fileType" }, { status: 400 });
    }
    const result = await getPresignedUploadUrl(fileName, fileType, folder || "owner-onboarding");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
