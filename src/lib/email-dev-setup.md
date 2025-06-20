# Configuração de Email para Desenvolvimento

## Ethereal Email (Recomendado para testes)

Para testar emails em desenvolvimento sem enviar emails reais:

1. Acesse [https://ethereal.email/](https://ethereal.email/)
2. Clique em "Create Ethereal Account"
3. Copie as credenciais geradas
4. Adicione no seu arquivo `.env.local`:

```env
# Email Configuration (Development)
NODE_ENV=development
ETHEREAL_USER=seu.usuario@ethereal.email
ETHEREAL_PASS=sua.senha.ethereal
```

## Gmail (Para produção)

Para usar Gmail em produção:

1. Ative a autenticação em 2 fatores na sua conta Google
2. Gere uma senha de app específica:

   - Acesse: Conta Google > Segurança > Senhas de app
   - Selecione "Email" como app
   - Copie a senha gerada (16 caracteres)

3. Configure no `.env.local`:

```env
# Email Configuration (Production)
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu.email@gmail.com
SMTP_PASS=sua.senha.de.app.de.16.caracteres
EMAIL_FROM_NAME=Nome da Clínica
EMAIL_FROM_ADDRESS=noreply@suaclinica.com
```

## Testando

1. Cadastre um paciente no sistema administrativo
2. Clique em "Enviar Credenciais" ou "Enviar Convite"
3. Em desenvolvimento: Verifique o console para o link de preview
4. Em produção: O email será enviado normalmente

## Variáveis de Ambiente Necessárias

```env
# URLs da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email - Desenvolvimento
NODE_ENV=development
ETHEREAL_USER=
ETHEREAL_PASS=

# Email - Produção
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM_NAME=
EMAIL_FROM_ADDRESS=
```
