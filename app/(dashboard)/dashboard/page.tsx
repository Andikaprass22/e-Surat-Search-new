import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helpers";

export default async function DashboardIndexPage() {
  const user = await requireSession();
  if (user.role === "admin") redirect("/admin");
  redirect("/pencarian");
}
