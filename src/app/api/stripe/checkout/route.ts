import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Stripe / Supabase のクライアントは遅延生成する。
 * モジュール読み込み時に生成すると、環境変数が1つ欠けただけで
 * next build の "Collecting page data" が失敗し、デプロイ全体が落ちる。
 */
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key, { apiVersion: "2026-02-25.clover" }) : null;
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();
    if (!stripe || !supabaseAdmin) {
      console.error("Stripe or Supabase is not configured.");
      return NextResponse.json({ error: "決済機能が設定されていません" }, { status: 503 });
    }

    const { accessToken } = await req.json();

    // Verify user
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a Stripe customer
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = sub?.stripe_customer_id;

    // Create customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Upsert subscription record
      await supabaseAdmin.from("subscriptions").upsert({
        user_id: user.id,
        plan: "free",
        stripe_customer_id: customerId,
      }, { onConflict: "user_id" });
    }

    // Create checkout session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prompt-notes.ai";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${siteUrl}/settings?upgrade=success`,
      cancel_url: `${siteUrl}/settings?upgrade=cancel`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
