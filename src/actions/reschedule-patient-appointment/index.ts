"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";
import { actionClient } from "@/lib/safe-action";
import dayjs from "dayjs";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reschedulePatientAppointmentSchema = z.object({
  appointmentId: z
    .string()
    .min(1, { message: "ID do agendamento é obrigatório" }),
  newDate: z.date({ message: "Nova data é obrigatória" }),
  newTime: z.string().min(1, { message: "Novo horário é obrigatório" }),
});

export const reschedulePatientAppointment = actionClient
  .schema(reschedulePatientAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const { appointmentId, newDate, newTime } = parsedInput;

    const session = await getPatientSession();
    if (!session) {
      throw new Error("Sessão inválida");
    }

    // Buscar o agendamento
    const appointment = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.id, appointmentId),
        eq(appointmentsTable.patientId, session.patient.id),
      ),
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    // Verificar se o agendamento pode ser remarcado
    if (appointment.status === "cancelled") {
      throw new Error("Não é possível remarcar agendamentos cancelados");
    }

    if (appointment.status === "completed") {
      throw new Error("Não é possível remarcar agendamentos já realizados");
    }

    // Criar nova data/hora
    const [hours, minutes] = newTime.split(":");
    const newDateTime = dayjs(newDate)
      .hour(parseInt(hours))
      .minute(parseInt(minutes))
      .second(0)
      .millisecond(0)
      .toDate();

    // Verificar se a nova data não está no passado
    if (dayjs(newDateTime).isBefore(dayjs())) {
      throw new Error("Não é possível remarcar para uma data no passado");
    }

    // Verificar se já existe outro agendamento no mesmo horário para o mesmo profissional
    const conflictingAppointment = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.professionalId, appointment.professionalId),
        eq(appointmentsTable.date, newDateTime),
        ne(appointmentsTable.id, appointmentId),
        ne(appointmentsTable.status, "cancelled"),
      ),
    });

    if (conflictingAppointment) {
      throw new Error(
        "Já existe um agendamento neste horário para este profissional",
      );
    }

    // Remarcar o agendamento
    await db
      .update(appointmentsTable)
      .set({
        date: newDateTime,
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, appointmentId));

    // Revalidar a página
    revalidatePath("/patient/appointments");

    return {
      success: true,
      message: "Agendamento remarcado com sucesso",
    };
  });
