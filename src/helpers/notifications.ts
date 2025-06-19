import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import type { NotificationType } from "@/lib/types/notifications";

export interface NotificationParams {
  userId: string;
  targetId?: string;
  targetType?: string;
}

export interface AppointmentNotificationData {
  patientName: string;
  professionalName: string;
  appointmentDate: Date;
  clinicName?: string;
}

export interface PatientNotificationData {
  patientName: string;
  clinicName: string;
}

export interface ProfessionalNotificationData {
  professionalName: string;
  speciality: string;
  clinicName: string;
}

// Função para criar notificação automaticamente
export async function createNotificationForUser(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  targetId?: string,
  targetType?: "appointment" | "patient" | "professional" | "clinic" | "system",
) {
  try {
    const [notification] = await db
      .insert(notificationsTable)
      .values({
        type,
        title,
        message,
        userId,
        targetId,
        targetType: targetType || "system",
      })
      .returning();

    return notification;
  } catch (error) {
    // Falhar silenciosamente para não quebrar o fluxo principal
  }
}

// Funções específicas para cada tipo de evento
export async function createAppointmentConfirmedNotification(
  userId: string,
  patientName: string,
  professionalName: string,
  date: string,
  time: string,
  appointmentId?: string,
) {
  return createNotificationForUser(
    userId,
    "appointment_confirmed",
    `Consulta Confirmada - ${patientName}`,
    `A consulta do paciente ${patientName} com ${professionalName} para ${date} às ${time} foi confirmada.`,
    appointmentId,
    "appointment",
  );
}

export async function createAppointmentCancelledNotification(
  userId: string,
  patientName: string,
  professionalName: string,
  date: string,
  time: string,
  appointmentId?: string,
) {
  return createNotificationForUser(
    userId,
    "appointment_cancelled",
    `Consulta Cancelada - ${patientName}`,
    `A consulta do paciente ${patientName} com ${professionalName} para ${date} às ${time} foi cancelada. Reagendamento necessário.`,
    appointmentId,
    "appointment",
  );
}

export async function createAppointmentCompletedNotification(
  userId: string,
  patientName: string,
  professionalName: string,
  appointmentId?: string,
) {
  return createNotificationForUser(
    userId,
    "appointment_completed",
    `Consulta Finalizada - ${patientName}`,
    `A consulta do paciente ${patientName} com ${professionalName} foi concluída com sucesso. Registros atualizados.`,
    appointmentId,
    "appointment",
  );
}

export async function createAppointmentExpiredNotification(
  userId: string,
  patientName: string,
  professionalName: string,
  appointmentId?: string,
) {
  return createNotificationForUser(
    userId,
    "appointment_expired",
    `Consulta Não Realizada - ${patientName}`,
    `A consulta agendada do paciente ${patientName} com ${professionalName} não foi realizada e foi marcada como expirada.`,
    appointmentId,
    "appointment",
  );
}

export async function createNewPatientNotification(
  userId: string,
  patientName: string,
  patientPhone?: string,
  patientEmail?: string,
  patientId?: string,
) {
  const contactInfo = [];
  if (patientPhone) contactInfo.push(`telefone ${patientPhone}`);
  if (patientEmail) contactInfo.push(`email ${patientEmail}`);

  const contactText =
    contactInfo.length > 0 ? `. Dados: ${contactInfo.join(", ")}` : "";

  return createNotificationForUser(
    userId,
    "new_patient_registered",
    `Novo Paciente Cadastrado`,
    `O paciente ${patientName} foi cadastrado no sistema${contactText}`,
    patientId,
    "patient",
  );
}

export async function createNewProfessionalNotification(
  userId: string,
  professionalName: string,
  specialty?: string,
  professionalId?: string,
) {
  const specialtyText = specialty ? `. Especialidade: ${specialty}` : "";

  return createNotificationForUser(
    userId,
    "new_professional_added",
    `Novo Profissional Adicionado`,
    `${professionalName} foi adicionado à equipe da clínica${specialtyText}. Agenda disponível para agendamentos.`,
    professionalId,
    "professional",
  );
}

export async function createClinicUpdatedNotification(
  userId: string,
  clinicId?: string,
) {
  return createNotificationForUser(
    userId,
    "clinic_updated",
    `Informações da Clínica Atualizadas`,
    `As informações da clínica foram atualizadas com sucesso. Verifique os novos dados no sistema de gestão.`,
    clinicId,
    "clinic",
  );
}
