"use server";
import prisma from "@/lib/prisma";

export const getRound = async () => {
  return await prisma.round.findFirst({
    where: { isActive: true },
    include: {
      games: {
        orderBy: { startAt: "asc" },
        include: {
          picks: {
            include: {
              participant: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });
};
