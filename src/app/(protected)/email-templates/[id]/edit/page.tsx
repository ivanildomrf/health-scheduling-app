import { getEmailTemplateById } from "@/actions/get-email-templates";
import { PageContainer } from "@/components/ui/page-container";
import { notFound } from "next/navigation";
import { EmailTemplateEditor } from "../../_components/email-template-editor";

interface EmailTemplateEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmailTemplateEditPage({
  params,
}: EmailTemplateEditPageProps) {
  try {
    const { id } = await params;
    const { data: template } = await getEmailTemplateById(id);

    if (!template) {
      notFound();
    }

    return (
      <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Template: {template.name}
            </h1>
            <p className="text-muted-foreground">
              Edite seu template de email personalizado
            </p>
          </div>

          <EmailTemplateEditor initialData={template} isEditing={true} />
        </div>
      </PageContainer>
    );
  } catch (error) {
    console.error("Erro ao carregar template:", error);
    notFound();
  }
}
