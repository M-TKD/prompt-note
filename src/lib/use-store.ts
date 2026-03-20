"use client";

import { useMemo, useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import { createHybridStore } from "./hybrid-store";
import { cloudStore } from "./cloud-store";

/**
 * useStore hook
 * 認証状態に応じてクラウド or ローカルのストアを返す
 * ログイン時に自動でlocalStorageのデータを移行する
 */
export function useStore() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const initialized = useRef(false);

  const hybridStore = useMemo(() => createHybridStore(userId), [userId]);

  // ログイン時: プロフィール確保 + データ移行
  useEffect(() => {
    if (userId && !initialized.current) {
      initialized.current = true;

      // プロフィールが存在しない場合は作成
      const meta = user?.user_metadata;
      cloudStore.ensureProfile(
        userId,
        meta?.full_name || meta?.name || user?.email?.split("@")[0],
        meta?.avatar_url || meta?.picture
      );

      // localStorageのデータをクラウドに移行
      hybridStore.migrateLocalData().then((count) => {
        if (count > 0) {
          console.log(`Migrated ${count} documents to cloud`);
        }
      });
    }
  }, [userId, user, hybridStore]);

  return hybridStore;
}
