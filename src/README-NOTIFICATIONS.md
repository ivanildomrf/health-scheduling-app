# Sistema de Notificações Integrado

## Visão Geral

O sistema de notificações foi totalmente integrado com as ações existentes da aplicação, criando notificações automáticas para eventos importantes do sistema de gestão da clínica.

## Integrações Implementadas

### 1. Agendamentos

#### Criação de Consulta

- **Action**: `src/actions/create-appointment/index.ts`
- **Notificação**: Confirma o agendamento com dados do paciente, profissional, data e horário
- **Tipo**: `appointment_confirmed`

#### Cancelamento de Consulta

- **Action**: `src/actions/cancel-appointment/index.ts`
- **Notificação**: Informa sobre o cancelamento com dados da consulta
- **Tipo**: `appointment_cancelled`

#### Conclusão de Consulta

- **Action**: `src/actions/complete-appointment/index.ts`
- **Notificação**: Confirma a finalização da consulta
- **Tipo**: `appointment_completed`

#### Expiração de Consulta

- **Action**: `src/actions/expire-appointment/index.ts`
- **Notificação**: Informa que a consulta não foi realizada
- **Tipo**: `appointment_expired`

### 2. Pacientes

#### Novo Paciente

- **Action**: `src/actions/upsert-patient/index.ts`
- **Notificação**: Informa sobre o cadastro de novo paciente (apenas para novos, não para edições)
- **Tipo**: `new_patient_registered`

### 3. Profissionais

#### Novo Profissional

- **Action**: `src/actions/upsert-professional/index.ts`
- **Notificação**: Informa sobre a adição de novo profissional à equipe (apenas para novos, não para edições)
- **Tipo**: `new_professional_added`

## Sistema de Lembretes Automáticos

### Lembretes de 24 Horas

- **Action**: `src/actions/send-appointment-reminders/index.ts`
- **Endpoint**: `/api/cron/reminders-24h`
- **Tipo**: `appointment_reminder_24h`
- **Funcionalidade**: Envia lembretes para consultas nas próximas 24 horas

### Lembretes de 2 Horas

- **Action**: `src/actions/send-appointment-reminders/index.ts`
- **Endpoint**: `/api/cron/reminders-2h`
- **Tipo**: `appointment_reminder_2h`
- **Funcionalidade**: Envia lembretes para consultas nas próximas 2 horas

## Configuração de Cron Jobs

### Para Servidor Linux/Unix

```bash
# Lembretes de 24h - todo dia às 9:00
0 9 * * * curl -X POST https://sua-app.com/api/cron/reminders-24h

# Lembretes de 2h - a cada 2 horas
0 */2 * * * curl -X POST https://sua-app.com/api/cron/reminders-2h
```

### Para Vercel Cron (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders-24h",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/reminders-2h",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

### Autenticação dos Cron Jobs

Configure a variável de ambiente `CRON_SECRET` para proteger os endpoints:

```bash
CRON_SECRET=sua-chave-secreta-aqui
```

E chame os endpoints com o header:

```bash
Authorization: Bearer sua-chave-secreta-aqui
```

## Helper Functions

### Arquivo Principal

- **Localização**: `src/helpers/notifications.ts`
- **Função Principal**: `createNotificationForUser()`
- **Funções Específicas**:
  - `createAppointmentConfirmedNotification()`
  - `createAppointmentCancelledNotification()`
  - `createAppointmentCompletedNotification()`
  - `createAppointmentExpiredNotification()`
  - `createNewPatientNotification()`
  - `createNewProfessionalNotification()`
  - `createClinicUpdatedNotification()`

## Páginas de Administração

### Página de Administração

- **Rota**: `/notifications/admin`
- **Funcionalidade**: Permite testar manualmente os lembretes automáticos
- **Recursos**:
  - Envio manual de lembretes 24h
  - Envio manual de lembretes 2h
  - Instruções para configuração de cron jobs

## Prevenção de Duplicatas

### Lembretes

- Sistema verifica se já existe lembrete para a consulta antes de criar novo
- Evita spam de notificações duplicadas
- Baseado em `targetId` + `type` da notificação

### Novos Registros

- Sistema verifica se é um novo registro ou edição
- Notificações são criadas apenas para novos cadastros
- Evita notificações desnecessárias em edições

## Tipos de Notificação

### Agendamentos

- `appointment_confirmed` - Consulta confirmada
- `appointment_cancelled` - Consulta cancelada
- `appointment_completed` - Consulta concluída
- `appointment_expired` - Consulta expirada
- `appointment_reminder_24h` - Lembrete 24h
- `appointment_reminder_2h` - Lembrete 2h

### Cadastros

- `new_patient_registered` - Novo paciente
- `new_professional_added` - Novo profissional
- `clinic_updated` - Clínica atualizada

### Sistema

- `system_alert` - Alerta do sistema

## Painel de Testes

### Localização

- **Componente**: `src/components/ui/notification-test-panel.tsx`
- **Visível**: Apenas em ambiente de desenvolvimento
- **Funcionalidade**: Permite criar notificações de teste para validar o sistema

### Recursos do Painel

- Criação automática de notificações de exemplo
- Visualização das integrações ativas
- Informações sobre o sistema de lembretes
- Status dos sistemas automáticos

## Fluxo de Notificações

1. **Evento Disparado**: Usuário executa ação (criar consulta, cancelar, etc.)
2. **Action Executada**: Sistema processa a ação principal
3. **Dados Coletados**: Helper function coleta dados necessários
4. **Notificação Criada**: Sistema cria notificação automática
5. **Usuário Notificado**: Notificação aparece no dropdown e centro de notificações

## Próximos Passos

### Funcionalidades Futuras

- [ ] Notificações por email
- [ ] Notificações push
- [ ] Configurações de preferências do usuário
- [ ] Webhooks para sistemas externos
- [ ] Notificações para múltiplos usuários por clínica
- [ ] Métricas e analytics de notificações

### Melhorias Técnicas

- [ ] Rate limiting para APIs de cron
- [ ] Retry mechanism para falhas
- [ ] Logging estruturado
- [ ] Monitoramento de performance
- [ ] Testes automatizados

## Troubleshooting

### Notificações não aparecem

- Verificar se o usuário está logado
- Confirmar se as actions estão sendo executadas
- Verificar logs do servidor

### Lembretes não funcionam

- Verificar configuração dos cron jobs
- Confirmar variável `CRON_SECRET`
- Testar endpoints manualmente

### Performance

- Índices no banco de dados
- Paginação de notificações
- Limpeza periódica de notificações antigas
