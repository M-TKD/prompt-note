"use client";

import { useMemo, useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import { createHybridStore } from "./hybrid-store";

/**
 * useStore hook
 * 認証状態に応じてクラウド or ローカルのストアを返す
 * ログイン時に自動でlocalStorageのデータを移行する
 */
export function useStore() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const migrated = useRef(false);

  const hybridStore = useMemo(() => createHybridStore(userId), [userId]);

  // ログイン時に自動移行
  useEffect(() => {
    if (userId && !migrated.current) {
      migrated.current = true;
      hybridStore.migrateLocalData().then((count) => {
        if (count > 0) {
          console.log(`Migrated ${count} documents to cloud`);
        }
      });
    }
  }, [userId, hybridStore]);

  return hybridStore;
}
