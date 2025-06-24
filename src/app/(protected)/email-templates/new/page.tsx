import { PageContainer } from "@/components/ui/page-container";

import { EmailTemplateEditor } from "../_components/email-template-editor";

export default function NewEmailTemplatePage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Novo Template de Email
          </h1>
          <p className="text-muted-foreground">
            Crie um template personalizado para os emails da sua clínica
          </p>
        </div>

        <EmailTemplateEditor />
      </div>
    </PageContainer>
  );
}
