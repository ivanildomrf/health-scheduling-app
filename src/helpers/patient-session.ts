import { cookies } from "next/headers";

import { patientAuth, PatientSession } from "@/lib/patient-auth";

export async function getPatientSession(): Promise<PatientSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("patient-session-token")?.value;

    if (!token) {
      return null;
    }

    const session = await patientAuth.getSession(token);
    return session;
  } catch (error) {
    return null;
  }
}

export async function requirePatientSession(): Promise<PatientSession> {
  const session = await getPatientSession();

  if (!session) {
    throw new Error("Sessão de paciente não encontrada");
  }

  return session;
}
