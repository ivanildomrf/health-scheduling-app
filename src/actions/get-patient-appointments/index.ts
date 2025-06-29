"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";
import { actionClient } from "@/lib/safe-action";

const getPatientAppointmentsSchema = z.object({
  status: z.enum(["active", "cancelled", "expired", "completed"]).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const getPatientAppointments = actionClient
  .schema(getPatientAppointmentsSchema)
  .action(async ({ parsedInput }) => {
    const { status, limit, offset } = parsedInput;

    const session = await getPatientSession();
    if (!session) {
      throw new Error("Sessão inválida");
    }

    const patientId = session.patient.id;

    try {
      // Criar filtros condicionais
      const baseFilter = eq(appointmentsTable.patientId, patientId);
      const statusFilter = status
        ? eq(appointmentsTable.status, status)
        : undefined;
      const whereClause = statusFilter
        ? and(baseFilter, statusFilter)
        : baseFilter;

      const appointments = await db.query.appointmentsTable.findMany({
        where: whereClause,
        with: {
          professional: {
            columns: {
              id: true,
              name: true,
              speciality: true,
              avatarImageUrl: true,
            },
          },
          clinic: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [desc(appointmentsTable.date)],
        limit,
        offset,
      });

      // Contar total de agendamentos
      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(appointmentsTable)
        .where(whereClause);

      return {
        success: true,
        data: {
          appointments,
          totalCount: totalCount[0]?.count || 0,
          hasMore: offset + limit < (totalCount[0]?.count || 0),
        },
      };
    } catch {
      throw new Error("Erro ao buscar agendamentos do paciente");
    }
  });
