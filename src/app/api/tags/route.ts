import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
  try {
    // Get all tags
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check if tag with same name or slug already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug: { equals: slug, mode: 'insensitive' } }
        ]
      }
    });
    
    if (existingTag) {
      // Return the existing tag instead of creating a new one
      return NextResponse.json({ tag: existingTag, message: "Tag already exists" });
    }
    
    // Create new tag
    const tag = await prisma.tag.create({
      data: {
        name,
        slug
      }
    });
    
    return NextResponse.json({ tag, message: "Tag created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}