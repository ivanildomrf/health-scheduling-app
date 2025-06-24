import { Eye, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NotificationType } from "@/lib/types/notifications";
import {
  notificationColors,
  notificationIcons,
} from "@/lib/types/notifications";
import { cn } from "@/lib/utils";

interface NotificationToastData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  targetId?: string;
  targetType?: string;
}

interface NotificationToastOptions {
  onMarkAsRead?: (id: string) => void;
  onNavigate?: (targetId?: string, targetType?: string) => void;
  duration?: number;
  dismissible?: boolean;
}

// Componente do toast customizado
function NotificationToastContent({
  notification,
  onMarkAsRead,
  onNavigate,
  onDismiss,
}: {
  notification: NotificationToastData;
  onMarkAsRead?: (id: string) => void;
  onNavigate?: (targetId?: string, targetType?: string) => void;
  onDismiss?: () => void;
}) {
  const icon = notificationIcons[notification.type] || "🔔";
  const colorClass = notificationColors[notification.type] || "text-gray-600";

  const handleMarkAsRead = () => {
    onMarkAsRead?.(notification.id);
    onDismiss?.();
  };

  const handleNavigate = () => {
    onNavigate?.(notification.targetId, notification.targetType);
    onDismiss?.();
  };

  return (
    <div className="flex items-start gap-3 p-1">
      {/* Ícone da notificação */}
      <div className={cn("mt-1 flex-shrink-0 text-xl", colorClass)}>{icon}</div>

      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm leading-tight font-medium text-gray-900">
              {notification.title}
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {notification.message}
            </p>
          </div>

          {/* Badge do tipo */}
          {notification.targetType && (
            <Badge variant="outline" className="flex-shrink-0 text-xs">
              {notification.targetType}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          {onMarkAsRead && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAsRead}
              className="h-7 text-xs"
            >
              <Eye className="mr-1 h-3 w-3" />
              Marcar como lida
            </Button>
          )}

          {onNavigate && notification.targetId && (
            <Button
              variant="default"
              size="sm"
              onClick={handleNavigate}
              className="h-7 text-xs"
            >
              Ver detalhes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Função principal para exibir toast de notificação
export function showNotificationToast(
  notification: NotificationToastData,
  options?: NotificationToastOptions,
) {
  const {
    onMarkAsRead,
    onNavigate,
    duration = 8000,
    dismissible = true,
  } = options || {};

  return toast.custom(
    (t) => (
      <div className="relative">
        <NotificationToastContent
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onNavigate={onNavigate}
          onDismiss={() => toast.dismiss(t)}
        />

        {/* Botão de fechar */}
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    ),
    {
      duration,
      className: "notification-toast",
    },
  );
}

// Funções de conveniência para diferentes tipos de notificação
export const notificationToast = {
  // Notificações de agendamento
  appointmentConfirmed: (
    data: NotificationToastData,
    options?: NotificationToastOptions,
  ) => showNotificationToast(data, { ...options, duration: 6000 }),

  appointmentCancelled: (
    data: NotificationToastData,
    options?: NotificationToastOptions,
  ) => showNotificationToast(data, { ...options, duration: 8000 }),

  appointmentReminder: (
    data: NotificationToastData,
    options?: NotificationToastOptions,
  ) => showNotificationToast(data, { ...options, duration: 10000 }),

  // Notificações do sistema
  systemAlert: (
    data: NotificationToastData,
    options?: NotificationToastOptions,
  ) => showNotificationToast(data, { ...options, duration: 12000 }),

  // Notificação genérica
  show: showNotificationToast,
};

// Estilos CSS para o toast (você pode adicionar isso ao seu CSS global)
export const notificationToastStyles = `
  .notification-toast {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: 16px;
    min-width: 350px;
    max-width: 500px;
  }

  .notification-toast[data-type="success"] {
    border-left: 4px solid #10b981;
  }

  .notification-toast[data-type="error"] {
    border-left: 4px solid #ef4444;
  }

  .notification-toast[data-type="warning"] {
    border-left: 4px solid #f59e0b;
  }

  .notification-toast[data-type="info"] {
    border-left: 4px solid #3b82f6;
  }
`;

// Hook para usar toasts de notificação
export function useNotificationToast() {
  const showToast = (
    notification: NotificationToastData,
    options?: NotificationToastOptions,
  ) => {
    return showNotificationToast(notification, options);
  };

  const showSuccess = (title: string, message: string) => {
    return toast.success(title, { description: message });
  };

  const showError = (title: string, message: string) => {
    return toast.error(title, { description: message });
  };

  const showInfo = (title: string, message: string) => {
    return toast.info(title, { description: message });
  };

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    dismiss: toast.dismiss,
    dismissAll: () => toast.dismiss(),
  };
}
