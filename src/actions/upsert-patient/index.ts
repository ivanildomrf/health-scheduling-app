"use server";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { createNewPatientNotification } from "@/helpers/notifications";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
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

    // Verificar se é um novo paciente ou edição
    let existingPatient = null;
    if (parsedInput.id) {
      existingPatient = await db.query.patientsTable.findFirst({
        where: eq(patientsTable.id, parsedInput.id),
      });
    }

    const isNewPatient = !existingPatient;

    if (isNewPatient) {
      // Criar novo paciente
      const temporaryPassword = await hash("temp123", 12); // Senha temporária que será alterada

      const result = await db
        .insert(patientsTable)
        .values({
          clinicId: session.user.clinic.id,
          name: parsedInput.name,
          email: parsedInput.email,
          phone: parsedInput.phone,
          sex: parsedInput.sex,
          password: temporaryPassword,
          isActive: false, // Inativo até receber credenciais ou ativar conta
        })
        .returning();

      const savedPatient = result[0];

      // Criar notificação para novo paciente
      await createNewPatientNotification(
        session.user.id,
        parsedInput.name,
        parsedInput.phone,
        parsedInput.email,
        savedPatient.id,
      );

      revalidatePath("/patients");

      return {
        success: true,
        patient: savedPatient,
      };
    } else {
      // Atualizar paciente existente
      const result = await db
        .update(patientsTable)
        .set({
          name: parsedInput.name,
          email: parsedInput.email,
          phone: parsedInput.phone,
          sex: parsedInput.sex,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, parsedInput.id!))
        .returning();

      revalidatePath("/patients");

      return {
        success: true,
        patient: result[0],
      };
    }
  });
