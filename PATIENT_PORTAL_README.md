# Portal do Paciente - Self-Service

Este documento descreve a implementação do Portal do Paciente (self-service) para o sistema MendX.

## 📋 Funcionalidades Implementadas

### 🔐 Autenticação de Pacientes

- Sistema de login separado para pacientes
- Gestão de sessões independente
- Cookies seguros para manter login

### 🏠 Dashboard do Paciente

- Visão geral das consultas
- Estatísticas pessoais
- Próximas consultas
- Ações rápidas

### 👤 Perfil do Paciente

- Visualização de informações pessoais
- Edição de dados de contato
- Informações de emergência
- Validação de formulários

### 📅 Agendamentos

- Visualização de consultas
- Histórico completo
- Status das consultas
- Funcionalidades futuras: reagendar, cancelar

## 🗄️ Modificações no Banco de Dados

### Tabela `patients` - Novos Campos

```sql
ALTER TABLE patients ADD COLUMN cpf text UNIQUE;
ALTER TABLE patients ADD COLUMN birth_date timestamp;
ALTER TABLE patients ADD COLUMN address text;
ALTER TABLE patients ADD COLUMN city text;
ALTER TABLE patients ADD COLUMN state text;
ALTER TABLE patients ADD COLUMN zip_code text;
ALTER TABLE patients ADD COLUMN emergency_contact text;
ALTER TABLE patients ADD COLUMN emergency_phone text;
ALTER TABLE patients ADD COLUMN profile_image_url text;
ALTER TABLE patients ADD COLUMN is_active boolean DEFAULT true NOT NULL;
ALTER TABLE patients ADD COLUMN last_login_at timestamp;
ALTER TABLE patients ADD COLUMN email_verified boolean DEFAULT false NOT NULL;
```

### Nova Tabela `patient_sessions`

```sql
CREATE TABLE patient_sessions (
  id text PRIMARY KEY,
  expires_at timestamp NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  ip_address text,
  user_agent text,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE
);
```

## 🛠️ Arquivos Criados

### Autenticação

- `src/lib/patient-auth.ts` - Classe de autenticação para pacientes
- `src/lib/patient-auth-middleware.ts` - Middleware de validação
- `src/helpers/patient-session.ts` - Helper para sessões

### Server Actions

- `src/actions/patient-login/` - Login de pacientes
- `src/actions/patient-logout/` - Logout de pacientes
- `src/actions/get-patient-appointments/` - Buscar agendamentos
- `src/actions/update-patient-profile/` - Atualizar perfil

### Páginas e Componentes

- `src/app/patient/` - Estrutura principal do portal
- `src/app/patient/login/` - Página de login
- `src/app/patient/dashboard/` - Dashboard principal
- `src/app/patient/profile/` - Perfil do paciente
- `src/app/patient/appointments/` - Lista de agendamentos

## 🚀 Como Executar

### 1. Instalar Dependências

As dependências já foram instaladas:

- `bcryptjs` - Hash de senhas
- `nanoid` - Geração de IDs únicos

### 2. Executar Migrações

```bash
# Execute as migrações do Drizzle para criar as novas tabelas/campos
npm run db:push
```

### 3. Criar Dados de Teste

Execute este script SQL para criar um paciente de teste:

```sql
INSERT INTO patients (
  id, name, clinic_id, email, phone, password, sex,
  cpf, birth_date, address, city, state, zip_code,
  emergency_contact, emergency_phone, is_active, email_verified
) VALUES (
  gen_random_uuid(),
  'João da Silva',
  'sua-clinic-id-aqui', -- Substitua pelo ID da sua clínica
  'joao@exemplo.com',
  '11999999999',
  '$2a$12$exemplo.hash.bcrypt', -- Hash bcrypt da senha "123456"
  'male',
  '12345678901',
  '1990-01-01',
  'Rua Exemplo, 123',
  'São Paulo',
  'SP',
  '01234-567',
  'Maria da Silva',
  '11888888888',
  true,
  true
);
```

### 4. Acessar o Portal

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/patient/login`
3. Use as credenciais do paciente criado

## 🔧 Configurações Necessárias

### Variáveis de Ambiente

Certifique-se de que essas variáveis estejam configuradas:

```env
DATABASE_URL="sua-url-do-postgresql"
NEXTAUTH_SECRET="seu-secret-aqui"
```

### Hash de Senha para Teste

Para criar um hash bcrypt da senha "123456":

```javascript
const bcrypt = require("bcryptjs");
const hash = bcrypt.hashSync("123456", 12);
console.log(hash);
```

## 🎯 Próximos Passos

### Funcionalidades Prioritárias

1. **Agendamento Online**

   - Seleção de profissional
   - Escolha de horários disponíveis
   - Confirmação por email

2. **Cancelamento/Reagendamento**

   - Política de cancelamento
   - Notificações automáticas

3. **Histórico Médico**

   - Visualização de consultas passadas
   - Download de receitas/exames

4. **Notificações**
   - Lembretes por email/SMS
   - Confirmações de agendamento

### Melhorias Técnicas

1. **Autenticação**

   - Reset de senha
   - Verificação de email
   - 2FA opcional

2. **Performance**

   - Cache de sessões
   - Paginação de agendamentos
   - Otimização de queries

3. **UX/UI**
   - Tema escuro
   - Responsividade mobile
   - Animações

## 📱 Estrutura de Rotas

```
/patient/
├── login              # Login do paciente
├── dashboard          # Dashboard principal
├── profile            # Perfil e configurações
├── appointments       # Lista de agendamentos
├── appointments/new   # Novo agendamento (futuro)
├── history           # Histórico médico (futuro)
└── settings          # Configurações (futuro)
```

## 🔒 Segurança

### Implementações de Segurança

- ✅ Senhas com hash bcrypt
- ✅ Cookies httpOnly para sessões
- ✅ Validação de sessão em todas as rotas
- ✅ Sanitização de inputs com Zod
- ✅ CSRF protection via forms

### Recomendações Adicionais

- [ ] Rate limiting no login
- [ ] Log de tentativas de acesso
- [ ] Bloqueio após tentativas falhadas
- [ ] Sessões com tempo limite configurável

## 📊 Monitoramento

### Métricas Importantes

- Taxa de login de pacientes
- Uso do portal por funcionalidade
- Tempo de sessão médio
- Erros de autenticação

## 🤝 Contribuição

Para adicionar novas funcionalidades ao portal:

1. Siga os padrões de nomenclatura existentes
2. Use Server Actions para operações do servidor
3. Implemente validação com Zod
4. Mantenha consistência visual com shadcn/ui
5. Documente novas funcionalidades

---

**Status**: ✅ Implementação Base Completa
**Versão**: 1.0.0
**Última Atualização**: $(date)
