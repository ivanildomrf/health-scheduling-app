"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { patientAuth } from "@/lib/patient-auth";
import { actionClient } from "@/lib/safe-action";

const patientLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const patientLogin = actionClient
  .schema(patientLoginSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput;

    try {
      const session = await patientAuth.signIn(email, password);

      if (!session) {
        return {
          success: false,
          error: "Email ou senha incorretos",
        };
      }

      // Definir cookie de sessão
      const cookieStore = await cookies();
      cookieStore.set("patient-session-token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: session.expiresAt,
        path: "/",
      });

      revalidatePath("/patient");

      // Redirecionar para dashboard
      redirect("/patient/dashboard");
    } catch {
      throw new Error("Erro no login");
    }
  });
