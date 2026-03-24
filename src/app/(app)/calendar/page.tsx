import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEvents } from "@/modules/calendar/queries";
import { CalendarView } from "@/modules/calendar/components/calendar-view";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch 3 months of events (previous, current, next)
  const now = new Date();
  const start = startOfMonth(subMonths(now, 1));
  const end = endOfMonth(addMonths(now, 1));

  const events = await getEvents(session.user.id, start, end);

  return (
    <CalendarView initialEvents={JSON.parse(JSON.stringify(events))} />
  );
}
