// Hooks
export { useNotifications } from "@/hooks/use-notifications";
export { useNotificationToast } from "../notification-toast";

// Componentes principais
export { NotificationCenter } from "../notification-center";
export { NotificationDropdown } from "../notification-dropdown";
export { NotificationItem } from "../notification-item";
export { NotificationTestPanel } from "../notification-test-panel";

// Toast utilities
export {
  notificationToast,
  notificationToastStyles,
  showNotificationToast,
} from "../notification-toast";

// Helpers para criação de notificações
export {
  createAppointmentCancelledNotification,
  createAppointmentCompletedNotification,
  createAppointmentConfirmedNotification,
  createAppointmentExpiredNotification,
  createClinicUpdatedNotification,
  createNewPatientNotification,
  createNewProfessionalNotification,
  createNotificationForUser,
} from "@/helpers/notifications";

// Types
export type {
  Notification,
  NotificationConfig,
  NotificationFilters,
  NotificationStats,
  NotificationTargetType,
  NotificationType,
  NotificationWithMeta,
} from "@/lib/types/notifications";

export {
  defaultNotificationConfigs,
  notificationColors,
  notificationIcons,
} from "@/lib/types/notifications";

// Actions (se precisar usar diretamente)
export { createNotification } from "@/actions/create-notification";
export { createTestNotifications } from "@/actions/create-test-notifications";
export { deleteNotification } from "@/actions/delete-notification";
export { getNotifications } from "@/actions/get-notifications";
export { getUnreadNotificationsCount } from "@/actions/get-unread-notifications-count";
export { markAllNotificationsRead } from "@/actions/mark-all-notifications-read";
export { markNotificationRead } from "@/actions/mark-notification-read";
