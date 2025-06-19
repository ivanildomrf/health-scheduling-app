"use server";

import { patientAuth } from "@/lib/patient-auth";
import { actionClient } from "@/lib/safe-action";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

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
    } catch (error) {
      redirect("/patient/login");
    }
  });
