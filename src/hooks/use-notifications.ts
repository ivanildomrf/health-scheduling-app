import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteNotification } from "@/actions/delete-notification";
import { getNotifications } from "@/actions/get-notifications";
import { getUnreadNotificationsCount } from "@/actions/get-unread-notifications-count";
import { markAllNotificationsRead } from "@/actions/mark-all-notifications-read";
import { markNotificationRead } from "@/actions/mark-notification-read";
import type { Notification } from "@/lib/types/notifications";

interface UseNotificationsProps {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onlyCounterRefresh?: boolean;
}

export function useNotifications({
  userId,
  autoRefresh = true,
  refreshInterval = 10000,
  onlyCounterRefresh = false,
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
      onError: () => {
        toast.error("Erro ao carregar notificações");
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
      onError: () => {
        toast.error("Erro ao carregar contador de notificações");
      },
    },
  );

  const { execute: markAsRead, isExecuting: isMarkingRead } = useAction(
    markNotificationRead,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === data.data.id ? { ...notif, isRead: true } : notif,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          toast.success("Notificação marcada como lida");
        }
      },
      onError: () => {
        toast.error("Erro ao marcar notificação como lida");
      },
    },
  );

  const { execute: markAllAsRead, isExecuting: isMarkingAllRead } = useAction(
    markAllNotificationsRead,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, isRead: true })),
          );
          setUnreadCount(0);
          toast.success(`${data.data.count} notificações marcadas como lidas`);
        }
      },
      onError: () => {
        toast.error("Erro ao marcar todas as notificações como lidas");
      },
    },
  );

  const { execute: removeNotification, isExecuting: isDeleting } = useAction(
    deleteNotification,
    {
      onSuccess: ({ data }) => {
        if (data?.data) {
          setNotifications((prev) =>
            prev.filter((notif) => notif.id !== data.data.id),
          );
          if (!data.data.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          toast.success("Notificação removida");
        }
      },
      onError: () => {
        toast.error("Erro ao remover notificação");
      },
    },
  );

  // Função de refresh
  const refresh = useCallback(() => {
    if (!userId) {
      return;
    }

    if (onlyCounterRefresh) {
      // Apenas atualizar contador
      fetchUnreadCount({ userId });
    } else {
      // Atualizar notificações e contador
      fetchNotifications({ userId, limit: 20 });
      fetchUnreadCount({ userId });
    }
  }, [userId, fetchNotifications, fetchUnreadCount, onlyCounterRefresh]);

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

  const resetState = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    refresh();
  }, [refresh]);

  // Carregamento inicial
  useEffect(() => {
    if (userId) {
      // Sempre carregar notificações na inicialização (mesmo com onlyCounterRefresh)
      fetchNotifications({ userId, limit: 20 });
      // Sempre carregar contador
      fetchUnreadCount({ userId });
    }
  }, [userId, fetchNotifications, fetchUnreadCount]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId || refreshInterval <= 0) {
      return;
    }

    const interval = setInterval(() => {
      if (onlyCounterRefresh) {
        // Apenas atualizar contador
        fetchUnreadCount({ userId });
      } else {
        // Atualizar notificações completas + contador
        fetchNotifications({ userId, limit: 20 });
        fetchUnreadCount({ userId });
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [
    autoRefresh,
    userId,
    refreshInterval,
    fetchUnreadCount,
    fetchNotifications,
    onlyCounterRefresh,
  ]);

  const isLoading = isLoadingNotifications || isLoadingCount;
  const isUpdating = isMarkingRead || isMarkingAllRead || isDeleting;
  const hasUnread = unreadCount > 0;
  const totalCount = notifications.length;

  return {
    notifications,
    unreadCount,
    isLoading,
    isUpdating,
    hasUnread,
    refresh,
    markAsRead: markAsReadHandler,
    markAllAsRead: markAllAsReadHandler,
    deleteNotification: deleteHandler,
    resetState,
    totalCount,
  };
}
