const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "singleton" }
    });
    console.log("Current Settings:", settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
