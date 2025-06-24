"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { getProfessionalAvailabilitySchema } from "./schema";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getProfessionalAvailability = actionClient
  .schema(getProfessionalAvailabilitySchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Não autorizado");
    }

    if (!session.user.clinic) {
      throw new Error("Clínica não encontrada");
    }

    // Buscar dados do profissional
    const [professional] = await db
      .select()
      .from(professionalsTable)
      .where(
        and(
          eq(professionalsTable.id, parsedInput.professionalId),
          eq(professionalsTable.clinicId, session.user.clinic.id),
        ),
      );

    if (!professional) {
      throw new Error("Profissional não encontrado");
    }

    // Converter horários de UTC para horário local (Brasil)
    const fromTimeUTC = dayjs.utc(
      `2000-01-01 ${professional.availableFromTime}`,
    );
    const toTimeUTC = dayjs.utc(`2000-01-01 ${professional.availableToTime}`);

    // Converter para timezone local (Brasil = UTC-3)
    const fromTimeLocal = fromTimeUTC.subtract(3, "hours");
    const toTimeLocal = toTimeUTC.subtract(3, "hours");

    // Definir período de consulta (próximos 60 dias)
    const startDate = dayjs().startOf("day");
    const endDate = startDate.add(60, "days");

    // Buscar agendamentos existentes do profissional no período
    const existingAppointments = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.professionalId, parsedInput.professionalId),
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, startDate.toDate()),
          lte(appointmentsTable.date, endDate.toDate()),
          eq(appointmentsTable.status, "active"),
        ),
      );

    // Converter agendamentos para formato mais fácil de trabalhar
    const bookedSlots = existingAppointments.map((appointment) => ({
      date: dayjs(appointment.date).format("YYYY-MM-DD"),
      time: dayjs(appointment.date).format("HH:mm:ss"),
    }));

    // Gerar horários disponíveis
    const availableSlots: {
      date: string;
      availableTimes: string[];
    }[] = [];

    // Iterar pelos próximos 60 dias
    for (let i = 0; i < 60; i++) {
      const currentDate = startDate.add(i, "days");
      const dayOfWeek = currentDate.day(); // 0 = Sunday, 1 = Monday, etc.

      // Verificar se o profissional atende neste dia da semana
      let isAvailable = false;

      if (
        professional.availableFromWeekDay <= professional.availableToWeekDay
      ) {
        // Caso normal: ex: segunda (1) a sexta (5)
        isAvailable =
          dayOfWeek >= professional.availableFromWeekDay &&
          dayOfWeek <= professional.availableToWeekDay;
      } else {
        // Caso que cruza a semana: ex: sexta (5) a segunda (1)
        isAvailable =
          dayOfWeek >= professional.availableFromWeekDay ||
          dayOfWeek <= professional.availableToWeekDay;
      }

      if (!isAvailable) {
        continue;
      }

      // Gerar horários disponíveis para este dia
      const dayAvailableTimes: string[] = [];

      const dateStr = currentDate.format("YYYY-MM-DD");
      let currentTime = fromTimeLocal;

      while (currentTime.isBefore(toTimeLocal)) {
        const timeStr = currentTime.format("HH:mm:ss");

        // Verificar se este horário não está ocupado
        const isBooked = bookedSlots.some(
          (slot) => slot.date === dateStr && slot.time === timeStr,
        );

        if (!isBooked) {
          dayAvailableTimes.push(timeStr);
        }

        currentTime = currentTime.add(30, "minutes");
      }

      if (dayAvailableTimes.length > 0) {
        availableSlots.push({
          date: dateStr,
          availableTimes: dayAvailableTimes,
        });
      }
    }

    return {
      professional: {
        id: professional.id,
        name: professional.name,
        availableFromWeekDay: professional.availableFromWeekDay,
        availableToWeekDay: professional.availableToWeekDay,
        availableFromTime: fromTimeLocal.format("HH:mm:ss"),
        availableToTime: toTimeLocal.format("HH:mm:ss"),
      },
      availableSlots,
    };
  });
