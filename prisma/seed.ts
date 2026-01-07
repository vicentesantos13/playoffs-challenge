// prisma/seed.ts
import prisma from "../src/lib/prisma";

async function main() {
  const teams = [
    { name: "San Francisco 49ers", logo: "/assets/teams/49ers.png" },
    { name: "Chicago Bears", logo: "/assets/teams/bears.png" },
    { name: "Buffalo Bills", logo: "/assets/teams/bills.png" },
    { name: "Denver Broncos", logo: "/assets/teams/broncos.png" },
    { name: "Los Angeles Chargers", logo: "/assets/teams/Chargers.png" },
    { name: "Philadelphia Eagles", logo: "/assets/teams/eagles.png" },
    { name: "Jacksonville Jaguars", logo: "/assets/teams/jaguars.png" },
    { name: "Green Bay Packers", logo: "/assets/teams/packers.png" },
    { name: "Carolina Panthers", logo: "/assets/teams/panthers.png" },
    { name: "New England Patriots", logo: "/assets/teams/patriots.png" },
    { name: "Los Angeles Rams", logo: "/assets/teams/rams.png" },
    { name: "Seattle Seahawks", logo: "/assets/teams/seahawks.png" },
    { name: "Pittsburgh Steelers", logo: "/assets/teams/steelers.png" },
    { name: "Houston Texans", logo: "/assets/teams/texans.png" },
  ];

  // ✅ Melhor: createMany com skipDuplicates (precisa de UNIQUE em Teams.name)
  await prisma.teams.createMany({
    data: teams,
    skipDuplicates: true,
  });

  console.log("Seed OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
