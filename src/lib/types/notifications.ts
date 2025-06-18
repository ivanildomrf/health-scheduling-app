import { notificationsTable } from "@/db/schema";

export type NotificationType =
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_reminder_24h"
  | "appointment_reminder_2h"
  | "appointment_completed"
  | "appointment_expired"
  | "new_patient_registered"
  | "new_professional_added"
  | "clinic_updated"
  | "system_alert";

export type NotificationTargetType =
  | "appointment"
  | "patient"
  | "professional"
  | "clinic"
  | "system";

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;

export interface NotificationWithMeta extends Notification {
  isNew?: boolean;
  timeAgo?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  targetType?: NotificationTargetType;
  dateFrom?: Date;
  dateTo?: Date;
}

// Configurações de notificação para diferentes cenários
export interface NotificationConfig {
  enableToast: boolean;
  enableInApp: boolean;
  enableEmail: boolean;
  enablePush: boolean;
}

export const defaultNotificationConfigs: Record<
  NotificationType,
  NotificationConfig
> = {
  appointment_confirmed: {
    enableToast: true,
    enableInApp: true,
    enableEmail: true,
    enablePush: true,
  },
  appointment_cancelled: {
    enableToast: true,
    enableInApp: true,
    enableEmail: true,
    enablePush: true,
  },
  appointment_reminder_24h: {
    enableToast: false,
    enableInApp: true,
    enableEmail: true,
    enablePush: true,
  },
  appointment_reminder_2h: {
    enableToast: true,
    enableInApp: true,
    enableEmail: false,
    enablePush: true,
  },
  appointment_completed: {
    enableToast: true,
    enableInApp: true,
    enableEmail: false,
    enablePush: false,
  },
  appointment_expired: {
    enableToast: true,
    enableInApp: true,
    enableEmail: false,
    enablePush: true,
  },
  new_patient_registered: {
    enableToast: true,
    enableInApp: true,
    enableEmail: false,
    enablePush: false,
  },
  new_professional_added: {
    enableToast: true,
    enableInApp: true,
    enableEmail: false,
    enablePush: false,
  },
  clinic_updated: {
    enableToast: true,
    enableInApp: true,
    enableEmail: false,
    enablePush: false,
  },
  system_alert: {
    enableToast: true,
    enableInApp: true,
    enableEmail: true,
    enablePush: true,
  },
};

// Ícones para cada tipo de notificação
export const notificationIcons: Record<NotificationType, string> = {
  appointment_confirmed: "📅",
  appointment_cancelled: "❌",
  appointment_reminder_24h: "⏰",
  appointment_reminder_2h: "⏰",
  appointment_completed: "✅",
  appointment_expired: "⏳",
  new_patient_registered: "👤",
  new_professional_added: "👨‍⚕️",
  clinic_updated: "🏥",
  system_alert: "⚠️",
};

// Cores para cada tipo de notificação (Tailwind)
export const notificationColors: Record<NotificationType, string> = {
  appointment_confirmed: "text-green-600",
  appointment_cancelled: "text-red-600",
  appointment_reminder_24h: "text-blue-600",
  appointment_reminder_2h: "text-orange-600",
  appointment_completed: "text-green-600",
  appointment_expired: "text-gray-600",
  new_patient_registered: "text-blue-600",
  new_professional_added: "text-purple-600",
  clinic_updated: "text-indigo-600",
  system_alert: "text-yellow-600",
};

// Tradução das tags de targetType para português
export const targetTypeLabels: Record<NotificationTargetType, string> = {
  appointment: "consulta",
  patient: "paciente",
  professional: "profissional",
  clinic: "clínica",
  system: "sistema",
};
