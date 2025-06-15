"use server";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

export const expireAppointment = actionClient
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
    });

    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }

    if (appointment.clinicId !== session.user.clinic?.id) {
      throw new Error("Agendamento não encontrado");
    }

    if (appointment.status === "cancelled") {
      throw new Error(
        "Não é possível marcar como expirado um agendamento cancelado",
      );
    }

    if (appointment.status === "expired") {
      throw new Error("Agendamento já foi marcado como expirado");
    }

    if (appointment.status === "completed") {
      throw new Error(
        "Não é possível marcar como expirado um agendamento concluído",
      );
    }

    await db
      .update(appointmentsTable)
      .set({ status: "expired" })
      .where(eq(appointmentsTable.id, parsedInput.id));

    revalidatePath("/appointments");
  });
