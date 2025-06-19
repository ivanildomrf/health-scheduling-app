"use client";

import { patientLogout } from "@/actions/patient-logout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_CONFIG } from "@/lib/constants";
import { PatientSession } from "@/lib/patient-auth";
import { LogOut, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface PatientHeaderProps {
  session: PatientSession;
}

export function PatientHeader({ session }: PatientHeaderProps) {
  const logoutAction = useAction(patientLogout, {
    onSuccess: () => {
      toast.success("Logout realizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao fazer logout");
    },
  });

  const handleLogout = () => {
    logoutAction.execute({});
  };

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/patient/dashboard">
            <Image
              src={APP_CONFIG.logo.local}
              alt={APP_CONFIG.name}
              width={140}
              height={32}
              className="h-12 w-auto"
            />
          </Link>
          <div className="text-sm font-bold text-gray-700">
            Portal do Paciente - {session.patient.clinic.name}
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-gray-700">
            Olá, {session.patient.name.split(" ")[0]}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {session.patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/patient/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutAction.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
