"use server";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";
import { signInOrCreateParticipant } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!name) throw new Error("Informe seu nome.");
  if (pin.length < 4) throw new Error("PIN deve ter pelo menos 4 caracteres.");

  await signInOrCreateParticipant(name, pin);

  redirect("/"); // ou "/picks"
}

export async function logoutAction() {
  (await cookies()).delete("pc_pid");
  redirect("/login");
}
