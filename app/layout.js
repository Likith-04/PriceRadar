import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";
import "./globals.css";

export const metadata = {
  title: "PriceRadar — Asynchronous Price & Target Alert Tracker",
  description:
    "Continuous e-commerce price monitoring with target price alerts, price history analytics, and background queue workers.",
};

export default async function RootLayout({ children }) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Fail gracefully if env not configured
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar initialUser={user} />
          <div className="flex-1">{children}</div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
