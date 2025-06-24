import { eq } from "drizzle-orm";
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
import { professionalsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddProfessionalButton from "./components/add-professional-button";
import ProfessionalCard from "./components/professional-card";

const ProfessionalsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic || !session.user.clinic?.id) {
    redirect("/clinic-form");
  }
  const professionals = await db.query.professionalsTable.findMany({
    where: eq(professionalsTable.clinicId, session.user.clinic.id),
  });
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderDescription>
            Aqui você pode gerenciar os profissionais
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <AddProfessionalButton />
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-3 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
            />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ProfessionalsPage;
