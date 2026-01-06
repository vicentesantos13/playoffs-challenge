import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import  prisma  from "./prisma";

const COOKIE_NAME = "pc_pid";

export async function signInOrCreateParticipant(name: string, pin: string) {
  const normalized = name.trim();
  if (!normalized || pin.trim().length < 4) {
    throw new Error("Nome e PIN (mínimo 4 dígitos) são obrigatórios.");
  }

  // procura pelo nome (simples). Se você preferir, use um "handle" único.
  const existing = await prisma.participant.findFirst({
    where: { name: normalized },
  });

  if (existing) {
    const ok = await bcrypt.compare(pin, existing.pinHash);
    if (!ok) throw new Error("PIN incorreto.");
    (await cookies()).set(COOKIE_NAME, existing.id, { httpOnly: true, sameSite: "lax", path: "/" });
    return existing;
  }

  const pinHash = await bcrypt.hash(pin, 10);
  const created = await prisma.participant.create({
    data: { name: normalized, pinHash },
  });

  (await cookies()).set(COOKIE_NAME, created.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return created;
}

export async function getSessionParticipant() {
  const pid = (await cookies()).get(COOKIE_NAME)?.value;
  if (!pid) return null;

  return prisma.participant.findUnique({ where: { id: pid } });
}

export async function signOut() {
  console.log("chamou");
  
 (await cookies()).delete(COOKIE_NAME);
}

export function requireAdmin(participant: { isAdmin: boolean } | null) {
  if (!participant?.isAdmin) throw new Error("Acesso negado.");
}
