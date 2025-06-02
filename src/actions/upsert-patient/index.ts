"use server";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { upsertPatientSchema } from "./schema";

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new Error("Não autorizado");
    }

    if (!session.user.clinic) {
      return new Error("Clínica não encontrada");
    }

    await db
      .insert(patientsTable)
      .values({
        id: parsedInput.id,
        clinicId: session.user.clinic.id,
        name: parsedInput.name,
        email: parsedInput.email,
        phone: parsedInput.phone,
        sex: parsedInput.sex,
        password: "temp123", // Senha temporária - deve ser alterada em uma implementação real
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          name: parsedInput.name,
          email: parsedInput.email,
          phone: parsedInput.phone,
          sex: parsedInput.sex,
        },
      });

    revalidatePath("/patients");

    return {
      success: true,
    };
  });
