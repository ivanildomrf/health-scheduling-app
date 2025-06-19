"use client";

import { BarChart3, Calendar, FileText, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/patient/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: "Agendamentos",
    href: "/patient/appointments",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    label: "Histórico Médico",
    href: "/patient/history",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Perfil",
    href: "/patient/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Configurações",
    href: "/patient/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-64 border-r border-gray-200 bg-white">
      <div className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Navegação</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-r-2 border-blue-700 bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Informações úteis */}
      <div className="mt-auto border-t border-gray-200 p-6">
        <div className="rounded-lg bg-blue-50 p-3">
          <h3 className="mb-1 text-sm font-medium text-blue-900">
            Precisa de ajuda?
          </h3>
          <p className="text-xs text-blue-700">
            Entre em contato com nossa equipe de suporte.
          </p>
        </div>
      </div>
    </aside>
  );
}
