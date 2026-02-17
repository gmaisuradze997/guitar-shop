import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // -----------------------------------------------------------------------
  // Admin user
  // -----------------------------------------------------------------------
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@guitarshop.com" },
    update: {},
    create: {
      email: "admin@guitarshop.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    },
  });
  console.log(`  Admin user: ${admin.email}`);

  // -----------------------------------------------------------------------
  // Categories  (top-level + subcategories)
  // -----------------------------------------------------------------------
  const pedals = await prisma.category.upsert({
    where: { slug: "pedals" },
    update: {},
    create: {
      name: "Effects Pedals",
      slug: "pedals",
      description:
        "Guitar effects pedals — overdrive, delay, reverb, fuzz, modulation and more.",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description:
        "Cables, power supplies, pedalboards, picks, straps, capos and other essentials.",
    },
  });

  const strings = await prisma.category.upsert({
    where: { slug: "strings" },
    update: {},
    create: {
      name: "Strings",
      slug: "strings",
      description:
        "Electric and acoustic guitar strings in every gauge and brand.",
    },
  });

  const parts = await prisma.category.upsert({
    where: { slug: "parts" },
    update: {},
    create: {
      name: "Parts & Hardware",
      slug: "parts",
      description:
        "Pickups, knobs, switches, bridges, tuning pegs and replacement parts.",
    },
  });

  // Pedal subcategories
  const pedalSubcategories = [
    { name: "Overdrive", slug: "overdrive" },
    { name: "Distortion", slug: "distortion" },
    { name: "Fuzz", slug: "fuzz" },
    { name: "Delay", slug: "delay" },
    { name: "Reverb", slug: "reverb" },
    { name: "Modulation", slug: "modulation" },
    { name: "Compression", slug: "compression" },
    { name: "Boost", slug: "boost" },
    { name: "Looper", slug: "looper" },
    { name: "Tuner", slug: "tuner" },
  ];

  const subCategoryMap: Record<string, string> = {};
  for (const sub of pedalSubcategories) {
    const cat = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {},
      create: {
        name: sub.name,
        slug: sub.slug,
        parentId: pedals.id,
      },
    });
    subCategoryMap[sub.slug] = cat.id;
  }

  console.log(
    `  Categories: ${4 + pedalSubcategories.length} created / verified`
  );

  // -----------------------------------------------------------------------
  // Products
  // -----------------------------------------------------------------------
  const products = [
    {
      name: "Classic Overdrive Pedal",
      slug: "classic-overdrive-pedal",
      description:
        "Warm, smooth overdrive that brings your tone to life. Perfect for blues, rock, and everything in between.",
      price: 149.99,
      categoryId: subCategoryMap["overdrive"],
      brand: "ToneForge",
      images: [] as string[],
      inStock: true,
      stockCount: 25,
    },
    {
      name: "Digital Delay Pro",
      slug: "digital-delay-pro",
      description:
        "Crystal-clear digital delay with tap tempo, modulation, and up to 2 seconds of delay time.",
      price: 199.99,
      categoryId: subCategoryMap["delay"],
      brand: "ToneForge",
      images: [] as string[],
      inStock: true,
      stockCount: 15,
    },
    {
      name: "Spring Reverb Tank",
      slug: "spring-reverb-tank",
      description:
        "Authentic spring reverb sound in a compact pedal format. From subtle ambience to surf-drenched wash.",
      price: 179.99,
      categoryId: subCategoryMap["reverb"],
      brand: "EchoWave",
      images: [] as string[],
      inStock: true,
      stockCount: 20,
    },
    {
      name: "Premium Instrument Cable 10ft",
      slug: "premium-instrument-cable-10ft",
      description:
        "Low-capacitance cable with gold-plated connectors for pristine signal transfer.",
      price: 29.99,
      categoryId: accessories.id,
      brand: "CableCraft",
      images: [] as string[],
      inStock: true,
      stockCount: 100,
    },
    {
      name: "Isolated Power Supply 8-Output",
      slug: "isolated-power-supply-8-output",
      description:
        "Clean, isolated power for up to 8 pedals. Eliminates hum and noise from your signal chain.",
      price: 129.99,
      categoryId: accessories.id,
      brand: "PowerTone",
      images: [] as string[],
      inStock: true,
      stockCount: 30,
    },
    {
      name: "Nickel Wound Electric Strings .010-.046",
      slug: "nickel-wound-electric-010-046",
      description:
        "Balanced tension and warm tone. The go-to string set for versatile players.",
      price: 7.99,
      categoryId: strings.id,
      brand: "StringKing",
      images: [] as string[],
      inStock: true,
      stockCount: 200,
    },
    {
      name: "Humbucker Pickup Set - Classic PAF",
      slug: "humbucker-pickup-set-classic-paf",
      description:
        "Vintage-voiced PAF-style humbuckers with Alnico II magnets. Rich, warm, and articulate.",
      price: 189.99,
      categoryId: parts.id,
      brand: "PickupLab",
      images: [] as string[],
      inStock: true,
      stockCount: 12,
    },
    {
      name: "Fuzz Factory Pedal",
      slug: "fuzz-factory-pedal",
      description:
        "Wild, unpredictable fuzz tones with five knobs for endless sonic possibilities.",
      price: 229.99,
      compareAtPrice: 259.99,
      categoryId: subCategoryMap["fuzz"],
      brand: "EchoWave",
      images: [] as string[],
      inStock: true,
      stockCount: 8,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`  Products: ${products.length} created / verified`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
