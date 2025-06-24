import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Notification } from "@/lib/types/notifications";
import {
  notificationColors,
  notificationIcons,
  targetTypeLabels,
} from "@/lib/types/notifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
  compact = false,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const icon = notificationIcons[notification.type] || "🔔";
  const colorClass = notificationColors[notification.type] || "text-gray-600";

  // Traduzir o targetType para português
  const targetTypeLabel = notification.targetType 
    ? targetTypeLabels[notification.targetType as keyof typeof targetTypeLabels] || notification.targetType
    : undefined;

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 hover:shadow-md",
        !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50/50",
        compact ? "p-3" : "p-4",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Ícone da notificação */}
        <div className={cn("flex-shrink-0 text-xl", colorClass)}>{icon}</div>

        {/* Conteúdo principal */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  "leading-tight font-medium",
                  compact ? "text-sm" : "text-base",
                  !notification.isRead && "text-gray-900",
                  notification.isRead && "text-gray-600",
                )}
              >
                {notification.title}
              </h4>

              <p
                className={cn(
                  "mt-1 leading-relaxed text-gray-600",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {notification.message}
              </p>
            </div>

            {/* Badge de não lida */}
            {!notification.isRead && (
              <div className="flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            )}
          </div>

          {/* Footer com tempo e actions */}
          <div className="mt-3 flex items-center justify-between">
            <span
              className={cn("text-gray-400", compact ? "text-xs" : "text-sm")}
            >
              {timeAgo}
            </span>

            {/* Actions (aparecem no hover) */}
            {showActions && (isHovered || !notification.isRead) && (
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-blue-100"
                          onClick={handleMarkAsRead}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Marcar como lida</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-100"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remover notificação</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tipo da notificação (badge traduzido) */}
      {!compact && targetTypeLabel && (
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-xs">
            {targetTypeLabel}
          </Badge>
        </div>
      )}
    </Card>
  );
}
