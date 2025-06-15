"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { upsertAppointmentSchema } from "./schema";

dayjs.extend(utc);

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
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

    // Verificar se o agendamento existe e pertence à clínica
    const existingAppointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
    });

    if (!existingAppointment) {
      return new Error("Agendamento não encontrado");
    }

    if (existingAppointment.clinicId !== session.user.clinic.id) {
      return new Error("Agendamento não encontrado");
    }

    if (existingAppointment.status === "cancelled") {
      return new Error("Não é possível editar um agendamento cancelado");
    }

    // Combinar data e horário para criar o timestamp completo
    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .set("second", 0)
      .utc()
      .toDate();

    await db
      .update(appointmentsTable)
      .set({
        professionalId: parsedInput.professionalId,
        date: appointmentDateTime,
      })
      .where(eq(appointmentsTable.id, parsedInput.id));

    revalidatePath("/appointments");

    return {
      success: true,
    };
  });
