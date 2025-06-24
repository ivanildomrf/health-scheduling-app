"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { appointmentsTable, notificationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

dayjs.extend(utc);

export const sendAppointmentReminders = actionClient
  .schema(
    z.object({
      reminderType: z.enum(["24h", "2h"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    const now = dayjs().utc();
    let startTime: dayjs.Dayjs;
    let endTime: dayjs.Dayjs;
    let notificationType:
      | "appointment_reminder_24h"
      | "appointment_reminder_2h";

    // Definir janela de tempo baseada no tipo de lembrete
    if (parsedInput.reminderType === "24h") {
      // Consultas entre 23h e 25h a partir de agora
      startTime = now.add(23, "hours");
      endTime = now.add(25, "hours");
      notificationType = "appointment_reminder_24h";
    } else {
      // Consultas entre 1h50min e 2h10min a partir de agora
      startTime = now.add(110, "minutes");
      endTime = now.add(130, "minutes");
      notificationType = "appointment_reminder_2h";
    }

    // Buscar consultas na janela de tempo
    const upcomingAppointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        eq(appointmentsTable.status, "active"),
        gte(appointmentsTable.date, startTime.toDate()),
        lte(appointmentsTable.date, endTime.toDate()),
      ),
      with: {
        patient: true,
        professional: true,
      },
    });

    if (upcomingAppointments.length === 0) {
      return {
        success: true,
        message: "Nenhuma consulta encontrada para lembretes",
        sentCount: 0,
      };
    }

    // Verificar quais consultas já têm lembrete enviado
    const appointmentIds = upcomingAppointments.map((apt) => apt.id);
    const existingNotifications = await db.query.notificationsTable.findMany({
      where: and(
        eq(notificationsTable.type, notificationType),
        inArray(notificationsTable.targetId, appointmentIds),
      ),
    });

    const notifiedAppointmentIds = new Set(
      existingNotifications.map((notif) => notif.targetId).filter(Boolean),
    );

    // Filtrar consultas que ainda não foram notificadas
    const appointmentsToNotify = upcomingAppointments.filter(
      (apt) => !notifiedAppointmentIds.has(apt.id),
    );

    let sentCount = 0;

    // Criar notificações de lembrete
    for (const appointment of appointmentsToNotify) {
      if (!appointment.patient || !appointment.professional) continue;

      const formattedDate = dayjs(appointment.date).format("DD/MM/YYYY");
      const formattedTime = dayjs(appointment.date).format("HH:mm");
      const reminderText =
        parsedInput.reminderType === "24h" ? "amanhã" : "em 2 horas";

      try {
        await db.insert(notificationsTable).values({
          type: notificationType,
          title: `Lembrete de Consulta - ${appointment.patient.name}`,
          message: `Você tem uma consulta com ${appointment.professional.name} ${reminderText} (${formattedDate} às ${formattedTime}). Não se esqueça!`,
          userId: session.user.id,
          targetId: appointment.id,
          targetType: "appointment",
        });

        sentCount++;
      } catch (error) {
        console.error(
          `Erro ao criar lembrete para consulta ${appointment.id}:`,
          error,
        );
      }
    }

    return {
      success: true,
      message: `${sentCount} lembretes enviados com sucesso`,
      sentCount,
    };
  });
