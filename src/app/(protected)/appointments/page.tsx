import { count, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentsTable,
  patientsTable,
  professionalsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import AddAppointmentButton from "./components/add-appointment-button";
import { AppointmentsTable } from "./components/appointments-table";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic || !session.user.clinic?.id) {
    redirect("/clinic-form");
  }

  const clinicId = session.user.clinic.id;

  // Buscar dados iniciais para a primeira página
  const [patients, professionals, appointments, totalCount] = await Promise.all(
    [
      db.query.patientsTable.findMany({
        where: eq(patientsTable.clinicId, clinicId),
      }),
      db.query.professionalsTable.findMany({
        where: eq(professionalsTable.clinicId, clinicId),
      }),
      db.query.appointmentsTable.findMany({
        where: eq(appointmentsTable.clinicId, clinicId),
        with: {
          patient: true,
          professional: true,
        },
        limit: 10,
        offset: 0,
        orderBy: [desc(appointmentsTable.date)],
      }),
      db
        .select({ count: count() })
        .from(appointmentsTable)
        .where(eq(appointmentsTable.clinicId, clinicId))
        .then((result) => result[0]?.count || 0),
    ],
  );

  const initialData = {
    appointments,
    pagination: {
      page: 1,
      limit: 10,
      totalCount,
      totalPages: Math.ceil(totalCount / 10),
      hasNextPage: totalCount > 10,
      hasPreviousPage: false,
    },
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderDescription>
            Aqui você pode gerenciar os agendamentos da clínica
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <AddAppointmentButton
            patients={patients}
            professionals={professionals}
          />
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <AppointmentsTable clinicId={clinicId} initialData={initialData} />
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;
