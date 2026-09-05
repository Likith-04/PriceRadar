"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import UserProfileMenu from "./UserProfileMenu";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function AuthButton({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  if (user) {
    return <UserProfileMenu initialUser={user} />;
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="default"
        size="sm"
        className="gap-2 shadow-sm rounded-xl font-medium"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
