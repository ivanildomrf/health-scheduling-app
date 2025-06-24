import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { appointmentsTable, notificationsTable } from "@/db/schema";

dayjs.extend(utc);

export async function POST(request: NextRequest) {
  try {
    // Verificar se há um token de autenticação ou segurança
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = dayjs().utc();
    const startTime = now.add(110, "minutes"); // 1h50min
    const endTime = now.add(130, "minutes"); // 2h10min

    // Buscar todas as consultas das próximas 2h
    const upcomingAppointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.status, "active"),
        gte(appointmentsTable.date, startTime.toDate()),
        lte(appointmentsTable.date, endTime.toDate()),
      ),
      with: {
        patient: true,
        professional: true,
        clinic: {
          with: {
            usersToClinics: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (upcomingAppointments.length === 0) {
      return Response.json({
        success: true,
        message: "Nenhuma consulta encontrada para lembretes",
        sentCount: 0,
      });
    }

    // Verificar quais consultas já têm lembrete enviado
    const appointmentIds = upcomingAppointments.map((apt) => apt.id);
    const existingNotifications = await db.query.notificationsTable.findMany({
      where: and(
        eq(notificationsTable.type, "appointment_reminder_2h"),
        inArray(notificationsTable.targetId, appointmentIds),
      ),
    });

    const notifiedAppointmentIds = new Set(
      existingNotifications.map((notif) => notif.targetId).filter(Boolean),
    );

    let sentCount = 0;

    // Criar notificações de lembrete
    for (const appointment of upcomingAppointments) {
      if (
        !appointment.patient ||
        !appointment.professional ||
        !appointment.clinic
      )
        continue;
      if (notifiedAppointmentIds.has(appointment.id)) continue;

      const formattedDate = dayjs(appointment.date).format("DD/MM/YYYY");
      const formattedTime = dayjs(appointment.date).format("HH:mm");

      // Enviar notificação para cada usuário da clínica
      for (const userToClinic of appointment.clinic.usersToClinics) {
        if (!userToClinic.user) continue;

        try {
          await db.insert(notificationsTable).values({
            type: "appointment_reminder_2h",
            title: `Lembrete Urgente: Consulta em 2h - ${appointment.patient.name}`,
            message: `Consulta com ${appointment.professional.name} hoje às ${formattedTime}. Prepare-se, faltam apenas 2 horas!`,
            userId: userToClinic.user.id,
            targetId: appointment.id,
            targetType: "appointment",
          });

          sentCount++;
        } catch (error) {
          console.error(
            `Erro ao criar lembrete para usuário ${userToClinic.user.id}:`,
            error,
          );
        }
      }
    }

    return Response.json({
      success: true,
      message: `${sentCount} lembretes de 2h enviados com sucesso`,
      sentCount,
    });
  } catch (error) {
    console.error("Erro no cron de lembretes 2h:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
