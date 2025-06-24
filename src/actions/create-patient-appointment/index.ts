"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, professionalsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";
import { actionClient } from "@/lib/safe-action";

dayjs.extend(utc);

const createPatientAppointmentSchema = z.object({
  professionalId: z.string().min(1, { message: "Profissional é obrigatório" }),
  appointmentPriceInCents: z
    .number()
    .min(1, { message: "Valor da consulta é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().min(1, { message: "Horário é obrigatório" }),
});

export const createPatientAppointment = actionClient
  .schema(createPatientAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await getPatientSession();

    if (!session) {
      throw new Error("Não autorizado");
    }

    // Verificar se o profissional existe na mesma clínica
    const professional = await db.query.professionalsTable.findFirst({
      where: and(
        eq(professionalsTable.id, parsedInput.professionalId),
        eq(professionalsTable.clinicId, session.patient.clinic.id),
      ),
    });

    if (!professional) {
      throw new Error("Profissional não encontrado");
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
        eq(appointmentsTable.clinicId, session.patient.clinic.id),
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
        patientId: session.patient.id,
        professionalId: parsedInput.professionalId,
        clinicId: session.patient.clinic.id,
        date: appointmentDateTime,
        appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        status: "active",
      })
      .returning();

    revalidatePath("/patient/appointments");
    revalidatePath("/patient/dashboard");

    return {
      success: true,
      appointmentId: newAppointment.id,
    };
  });
