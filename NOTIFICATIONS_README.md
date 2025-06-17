# 🔔 Sistema de Notificações - Estrutura Base

Este documento descreve a implementação da estrutura base do sistema de notificações para o MendX Scheduling App.

## 📋 O que foi implementado

### 1. **Schema do Banco de Dados**

#### ✅ **Tabela `notifications`**

```sql
CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" notification_type NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "user_id" text NOT NULL,
  "target_id" uuid,
  "target_type" text,
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);
```

#### ✅ **Enum `notification_type`**

- `appointment_confirmed` - Consulta confirmada
- `appointment_cancelled` - Consulta cancelada
- `appointment_reminder_24h` - Lembrete 24h antes
- `appointment_reminder_2h` - Lembrete 2h antes
- `appointment_completed` - Consulta concluída
- `appointment_expired` - Consulta expirada
- `new_patient_registered` - Novo paciente cadastrado
- `new_professional_added` - Novo profissional adicionado
- `clinic_updated` - Clínica atualizada
- `system_alert` - Alerta do sistema

### 2. **Server Actions**

#### ✅ **Actions Implementadas**

| Action                        | Arquivo                                       | Descrição                      |
| ----------------------------- | --------------------------------------------- | ------------------------------ |
| `createNotification`          | `src/actions/create-notification/`            | Criar nova notificação         |
| `getNotifications`            | `src/actions/get-notifications/`              | Buscar notificações do usuário |
| `markNotificationRead`        | `src/actions/mark-notification-read/`         | Marcar como lida               |
| `markAllNotificationsRead`    | `src/actions/mark-all-notifications-read/`    | Marcar todas como lidas        |
| `deleteNotification`          | `src/actions/delete-notification/`            | Deletar notificação            |
| `getUnreadNotificationsCount` | `src/actions/get-unread-notifications-count/` | Contar não lidas               |

#### ✅ **Exemplo de Uso das Actions**

```typescript
import { createNotification } from "@/actions/create-notification";

// Criar notificação
const result = await createNotification({
  type: "appointment_confirmed",
  title: "Consulta Agendada!",
  message: "Sua consulta foi confirmada para 15/12/2024 às 14:00",
  userId: "user-123",
  targetId: "appointment-456",
  targetType: "appointment",
});
```

### 3. **Helpers Utilitários**

#### ✅ **Arquivo: `src/helpers/notifications.ts`**

Funções especializadas para cada tipo de notificação:

```typescript
// Exemplo: Notificação de consulta confirmada
await createAppointmentConfirmedNotification(
  {
    userId: "patient-123",
    targetId: "appointment-456",
  },
  {
    patientName: "João Silva",
    professionalName: "Dr. Maria Santos",
    appointmentDate: new Date("2024-12-15T14:00:00Z"),
    clinicName: "Clínica Saúde Total",
  },
);
```

### 4. **Tipos TypeScript**

#### ✅ **Arquivo: `src/lib/types/notifications.ts`**

- **Tipos básicos**: `NotificationType`, `Notification`, `NewNotification`
- **Configurações**: `NotificationConfig`, `defaultNotificationConfigs`
- **Metadata**: `notificationIcons`, `notificationColors`
- **Filtros**: `NotificationFilters`, `NotificationStats`

### 5. **Integração com Actions Existentes**

#### ✅ **Exemplo Prático**

Arquivo: `src/actions/create-appointment-with-notifications/index.ts`

Mostra como integrar notificações automáticas ao criar uma consulta:

```typescript
// Criar o agendamento
const [newAppointment] = await db.insert(appointmentsTable).values({...});

// ✨ Criar notificações automáticas
await createAppointmentConfirmedNotification(
  { userId: patient.id, targetId: newAppointment.id },
  { patientName, professionalName, appointmentDate, clinicName }
);
```

## 🚀 Como usar a estrutura base

### **1. Aplicar a migração do banco**

```bash
npx drizzle-kit push
```

### **2. Criar notificação simples**

```typescript
import { createNotification } from "@/actions/create-notification";

const result = await createNotification({
  type: "system_alert",
  title: "Manutenção Programada",
  message: "O sistema ficará offline das 2h às 4h",
  userId: "admin-123",
});
```

### **3. Buscar notificações de um usuário**

```typescript
import { getNotifications } from "@/actions/get-notifications";

const notifications = await getNotifications({
  userId: "user-123",
  limit: 10,
  onlyUnread: true,
});
```

### **4. Usar helpers especializados**

```typescript
import { createAppointmentReminderNotification } from "@/helpers/notifications";

await createAppointmentReminderNotification(
  { userId: "patient-123", targetId: "appointment-456" },
  {
    patientName: "João",
    professionalName: "Dr. Maria",
    appointmentDate: new Date(),
  },
  "24h",
);
```

## 📁 Estrutura de Arquivos

```
src/
├── actions/
│   ├── create-notification/
│   ├── get-notifications/
│   ├── mark-notification-read/
│   ├── mark-all-notifications-read/
│   ├── delete-notification/
│   ├── get-unread-notifications-count/
│   └── create-appointment-with-notifications/ (exemplo)
├── helpers/
│   └── notifications.ts
├── lib/types/
│   └── notifications.ts
└── db/
    └── schema.ts (atualizado)
```

## 🔄 Próximos Passos

A estrutura base está completa! Para continuar a implementação:

1. **Interface Visual** - Criar componentes React para exibir notificações
2. **Sistema de Toast** - Integrar com Sonner para notificações em tempo real
3. **Notificações por Email** - Sistema de lembretes por email
4. **WebSocket/Polling** - Atualizações em tempo real
5. **Push Notifications** - Para dispositivos móveis

## ✅ Checklist da Estrutura Base

- [x] Schema do banco com tabela `notifications`
- [x] Enum `notification_type` com todos os tipos
- [x] Server Actions para CRUD de notificações
- [x] Helpers especializados por domínio
- [x] Tipos TypeScript completos
- [x] Configuração de cores e ícones
- [x] Exemplo de integração com actions existentes
- [x] Migração do banco gerada
- [x] Documentação completa

---

**🎉 A estrutura base do sistema de notificações está pronta para uso!**

Você pode agora:

- ✅ Criar notificações programaticamente
- ✅ Buscar e gerenciar notificações
- ✅ Integrar com actions existentes
- ✅ Usar helpers especializados
- ✅ Expandir com interface visual
