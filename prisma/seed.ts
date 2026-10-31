import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CURATED_STATIONS, CATEGORIES_LIST } from "../src/lib/curated-stations";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Starting RadioVerse India database seed...");

  // 1. Seed Categories
  console.log("Seeding categories...");
  for (const cat of CATEGORIES_LIST) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        nameEn: cat.nameEn,
        nameHi: cat.nameHi,
        icon: cat.icon,
      },
      create: {
        slug: cat.slug,
        nameEn: cat.nameEn,
        nameHi: cat.nameHi,
        icon: cat.icon,
      },
    });
  }

  // 2. Seed Super Admin User
  console.log("Seeding default Super Admin user...");
  const adminEmail = "admin@radioverse.in";
  const passwordHash = await bcrypt.hash("RadioVerseAdmin2026!", 12);

  await db.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      accountStatus: "ACTIVE",
    },
    create: {
      email: adminEmail,
      name: "RadioVerse SuperAdmin",
      passwordHash,
      role: "SUPER_ADMIN",
      accountStatus: "ACTIVE",
    },
  });

  // 3. Seed Curated Stations & Endpoints
  console.log("Seeding curated Indian radio stations...");
  for (const station of CURATED_STATIONS) {
    const createdStation = await db.station.upsert({
      where: { slug: station.slug },
      update: {
        name: station.name,
        externalSource: station.externalSource,
        externalId: station.externalId,
        language: station.language,
        countryCode: station.countryCode,
        state: station.state,
        logoUrl: station.logoUrl,
        homepageUrl: station.homepageUrl,
        description: station.description,
        status: station.status,
        isFeatured: station.isFeatured,
      },
      create: {
        id: station.id,
        name: station.name,
        slug: station.slug,
        externalSource: station.externalSource,
        externalId: station.externalId,
        language: station.language,
        countryCode: station.countryCode,
        state: station.state,
        logoUrl: station.logoUrl,
        homepageUrl: station.homepageUrl,
        description: station.description,
        status: station.status,
        isFeatured: station.isFeatured,
      },
    });

    // Create stream endpoints
    for (const ep of station.endpoints) {
      await db.streamEndpoint.upsert({
        where: { id: ep.id },
        update: {
          streamUrl: ep.streamUrl,
          streamType: ep.streamType,
          codec: ep.codec,
          bitrate: ep.bitrate,
          authorizationStatus: ep.authorizationStatus,
          verificationStatus: ep.verificationStatus,
          priority: ep.priority,
        },
        create: {
          id: ep.id,
          stationId: createdStation.id,
          streamUrl: ep.streamUrl,
          streamType: ep.streamType,
          codec: ep.codec,
          bitrate: ep.bitrate,
          authorizationStatus: ep.authorizationStatus,
          verificationStatus: ep.verificationStatus,
          priority: ep.priority,
        },
      });

      // Initial sample health check log
      await db.streamHealthCheck.create({
        data: {
          endpointId: ep.id,
          result: "healthy",
          httpStatus: 200,
          responseTimeMs: 320,
          diagnosticSummary: "Initial seed verification successful",
        },
      });
    }

    // Connect Categories
    for (const catSlug of station.categories) {
      const cat = await db.category.findUnique({ where: { slug: catSlug } });
      if (cat) {
        await db.stationCategory.upsert({
          where: {
            stationId_categoryId: {
              stationId: createdStation.id,
              categoryId: cat.id,
            },
          },
          update: {},
          create: {
            stationId: createdStation.id,
            categoryId: cat.id,
          },
        });
      }
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
