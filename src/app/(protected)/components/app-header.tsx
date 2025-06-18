"use client";

import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Settings } from "lucide-react";

export function AppHeader() {
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          {userId && (
            <NotificationDropdown
              userId={userId}
              size="md"
              className="hover:bg-gray-100"
            />
          )}

          {/* Settings */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

// Helper function to get page title based on pathname
function getPageTitle() {
  if (typeof window === "undefined") return "";

  const pathname = window.location.pathname;

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/appointments": "Agendamentos",
    "/professionals": "Profissionais",
    "/patients": "Pacientes",
    "/clinics": "Clínicas",
    "/notifications": "Notificações",
  };

  return titleMap[pathname] || "MendX";
}
