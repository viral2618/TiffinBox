import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "owner" || !session.user.id) {
      return NextResponse.json(
        { error: "Not authenticated or not authorized" },
        { status: 401 }
      );
    }
    
    // Get owner details from database using session user id
    const owner = await prisma.owner.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isOnboarded: true,
        phone: true
      }
    });
    
    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ owner });
  } catch (error) {
    console.error("Error fetching owner data:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}