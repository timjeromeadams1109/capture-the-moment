"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { User as DbUser } from "@/lib/types/database";

interface AuthState {
  user: User | null;
  profile: DbUser | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  });

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string): Promise<DbUser | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as DbUser;
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const profile = await fetchProfile(user.id);
          setState({
            user,
            profile,
            loading: false,
            isAdmin: profile?.role === "admin",
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            isAdmin: false,
          });
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setState({
          user: null,
          profile: null,
          loading: false,
          isAdmin: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          loading: false,
          isAdmin: profile?.role === "admin",
        });
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          loading: false,
          isAdmin: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [supabase, router]);

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState((prev) => ({
        ...prev,
        profile,
        isAdmin: profile?.role === "admin",
      }));
    }
  }, [state.user, fetchProfile]);

  return {
    ...state,
    signOut,
    refreshProfile,
  };
}
