"use server";

import { db } from "@/db";
import { clinicEmailSettingsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getClinicEmailSettings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Não autorizado");
  }

  if (!session.user.clinic) {
    throw new Error("Clínica não encontrada");
  }

  try {
    const settings = await db.query.clinicEmailSettingsTable.findFirst({
      where: eq(clinicEmailSettingsTable.clinicId, session.user.clinic.id),
    });

    return {
      success: true,
      data: settings || null,
    };
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    throw new Error("Erro interno do servidor");
  }
}
