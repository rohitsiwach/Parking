require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const spaces = [
    "Space 1",
    "Space 2",
    "Space 3",
    "Space 4",
    "Space 5",
    "Space 6",
    "Space 7",
    "Space 8",
  ];

  for (const name of spaces) {
    await prisma.parkingSpace.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed completed: 8 parking spaces created/verified.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
