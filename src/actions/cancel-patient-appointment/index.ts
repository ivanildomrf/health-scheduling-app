"use server";

import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";
import { actionClient } from "@/lib/safe-action";

const cancelPatientAppointmentSchema = z.object({
  appointmentId: z
    .string()
    .min(1, { message: "ID do agendamento é obrigatório" }),
});

export const cancelPatientAppointment = actionClient
  .schema(cancelPatientAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const { appointmentId } = parsedInput;

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

    // Verificar se o agendamento pode ser cancelado (não pode estar no passado ou já cancelado)
    const appointmentDate = dayjs(appointment.date);
    const now = dayjs();

    if (appointmentDate.isBefore(now)) {
      throw new Error("Não é possível cancelar agendamentos que já passaram");
    }

    if (appointment.status === "cancelled") {
      throw new Error("Agendamento já foi cancelado");
    }

    if (appointment.status === "completed") {
      throw new Error("Não é possível cancelar agendamentos já realizados");
    }

    // Cancelar o agendamento
    await db
      .update(appointmentsTable)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, appointmentId));

    // Revalidar as páginas
    revalidatePath("/patient/appointments");
    revalidatePath("/patient/dashboard");

    return {
      success: true,
      message: "Agendamento cancelado com sucesso",
    };
  });
