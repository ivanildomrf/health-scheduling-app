"use client";

import { updatePatientProfile } from "@/actions/update-patient-profile";
import { Button } from "@/components/ui/button";
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
import React from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  socialName: z.string().optional(),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido (exemplo: usuario@email.com)")
    .refine((email) => email.includes("@") && email.includes("."), {
      message: "Email deve conter @ e um domínio válido",
    }),
  phone: z.string().min(1, "Telefone é obrigatório"),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  cpf: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

interface PatientProfileFormProps {
  patientData: {
    id: string;
    name: string;
    socialName?: string | null;
    email: string;
    phone: string;
    sex: "male" | "female";
    cpf: string | null;
    birthDate: Date | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    clinic: {
      id: string;
      name: string;
    };
  };
}

export function PatientProfileForm({ patientData }: PatientProfileFormProps) {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: patientData.name,
      socialName: patientData.socialName || "",
      email: patientData.email,
      phone: patientData.phone,
      sex: patientData.sex,
      cpf: patientData.cpf || "",
      address: patientData.address || "",
      city: patientData.city || "",
      state: patientData.state || "",
      zipCode: patientData.zipCode || "",
      emergencyContact: patientData.emergencyContact || "",
      emergencyPhone: patientData.emergencyPhone || "",
    },
  });

  // Atualizar formulário quando os dados mudarem
  React.useEffect(() => {
    form.reset({
      name: patientData.name,
      socialName: patientData.socialName || "",
      email: patientData.email,
      phone: patientData.phone,
      sex: patientData.sex,
      cpf: patientData.cpf || "",
      address: patientData.address || "",
      city: patientData.city || "",
      state: patientData.state || "",
      zipCode: patientData.zipCode || "",
      emergencyContact: patientData.emergencyContact || "",
      emergencyPhone: patientData.emergencyPhone || "",
    });
  }, [patientData, form]);

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

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfileAction.execute({
      patientId: patientData.id,
      ...values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input {...field} disabled={updateProfileAction.isPending} />
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
                <FormLabel>Nome Social</FormLabel>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={updateProfileAction.isPending}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input
                  placeholder="Rua, número, complemento"
                  {...field}
                  disabled={updateProfileAction.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} disabled={updateProfileAction.isPending} />
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
                  <Input {...field} disabled={updateProfileAction.isPending} />
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

        <div className="border-t pt-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Contato de Emergência
          </h3>

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
        </div>

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
