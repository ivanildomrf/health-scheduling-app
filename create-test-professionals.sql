-- Script para criar profissionais de teste na clínica
-- Primeiro, vamos buscar o ID da clínica onde o paciente está cadastrado

-- Inserir profissionais de teste na clínica do paciente
INSERT INTO professionals (
  id,
  name,
  clinic_id,
  avatar_image_url,
  available_from_week_day,
  available_to_week_day,
  available_from_time,
  available_to_time,
  speciality,
  appointments_price_in_cents,
  created_at,
  updated_at
) VALUES 
-- Dr. João Silva - Cardiologia
(
  gen_random_uuid(),
  'Dr. João Silva',
  (SELECT clinic_id FROM patients WHERE email = 'paciente@teste.com' LIMIT 1),
  NULL,
  1, -- Segunda-feira
  5, -- Sexta-feira
  '08:00:00',
  '18:00:00',
  'Cardiologia',
  15000, -- R$ 150,00
  NOW(),
  NOW()
),
-- Dra. Maria Santos - Dermatologia
(
  gen_random_uuid(),
  'Dra. Maria Santos',
  (SELECT clinic_id FROM patients WHERE email = 'paciente@teste.com' LIMIT 1),
  NULL,
  1, -- Segunda-feira
  5, -- Sexta-feira
  '09:00:00',
  '17:00:00',
  'Dermatologia',
  12000, -- R$ 120,00
  NOW(),
  NOW()
),
-- Dr. Pedro Costa - Clínico Geral
(
  gen_random_uuid(),
  'Dr. Pedro Costa',
  (SELECT clinic_id FROM patients WHERE email = 'paciente@teste.com' LIMIT 1),
  NULL,
  1, -- Segunda-feira
  6, -- Sábado
  '07:00:00',
  '16:00:00',
  'Clínico Geral',
  10000, -- R$ 100,00
  NOW(),
  NOW()
),
-- Dra. Ana Oliveira - Ginecologia
(
  gen_random_uuid(),
  'Dra. Ana Oliveira',
  (SELECT clinic_id FROM patients WHERE email = 'paciente@teste.com' LIMIT 1),
  NULL,
  2, -- Terça-feira
  6, -- Sábado
  '08:30:00',
  '17:30:00',
  'Ginecologia',
  14000, -- R$ 140,00
  NOW(),
  NOW()
);

-- Verificar se os profissionais foram criados
SELECT 
  p.name,
  p.speciality,
  p.appointments_price_in_cents / 100 as price_in_reais,
  c.name as clinic_name
FROM professionals p
JOIN clinics c ON p.clinic_id = c.id
WHERE p.clinic_id = (SELECT clinic_id FROM patients WHERE email = 'paciente@teste.com' LIMIT 1); 