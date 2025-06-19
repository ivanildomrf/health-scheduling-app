-- Script para criar um paciente de teste para o Portal Self-Service
-- Execute este script no seu banco de dados PostgreSQL

-- IMPORTANTE: Substitua 'YOUR_CLINIC_ID_HERE' pelo ID real da sua clínica
-- Você pode encontrar o ID da clínica executando: SELECT id, name FROM clinics;

INSERT INTO patients (
  id, 
  name, 
  clinic_id, 
  email, 
  phone, 
  password, 
  sex,
  cpf,
  birth_date,
  address,
  city,
  state,
  zip_code,
  emergency_contact,
  emergency_phone,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'João da Silva',
  'YOUR_CLINIC_ID_HERE', -- ⚠️ SUBSTITUA PELO ID DA SUA CLÍNICA
  'paciente@teste.com',
  '11999999999',
  '$2b$12$liQzCqf.o0Ji3g0KucJ./OMjle/HnWrl.gUVa084ulNh2MBYNUtt6', -- Senha: 123456
  'male',
  '12345678901',
  '1990-01-15 00:00:00',
  'Rua Exemplo, 123, Apt 45',
  'São Paulo',
  'SP',
  '01234-567',
  'Maria da Silva',
  '11888888888',
  true,
  true,
  NOW(),
  NOW()
);

-- Para verificar se foi criado com sucesso:
-- SELECT id, name, email FROM patients WHERE email = 'paciente@teste.com'; 