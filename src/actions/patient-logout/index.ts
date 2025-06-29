"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { patientAuth } from "@/lib/patient-auth";
import { actionClient } from "@/lib/safe-action";

const patientLogoutSchema = z.object({});

export const patientLogout = actionClient
  .schema(patientLogoutSchema)
  .action(async () => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("patient-session-token")?.value;

      if (token) {
        await patientAuth.signOut(token);
        cookieStore.delete("patient-session-token");
      }

      redirect("/patient/login");
    } catch {
      redirect("/patient/login");
    }
  });
