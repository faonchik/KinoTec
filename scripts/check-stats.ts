import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const directorsWithBio = await prisma.director.count({ 
    where: { bio: { not: null } } 
  });
  const totalDirectors = await prisma.director.count();
  
  const actorsWithBio = await prisma.actor.count({ 
    where: { bio: { not: null } } 
  });
  const totalActors = await prisma.actor.count();
  
  console.log("\n📊 Статистика биографий:");
  console.log(`   Режиссёры с биографией: ${directorsWithBio} / ${totalDirectors}`);
  console.log(`   Актёры с биографией: ${actorsWithBio} / ${totalActors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

