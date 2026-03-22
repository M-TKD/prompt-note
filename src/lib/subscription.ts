"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

export type Plan = "free" | "pro";

interface SubscriptionState {
  plan: Plan;
  loading: boolean;
  isPro: boolean;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlan("free");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("plan, current_period_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data) {
          setPlan("free");
        } else if (data.plan === "pro" && isProValid(data.current_period_end)) {
          setPlan("pro");
        } else {
          setPlan("free");
        }
      } catch {
        if (!cancelled) setPlan("free");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSubscription();
    return () => { cancelled = true; };
  }, [user]);

  return { plan, loading, isPro: plan === "pro" };
}

function isProValid(currentPeriodEnd: string | null): boolean {
  if (!currentPeriodEnd) return false;
  return new Date(currentPeriodEnd) > new Date();
}
