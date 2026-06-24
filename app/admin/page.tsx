import { isAuthenticated } from "@/lib/dashboard-auth";
import DashboardLogin from "@/components/DashboardLogin";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAuthenticated();
  return authed ? <AdminPanel /> : <DashboardLogin />;
}
