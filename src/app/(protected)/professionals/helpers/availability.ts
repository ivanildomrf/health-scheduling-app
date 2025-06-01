import { professionalsTable } from "@/db/schema";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.locale("pt-br");

export const getAvailability = (
  professional: typeof professionalsTable.$inferSelect,
) => {
  const from = dayjs
    .utc()
    .day(professional.availableFromWeekDay)
    .set("hour", Number(professional.availableFromTime.split(":")[0]))
    .set("minute", Number(professional.availableFromTime.split(":")[1]))
    .set("second", Number(professional.availableFromTime.split(":")[2] || 0))
    .local();
  const to = dayjs
    .utc()
    .day(professional.availableToWeekDay)
    .set("hour", Number(professional.availableToTime.split(":")[0]))
    .set("minute", Number(professional.availableToTime.split(":")[1]))
    .set("second", Number(professional.availableToTime.split(":")[2] || 0))
    .local();

  return {
    from,
    to,
  };
};
