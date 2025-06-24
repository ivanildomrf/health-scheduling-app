import { SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader } from "./components/app-header";
import { AppSidebar } from "./components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <AppHeader />
          <div className="p-6">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
