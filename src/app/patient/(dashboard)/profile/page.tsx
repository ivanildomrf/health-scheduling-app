import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { clinicsTable, patientsTable } from "@/db/schema";
import { getPatientSession } from "@/helpers/patient-session";

import { PatientProfileForm } from "./components/patient-profile-form";

// Forçar renderização dinâmica
export const dynamic = "force-dynamic";

async function getPatientData(patientId: string) {
  const patient = await db
    .select({
      id: patientsTable.id,
      name: patientsTable.name,
      socialName: patientsTable.socialName,
      motherName: patientsTable.motherName,
      motherUnknown: patientsTable.motherUnknown,
      email: patientsTable.email,
      phone: patientsTable.phone,
      sex: patientsTable.sex,
      gender: patientsTable.gender,
      birthDate: patientsTable.birthDate,
      raceColor: patientsTable.raceColor,
      nationality: patientsTable.nationality,
      birthCountry: patientsTable.birthCountry,
      birthCity: patientsTable.birthCity,
      birthState: patientsTable.birthState,
      naturalizationDate: patientsTable.naturalizationDate,
      passportNumber: patientsTable.passportNumber,
      passportCountry: patientsTable.passportCountry,
      passportIssueDate: patientsTable.passportIssueDate,
      passportExpiryDate: patientsTable.passportExpiryDate,
      zipCode: patientsTable.zipCode,
      addressType: patientsTable.addressType,
      addressName: patientsTable.addressName,
      addressNumber: patientsTable.addressNumber,
      addressComplement: patientsTable.addressComplement,
      addressNeighborhood: patientsTable.addressNeighborhood,
      city: patientsTable.city,
      state: patientsTable.state,
      country: patientsTable.country,
      cpf: patientsTable.cpf,
      rgNumber: patientsTable.rgNumber,
      rgComplement: patientsTable.rgComplement,
      rgState: patientsTable.rgState,
      rgIssuer: patientsTable.rgIssuer,
      rgIssueDate: patientsTable.rgIssueDate,
      cnsNumber: patientsTable.cnsNumber,
      guardianName: patientsTable.guardianName,
      guardianRelationship: patientsTable.guardianRelationship,
      guardianCpf: patientsTable.guardianCpf,
      emergencyContact: patientsTable.emergencyContact,
      emergencyPhone: patientsTable.emergencyPhone,
      clinicId: patientsTable.clinicId,
    })
    .from(patientsTable)
    .where(eq(patientsTable.id, patientId))
    .limit(1);

  if (!patient[0]) return null;

  // Buscar dados da clínica
  const clinic = await db
    .select({
      id: clinicsTable.id,
      name: clinicsTable.name,
    })
    .from(clinicsTable)
    .where(eq(clinicsTable.id, patient[0].clinicId))
    .limit(1);

  return {
    ...patient[0],
    clinic: clinic[0] || {
      id: patient[0].clinicId,
      name: "Clínica não encontrada",
    },
  };
}

export default async function PatientProfilePage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/patient/login");
  }

  const patientData = await getPatientData(session.patientId);

  if (!patientData) {
    redirect("/patient/login");
  }

  return <PatientProfileForm patientData={patientData} />;
}
