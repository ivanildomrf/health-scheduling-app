"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { patientLogin } from "@/actions/patient-login";
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

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export function PatientLoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginAction = useAction(patientLogin, {
    onSuccess: (result) => {
      if (result?.data?.success) {
        toast.success("Login realizado com sucesso!");
      } else if (result?.data?.error) {
        toast.error(result.data.error);
      }
    },
    onError: (error) => {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginAction.execute(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Seu email"
                  {...field}
                  disabled={loginAction.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Sua senha"
                  {...field}
                  disabled={loginAction.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loginAction.isPending}
        >
          {loginAction.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
