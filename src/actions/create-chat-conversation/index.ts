"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  chatConversationsTable,
  chatUnreadMessagesTable,
  patientsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/safe-action";

import { createChatConversationSchema } from "./schema";

export const createChatConversation = actionClient
  .schema(createChatConversationSchema)
  .action(async ({ parsedInput }) => {
    const { patientId, subject, priority = 1, initialMessage } = parsedInput;

    console.log("=== createChatConversation Action START ===");
    console.log("parsedInput:", parsedInput);

    try {
      // Buscar dados do paciente
      const [patient] = await db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.id, patientId))
        .limit(1);

      if (!patient) {
        throw new Error("Paciente não encontrado");
      }

      // Criar nova conversa
      const [newConversation] = await db
        .insert(chatConversationsTable)
        .values({
          clinicId: patient.clinicId,
          patientId,
          subject,
          priority,
          lastMessageAt: new Date(),
        })
        .returning();

      console.log("Conversation created:", newConversation);

      // Criar registro de mensagens não lidas para a clínica
      await db.insert(chatUnreadMessagesTable).values({
        conversationId: newConversation.id,
        userType: "receptionist",
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      // Criar registro de mensagens não lidas para o paciente
      await db.insert(chatUnreadMessagesTable).values({
        conversationId: newConversation.id,
        userType: "patient",
        patientId,
        unreadCount: 0,
        lastReadAt: new Date(),
      });

      // Se há mensagem inicial, criá-la
      if (initialMessage && initialMessage.trim()) {
        const { chatMessagesTable } = await import("@/db/schema");

        console.log("Creating initial message:", initialMessage.trim());

        const [createdMessage] = await db
          .insert(chatMessagesTable)
          .values({
            conversationId: newConversation.id,
            content: initialMessage.trim(),
            senderType: "patient",
            senderPatientId: patientId,
            senderName: patient.name,
            messageType: "text",
          })
          .returning();

        console.log("Initial message created:", createdMessage);

        // Incrementar contador de não lidas para a clínica (receptionist)
        await db
          .update(chatUnreadMessagesTable)
          .set({
            unreadCount: 1,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(chatUnreadMessagesTable.conversationId, newConversation.id),
              eq(chatUnreadMessagesTable.userType, "receptionist"),
            ),
          );

        console.log("Unread count updated for clinic");
      }

      return {
        success: true,
        data: newConversation,
      };
    } catch (error) {
      console.error("Erro ao criar conversa:", error);
      throw new Error("Falha ao criar conversa de chat");
    }
  });
