-- Script para popular as tabelas de planos e funcionalidades

-- Inserir os planos disponíveis
INSERT INTO plans (id, name, slug, description, price_in_cents, sort_order) VALUES
  (gen_random_uuid(), 'Essential', 'essential', 'Para profissionais autônomos ou pequenas clínicas', 5900, 1),
  (gen_random_uuid(), 'Professional', 'professional', 'Para clínicas médias com múltiplos profissionais', 11900, 2),
  (gen_random_uuid(), 'Enterprise', 'enterprise', 'Para grandes clínicas e hospitais', 29900, 3);

-- Inserir as funcionalidades do sistema
INSERT INTO plan_features (id, name, display_name, description, feature_type, category, sort_order) VALUES
  -- Limites de cadastro
  (gen_random_uuid(), 'max_professionals', 'Cadastro de profissionais', 'Número máximo de profissionais que podem ser cadastrados', 'limit', 'limits', 1),
  
  -- Funcionalidades básicas
  (gen_random_uuid(), 'unlimited_appointments', 'Agendamentos ilimitados', 'Permite agendamentos sem limite de quantidade', 'boolean', 'features', 2),
  (gen_random_uuid(), 'patient_management', 'Cadastro de pacientes', 'Permite cadastro e gerenciamento de pacientes', 'boolean', 'features', 3),
  
  -- Métricas e relatórios
  (gen_random_uuid(), 'basic_metrics', 'Métricas básicas', 'Dashboard com métricas básicas de agendamentos', 'boolean', 'analytics', 4),
  (gen_random_uuid(), 'advanced_metrics', 'Métricas avançadas', 'Relatórios detalhados e métricas avançadas', 'boolean', 'analytics', 5),
  (gen_random_uuid(), 'complete_metrics', 'Métricas completas', 'Suite completa de análises e relatórios personalizados', 'boolean', 'analytics', 6),
  
  -- Confirmações
  (gen_random_uuid(), 'manual_confirmation', 'Confirmação manual', 'Confirmação manual de agendamentos', 'boolean', 'features', 7),
  (gen_random_uuid(), 'automatic_confirmation', 'Confirmação automática', 'Confirmação automática de agendamentos', 'boolean', 'features', 8),
  
  -- Suporte
  (gen_random_uuid(), 'email_support', 'Suporte via e-mail', 'Suporte via e-mail durante horário comercial', 'boolean', 'support', 9),
  (gen_random_uuid(), 'chat_support', 'Suporte via chat', 'Suporte via chat em tempo real', 'boolean', 'support', 10),
  (gen_random_uuid(), 'priority_support', 'Suporte prioritário 24/7', 'Suporte prioritário disponível 24 horas por dia', 'boolean', 'support', 11),
  
  -- Integrações e recursos avançados
  (gen_random_uuid(), 'detailed_reports', 'Relatórios detalhados', 'Relatórios detalhados de pacientes e agendamentos', 'boolean', 'features', 12),
  (gen_random_uuid(), 'calendar_integration', 'Integração com calendário', 'Sincronização com Google Calendar e outros', 'boolean', 'integrations', 13),
  (gen_random_uuid(), 'custom_reports', 'Relatórios personalizados', 'Criação de relatórios personalizados', 'boolean', 'features', 14),
  (gen_random_uuid(), 'api_access', 'API completa', 'Acesso completo à API para integrações customizadas', 'boolean', 'integrations', 15),
  (gen_random_uuid(), 'automatic_backup', 'Backup automático', 'Backup automático dos dados da clínica', 'boolean', 'features', 16),
  (gen_random_uuid(), 'multiple_locations', 'Múltiplas localizações', 'Suporte para clínicas com múltiplas filiais', 'boolean', 'features', 17);

-- Configurar funcionalidades do plano Essential
INSERT INTO plan_feature_limits (id, plan_id, feature_id, enabled, limit_value)
SELECT 
  gen_random_uuid(),
  p.id,
  f.id,
  CASE 
    WHEN f.name = 'max_professionals' THEN true
    WHEN f.name = 'unlimited_appointments' THEN true
    WHEN f.name = 'patient_management' THEN true
    WHEN f.name = 'basic_metrics' THEN true
    WHEN f.name = 'manual_confirmation' THEN true
    WHEN f.name = 'email_support' THEN true
    ELSE false
  END as enabled,
  CASE 
    WHEN f.name = 'max_professionals' THEN 3
    ELSE NULL
  END as limit_value
FROM plans p
CROSS JOIN plan_features f
WHERE p.slug = 'essential';

-- Configurar funcionalidades do plano Professional
INSERT INTO plan_feature_limits (id, plan_id, feature_id, enabled, limit_value)
SELECT 
  gen_random_uuid(),
  p.id,
  f.id,
  CASE 
    WHEN f.name IN (
      'max_professionals', 'unlimited_appointments', 'patient_management', 
      'basic_metrics', 'advanced_metrics', 'automatic_confirmation', 
      'email_support', 'chat_support', 'detailed_reports', 'calendar_integration'
    ) THEN true
    ELSE false
  END as enabled,
  CASE 
    WHEN f.name = 'max_professionals' THEN 10
    ELSE NULL
  END as limit_value
FROM plans p
CROSS JOIN plan_features f
WHERE p.slug = 'professional';

-- Configurar funcionalidades do plano Enterprise
INSERT INTO plan_feature_limits (id, plan_id, feature_id, enabled, limit_value)
SELECT 
  gen_random_uuid(),
  p.id,
  f.id,
  true as enabled, -- Enterprise tem todas as funcionalidades
  CASE 
    WHEN f.name = 'max_professionals' THEN NULL -- ilimitado
    ELSE NULL
  END as limit_value
FROM plans p
CROSS JOIN plan_features f
WHERE p.slug = 'enterprise'; 