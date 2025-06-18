"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SpecialityStatsProps {
  specialities: Array<{
    speciality: string;
    count: number;
  }>;
}

const specialityIcons: Record<string, string> = {
  Cardiologia: "❤️",
  Ginecologia: "🩺",
  Pediatria: "👶",
  Dermatologia: "🔬",
  Ortopedia: "🦴",
  Neurologia: "🧠",
  Psicologia: "🧠",
  Psiquiatria: "🧠",
  Oftalmologia: "👁️",
  Otorrinolaringologia: "👂",
  Urologia: "🏥",
  Endocrinologia: "🧬",
};

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

export function SpecialityStats({ specialities }: SpecialityStatsProps) {
  const totalCount = specialities.reduce((sum, spec) => sum + spec.count, 0);
  const maxCount = Math.max(...specialities.map((spec) => spec.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          🏥 Especialidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {specialities.map((speciality, index) => {
          const percentage =
            totalCount > 0 ? (speciality.count / totalCount) * 100 : 0;
          const progressValue =
            maxCount > 0 ? (speciality.count / maxCount) * 100 : 0;
          const icon = specialityIcons[speciality.speciality] || "🩺";

          return (
            <div key={speciality.speciality} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="truncate text-sm font-medium text-gray-900">
                    {speciality.speciality}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {speciality.count} agend.
                  </span>
                  <span className="text-xs text-gray-400">
                    ({percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>

              <Progress value={progressValue} className="h-2" />
            </div>
          );
        })}

        {specialities.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            Nenhuma especialidade encontrada
          </p>
        )}
      </CardContent>
    </Card>
  );
}
