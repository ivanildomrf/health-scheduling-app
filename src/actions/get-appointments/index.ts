"use server";

import { count, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { getAppointmentsSchema } from "./schema";

export const getAppointments = actionClient
  .schema(getAppointmentsSchema)
  .action(async ({ parsedInput: { page, limit, clinicId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const offset = (page - 1) * limit;

    // Buscar agendamentos com paginação
    const [appointments, totalCount] = await Promise.all([
      db.query.appointmentsTable.findMany({
        where: eq(appointmentsTable.clinicId, clinicId),
        with: {
          patient: true,
          professional: true,
        },
        limit,
        offset,
        orderBy: [desc(appointmentsTable.date)],
      }),
      db
        .select({ count: count() })
        .from(appointmentsTable)
        .where(eq(appointmentsTable.clinicId, clinicId))
        .then((result) => result[0]?.count || 0),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      appointments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  });
