import { NextRequest, NextResponse } from "next/server";
import { patientAuth, PatientSession } from "./patient-auth";

export async function validatePatientSession(
  request: NextRequest,
): Promise<PatientSession | null> {
  // Buscar token no cookie
  const token = request.cookies.get("patient-session-token")?.value;

  if (!token) {
    return null;
  }

  // Validar sessão
  const session = await patientAuth.getSession(token);
  return session;
}

export async function createPatientResponse(
  request: NextRequest,
  redirectTo?: string,
): Promise<NextResponse> {
  const session = await validatePatientSession(request);

  if (!session) {
    // Se não há sessão válida, redirecionar para login
    const loginUrl = new URL("/patient/login", request.url);
    if (redirectTo) {
      loginUrl.searchParams.set("redirect", redirectTo);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Sessão válida, continuar
  const response = NextResponse.next();

  // Adicionar informações da sessão nos headers (para usar nos componentes)
  response.headers.set("x-patient-id", session.patient.id);
  response.headers.set("x-patient-name", session.patient.name);
  response.headers.set("x-patient-email", session.patient.email);

  return response;
}

export function setPatientSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
): void {
  response.cookies.set("patient-session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export function removePatientSessionCookie(response: NextResponse): void {
  response.cookies.delete("patient-session-token");
}
