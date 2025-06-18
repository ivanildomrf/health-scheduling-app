"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsChartProps {
  data: Array<{
    month: string;
    appointments: number;
    patients: number;
  }>;
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.appointments, item.patients)),
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg font-semibold">Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex h-72 flex-1 items-end justify-between gap-4">
          {data.map((item, index) => {
            const appointmentHeight = (item.appointments / maxValue) * 100;
            const patientHeight = (item.patients / maxValue) * 100;

            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex h-full w-full items-end justify-center gap-1">
                  {/* Barra de Agendamentos */}
                  <div
                    className="group relative min-h-[4px] flex-1 rounded-t-sm bg-blue-500"
                    style={{ height: `${appointmentHeight}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.appointments} agendamentos
                    </div>
                  </div>

                  {/* Barra de Pacientes */}
                  <div
                    className="group relative min-h-[4px] flex-1 rounded-t-sm bg-green-500"
                    style={{ height: `${patientHeight}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.patients} pacientes
                    </div>
                  </div>
                </div>

                <span className="text-sm font-medium text-gray-600">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-shrink-0 items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">Agendamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Pacientes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
