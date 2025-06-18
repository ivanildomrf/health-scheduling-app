import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface AppointmentReminder24hProps {
  patientName: string;
  professionalName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName: string;
  clinicAddress?: string;
  clinicPhone?: string;
  confirmationUrl?: string;
  cancelUrl?: string;
}

export const AppointmentReminder24h = ({
  patientName = "João Silva",
  professionalName = "Dr. Maria Santos",
  appointmentDate = "25 de Janeiro de 2025",
  appointmentTime = "14:30",
  clinicName = "Clínica Saúde Total",
  clinicAddress = "Rua das Flores, 123 - Centro",
  clinicPhone = "(11) 3456-7890",
  confirmationUrl = "#",
  cancelUrl = "#",
}: AppointmentReminder24hProps) => {
  const previewText = `Lembrete: Consulta amanhã às ${appointmentTime} com ${professionalName}`;

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=MendX"
              width="200"
              height="60"
              alt="MendX"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>🗓️ Lembrete de Consulta</Heading>

            <Text style={text}>
              Olá, <strong>{patientName}</strong>!
            </Text>

            <Text style={text}>
              Este é um lembrete de que você tem uma consulta agendada para{" "}
              <strong>amanhã</strong>.
            </Text>

            {/* Appointment Details Card */}
            <Section style={appointmentCard}>
              <Row>
                <Column style={iconColumn}>
                  <Text style={icon}>👨‍⚕️</Text>
                </Column>
                <Column>
                  <Text style={cardTitle}>Profissional</Text>
                  <Text style={cardValue}>{professionalName}</Text>
                </Column>
              </Row>

              <Hr style={hr} />

              <Row>
                <Column style={iconColumn}>
                  <Text style={icon}>📅</Text>
                </Column>
                <Column>
                  <Text style={cardTitle}>Data e Horário</Text>
                  <Text style={cardValue}>
                    {appointmentDate} às {appointmentTime}
                  </Text>
                </Column>
              </Row>

              <Hr style={hr} />

              <Row>
                <Column style={iconColumn}>
                  <Text style={icon}>🏥</Text>
                </Column>
                <Column>
                  <Text style={cardTitle}>Local</Text>
                  <Text style={cardValue}>{clinicName}</Text>
                  {clinicAddress && (
                    <Text style={cardSubValue}>{clinicAddress}</Text>
                  )}
                  {clinicPhone && (
                    <Text style={cardSubValue}>📞 {clinicPhone}</Text>
                  )}
                </Column>
              </Row>
            </Section>

            {/* Important Notes */}
            <Section style={notesSection}>
              <Text style={notesTitle}>📋 Informações Importantes:</Text>
              <Text style={noteItem}>
                • Chegue com 15 minutos de antecedência
              </Text>
              <Text style={noteItem}>• Traga um documento com foto</Text>
              <Text style={noteItem}>• Traga exames anteriores, se houver</Text>
              <Text style={noteItem}>
                • Use máscara durante toda a consulta
              </Text>
            </Section>

            {/* Action Buttons */}
            <Section style={buttonContainer}>
              <Button style={confirmButton} href={confirmationUrl}>
                ✅ Confirmar Presença
              </Button>

              <Button style={cancelButton} href={cancelUrl}>
                ❌ Cancelar Consulta
              </Button>
            </Section>

            <Text style={footerText}>
              Se você não conseguir comparecer, por favor cancele sua consulta
              com pelo menos 2 horas de antecedência.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              Este email foi enviado automaticamente pelo sistema MendX.
              <br />
              Se você tem dúvidas, entre em contato conosco: {clinicPhone}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "'Inter', 'Arial', sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "20px 30px",
  backgroundColor: "#3B82F6",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
};

const logo = {
  margin: "0 auto",
  display: "block",
};

const content = {
  padding: "30px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 30px 0",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const appointmentCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const iconColumn = {
  width: "40px",
  verticalAlign: "top",
};

const icon = {
  fontSize: "24px",
  margin: "0",
};

const cardTitle = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const cardValue = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const cardSubValue = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "4px 0 0 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const notesSection = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const notesTitle = {
  color: "#92400e",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const noteItem = {
  color: "#92400e",
  fontSize: "14px",
  margin: "0 0 8px 0",
  lineHeight: "20px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const confirmButton = {
  backgroundColor: "#10b981",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0 8px 16px 8px",
  minWidth: "200px",
};

const cancelButton = {
  backgroundColor: "#ef4444",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "0 8px 16px 8px",
  minWidth: "200px",
};

const footer = {
  padding: "0 30px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "16px 0 0 0",
  textAlign: "center" as const,
};

export default AppointmentReminder24h;
