"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AuthButton from "./AuthButton";
import ThemeToggle from "./theme-toggle";
import {
  Menu,
  X,
  LayoutDashboard,
  Cpu,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function Navbar({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <Image
            src="/PriceRadarbnbg.png"
            alt="PriceRadar Logo"
            width={572}
            height={193}
            className="h-8 w-auto dark:hidden sm:h-9"
            priority
          />
          <Image
            src="/PriceRadarwnbg.png"
            alt="PriceRadar Logo"
            width={572}
            height={193}
            className="hidden h-8 w-auto dark:block sm:h-9"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {user && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-accent hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          )}

          <Link
            href="/#features"
            className="rounded-xl px-3.5 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
          >
            Features
          </Link>

          <Link
            href="/how-it-works"
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
              pathname === "/how-it-works"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            How It Works
          </Link>

          <Link
            href="/how-it-works#architecture"
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
          >
            <Cpu className="h-3.5 w-3.5 text-primary" />
            System Architecture
          </Link>
        </nav>

        {/* Right-side Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <AuthButton user={user} />

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-foreground md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border/70 bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            {user && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/80 hover:bg-accent"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                Dashboard
              </Link>
            )}

            <Link
              href="/#features"
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Features
            </Link>

            <Link
              href="/how-it-works"
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
            >
              <HelpCircle className="h-4 w-4" />
              How It Works
            </Link>

            <Link
              href="/how-it-works#architecture"
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
            >
              <Cpu className="h-4 w-4 text-primary" />
              System Architecture
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
