"use client";

import { Bell, CheckCheck, RefreshCw, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificationType } from "@/lib/types/notifications";
import { cn } from "@/lib/utils";

import { NotificationItem } from "./notification-item";

// Dynamic import para evitar hidratação server-side
const DynamicNotificationTestPanel = dynamic(
  () =>
    import("./notification-test-panel").then(
      (mod) => mod.NotificationTestPanel,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

interface NotificationCenterProps {
  userId: string;
  className?: string;
}

export function NotificationCenter({
  userId,
  className,
}: NotificationCenterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");

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
  } = useNotifications({ userId, refreshInterval: 20000 });

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notification) => {
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !notification.title.toLowerCase().includes(searchLower) &&
        !notification.message.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Filtro por status
    if (activeTab === "unread" && notification.isRead) return false;
    if (activeTab === "read" && !notification.isRead) return false;

    // Filtro por tipo
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    return true;
  });

  // Contadores baseados nas notificações originais (sem filtro de status de aba)
  const baseFilteredNotifications = notifications.filter((notification) => {
    // Aplicar apenas filtros de busca e tipo, NÃO o filtro de status da aba
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !notification.title.toLowerCase().includes(searchLower) &&
        !notification.message.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    return true;
  });

  const allCount = baseFilteredNotifications.length;
  const unreadCount_local = baseFilteredNotifications.filter(
    (n) => !n.isRead,
  ).length;
  const readCount_local = baseFilteredNotifications.filter(
    (n) => n.isRead,
  ).length;

  if (!userId) return null;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Central de Notificações</CardTitle>
            {hasUnread && (
              <Badge variant="secondary">
                {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              Atualizar
            </Button>

            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={isUpdating}
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por tipo */}
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as NotificationType | "all")
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="appointment_confirmed">
                Consultas confirmadas
              </SelectItem>
              <SelectItem value="appointment_cancelled">
                Consultas canceladas
              </SelectItem>
              <SelectItem value="appointment_reminder_24h">
                Lembretes 24h
              </SelectItem>
              <SelectItem value="appointment_reminder_2h">
                Lembretes 2h
              </SelectItem>
              <SelectItem value="appointment_completed">
                Consultas concluídas
              </SelectItem>
              <SelectItem value="appointment_expired">
                Consultas expiradas
              </SelectItem>
              <SelectItem value="new_patient_registered">
                Novos pacientes
              </SelectItem>
              <SelectItem value="new_professional_added">
                Novos profissionais
              </SelectItem>
              <SelectItem value="clinic_updated">Clínica atualizada</SelectItem>
              <SelectItem value="system_alert">Alertas do sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "all" | "unread" | "read")
          }
        >
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                Todas
                <Badge variant="outline" className="ml-1">
                  {allCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                Não lidas
                <Badge variant="destructive" className="ml-1">
                  {unreadCount_local}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-2">
                Lidas
                <Badge variant="secondary" className="ml-1">
                  {readCount_local}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="read" className="m-0">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Painel de teste apenas em desenvolvimento */}
        {process.env.NODE_ENV === "development" && (
          <div className="border-t px-6 py-4">
            <DynamicNotificationTestPanel userId={userId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NotificationListProps {
  notifications: any[]; // Temporariamente any para evitar conflito com tipo nativo Notification
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  isLoading,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Bell className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
          <h3 className="text-muted-foreground mb-2 text-lg font-medium">
            Nenhuma notificação encontrada
          </h3>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros ou aguarde por novas notificações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-3 px-6 py-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
