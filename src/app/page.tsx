import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardClient user={session.user} />;
}
