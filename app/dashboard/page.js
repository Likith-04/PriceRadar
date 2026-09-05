import { createClient } from "@/utils/supabase/server";
import { getProducts } from "@/app/actions";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard — PriceRadar",
  description: "Monitor your tracked products, prices, and target alert thresholds.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const products = await getProducts();

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardClient products={products} user={user} />
      </div>
    </main>
  );
}
