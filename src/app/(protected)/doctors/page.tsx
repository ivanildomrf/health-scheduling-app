import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/ui/page-container";
import { Plus } from "lucide-react";

const DoctorsPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Médicos</PageHeaderTitle>
          <PageHeaderDescription>
            Aqui você pode gerenciar os médicos
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button>
            <Plus /> Adicionar Médico
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <PageContent>
        <div>
          <h1>Médicos</h1>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
