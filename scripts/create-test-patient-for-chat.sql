-- Script para criar um paciente de teste para o sistema de chat
-- Execute este script depois de ter uma clínica criada

-- Primeiro, vamos inserir um paciente de teste
-- SUBSTITUA 'sua-clinic-id' pela ID real da sua clínica
INSERT INTO patients (
  id,
  name,
  email,
  phone,
  sex,
  birth_date,
  clinic_id,
  password,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'test-patient-001', -- ID fixo para facilitar testes
  'Paciente Teste Chat',
  'paciente@teste.com',
  '(11) 99999-9999',
  'MALE',
  '1990-01-01',
  'sua-clinic-id', -- SUBSTITUA pela ID real da clínica
  '$2b$10$8qwe.p8QxVdBQrOsKGZpJ.P4vN9mH5FhWKpD3X2UcNxFpVjE1K4tC', -- senha: "123456"
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Criar uma sessão de teste para o paciente
INSERT INTO patient_sessions (
  id,
  patient_id,
  expires_at,
  created_at
) VALUES (
  'test-session-001',
  'test-patient-001',
  NOW() + INTERVAL '7 days', -- Sessão válida por 7 dias
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  expires_at = EXCLUDED.expires_at;

-- Criar uma conversa de teste
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
  'test-conversation-001',
  'sua-clinic-id', -- SUBSTITUA pela ID real da clínica
  'test-patient-001',
  'Dúvida sobre meu agendamento',
  'active',
  2,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  subject = EXCLUDED.subject,
  updated_at = NOW();

-- Criar uma mensagem de teste
INSERT INTO chat_messages (
  id,
  conversation_id,
  sender_type,
  sender_id,
  sender_name,
  content,
  message_type,
  created_at,
  updated_at
) VALUES (
  'test-message-001',
  'test-conversation-001',
  'patient',
  'test-patient-001',
  'Paciente Teste Chat',
  'Olá, gostaria de esclarecer uma dúvida sobre meu próximo agendamento.',
  'text',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- Mostrar instruções
SELECT 'Dados de teste criados com sucesso!' as message;
SELECT 'Para testar, use o cookie: patient-session-token=test-session-001' as instruction; 