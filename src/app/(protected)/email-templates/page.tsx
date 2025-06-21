import { getEmailTemplates } from "@/actions/get-email-templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { Mail, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { CreateDefaultTemplatesButton } from "./_components/create-default-templates-button";
import { EmailTemplatesList } from "./_components/email-templates-list";

const EMAIL_TYPE_LABELS = {
  appointment_reminder_24h: "Lembrete 24h",
  appointment_reminder_2h: "Lembrete 2h",
  appointment_confirmed: "Consulta Confirmada",
  appointment_cancelled: "Consulta Cancelada",
  appointment_completed: "Consulta Concluída",
  welcome_patient: "Boas-vindas Paciente",
  welcome_professional: "Boas-vindas Profissional",
  password_reset: "Redefinir Senha",
  custom: "Personalizado",
};

export default async function EmailTemplatesPage() {
  const { data: templates } = await getEmailTemplates();

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie os templates de email personalizados da sua clínica
          </p>
        </div>
        <div className="flex gap-2">
          <CreateDefaultTemplatesButton />
          <Button asChild variant="outline">
            <Link href="/email-settings">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Link>
          </Button>
          <Button asChild>
            <Link href="/email-templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card de estatísticas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Templates
            </CardTitle>
            <Mail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-muted-foreground text-xs">
              {templates.filter((t) => t.isActive).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Templates de Lembrete
            </CardTitle>
            <Mail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                templates.filter(
                  (t) =>
                    t.type === "appointment_reminder_24h" ||
                    t.type === "appointment_reminder_2h",
                ).length
              }
            </div>
            <p className="text-muted-foreground text-xs">Para consultas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Templates Personalizados
            </CardTitle>
            <Mail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.type === "custom").length}
            </div>
            <p className="text-muted-foreground text-xs">Criados por você</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de templates */}
      <EmailTemplatesList templates={templates} />

      {templates.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Template Encontrado</CardTitle>
            <CardDescription>
              Você ainda não criou nenhum template de email. Comece criando
              templates padrão ou crie seu primeiro template personalizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <CreateDefaultTemplatesButton />
            <Button asChild>
              <Link href="/email-templates/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Template Personalizado
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
