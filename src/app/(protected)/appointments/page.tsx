import { DataTable } from "@/components/ui/data-table";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentsTable,
  patientsTable,
  professionalsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AddAppointmentButton from "./components/add-appointment-button";
import { appointmentTableColumns } from "./components/table-column";

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

  // Buscar pacientes, profissionais e agendamentos da clínica
  const [patients, professionals, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.professionalsTable.findMany({
      where: eq(professionalsTable.clinicId, session.user.clinic.id),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session.user.clinic.id),
      with: {
        patient: true,
        professional: true,
      },
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Agendamentos</PageHeaderTitle>
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
        <DataTable columns={appointmentTableColumns} data={appointments} />
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;
