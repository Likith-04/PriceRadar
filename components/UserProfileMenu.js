"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  LogOut,
  Cpu,
  ChevronDown,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserProfileMenu({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const email = user.email || "";
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    email.split("@")[0] ||
    "Account";
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || email[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    await signOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 p-1 pr-2.5 shadow-sm transition-colors hover:border-primary/40 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="h-8 w-8 rounded-full border border-border/70 object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </div>
        )}

        <span className="hidden text-xs font-medium text-foreground sm:inline-block max-w-[120px] truncate">
          {name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl border border-border/70 bg-popover p-2 shadow-xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Your Dashboard
            </Link>

            <Link
              href="/how-it-works"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Cpu className="h-4 w-4 text-muted-foreground" />
              System Architecture
            </Link>
          </div>

          <div className="border-t border-border/60 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
