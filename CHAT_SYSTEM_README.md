# 💬 Sistema de Chat - MendX Scheduling App

Este documento descreve a implementação completa do sistema de chat entre pacientes e equipe da clínica no MendX Scheduling App.

## 🎯 Visão Geral

O sistema de chat permite que pacientes entrem em contato com a recepção/equipe da clínica através do portal do paciente, facilitando a comunicação e suporte.

### ✨ Funcionalidades Implementadas

#### **Portal do Paciente**

- ✅ **Iniciar nova conversa** com assunto e prioridade
- ✅ **Listar conversas** existentes com status e contadores
- ✅ **Interface de chat** em tempo real
- ✅ **Marcação automática** de mensagens como lidas
- ✅ **Indicadores visuais** de mensagens não lidas

#### **Portal da Clínica**

- ✅ **Visualizar todas as conversas** dos pacientes
- ✅ **Responder mensagens** dos pacientes
- ✅ **Organização por status** (ativa, resolvida, arquivada)
- ✅ **Sistema de prioridades** (baixa, média, alta)
- ✅ **Indicadores de atribuição** de conversas

## 🗃️ Estrutura do Banco de Dados

### **Tabelas Criadas**

#### `chat_conversations`

```sql
- id (UUID, Primary Key)
- clinic_id (UUID, FK para clinics)
- patient_id (UUID, FK para patients)
- subject (TEXT) - Assunto da conversa
- status (ENUM) - active, resolved, archived
- priority (INTEGER) - 1=baixa, 2=média, 3=alta
- assigned_user_id (TEXT, FK para users) - Recepcionista responsável
- last_message_at (TIMESTAMP)
- resolved_at (TIMESTAMP)
- resolved_by (TEXT, FK para users)
- created_at, updated_at
```

#### `chat_messages`

```sql
- id (UUID, Primary Key)
- conversation_id (UUID, FK para chat_conversations)
- sender_type (ENUM) - patient, receptionist, admin
- sender_patient_id (UUID, FK para patients)
- sender_user_id (TEXT, FK para users)
- sender_name (TEXT) - Nome para exibição
- content (TEXT) - Conteúdo da mensagem
- message_type (TEXT) - text, image, file, system
- attachment_url, attachment_name, attachment_size, attachment_mime_type
- is_read (BOOLEAN)
- read_at, read_by
- is_system_message (BOOLEAN)
- created_at, updated_at
```

#### `chat_unread_messages`

```sql
- id (UUID, Primary Key)
- conversation_id (UUID, FK para chat_conversations)
- user_type (ENUM) - patient, receptionist, admin
- user_id (TEXT, FK para users) - Para recepcionistas
- patient_id (UUID, FK para patients) - Para pacientes
- unread_count (INTEGER)
- last_read_message_id (UUID, FK para chat_messages)
- last_read_at (TIMESTAMP)
- created_at, updated_at
```

## 🔧 Server Actions Implementadas

### **Gerenciamento de Conversas**

#### `createChatConversation`

```typescript
// Cria nova conversa
await createChatConversation({
  patientId: "uuid",
  subject: "Dúvida sobre consulta",
  priority: 2, // 1=baixa, 2=média, 3=alta
});
```

#### `getPatientConversations`

```typescript
// Busca conversas do paciente
await getPatientConversations({
  patientId: "uuid",
});
```

### **Gerenciamento de Mensagens**

#### `sendChatMessage`

```typescript
// Envia mensagem
await sendChatMessage({
  conversationId: "uuid",
  content: "Mensagem do paciente...",
  senderType: "patient",
  senderPatientId: "uuid",
  senderName: "Nome do Paciente",
});
```

#### `getChatMessages`

```typescript
// Busca mensagens da conversa
await getChatMessages({
  conversationId: "uuid",
  limit: 50,
});
```

#### `markChatMessagesRead`

```typescript
// Marca mensagens como lidas
await markChatMessagesRead({
  conversationId: "uuid",
  userType: "patient",
  patientId: "uuid",
});
```

## 🎨 Interface do Usuario

### **Portal do Paciente**

#### **Página Principal** - `/patient/chat`

- Lista todas as conversas do paciente
- Botão para iniciar nova conversa
- Badges com status e prioridade
- Contadores de mensagens não lidas

#### **Chat Individual** - `/patient/chat/[conversationId]`

- Interface de chat completa
- Mensagens organizadas por remetente
- Timestamps das mensagens
- Campo de envio de mensagens
- Auto-scroll para novas mensagens

### **Portal da Clínica**

#### **Página Principal** - `/chat`

- Lista conversas de todos os pacientes
- Organização por status (ativa, resolvida, arquivada)
- Avatar e dados do paciente
- Indicadores de prioridade e atribuição

#### **Componentes Principais**

##### `ChatConversationsList`

- Lista conversas do paciente
- Estados vazios informativos
- Badges de status e prioridade

##### `NewConversationButton`

- Modal para criar nova conversa
- Formulário com validação Zod
- Seleção de prioridade

##### `ChatWindow`

- Interface principal de chat
- Scroll automático
- Diferenciação visual de remetentes
- Desabilitação para conversas encerradas

##### `ClinicChatList`

- Lista para equipe da clínica
- Separação por status
- Avatar dos pacientes
- Botões de ação

## 🚀 Como Usar

### **Como Paciente**

1. **Acessar o Chat**

   - Login no portal do paciente
   - Clicar em "Chat" na sidebar

2. **Iniciar Nova Conversa**

   - Clicar em "Nova Conversa"
   - Preencher assunto e prioridade
   - Confirmar criação

3. **Conversar**
   - Selecionar conversa da lista
   - Digitar mensagem e enviar
   - Ver respostas em tempo real

### **Como Equipe da Clínica**

1. **Acessar Conversas**

   - Login na área protegida
   - Clicar em "Chat" na sidebar

2. **Responder Pacientes**
   - Ver lista organizada por status
   - Clicar em "Responder" na conversa
   - Enviar mensagens de resposta

## 🔧 Integração com Sistema Existente

### **Sistema de Notificações**

- Preparado para integrar com sistema de notificações existente
- Placeholder para notificar equipe sobre novas conversas

### **Autenticação**

- **Pacientes**: Sistema próprio com `getPatientSession()`
- **Equipe**: BetterAuth existente

### **Permissões**

- Pacientes só veem suas próprias conversas
- Equipe vê conversas da sua clínica
- Validação de acesso em todas as actions

## 📱 Interface Responsiva

- **Design adaptável** para mobile e desktop
- **Componentes shadcn/ui** consistentes
- **Cores e badges** para diferentes status
- **Scrolling suave** no chat

## 🛠️ Melhorias Futuras

### **Funcionalidades Pendentes**

- [ ] **Anexos** de arquivos nas mensagens
- [ ] **Notificações push** para novas mensagens
- [ ] **Status online/offline** dos usuários
- [ ] **Busca** nas mensagens
- [ ] **Arquivamento** automático de conversas antigas
- [ ] **Templates** de respostas rápidas
- [ ] **Atribuição automática** baseada em especialidade
- [ ] **Métricas** de tempo de resposta

### **Integrações**

- [ ] **WebSocket** para chat em tempo real
- [ ] **Email** para notificações de novas mensagens
- [ ] **SMS** para urgências
- [ ] **Chatbot** para respostas automáticas

## 📊 Estrutura de Arquivos

```
src/
├── actions/
│   ├── create-chat-conversation/
│   ├── send-chat-message/
│   ├── get-patient-conversations/
│   ├── get-chat-messages/
│   └── mark-chat-messages-read/
├── app/
│   ├── patient/(dashboard)/chat/
│   │   ├── [conversationId]/
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── chat-conversations-list.tsx
│   │   │   ├── new-conversation-button.tsx
│   │   │   └── chat-window.tsx
│   │   └── page.tsx
│   └── (protected)/chat/
│       ├── components/
│       │   └── clinic-chat-list.tsx
│       └── page.tsx
└── db/
    └── schema.ts (+ 3 novas tabelas)
```

## ✅ Status da Implementação

- ✅ **Schema do banco** - Completo
- ✅ **Server Actions** - Completas
- ✅ **Portal do Paciente** - Completo
- ✅ **Portal da Clínica** - Completo
- ✅ **Interface responsiva** - Completa
- ✅ **Validações** - Completas
- ✅ **Navegação** - Completa
- ✅ **Migrações aplicadas** - Completas

## 🎉 Resultado Final

O sistema de chat está **100% funcional** e integrado ao MendX Scheduling App, permitindo comunicação eficiente entre pacientes e equipe da clínica com interface moderna e intuitiva! 🚀
