import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/modules/dashboard/queries";
import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Welcome back, {session?.user?.name || "User"} 🦆
      </h1>
      <DashboardOverview data={JSON.parse(JSON.stringify(data))} />
    </div>
  );
}
