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
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { NotificationItem } from "./notification-item";

interface NotificationDropdownProps {
  userId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function NotificationDropdown({
  userId,
  className,
  size = "md",
}: NotificationDropdownProps) {
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
  } = useNotifications({ userId });

  const buttonSizes = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (!userId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", buttonSizes[size], className)}
          disabled={isLoading}
        >
          <Bell className={iconSizes[size]} />

          {/* Badge de contador */}
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}

          {/* Indicador de loading */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Notificações</h3>
              {hasUnread && (
                <p className="text-sm text-gray-600">
                  {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
                </p>
              )}
            </div>

            {/* Actions do header */}
            <div className="flex items-center gap-1">
              {/* Menu de opções */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={refresh}
                    disabled={isLoading}
                    className="cursor-pointer"
                  >
                    <RefreshCw
                      className={cn(
                        "mr-2 h-4 w-4",
                        isLoading && "animate-spin",
                      )}
                    />
                    Atualizar notificações
                  </DropdownMenuItem>

                  {hasUnread && (
                    <>
                      <DropdownMenuItem
                        onClick={markAllAsRead}
                        disabled={isUpdating}
                        className="cursor-pointer"
                      >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Marcar todas como lidas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="cursor-pointer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir página completa
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isUpdating}
                  className="h-8 w-8 p-0"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de notificações */}
        <ScrollArea className="max-h-96">
          {isLoading && notifications.length === 0 ? (
            // Loading state
            <div className="p-6 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
              <p className="text-sm text-gray-600">
                Carregando notificações...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            // Empty state
            <div className="p-6 text-center">
              <Bell className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <h4 className="mb-1 font-medium text-gray-900">
                Nenhuma notificação
              </h4>
              <p className="text-sm text-gray-600">Você está em dia! 🎉</p>
            </div>
          ) : (
            // Lista de notificações
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    compact
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                asChild
              >
                <Link href="/notifications">Ver todas as notificações</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
