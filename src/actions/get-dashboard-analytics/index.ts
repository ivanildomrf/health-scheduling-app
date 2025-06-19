"use server";

import { db } from "@/db";
import {
  appointmentsTable,
  patientsTable,
  professionalsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/safe-action";
import dayjs from "dayjs";
import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { z } from "zod";

const inputSchema = z.object({
  clinicId: z.string().uuid(),
});

export interface DashboardAnalytics {
  revenue: number;
  totalAppointments: number;
  totalPatients: number;
  totalProfessionals: number;
  monthlyData: Array<{
    month: string;
    appointments: number;
    patients: number;
  }>;
  topProfessionals: Array<{
    id: string;
    name: string;
    speciality: string;
    appointmentCount: number;
    avatarImageUrl?: string | null;
  }>;
  recentAppointments: Array<{
    id: string;
    date: Date;
    patientName: string;
    professionalName: string;
    status: "active" | "cancelled" | "expired" | "completed";
  }>;
  specialityStats: Array<{
    speciality: string;
    count: number;
  }>;
}

export const getDashboardAnalytics = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput }): Promise<DashboardAnalytics> => {
    const { clinicId } = parsedInput;

    // Métricas principais
    const [revenueResult] = await db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          eq(appointmentsTable.status, "completed"),
        ),
      );

    const [appointmentsResult] = await db
      .select({
        count: count(),
      })
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, clinicId));

    const [patientsResult] = await db
      .select({
        count: count(),
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId));

    const [professionalsResult] = await db
      .select({
        count: count(),
      })
      .from(professionalsTable)
      .where(eq(professionalsTable.clinicId, clinicId));

    // Dados mensais (últimos 12 meses para garantir que julho sempre apareça)
    const twelveMonthsAgo = dayjs()
      .subtract(12, "month")
      .startOf("month")
      .toDate();

    const monthlyAppointments = await db
      .select({
        month: sql<string>`TO_CHAR(${appointmentsTable.date}, 'YYYY-MM')`,
        count: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, twelveMonthsAgo),
        ),
      )
      .groupBy(sql`TO_CHAR(${appointmentsTable.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${appointmentsTable.date}, 'YYYY-MM')`);

    const monthlyPatients = await db
      .select({
        month: sql<string>`TO_CHAR(${patientsTable.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, clinicId),
          gte(patientsTable.createdAt, twelveMonthsAgo),
        ),
      )
      .groupBy(sql`TO_CHAR(${patientsTable.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${patientsTable.createdAt}, 'YYYY-MM')`);

    // Top profissionais
    const topProfessionals = await db
      .select({
        id: professionalsTable.id,
        name: professionalsTable.name,
        speciality: professionalsTable.speciality,
        avatarImageUrl: professionalsTable.avatarImageUrl,
        appointmentCount: count(appointmentsTable.id),
      })
      .from(professionalsTable)
      .leftJoin(
        appointmentsTable,
        eq(professionalsTable.id, appointmentsTable.professionalId),
      )
      .where(eq(professionalsTable.clinicId, clinicId))
      .groupBy(
        professionalsTable.id,
        professionalsTable.name,
        professionalsTable.speciality,
        professionalsTable.avatarImageUrl,
      )
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(5);

    // Agendamentos recentes
    const recentAppointments = await db
      .select({
        id: appointmentsTable.id,
        date: appointmentsTable.date,
        patientName: patientsTable.name,
        professionalName: professionalsTable.name,
        status: appointmentsTable.status,
      })
      .from(appointmentsTable)
      .innerJoin(
        patientsTable,
        eq(appointmentsTable.patientId, patientsTable.id),
      )
      .innerJoin(
        professionalsTable,
        eq(appointmentsTable.professionalId, professionalsTable.id),
      )
      .where(eq(appointmentsTable.clinicId, clinicId))
      .orderBy(desc(appointmentsTable.createdAt))
      .limit(5);

    // Estatísticas por especialidade
    const specialityStats = await db
      .select({
        speciality: professionalsTable.speciality,
        count: count(appointmentsTable.id),
      })
      .from(professionalsTable)
      .leftJoin(
        appointmentsTable,
        eq(professionalsTable.id, appointmentsTable.professionalId),
      )
      .where(eq(professionalsTable.clinicId, clinicId))
      .groupBy(professionalsTable.speciality)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(5);

    // Processar dados mensais - mostrar últimos 6 meses mas com dados dos últimos 12 meses disponíveis
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, "month").format("YYYY-MM");
      const monthName = dayjs().subtract(i, "month").format("MMM");

      const appointmentData = monthlyAppointments.find(
        (item) => item.month === month,
      );
      const patientData = monthlyPatients.find((item) => item.month === month);

      const appointments = Number(appointmentData?.count) || 0;
      const patients = Number(patientData?.count) || 0;

      monthlyData.push({
        month: monthName,
        appointments,
        patients,
      });
    }

    return {
      revenue: Math.round((Number(revenueResult?.total) || 0) / 100), // Converter centavos para reais
      totalAppointments: Number(appointmentsResult?.count) || 0,
      totalPatients: Number(patientsResult?.count) || 0,
      totalProfessionals: Number(professionalsResult?.count) || 0,
      monthlyData,
      topProfessionals: topProfessionals.map((prof) => ({
        ...prof,
        appointmentCount: Number(prof.appointmentCount) || 0,
      })),
      recentAppointments,
      specialityStats: specialityStats.map((spec) => ({
        ...spec,
        count: Number(spec.count) || 0,
      })),
    };
  });
