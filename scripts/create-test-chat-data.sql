-- Script para criar dados de teste para o sistema de chat
-- Execute este script após ter um paciente e uma clínica criados

-- Exemplo de inserção de conversa de teste
-- SUBSTITUA os IDs pelos valores reais do seu banco de dados

INSERT INTO chat_conversations (
  id,
  clinic_id,
  patient_id,
  subject,
  status,
  priority,
  last_message_at,
  created_at,
  updated_at
) VALUES (
  'test-conv-1',
  'sua-clinic-id', -- SUBSTITUA pela ID real da clínica
  'seu-patient-id', -- SUBSTITUA pela ID real do paciente
  'Dúvida sobre consulta',
  'active',
  2,
  NOW(),
  NOW(),
  NOW()
);

-- Exemplo de mensagem de teste
INSERT INTO chat_messages (
  id,
  conversation_id,
  sender_type,
  sender_id,
  content,
  message_type,
  read_at,
  created_at,
  updated_at
) VALUES (
  'test-msg-1',
  'test-conv-1',
  'patient',
  'seu-patient-id', -- SUBSTITUA pela ID real do paciente
  'Olá, gostaria de esclarecer uma dúvida sobre minha próxima consulta.',
  'text',
  NULL,
  NOW(),
  NOW()
);

-- Contador de mensagens não lidas para o paciente
INSERT INTO chat_unread_messages (
  id,
  conversation_id,
  user_id,
  patient_id,
  unread_count,
  updated_at
) VALUES (
  'test-unread-1',
  'test-conv-1',
  NULL,
  'seu-patient-id', -- SUBSTITUA pela ID real do paciente
  0,
  NOW()
);

-- Contador de mensagens não lidas para a clínica
INSERT INTO chat_unread_messages (
  id,
  conversation_id,
  user_id,
  patient_id,
  unread_count,
  updated_at
) VALUES (
  'test-unread-2',
  'test-conv-1',
  'seu-user-id', -- SUBSTITUA pela ID real do usuário da clínica
  NULL,
  1,
  NOW()
); 