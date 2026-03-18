import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const onboardingSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  contactPhone: z.string().optional(),
  contactPhone2: z.string().optional(),
  contactPhone3: z.string().optional(),
  whatsapp: z.string().optional(),
  establishedYear: z.number().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  bannerImage: z.string().optional(),
  logoUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  openingHours: z.any().optional(),
  shopTags: z.array(z.object({ tagId: z.string() })).optional(),
  isOnboarded: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Not authenticated as owner" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate input
    const result = onboardingSchema.safeParse(body);
    if (!result.success) {
      console.error("Validation error:", result.error.issues);
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }
    
    const {
      name,
      description,
      address,
      contactPhone,
      contactPhone2,
      contactPhone3,
      whatsapp,
      establishedYear,
      coordinates,
      bannerImage,
      logoUrl,
      imageUrls,
      openingHours,
      shopTags,
      isOnboarded
    } = result.data;

    // Find if the owner already has a shop
    let shop = await prisma.shop.findFirst({
      where: { ownerId: session.user.id },
    });

    // Generate slug from name
    function slugify(str: string) {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    let slug = slugify(name);
    
    // Check if slug already exists and make it unique
    const existingShop = await prisma.shop.findUnique({ where: { slug } });
    if (existingShop && existingShop.ownerId !== session.user.id) {
      slug = `${slug}-${Date.now()}`;
    }

    // Process shop tags if provided
    let tagConnections: { tag: { connect: { id: string } } }[] = [];
    if (shopTags && shopTags.length > 0) {
      // Create or find tags and prepare connections
      for (const shopTag of shopTags) {
        tagConnections.push({
          tag: {
            connect: { id: shopTag.tagId }
          }
        });
      }
    }
    
    if (shop) {
      // Update existing shop
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: {
          name,
          slug,
          description: description || undefined,
          address,
          coordinates: { lat: coordinates.lat, lng: coordinates.lng },
          bannerImage: bannerImage || undefined,
          logoUrl: logoUrl || undefined,
          imageUrls: imageUrls || [],
          contactPhone: contactPhone || undefined,
          contactPhone2: contactPhone2 || undefined,
          contactPhone3: contactPhone3 || undefined,
          whatsapp: whatsapp || undefined,
          establishedYear: establishedYear || undefined,
          openingHours: openingHours || undefined,
          // Clear existing shop tags and create new ones
          shopTags: {
            deleteMany: {},
            create: tagConnections
          }
        },
      });
    } else {
      // Create new shop
      shop = await prisma.shop.create({
        data: {
          name,
          slug,
          description: description || undefined,
          address,
          coordinates: { lat: coordinates.lat, lng: coordinates.lng },
          bannerImage: bannerImage || undefined,
          logoUrl: logoUrl || undefined,
          imageUrls: imageUrls || [],
          contactPhone: contactPhone || undefined,
          contactPhone2: contactPhone2 || undefined,
          contactPhone3: contactPhone3 || undefined,
          whatsapp: whatsapp || undefined,
          establishedYear: establishedYear || undefined,
          openingHours: openingHours || undefined,
          owner: { connect: { id: session.user.id } },
          // Create shop tags
          shopTags: {
            create: tagConnections
          }
        },
      });
      
      console.log("Created shop with imageUrls:", imageUrls);
    }

    // Mark owner as onboarded
    const updatedOwner = await prisma.owner.update({
      where: { id: session.user.id },
      data: { isOnboarded },
    });

    // Get shop with tags for response
    const shopWithTags = await prisma.shop.findUnique({
      where: { id: shop.id },
      include: {
        shopTags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return NextResponse.json({
      message: "Onboarding completed successfully",
      shop: {
        id: shop.id,
        name: shop.name,
        description: shop.description,
        address: shop.address,
        coordinates: shop.coordinates,
        bannerImage: shop.bannerImage,
        logoUrl: shop.logoUrl,
        imageUrls: shop.imageUrls,
        contactPhone: shop.contactPhone,
        contactPhone2: shop.contactPhone2,
        contactPhone3: shop.contactPhone3,
        whatsapp: shop.whatsapp,
        establishedYear: shop.establishedYear,
        ownerId: shop.ownerId,
        tags: shopWithTags?.shopTags.map(st => st.tag.name) || []
      },
      owner: {
        id: updatedOwner.id,
        email: updatedOwner.email,
        isOnboarded: updatedOwner.isOnboarded,
      }
    });
  } catch (error) {
    console.error("Error updating onboarding status:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}