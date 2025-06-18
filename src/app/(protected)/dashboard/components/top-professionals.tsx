"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProfessionalsProps {
  professionals: Array<{
    id: string;
    name: string;
    speciality: string;
    appointmentCount: number;
    avatarImageUrl?: string | null;
  }>;
}

export function TopProfessionals({ professionals }: TopProfessionalsProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          👨‍⚕️ Médicos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between space-y-4">
        <div className="space-y-4">
          {professionals.slice(0, 5).map((professional, index) => (
            <div key={professional.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={professional.avatarImageUrl || ""}
                  alt={professional.name}
                />
                <AvatarFallback className="bg-blue-100 text-sm font-medium text-blue-600">
                  {professional.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  Dr. {professional.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {professional.speciality}
                </p>
              </div>

              <Badge variant="secondary" className="text-xs">
                {professional.appointmentCount} agend.
              </Badge>
            </div>
          ))}
        </div>

        {professionals.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-sm text-gray-500">
              Nenhum profissional encontrado
            </p>
          </div>
        )}

        {/* Espaçamento adicional para manter altura consistente */}
        {professionals.length > 0 && professionals.length < 5 && (
          <div className="flex-1" />
        )}
      </CardContent>
    </Card>
  );
}
