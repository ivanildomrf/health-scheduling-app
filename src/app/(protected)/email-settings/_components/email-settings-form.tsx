"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bell,
  Globe,
  Image,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  Settings,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertClinicEmailSettings } from "@/actions/upsert-clinic-email-settings";
import {
  type UpsertClinicEmailSettingsSchema,
  upsertClinicEmailSettingsSchema,
} from "@/actions/upsert-clinic-email-settings/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface EmailSettingsFormProps {
  initialData?: any;
}

export function EmailSettingsForm({ initialData }: EmailSettingsFormProps) {
  const form = useForm<UpsertClinicEmailSettingsSchema>({
    resolver: zodResolver(upsertClinicEmailSettingsSchema),
    defaultValues: {
      senderName: initialData?.senderName || "",
      senderEmail: initialData?.senderEmail || "",
      logoUrl: initialData?.logoUrl || "",
      primaryColor: initialData?.primaryColor || "#3B82F6",
      secondaryColor: initialData?.secondaryColor || "#1F2937",
      footerText: initialData?.footerText || "",
      clinicAddress: initialData?.clinicAddress || "",
      clinicPhone: initialData?.clinicPhone || "",
      clinicWebsite: initialData?.clinicWebsite || "",
      emailSignature: initialData?.emailSignature || "",
      enableReminders: initialData?.enableReminders ?? true,
      reminder24hEnabled: initialData?.reminder24hEnabled ?? true,
      reminder2hEnabled: initialData?.reminder2hEnabled ?? true,
    },
  });

  const { execute, isExecuting } = useAction(upsertClinicEmailSettings, {
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao salvar configurações");
    },
  });

  const handleSubmit = (data: UpsertClinicEmailSettingsSchema) => {
    execute(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Configure as informações básicas do remetente dos emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Remetente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Clínica Saúde Total" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome que aparecerá como remetente dos emails
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Remetente</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contato@clinica.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Email que será usado para enviar as mensagens
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Identidade Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Identidade Visual
            </CardTitle>
            <CardDescription>
              Personalize a aparência dos seus emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    URL da Logo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/logo.png"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL da logo da sua clínica (formato PNG, JPG ou SVG)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="h-10 w-16 p-1"
                          alt="Seletor de cor"
                          {...field}
                        />
                        <Input placeholder="#3B82F6" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Cor principal dos botões e destaques
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Secundária</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="h-10 w-16 p-1"
                          {...field}
                        />
                        <Input placeholder="#1F2937" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Cor secundária para textos e elementos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações da Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informações da Clínica
            </CardTitle>
            <CardDescription>
              Dados que aparecerão nos emails enviados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clinicAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço da Clínica
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Rua das Flores, 123 - Centro&#10;São Paulo - SP - CEP: 01234-567"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Endereço completo da clínica
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="clinicPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 3456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinicWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Site da Clínica
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.clinica.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Textos Personalizados */}
        <Card>
          <CardHeader>
            <CardTitle>Textos Personalizados</CardTitle>
            <CardDescription>
              Personalize os textos que aparecem nos emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="footerText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do Rodapé</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Este email foi enviado automaticamente pelo sistema MendX."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Texto que aparece no rodapé de todos os emails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assinatura do Email</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Atenciosamente,&#10;Equipe da Clínica Saúde Total"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Assinatura personalizada que aparece nos emails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Configurações de Lembretes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configurações de Lembretes
            </CardTitle>
            <CardDescription>
              Configure quando os lembretes automáticos devem ser enviados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="enableReminders"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Habilitar Lembretes
                    </FormLabel>
                    <FormDescription>
                      Ativar ou desativar o envio automático de lembretes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="reminder24hEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Lembrete 24h</FormLabel>
                      <FormDescription>
                        Enviar lembrete 24 horas antes da consulta
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("enableReminders")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminder2hEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Lembrete 2h</FormLabel>
                      <FormDescription>
                        Enviar lembrete 2 horas antes da consulta
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch("enableReminders")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isExecuting} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {isExecuting ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
