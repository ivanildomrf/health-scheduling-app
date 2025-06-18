"use client";

import { NotificationCenter } from "@/components/ui/notification-center";
import { PageContainer } from "@/components/ui/page-container";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const session = authClient.useSession();

  if (session.isPending) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (!session.data?.user?.id) {
    return (
      <PageContainer>
        <div className="text-center">
          <p className="text-gray-600">
            Você precisa estar logado para ver as notificações.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <NotificationCenter userId={session.data.user.id} />
    </PageContainer>
  );
}
