import nodemailer from "nodemailer";

// Configuração do transporter
const createTransporter = async () => {
  // Para desenvolvimento, usar Ethereal Email (email de teste)
  if (process.env.NODE_ENV === "development") {
    // Gerar conta de teste automaticamente
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Para produção, usar serviço real (Gmail, SendGrid, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Interface para envio de email
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Interface para resultado do envio
interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

// Função principal para enviar emails
export const sendEmail = async (
  options: SendEmailOptions,
): Promise<SendEmailResult> => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@drcuidar.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Fallback para texto sem HTML
    };

    const info = await transporter.sendMail(mailOptions);

    // Para desenvolvimento, gerar URL de preview
    let previewUrl: string | undefined;
    if (process.env.NODE_ENV === "development") {
      const testUrl = nodemailer.getTestMessageUrl(info);
      previewUrl = testUrl || undefined;
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
};

// Templates de email
export const emailTemplates = {
  // Template para credenciais temporárias
  patientCredentials: ({
    patientName,
    email,
    temporaryPassword,
    loginUrl,
    clinicName,
  }: {
    patientName: string;
    email: string;
    temporaryPassword: string;
    loginUrl: string;
    clinicName: string;
  }) => ({
    subject: `Acesso ao Portal do Paciente - ${clinicName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Acesso ao Portal do Paciente</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 ${clinicName}</h1>
              <p>Portal do Paciente</p>
            </div>
            <div class="content">
              <h2>Olá, ${patientName}!</h2>
              <p>Suas credenciais de acesso ao Portal do Paciente foram geradas com sucesso.</p>
              
              <div class="credentials">
                <h3>📧 Suas Credenciais:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Senha Temporária:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${temporaryPassword}</code></p>
              </div>

              <p>⚠️ <strong>Importante:</strong> Esta é uma senha temporária. Recomendamos que você altere sua senha após o primeiro acesso.</p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Acessar Portal do Paciente</a>
              </div>

              <h3>🔐 Dicas de Segurança:</h3>
              <ul>
                <li>Nunca compartilhe suas credenciais com terceiros</li>
                <li>Use uma senha forte com letras, números e símbolos</li>
                <li>Faça logout após usar o sistema</li>
              </ul>
            </div>
            <div class="footer">
              <p>Este email foi enviado automaticamente. Em caso de dúvidas, entre em contato com a clínica.</p>
              <p>© ${new Date().getFullYear()} ${clinicName}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      ${clinicName} - Portal do Paciente
      
      Olá, ${patientName}!
      
      Suas credenciais de acesso foram geradas:
      Email: ${email}
      Senha Temporária: ${temporaryPassword}
      
      Acesse: ${loginUrl}
      
      Esta é uma senha temporária. Altere após o primeiro acesso.
      
      © ${new Date().getFullYear()} ${clinicName}
    `,
  }),

  // Template para convite de ativação
  patientInvite: ({
    patientName,
    activationUrl,
    expiresAt,
    clinicName,
  }: {
    patientName: string;
    activationUrl: string;
    expiresAt: Date;
    clinicName: string;
  }) => ({
    subject: `Convite para ativar sua conta - ${clinicName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ative sua conta no Portal do Paciente</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
            .activation-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
            .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .expiry { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 ${clinicName}</h1>
              <p>Convite para Portal do Paciente</p>
            </div>
            <div class="content">
              <h2>Olá, ${patientName}!</h2>
              <p>Você foi convidado(a) a ativar sua conta no Portal do Paciente da ${clinicName}.</p>
              
              <div class="activation-box">
                <h3>🎯 Ative sua conta agora:</h3>
                <p>Clique no botão abaixo para definir sua senha e acessar o portal:</p>
                <div style="text-align: center;">
                  <a href="${activationUrl}" class="button">Ativar Minha Conta</a>
                </div>
              </div>

              <div class="expiry">
                <h4>⏰ Prazo de Ativação:</h4>
                <p>Este convite expira em: <strong>${expiresAt.toLocaleDateString("pt-BR")} às ${expiresAt.toLocaleTimeString("pt-BR")}</strong></p>
              </div>

              <h3>✨ O que você pode fazer no Portal:</h3>
              <ul>
                <li>Agendar consultas online</li>
                <li>Visualizar histórico médico</li>
                <li>Atualizar dados pessoais</li>
                <li>Receber lembretes de consultas</li>
              </ul>

              <p><small>Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
              <code style="background: #e5e7eb; padding: 4px; border-radius: 4px; word-break: break-all;">${activationUrl}</code></small></p>
            </div>
            <div class="footer">
              <p>Este email foi enviado automaticamente. Em caso de dúvidas, entre em contato com a clínica.</p>
              <p>© ${new Date().getFullYear()} ${clinicName}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      ${clinicName} - Convite para Portal do Paciente
      
      Olá, ${patientName}!
      
      Você foi convidado a ativar sua conta no Portal do Paciente.
      
      Ative sua conta: ${activationUrl}
      
      Este convite expira em: ${expiresAt.toLocaleDateString("pt-BR")} às ${expiresAt.toLocaleTimeString("pt-BR")}
      
      © ${new Date().getFullYear()} ${clinicName}
    `,
  }),
};
