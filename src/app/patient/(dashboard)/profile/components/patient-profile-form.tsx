"use client";

import { updatePatientProfile } from "@/actions/update-patient-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  // Dados básicos obrigatórios do CNS
  name: z.string().min(1, "Nome é obrigatório"),
  socialName: z.string().optional(),
  motherName: z.string().optional(),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  birthDate: z.string().optional(),
  raceColor: z
    .enum(["branca", "preta", "parda", "amarela", "indigena", "sem_informacao"])
    .optional(),

  // Contato
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido (exemplo: usuario@email.com)")
    .refine((email) => email.includes("@") && email.includes("."), {
      message: "Email deve conter @ e um domínio válido",
    }),
  phone: z.string().min(1, "Telefone é obrigatório"),

  // Endereço
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),

  // Documentos
  cpf: z.string().optional(),
  cnsNumber: z.string().optional(),

  // Contato de emergência
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface PatientProfileFormProps {
  patientData: {
    id: string;
    name: string;
    socialName?: string | null;
    motherName?: string | null;
    email: string;
    phone: string;
    sex: "male" | "female";
    birthDate?: Date | null;
    raceColor?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    cpf?: string | null;
    cnsNumber?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    clinic: {
      id: string;
      name: string;
    };
  };
}

export function PatientProfileForm({ patientData }: PatientProfileFormProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: patientData.name,
      socialName: patientData.socialName || "",
      motherName: patientData.motherName || "",
      email: patientData.email,
      phone: patientData.phone,
      sex: patientData.sex,
      birthDate: patientData.birthDate
        ? patientData.birthDate.toISOString().split("T")[0]
        : "",
      raceColor: (patientData.raceColor as any) || "sem_informacao",
      city: patientData.city || "",
      state: patientData.state || "",
      zipCode: patientData.zipCode || "",
      cpf: patientData.cpf || "",
      cnsNumber: patientData.cnsNumber || "",
      emergencyContact: patientData.emergencyContact || "",
      emergencyPhone: patientData.emergencyPhone || "",
    },
  });

  const updateProfileAction = useAction(updatePatientProfile, {
    onSuccess: (result) => {
      if (result?.data?.success) {
        toast.success("Perfil atualizado com sucesso!");
      } else if (result?.data?.error) {
        toast.error(result.data.error);
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const onSubmit = (values: ProfileFormData) => {
    updateProfileAction.execute({
      patientId: patientData.id,
      ...values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Seção 1: Dados Básicos de Identificação */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos de Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Social/Apelido</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome pelo qual prefere ser chamado"
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Mãe</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={updateProfileAction.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o sexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="raceColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raça/Cor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={updateProfileAction.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raça/cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="branca">Branca</SelectItem>
                        <SelectItem value="preta">Preta</SelectItem>
                        <SelectItem value="parda">Parda</SelectItem>
                        <SelectItem value="amarela">Amarela</SelectItem>
                        <SelectItem value="indigena">Indígena</SelectItem>
                        <SelectItem value="sem_informacao">
                          Sem informação
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Principal *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="usuario@email.com"
                      disabled={updateProfileAction.isPending}
                      autoComplete="email"
                      inputMode="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="(##) #####-####"
                      mask="_"
                      customInput={Input}
                      placeholder="(11) 99999-9999"
                      disabled={updateProfileAction.isPending}
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values.formattedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção 3: Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="#####-###"
                        mask="_"
                        customInput={Input}
                        placeholder="12345-678"
                        disabled={updateProfileAction.isPending}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.formattedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 4: Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="###.###.###-##"
                        mask="_"
                        customInput={Input}
                        placeholder="123.456.789-00"
                        disabled={updateProfileAction.isPending}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.formattedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnsNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão Nacional de Saúde (CNS)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123 4567 8901 2345"
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 5: Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contato de Emergência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do Contato</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="(##) #####-####"
                        mask="_"
                        customInput={Input}
                        placeholder="(11) 99999-9999"
                        disabled={updateProfileAction.isPending}
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.formattedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de salvar */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateProfileAction.isPending}
            className="min-w-32"
          >
            {updateProfileAction.isPending
              ? "Salvando..."
              : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
