"use server";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { createAppointmentCancelledNotification } from "@/helpers/notifications";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

export const cancelAppointment = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
      with: {
        patient: true,
        professional: true,
      },
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    if (appointment.clinicId !== session.user.clinic?.id) {
      throw new Error("Agendamento não encontrado");
    }

    if (appointment.status === "cancelled") {
      throw new Error("Agendamento já foi cancelado");
    }

    await db
      .update(appointmentsTable)
      .set({ status: "cancelled" })
      .where(eq(appointmentsTable.id, parsedInput.id));

    // Criar notificação de cancelamento
    if (appointment.patient && appointment.professional) {
      const formattedDate = dayjs(appointment.date).format("DD/MM/YYYY");
      const formattedTime = dayjs(appointment.date).format("HH:mm");

      await createAppointmentCancelledNotification(
        session.user.id,
        appointment.patient.name,
        appointment.professional.name,
        formattedDate,
        formattedTime,
        appointment.id,
      );
    }

    revalidatePath("/appointments");
  });
