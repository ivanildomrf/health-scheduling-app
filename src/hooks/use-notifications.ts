import { deleteNotification } from "@/actions/delete-notification";
import { getNotifications } from "@/actions/get-notifications";
import { getUnreadNotificationsCount } from "@/actions/get-unread-notifications-count";
import { markAllNotificationsRead } from "@/actions/mark-all-notifications-read";
import { markNotificationRead } from "@/actions/mark-notification-read";
import type { Notification } from "@/lib/types/notifications";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UseNotificationsProps {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications({
  userId,
  autoRefresh = true,
  refreshInterval = 30000,
}: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Actions
  const { execute: fetchNotifications, isExecuting: isLoadingNotifications } =
    useAction(getNotifications, {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setNotifications(data.data);
        }
      },
      onError: ({ error }) => {
        toast.error("Erro ao carregar notificações");
        console.error("Erro ao carregar notificações:", error);
      },
    });

  const { execute: fetchUnreadCount, isExecuting: isLoadingCount } = useAction(
    getUnreadNotificationsCount,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setUnreadCount(data.data.count);
        }
      },
      onError: ({ error }) => {
        console.error("Erro ao carregar contador:", error);
      },
    },
  );

  const { execute: markAsRead, isExecuting: isMarkingRead } = useAction(
    markNotificationRead,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          // Atualizar notificação local
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === data.data.id ? { ...notif, isRead: true } : notif,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          toast.success("Notificação marcada como lida");
        }
      },
      onError: ({ error }) => {
        toast.error("Erro ao marcar notificação como lida");
        console.error("Erro ao marcar como lida:", error);
      },
    },
  );

  const { execute: markAllAsRead, isExecuting: isMarkingAllRead } = useAction(
    markAllNotificationsRead,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          // Atualizar todas as notificações locais
          setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, isRead: true })),
          );
          setUnreadCount(0);
          toast.success(`${data.data.count} notificações marcadas como lidas`);
        }
      },
      onError: ({ error }) => {
        toast.error("Erro ao marcar todas as notificações como lidas");
        console.error("Erro ao marcar todas como lidas:", error);
      },
    },
  );

  const { execute: removeNotification, isExecuting: isDeleting } = useAction(
    deleteNotification,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          // Remover notificação local
          setNotifications((prev) =>
            prev.filter((notif) => notif.id !== data.data.id),
          );
          if (!data.data.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          toast.success("Notificação removida");
        }
      },
      onError: ({ error }) => {
        toast.error("Erro ao remover notificação");
        console.error("Erro ao remover notificação:", error);
      },
    },
  );

  // Funções utilitárias
  const refresh = useCallback(() => {
    fetchNotifications({ userId, limit: 20 });
    fetchUnreadCount({ userId });
  }, [userId, fetchNotifications, fetchUnreadCount]);

  const markAsReadHandler = useCallback(
    (notificationId: string) => {
      markAsRead({ notificationId, userId });
    },
    [markAsRead, userId],
  );

  const markAllAsReadHandler = useCallback(() => {
    markAllAsRead({ userId });
  }, [markAllAsRead, userId]);

  const deleteHandler = useCallback(
    (notificationId: string) => {
      removeNotification({ notificationId, userId });
    },
    [removeNotification, userId],
  );

  // Buscar notificações inicial
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    const interval = setInterval(() => {
      fetchNotifications({ userId, limit: 20 });
      fetchUnreadCount({ userId });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [
    autoRefresh,
    refreshInterval,
    userId,
    fetchNotifications,
    fetchUnreadCount,
  ]);

  // Estados de loading
  const isLoading = isLoadingNotifications || isLoadingCount;
  const isUpdating = isMarkingRead || isMarkingAllRead || isDeleting;

  return {
    // Data
    notifications,
    unreadCount,

    // Loading states
    isLoading,
    isUpdating,

    // Actions
    refresh,
    markAsRead: markAsReadHandler,
    markAllAsRead: markAllAsReadHandler,
    deleteNotification: deleteHandler,

    // Utils
    hasUnread: unreadCount > 0,
    totalCount: notifications.length,
  };
}
