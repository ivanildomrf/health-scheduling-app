import { getEmailTemplateById } from "@/actions/get-email-templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { EmailTemplateEngine } from "@/helpers/email-template-engine";
import { ArrowLeft, Edit, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmailClientPreview } from "../../_components/email-client-preview";

interface EmailTemplatePreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmailTemplatePreviewPage({
  params,
}: EmailTemplatePreviewPageProps) {
  try {
    const { id } = await params;
    const { data: template } = await getEmailTemplateById(id);

    if (!template) {
      notFound();
    }

    // Gerar preview com dados de exemplo
    const previewHtml = EmailTemplateEngine.generatePreview(
      template.htmlContent,
    );
    const previewSubject = EmailTemplateEngine.generatePreview(
      template.subject,
    );

    return (
      <PageContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/email-templates">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Templates
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">
                Preview: {template.name}
              </h1>
              <p className="text-muted-foreground">
                Visualização com dados de exemplo
              </p>
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/email-templates/${template.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Template
                </Link>
              </Button>
            </div>
          </div>

          {/* Informações do Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Informações do Email
              </CardTitle>
              <CardDescription>
                Detalhes do template que será enviado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Assunto:
                </label>
                <p className="text-lg font-medium">{previewSubject}</p>
              </div>

              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Tipo:
                </label>
                <p>{template.type}</p>
              </div>

              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Status:
                </label>
                <p>{template.isActive ? "Ativo" : "Inativo"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Preview do Email */}
          <Card>
            <CardHeader>
              <CardTitle>Preview do Email</CardTitle>
              <CardDescription>
                Como o email aparecerá para os destinatários
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <EmailClientPreview
                subject={previewSubject}
                htmlContent={previewHtml}
              />
            </CardContent>
          </Card>

          {/* Versão Texto (se disponível) */}
          {template.textContent && (
            <Card>
              <CardHeader>
                <CardTitle>Versão Texto</CardTitle>
                <CardDescription>
                  Versão alternativa em texto simples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-gray-50 p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {EmailTemplateEngine.generatePreview(template.textContent)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    );
  } catch (error) {
    console.error("Erro ao carregar template:", error);
    notFound();
  }
}
