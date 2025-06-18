import { getClinicEmailSettings } from "@/actions/get-clinic-email-settings";
import { PageContainer } from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EmailSettingsForm } from "./_components/email-settings-form";

export default async function EmailSettingsPage() {
  const { data: settings } = await getClinicEmailSettings();

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/email-templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Templates
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Configurações de Email</h1>
            <p className="text-muted-foreground">
              Configure as informações da sua clínica para personalizar os emails
            </p>
          </div>
        </div>

        <EmailSettingsForm initialData={settings} />
      </div>
    </PageContainer>
  );
} 