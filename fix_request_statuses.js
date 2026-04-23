const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.task.updateMany({
    where: {
      linkedRequestId: null,
      requestStatus: {
        not: "Not Applicable"
      }
    },
    data: {
      requestStatus: "Not Applicable"
    }
  });
  console.log(`Updated ${result.count} tasks to 'Not Applicable' request status.`);
  
  const result2 = await prisma.task.updateMany({
    where: {
      linkedRequestId: {
        not: null
      },
      requestStatus: null
    },
    data: {
      requestStatus: "Pending"
    }
  });
  console.log(`Updated ${result2.count} linked tasks to 'Pending' request status.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
