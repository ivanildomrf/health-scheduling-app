"use client";

import dayjs from "dayjs";
import { Calendar, DollarSign } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCentsToBRL } from "@/helpers/currency";

export const description = "A stacked area chart";

interface RevenueChartProps {
  dailyAppointmentsData: {
    date: string;
    appointments: number;
    revenue: number;
  }[];
}

export function RevenueChart({ dailyAppointmentsData }: RevenueChartProps) {
  // Gerar 21 dias para o gráfico: 10 dias antes e 10 dias depois do dia atual
  const chartDays = Array.from({ length: 21 }).map((_, index) =>
    dayjs()
      .subtract(10 - index, "days")
      .format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dailyData = dailyAppointmentsData.find((item) => item.date === date);
    return {
      date: dayjs(date).format("DD/MM"),
      fullDate: date,
      appointments: dailyData?.appointments || 0,
      revenue: dailyData?.revenue || 0,
    };
  });

  const chartConfig = {
    appointments: {
      label: "Agendamentos",
      color: "#0B68F7",
    },
    revenue: {
      label: "Faturamento",
      color: "#10B981",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <DollarSign className="h-5 w-5 rounded-lg bg-green-100 p-1 text-green-600" />
        <CardTitle>Agendamentos e Faturamento</CardTitle>
        <CardDescription>
          Faturamento diário dos últimos 10 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              left: 20,
              right: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrencyInCentsToBRL(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "appointments") {
                      return (
                        <>
                          <div className="flex h-4 w-full items-center gap-2 rounded bg-blue-100 p-2">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            <span className="text-muted-foreground">
                              Agendamentos:
                            </span>
                            <span className="font-semibold">{value}</span>
                          </div>
                        </>
                      );
                    }
                    if (name === "revenue") {
                      return (
                        <>
                          <div className="flex h-4 w-full items-center gap-2 rounded bg-green-100 p-2">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="text-muted-foreground">
                              Faturamento:
                            </span>
                            <span className="font-semibold">
                              {formatCurrencyInCentsToBRL(Number(value))}
                            </span>
                          </div>
                        </>
                      );
                    }
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return (
                        <>
                          {dayjs(payload[0].payload.fullDate).format(
                            "DD/MM/YYYY (dddd)",
                          )}
                        </>
                      );
                    }
                    return <>{label}</>;
                  }}
                />
              }
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="appointments"
              stroke="var(--color-appointments)"
              fill="var(--color-appointments)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
