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
  // Calcular o valor máximo com validações
  const maxValue = Math.max(
    1, // Valor mínimo para evitar divisão por zero
    ...data.map((item) =>
      Math.max(Number(item.appointments) || 0, Number(item.patients) || 0),
    ),
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg font-semibold">Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {/* Container fixo de 280px para o gráfico */}
        <div className="relative flex h-full items-end justify-between gap-4 border-b border-gray-100 pb-2">
          {data.map((item, index) => {
            const appointments = Number(item.appointments) || 0;
            const patients = Number(item.patients) || 0;

            // Altura em pixels baseada na altura do container (280px)
            const maxHeight = 280;
            const appointmentHeight =
              appointments > 0
                ? Math.max(8, (appointments / maxValue) * maxHeight)
                : 4;
            const patientHeight =
              patients > 0 ? Math.max(8, (patients / maxValue) * maxHeight) : 4;

            return (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-3"
              >
                {/* Container das barras com altura fixa */}
                <div className="flex h-72 w-full items-end justify-center gap-1">
                  {/* Barra de Agendamentos */}
                  <div
                    className="group relative w-full max-w-[32px] rounded-t-sm bg-[#3399CC] shadow-sm transition-all hover:bg-blue-600"
                    style={{
                      height: `${appointmentHeight}px`,
                      minHeight: appointments > 0 ? "8px" : "4px",
                      opacity: appointments > 0 ? 1 : 0.3,
                    }}
                  >
                    <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {appointments} agendamentos
                    </div>
                  </div>

                  {/* Barra de Pacientes */}
                  <div
                    className="group relative w-full max-w-[32px] rounded-t-sm bg-green-500 shadow-sm transition-all hover:bg-green-600"
                    style={{
                      height: `${patientHeight}px`,
                      minHeight: patients > 0 ? "8px" : "4px",
                      opacity: patients > 0 ? 1 : 0.3,
                    }}
                  >
                    <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {patients} pacientes
                    </div>
                  </div>
                </div>

                {/* Label do mês */}
                <span className="mt-2 text-sm font-medium text-gray-600">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-6 flex flex-shrink-0 items-center justify-center gap-6">
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
