import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Owner ──────────────────────────────────────────────────────────────────
  const owner = await prisma.owner.upsert({
    where: { email: "owner@tiffinbox.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "owner@tiffinbox.com",
      phone: "+91 98765 43210",
      password: await bcrypt.hash("password123", 10),
      role: "owner",
      isOnboarded: true,
      emailVerified: true,
    },
  });
  console.log("✅ Owner created");

  // ── Tags ───────────────────────────────────────────────────────────────────
  const tagData = [
    { name: "Home Kitchen", slug: "home-kitchen" },
    { name: "Veg", slug: "veg" },
    { name: "Non-Veg", slug: "non-veg" },
    { name: "Spicy", slug: "spicy" },
    { name: "Healthy", slug: "healthy" },
  ];
  const tags: Record<string, { id: string }> = {};
  for (const t of tagData) {
    tags[t.slug] = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }
  console.log("✅ Tags created");

  // ── Categories ─────────────────────────────────────────────────────────────
  const categoryData = [
    {
      name: "Lunch",
      slug: "lunch",
      description: "Wholesome homemade lunch meals",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
      subcategories: [
        { name: "Dal & Rice", slug: "dal-rice", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80" },
        { name: "Roti & Sabzi", slug: "roti-sabzi", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
      ],
    },
    {
      name: "Breakfast",
      slug: "breakfast",
      description: "Fresh morning homemade breakfast",
      imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80",
      subcategories: [
        { name: "Idli & Dosa", slug: "idli-dosa", imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80" },
        { name: "Poha & Upma", slug: "poha-upma", imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80" },
      ],
    },
    {
      name: "Dinner",
      slug: "dinner",
      description: "Comforting homemade dinner",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
      subcategories: [
        { name: "Curry", slug: "curry", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
      ],
    },
    {
      name: "Snacks",
      slug: "snacks",
      description: "Evening homemade snacks",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
      subcategories: [],
    },
    {
      name: "Tiffin Box",
      slug: "tiffin-box",
      description: "Full tiffin meal combos",
      imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
      subcategories: [
        { name: "Veg Tiffin", slug: "veg-tiffin", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
        { name: "Non-Veg Tiffin", slug: "non-veg-tiffin", imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" },
      ],
    },
  ];

  const categories: Record<string, { id: string; subcategories: { id: string; slug: string }[] }> = {};
  for (const cat of categoryData) {
    const { subcategories: subs, ...catFields } = cat;
    const created = await prisma.category.upsert({
      where: { slug: catFields.slug },
      update: {},
      create: catFields,
    });
    const createdSubs: { id: string; slug: string }[] = [];
    for (const sub of subs) {
      const s = await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {},
        create: { ...sub, categoryId: created.id },
      });
      createdSubs.push({ id: s.id, slug: s.slug });
    }
    categories[catFields.slug] = { id: created.id, subcategories: createdSubs };
  }
  console.log("✅ Categories & subcategories created");

  // ── Shops ──────────────────────────────────────────────────────────────────
  const shopData = [
    {
      name: "Priya's Home Kitchen",
      slug: "priyas-home-kitchen",
      description: "Authentic Gujarati home-cooked meals made with love and fresh ingredients every day.",
      address: "12, Andheri West, Mumbai, Maharashtra 400058",
      coordinates: { lat: 19.1197, lng: 72.8468 },
      bannerImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80",
      imageUrls: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80",
      ],
      contactPhone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      establishedYear: 2019,
      isOpen: true,
      tagSlugs: ["home-kitchen", "veg"],
    },
    {
      name: "Meera's Tiffin Service",
      slug: "meeras-tiffin-service",
      description: "Daily fresh tiffin service with Punjabi and North Indian home food.",
      address: "45, Borivali East, Mumbai, Maharashtra 400066",
      coordinates: { lat: 19.2307, lng: 72.8567 },
      bannerImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80",
      imageUrls: [
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
      ],
      contactPhone: "+91 91234 56789",
      whatsapp: "+91 91234 56789",
      establishedYear: 2020,
      isOpen: true,
      tagSlugs: ["home-kitchen", "healthy"],
    },
    {
      name: "Sunita's Rasoi",
      slug: "sunitas-rasoi",
      description: "South Indian and Maharashtrian home food delivered fresh daily.",
      address: "78, Malad West, Mumbai, Maharashtra 400064",
      coordinates: { lat: 19.1863, lng: 72.8484 },
      bannerImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&q=80",
      imageUrls: [
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
      ],
      contactPhone: "+91 99887 76655",
      whatsapp: "+91 99887 76655",
      establishedYear: 2021,
      isOpen: true,
      tagSlugs: ["home-kitchen", "spicy"],
    },
  ];

  const shops: Record<string, string> = {};
  for (const { tagSlugs, ...shopFields } of shopData) {
    const shop = await prisma.shop.upsert({
      where: { slug: shopFields.slug },
      update: { coordinates: shopFields.coordinates, address: shopFields.address },
      create: { ...shopFields, ownerId: owner.id },
    });
    shops[shopFields.slug] = shop.id;

    for (const slug of tagSlugs) {
      if (tags[slug]) {
        await prisma.shopTag.upsert({
          where: { shopId_tagId: { shopId: shop.id, tagId: tags[slug].id } },
          update: {},
          create: { shopId: shop.id, tagId: tags[slug].id },
        });
      }
    }
  }
  console.log("✅ Shops created");

  // ── Dishes ─────────────────────────────────────────────────────────────────
  const dishData = [
    {
      name: "Dal Tadka with Jeera Rice",
      slug: "dal-tadka-jeera-rice",
      description: "Creamy yellow dal tempered with ghee, cumin and garlic served with fragrant jeera rice.",
      imageUrls: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"],
      price: 120,
      originalPrice: 150,
      discountPercentage: 20,
      isVeg: true,
      prepTimeMinutes: 30,
      shopSlug: "priyas-home-kitchen",
      categorySlug: "lunch",
      subcategorySlug: "dal-rice",
      tagSlugs: ["veg", "healthy"],
    },
    {
      name: "Paneer Butter Masala with Roti",
      slug: "paneer-butter-masala-roti",
      description: "Rich and creamy paneer curry in tomato-butter gravy served with soft whole wheat rotis.",
      imageUrls: ["https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80"],
      price: 160,
      originalPrice: 180,
      discountPercentage: 11,
      isVeg: true,
      prepTimeMinutes: 35,
      shopSlug: "priyas-home-kitchen",
      categorySlug: "lunch",
      subcategorySlug: "roti-sabzi",
      tagSlugs: ["veg", "spicy"],
    },
    {
      name: "Masala Dosa with Sambar",
      slug: "masala-dosa-sambar",
      description: "Crispy golden dosa stuffed with spiced potato filling, served with sambar and coconut chutney.",
      imageUrls: ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80"],
      price: 90,
      originalPrice: 110,
      discountPercentage: 18,
      isVeg: true,
      prepTimeMinutes: 20,
      shopSlug: "sunitas-rasoi",
      categorySlug: "breakfast",
      subcategorySlug: "idli-dosa",
      tagSlugs: ["veg", "healthy"],
    },
    {
      name: "Poha with Sev",
      slug: "poha-with-sev",
      description: "Light and fluffy flattened rice cooked with onions, mustard seeds and turmeric, topped with sev.",
      imageUrls: ["https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80"],
      price: 60,
      originalPrice: 70,
      discountPercentage: 14,
      isVeg: true,
      prepTimeMinutes: 15,
      shopSlug: "sunitas-rasoi",
      categorySlug: "breakfast",
      subcategorySlug: "poha-upma",
      tagSlugs: ["veg", "healthy"],
    },
    {
      name: "Chicken Curry with Rice",
      slug: "chicken-curry-rice",
      description: "Slow-cooked home-style chicken curry in aromatic spices served with steamed basmati rice.",
      imageUrls: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"],
      price: 200,
      originalPrice: 230,
      discountPercentage: 13,
      isVeg: false,
      prepTimeMinutes: 45,
      shopSlug: "meeras-tiffin-service",
      categorySlug: "dinner",
      subcategorySlug: "curry",
      tagSlugs: ["non-veg", "spicy"],
    },
    {
      name: "Rajma Chawal",
      slug: "rajma-chawal",
      description: "Classic Punjabi red kidney bean curry cooked in onion-tomato masala served with steamed rice.",
      imageUrls: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"],
      price: 130,
      originalPrice: 150,
      discountPercentage: 13,
      isVeg: true,
      prepTimeMinutes: 40,
      shopSlug: "meeras-tiffin-service",
      categorySlug: "lunch",
      subcategorySlug: "dal-rice",
      tagSlugs: ["veg", "healthy"],
    },
    {
      name: "Veg Tiffin Box",
      slug: "veg-tiffin-box",
      description: "Complete veg tiffin with 2 rotis, dal, sabzi, rice, salad and pickle — freshly packed daily.",
      imageUrls: ["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80"],
      price: 180,
      originalPrice: 220,
      discountPercentage: 18,
      isVeg: true,
      prepTimeMinutes: 30,
      shopSlug: "priyas-home-kitchen",
      categorySlug: "tiffin-box",
      subcategorySlug: "veg-tiffin",
      tagSlugs: ["veg", "healthy"],
    },
    {
      name: "Non-Veg Tiffin Box",
      slug: "non-veg-tiffin-box",
      description: "Full non-veg tiffin with 2 rotis, chicken curry, rice, salad and pickle — packed fresh.",
      imageUrls: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"],
      price: 250,
      originalPrice: 290,
      discountPercentage: 14,
      isVeg: false,
      prepTimeMinutes: 45,
      shopSlug: "meeras-tiffin-service",
      categorySlug: "tiffin-box",
      subcategorySlug: "non-veg-tiffin",
      tagSlugs: ["non-veg", "spicy"],
    },
    {
      name: "Samosa (2 pcs)",
      slug: "samosa-2pcs",
      description: "Crispy golden samosas stuffed with spiced potato and peas, served with green chutney.",
      imageUrls: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80"],
      price: 40,
      originalPrice: 50,
      discountPercentage: 20,
      isVeg: true,
      prepTimeMinutes: 20,
      shopSlug: "sunitas-rasoi",
      categorySlug: "snacks",
      subcategorySlug: null,
      tagSlugs: ["veg", "spicy"],
    },
    {
      name: "Idli with Sambar & Chutney",
      slug: "idli-sambar-chutney",
      description: "Soft steamed rice idlis served with piping hot sambar and fresh coconut chutney.",
      imageUrls: ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80"],
      price: 70,
      originalPrice: 85,
      discountPercentage: 18,
      isVeg: true,
      prepTimeMinutes: 20,
      shopSlug: "sunitas-rasoi",
      categorySlug: "breakfast",
      subcategorySlug: "idli-dosa",
      tagSlugs: ["veg", "healthy"],
    },
  ];

  for (const { shopSlug, categorySlug, subcategorySlug, tagSlugs, ...dishFields } of dishData) {
    const shopId = shops[shopSlug];
    const categoryId = categories[categorySlug].id;
    const subcategoryId = subcategorySlug
      ? categories[categorySlug].subcategories.find((s) => s.slug === subcategorySlug)?.id
      : undefined;

    const dish = await prisma.dish.upsert({
      where: { slug: dishFields.slug },
      update: {},
      create: {
        ...dishFields,
        shopId,
        categoryId,
        subcategoryId: subcategoryId ?? null,
      },
    });

    for (const slug of tagSlugs) {
      if (tags[slug]) {
        await prisma.dishTag.upsert({
          where: { dishId_tagId: { dishId: dish.id, tagId: tags[slug].id } },
          update: {},
          create: { dishId: dish.id, tagId: tags[slug].id },
        });
      }
    }
  }
  console.log("✅ 10 Dishes created");

  console.log("\n🎉 Seeding complete!");
  console.log("   Owner login → owner@tiffinbox.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
