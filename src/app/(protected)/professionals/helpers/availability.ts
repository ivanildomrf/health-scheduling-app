import { professionalsTable } from "@/db/schema";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.locale("pt-br");

export const getAvailability = (
  professional: typeof professionalsTable.$inferSelect,
) => {
  // Converter horários de UTC para local (Brasil = UTC-3)
  const fromUTC = dayjs.utc(`2000-01-01 ${professional.availableFromTime}`);
  const toUTC = dayjs.utc(`2000-01-01 ${professional.availableToTime}`);

  // Subtrair 3 horas para converter de UTC para horário local do Brasil
  const from = fromUTC
    .subtract(3, "hours")
    .day(professional.availableFromWeekDay);
  const to = toUTC.subtract(3, "hours").day(professional.availableToWeekDay);

  return {
    from,
    to,
  };
};
