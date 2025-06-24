"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  appointmentsTable,
  patientsTable,
  professionalsTable,
} from "@/db/schema";
import { createAppointmentConfirmedNotification } from "@/helpers/notifications";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createAppointmentSchema } from "./schema";

dayjs.extend(utc);

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
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

    // Combinar data e horário para criar o timestamp completo
    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .set("second", 0)
      .utc()
      .toDate();

    // Verificar se já existe um agendamento para o mesmo profissional no mesmo horário
    const conflictingAppointment = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.professionalId, parsedInput.professionalId),
        eq(appointmentsTable.date, appointmentDateTime),
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        ne(appointmentsTable.status, "cancelled"), // Excluir agendamentos cancelados
      ),
    });

    if (conflictingAppointment) {
      throw new Error(
        "Já existe um agendamento para este profissional neste horário",
      );
    }

    const [newAppointment] = await db
      .insert(appointmentsTable)
      .values({
        patientId: parsedInput.patientId,
        professionalId: parsedInput.professionalId,
        clinicId: session.user.clinic.id,
        date: appointmentDateTime,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        status: "active",
      })
      .returning();

    // Buscar dados do paciente e profissional para criar notificação
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, parsedInput.patientId),
    });

    const professional = await db.query.professionalsTable.findFirst({
      where: eq(professionalsTable.id, parsedInput.professionalId),
    });

    // Criar notificação de agendamento confirmado
    if (patient && professional) {
      const formattedDate = dayjs(appointmentDateTime).format("DD/MM/YYYY");
      const formattedTime = dayjs(appointmentDateTime).format("HH:mm");

      await createAppointmentConfirmedNotification(
        session.user.id,
        patient.name,
        professional.name,
        formattedDate,
        formattedTime,
        newAppointment.id,
      );
    }

    revalidatePath("/appointments");

    return {
      success: true,
    };
  });
