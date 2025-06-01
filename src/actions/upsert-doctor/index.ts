"use server";

import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { headers } from "next/headers";
import { upsertDoctorSchema } from "./schema";

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
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
      .insert(professionalsTable)
      .values({
        id: parsedInput.id,
        clinicId: session.user.clinic.id,
        name: parsedInput.name,
        speciality: parsedInput.specialty,
        appointmentsPriceInCents: parsedInput.appointmentPriceInCents,
        availableFromWeekDay: parsedInput.availableFromWeekDay,
        availableToWeekDay: parsedInput.availableToWeekDay,
        availableFromTime: parsedInput.availableFromTime,
        availableToTime: parsedInput.availableToTime,
      })
      .onConflictDoUpdate({
        target: [professionalsTable.id],
        set: {
          name: parsedInput.name,
          speciality: parsedInput.specialty,
          appointmentsPriceInCents: parsedInput.appointmentPriceInCents,
          availableFromWeekDay: parsedInput.availableFromWeekDay,
          availableToWeekDay: parsedInput.availableToWeekDay,
          availableFromTime: parsedInput.availableFromTime,
          availableToTime: parsedInput.availableToTime,
        },
      });

    return {
      success: true,
    };
  });
