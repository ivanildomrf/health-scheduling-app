"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { createNewProfessionalNotification } from "@/helpers/notifications";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { upsertProfessionalSchema } from "./schema";

dayjs.extend(utc);

export const upsertProfessional = actionClient
  .schema(upsertProfessionalSchema)
  .action(async ({ parsedInput }) => {
    const availableFromTime = parsedInput.availableFromTime;
    const availableToTime = parsedInput.availableToTime;

    // Converter horário local para UTC
    const availableFromTimeUTC = dayjs()
      .set("hour", parseInt(availableFromTime.split(":")[0]))
      .set("minute", parseInt(availableFromTime.split(":")[1]))
      .set("second", parseInt(availableFromTime.split(":")[2]))
      .utc()
      .format("HH:mm:ss");

    const availableToTimeUTC = dayjs()
      .set("hour", parseInt(availableToTime.split(":")[0]))
      .set("minute", parseInt(availableToTime.split(":")[1]))
      .set("second", parseInt(availableToTime.split(":")[2]))
      .utc()
      .format("HH:mm:ss");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new Error("Não autorizado");
    }

    if (!session.user.clinic) {
      return new Error("Clínica não encontrada");
    }

    // Verificar se é um novo profissional ou edição
    let existingProfessional = null;
    if (parsedInput.id) {
      existingProfessional = await db.query.professionalsTable.findFirst({
        where: eq(professionalsTable.id, parsedInput.id),
      });
    }

    const isNewProfessional = !existingProfessional;

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
        availableFromTime: availableFromTimeUTC,
        availableToTime: availableToTimeUTC,
      })
      .onConflictDoUpdate({
        target: [professionalsTable.id],
        set: {
          name: parsedInput.name,
          speciality: parsedInput.specialty,
          appointmentsPriceInCents: parsedInput.appointmentPriceInCents,
          availableFromWeekDay: parsedInput.availableFromWeekDay,
          availableToWeekDay: parsedInput.availableToWeekDay,
          availableFromTime: availableFromTimeUTC,
          availableToTime: availableToTimeUTC,
        },
      });

    // Criar notificação apenas para novos profissionais
    if (isNewProfessional) {
      await createNewProfessionalNotification(
        session.user.id,
        parsedInput.name,
        parsedInput.specialty,
        parsedInput.id,
      );
    }

    revalidatePath("/professionals");

    return {
      success: true,
    };
  });
