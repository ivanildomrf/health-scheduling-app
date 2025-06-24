"use client";

import {
  Bell,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

import { NotificationItem } from "./notification-item";

interface NotificationDropdownProps {
  userId: string;
  className?: string;
}

export function NotificationDropdown({
  userId,
  className,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    isUpdating,
    hasUnread,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    resetState,
  } = useNotifications({
    userId,
    autoRefresh: true,
    refreshInterval: 15000,
    onlyCounterRefresh: true,
  });

  // Mostrar as 5 notificações mais recentes no dropdown
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-medium"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-96 p-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-medium">Notificações</span>
              {hasUnread && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
                </Badge>
              )}
            </div>

            {/* Dropdown de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={isLoading || isUpdating}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={refresh} disabled={isLoading}>
                  <RefreshCw
                    className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
                  />
                  Atualizar
                </DropdownMenuItem>
                {hasUnread && (
                  <DropdownMenuItem
                    onClick={markAllAsRead}
                    disabled={isUpdating}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Marcar todas como lidas
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={resetState}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset (caso de travamento)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Lista de notificações */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-muted-foreground text-sm">Carregando...</p>
              </div>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Bell className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  Nenhuma notificação
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-60">
              <div className="space-y-1 p-2">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="hover:bg-accent/50 rounded-md transition-colors"
                  >
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      compact
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          <div className="border-t p-2">
            <Link href="/notifications" onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                size="sm"
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                Ver todas as notificações
              </Button>
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
