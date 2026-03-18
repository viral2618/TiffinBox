import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    const owner = await prisma.owner.findUnique({
      where: { email },
      select: { id: true, emailVerified: true }
    });
    
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }
    
    return NextResponse.json({ ownerId: owner.id, emailVerified: owner.emailVerified });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
