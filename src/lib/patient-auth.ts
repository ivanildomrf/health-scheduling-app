import { db } from "@/db";
import * as schema from "@/db/schema";
import { patientsTable } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface PatientSession {
  id: string;
  patientId: string;
  token: string;
  expiresAt: Date;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf: string | null;
    birthDate: Date | null;
    sex: "male" | "female";
    clinic: {
      id: string;
      name: string;
    };
  };
}

export class PatientAuth {
  private readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

  async signIn(
    email: string,
    password: string,
  ): Promise<PatientSession | null> {
    try {
      // Buscar paciente pelo email
      const patient = await db.query.patientsTable.findFirst({
        where: eq(patientsTable.email, email),
        with: {
          clinic: true,
        },
      });

      if (!patient || !patient.isActive) {
        return null;
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, patient.password);
      if (!isPasswordValid) {
        return null;
      }

      // Criar nova sessão
      const sessionId = nanoid();
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      await db.insert(schema.patientSessionsTable).values({
        id: sessionId,
        token,
        patientId: patient.id,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Atualizar último login
      await db
        .update(patientsTable)
        .set({ lastLoginAt: new Date() })
        .where(eq(patientsTable.id, patient.id));

      return {
        id: sessionId,
        patientId: patient.id,
        token,
        expiresAt,
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          cpf: patient.cpf,
          birthDate: patient.birthDate,
          sex: patient.sex,
          clinic: {
            id: patient.clinic.id,
            name: patient.clinic.name,
          },
        },
      };
    } catch (error) {
      throw new Error("Credenciais inválidas");
    }
  }

  async getSession(token: string): Promise<PatientSession | null> {
    try {
      const session = await db.query.patientSessionsTable.findFirst({
        where: eq(schema.patientSessionsTable.token, token),
        with: {
          patient: {
            with: {
              clinic: true,
            },
          },
        },
      });

      if (
        !session ||
        session.expiresAt < new Date() ||
        !session.patient.isActive
      ) {
        // Limpar sessão expirada
        if (session) {
          await this.deleteSession(token);
        }
        return null;
      }

      return {
        id: session.id,
        patientId: session.patientId,
        token: session.token,
        expiresAt: session.expiresAt,
        patient: {
          id: session.patient.id,
          name: session.patient.name,
          email: session.patient.email,
          phone: session.patient.phone,
          cpf: session.patient.cpf,
          birthDate: session.patient.birthDate,
          sex: session.patient.sex,
          clinic: {
            id: session.patient.clinic.id,
            name: session.patient.clinic.name,
          },
        },
      };
    } catch (error) {
      return null;
    }
  }

  async deleteSession(token: string): Promise<void> {
    try {
      await db
        .delete(schema.patientSessionsTable)
        .where(eq(schema.patientSessionsTable.token, token));
    } catch (error) {
      // Ignorar erro ao deletar sessão
    }
  }

  async signOut(token: string): Promise<void> {
    await this.deleteSession(token);
  }

  async updateProfile(
    patientId: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      emergencyContact?: string;
      emergencyPhone?: string;
    },
  ): Promise<boolean> {
    try {
      await db
        .update(patientsTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, patientId));

      return true;
    } catch (error) {
      throw new Error("Erro ao atualizar perfil");
    }
  }

  async changePassword(
    token: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // Buscar sessão
      const session = await this.getSession(token);
      if (!session) {
        throw new Error("Sessão inválida");
      }

      // Buscar paciente com senha do banco
      const patient = await db.query.patientsTable.findFirst({
        where: eq(patientsTable.id, session.patient.id),
      });

      if (!patient) {
        throw new Error("Paciente não encontrado");
      }

      // Verificar senha atual
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        patient.password,
      );

      if (!isPasswordValid) {
        throw new Error("Senha atual incorreta");
      }

      // Gerar hash da nova senha
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Atualizar senha
      await db
        .update(schema.patientsTable)
        .set({ password: newPasswordHash })
        .where(eq(schema.patientsTable.id, session.patient.id));
    } catch (error) {
      throw new Error("Erro ao alterar senha");
    }
  }
}

export const patientAuth = new PatientAuth();
