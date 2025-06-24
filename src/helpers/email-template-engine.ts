import "dayjs/locale/pt-br";

import dayjs from "dayjs";

dayjs.locale("pt-br");

// Tipos para variáveis disponíveis nos templates
export interface EmailTemplateVariables {
  // Dados do paciente
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientDocument?: string;

  // Dados do profissional
  professionalName?: string;
  professionalSpecialty?: string;
  professionalEmail?: string;

  // Dados da consulta
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentDuration?: string;
  appointmentPrice?: string;
  appointmentNotes?: string;
  appointmentId?: string;

  // Dados da clínica
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWebsite?: string;
  logoUrl?: string;

  // URLs de ação
  confirmationUrl?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;
  loginUrl?: string;

  // Configurações visuais
  primaryColor?: string;
  secondaryColor?: string;
  footerText?: string;
  emailSignature?: string;

  // Dados do sistema
  systemName?: string;
  currentDate?: string;
  currentYear?: string;
}

// Variáveis padrão disponíveis em todos os templates
export const DEFAULT_VARIABLES: EmailTemplateVariables = {
  systemName: "MendX",
  currentDate: dayjs().format("DD/MM/YYYY"),
  currentYear: dayjs().format("YYYY"),
  primaryColor: "#3B82F6",
  secondaryColor: "#1F2937",
};

// Lista de todas as variáveis disponíveis com descrições
export const AVAILABLE_VARIABLES = {
  // Paciente
  "{{patientName}}": "Nome do paciente",
  "{{patientEmail}}": "Email do paciente",
  "{{patientPhone}}": "Telefone do paciente",
  "{{patientDocument}}": "Documento do paciente",

  // Profissional
  "{{professionalName}}": "Nome do profissional",
  "{{professionalSpecialty}}": "Especialidade do profissional",
  "{{professionalEmail}}": "Email do profissional",

  // Consulta
  "{{appointmentDate}}": "Data da consulta (DD/MM/YYYY)",
  "{{appointmentTime}}": "Horário da consulta (HH:mm)",
  "{{appointmentDuration}}": "Duração da consulta",
  "{{appointmentPrice}}": "Valor da consulta",
  "{{appointmentNotes}}": "Observações da consulta",
  "{{appointmentId}}": "ID da consulta",

  // Clínica
  "{{clinicName}}": "Nome da clínica",
  "{{clinicAddress}}": "Endereço da clínica",
  "{{clinicPhone}}": "Telefone da clínica",
  "{{clinicEmail}}": "Email da clínica",
  "{{clinicWebsite}}": "Site da clínica",
  "{{logoUrl}}": "URL da logo da clínica",

  // URLs de ação
  "{{confirmationUrl}}": "URL para confirmar consulta",
  "{{cancelUrl}}": "URL para cancelar consulta",
  "{{rescheduleUrl}}": "URL para reagendar consulta",
  "{{loginUrl}}": "URL para fazer login",

  // Configurações visuais
  "{{primaryColor}}": "Cor primária da clínica",
  "{{secondaryColor}}": "Cor secundária da clínica",
  "{{footerText}}": "Texto do rodapé",
  "{{emailSignature}}": "Assinatura do email",

  // Sistema
  "{{systemName}}": "Nome do sistema (MendX)",
  "{{currentDate}}": "Data atual",
  "{{currentYear}}": "Ano atual",
};

// Engine para processar templates
export class EmailTemplateEngine {
  private variables: EmailTemplateVariables;

  constructor(variables: EmailTemplateVariables = {}) {
    this.variables = { ...DEFAULT_VARIABLES, ...variables };
  }

  // Processa um template substituindo as variáveis
  public render(template: string): string {
    let processedTemplate = template;

    // Substitui cada variável no template
    Object.entries(this.variables).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{{${key}}}`, "g");
        processedTemplate = processedTemplate.replace(regex, String(value));
      }
    });

    // Remove variáveis não definidas (deixa vazio)
    processedTemplate = processedTemplate.replace(/{{[^}]+}}/g, "");

    return processedTemplate;
  }

  // Processa o assunto do email
  public renderSubject(subject: string): string {
    return this.render(subject);
  }

  // Processa o conteúdo HTML
  public renderHtml(htmlContent: string): string {
    return this.render(htmlContent);
  }

  // Processa o conteúdo texto
  public renderText(textContent: string): string {
    return this.render(textContent);
  }

  // Adiciona ou atualiza variáveis
  public setVariable(key: keyof EmailTemplateVariables, value: string): void {
    this.variables[key] = value;
  }

  // Adiciona múltiplas variáveis
  public setVariables(variables: Partial<EmailTemplateVariables>): void {
    this.variables = { ...this.variables, ...variables };
  }

  // Obtém o valor de uma variável
  public getVariable(key: keyof EmailTemplateVariables): string | undefined {
    return this.variables[key];
  }

  // Lista todas as variáveis definidas
  public getAllVariables(): EmailTemplateVariables {
    return { ...this.variables };
  }

  // Valida se todas as variáveis obrigatórias estão definidas
  public validateRequired(requiredVars: (keyof EmailTemplateVariables)[]): {
    valid: boolean;
    missing: string[];
  } {
    const missing = requiredVars.filter((varName) => !this.variables[varName]);

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  // Extrai variáveis usadas em um template
  public static extractVariables(template: string): string[] {
    const regex = /{{([^}]+)}}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  // Gera preview do template com dados de exemplo
  public static generatePreview(template: string): string {
    const sampleData: EmailTemplateVariables = {
      patientName: "Maria Silva",
      patientEmail: "maria.silva@email.com",
      patientPhone: "(11) 99999-9999",
      professionalName: "Dr. João Santos",
      professionalSpecialty: "Cardiologia",
      appointmentDate: dayjs().add(1, "day").format("DD/MM/YYYY"),
      appointmentTime: "14:30",
      appointmentDuration: "30 minutos",
      appointmentPrice: "R$ 150,00",
      clinicName: "Clínica Saúde Total",
      clinicAddress: "Rua das Flores, 123 - Centro",
      clinicPhone: "(11) 3456-7890",
      clinicEmail: "contato@clinica.com",
      confirmationUrl: "#confirmar",
      cancelUrl: "#cancelar",
      rescheduleUrl: "#reagendar",
      primaryColor: "#3B82F6",
      secondaryColor: "#1F2937",
      footerText: "Este email foi enviado automaticamente pelo sistema MendX.",
    };

    const engine = new EmailTemplateEngine(sampleData);
    return engine.render(template);
  }
}

// Funções utilitárias para formatação
export const formatters = {
  // Formata data para português
  formatDate: (date: Date | string): string => {
    return dayjs(date).format("DD/MM/YYYY");
  },

  // Formata data e hora
  formatDateTime: (date: Date | string): string => {
    return dayjs(date).format("DD/MM/YYYY [às] HH:mm");
  },

  // Formata valor monetário
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  // Formata telefone
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },
};

export default EmailTemplateEngine;
