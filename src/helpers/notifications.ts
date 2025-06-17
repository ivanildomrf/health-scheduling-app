import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import dayjs from "dayjs";

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

// Função utilitária para criar notificação diretamente no banco
async function createNotificationInDB(
  type:
    | "appointment_confirmed"
    | "appointment_cancelled"
    | "appointment_reminder_24h"
    | "appointment_reminder_2h"
    | "appointment_completed"
    | "appointment_expired"
    | "new_patient_registered"
    | "new_professional_added"
    | "clinic_updated"
    | "system_alert",
  title: string,
  message: string,
  userId: string,
  targetId?: string,
  targetType?: string,
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
        targetType,
      })
      .returning();

    return {
      success: true,
      data: notification,
      message: "Notificação criada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return {
      success: false,
      error: "Erro interno do servidor",
    };
  }
}

// Notificações de Agendamento
export async function createAppointmentConfirmedNotification(
  params: NotificationParams,
  data: AppointmentNotificationData,
) {
  const formattedDate = dayjs(data.appointmentDate).format(
    "DD/MM/YYYY [às] HH:mm",
  );

  return await createNotificationInDB(
    "appointment_confirmed",
    "Consulta Agendada! 📅",
    `Sua consulta com ${data.professionalName} foi confirmada para ${formattedDate}`,
    params.userId,
    params.targetId,
    params.targetType || "appointment",
  );
}

export async function createAppointmentCancelledNotification(
  params: NotificationParams,
  data: AppointmentNotificationData,
) {
  const formattedDate = dayjs(data.appointmentDate).format(
    "DD/MM/YYYY [às] HH:mm",
  );

  return await createNotificationInDB(
    "appointment_cancelled",
    "Consulta Cancelada ❌",
    `Sua consulta com ${data.professionalName} marcada para ${formattedDate} foi cancelada`,
    params.userId,
    params.targetId,
    params.targetType || "appointment",
  );
}

export async function createAppointmentReminderNotification(
  params: NotificationParams,
  data: AppointmentNotificationData,
  reminderType: "24h" | "2h",
) {
  const formattedDate = dayjs(data.appointmentDate).format(
    "DD/MM/YYYY [às] HH:mm",
  );
  const reminderText = reminderType === "24h" ? "amanhã" : "em 2 horas";

  return await createNotificationInDB(
    reminderType === "24h"
      ? "appointment_reminder_24h"
      : "appointment_reminder_2h",
    `Lembrete de Consulta ⏰`,
    `Você tem uma consulta com ${data.professionalName} ${reminderText} (${formattedDate})`,
    params.userId,
    params.targetId,
    params.targetType || "appointment",
  );
}

export async function createAppointmentCompletedNotification(
  params: NotificationParams,
  data: AppointmentNotificationData,
) {
  return await createNotificationInDB(
    "appointment_completed",
    "Consulta Concluída ✅",
    `Sua consulta com ${data.professionalName} foi concluída com sucesso`,
    params.userId,
    params.targetId,
    params.targetType || "appointment",
  );
}

export async function createAppointmentExpiredNotification(
  params: NotificationParams,
  data: AppointmentNotificationData,
) {
  const formattedDate = dayjs(data.appointmentDate).format(
    "DD/MM/YYYY [às] HH:mm",
  );

  return await createNotificationInDB(
    "appointment_expired",
    "Consulta Expirada ⏳",
    `Sua consulta com ${data.professionalName} de ${formattedDate} expirou`,
    params.userId,
    params.targetId,
    params.targetType || "appointment",
  );
}

// Notificações de Sistema
export async function createNewPatientNotification(
  params: NotificationParams,
  data: PatientNotificationData,
) {
  return await createNotificationInDB(
    "new_patient_registered",
    "Novo Paciente Cadastrado 👤",
    `${data.patientName} se cadastrou na ${data.clinicName}`,
    params.userId,
    params.targetId,
    params.targetType || "patient",
  );
}

export async function createNewProfessionalNotification(
  params: NotificationParams,
  data: ProfessionalNotificationData,
) {
  return await createNotificationInDB(
    "new_professional_added",
    "Novo Profissional Adicionado 👨‍⚕️",
    `${data.professionalName} (${data.speciality}) foi adicionado à ${data.clinicName}`,
    params.userId,
    params.targetId,
    params.targetType || "professional",
  );
}

export async function createClinicUpdatedNotification(
  params: NotificationParams,
  clinicName: string,
) {
  return await createNotificationInDB(
    "clinic_updated",
    "Clínica Atualizada 🏥",
    `As informações da ${clinicName} foram atualizadas`,
    params.userId,
    params.targetId,
    params.targetType || "clinic",
  );
}

export async function createSystemAlertNotification(
  params: NotificationParams,
  title: string,
  message: string,
) {
  return await createNotificationInDB(
    "system_alert",
    `⚠️ ${title}`,
    message,
    params.userId,
    params.targetId,
    params.targetType || "system",
  );
}
