import { ArrowLeft } from "lucide-react";

// 製品内のどの画面からでも、運営ブランドのトップへ戻れるようにする。
export function CraftbaseReturnNav() {
  return (
    <nav aria-label="Craftbaseへのナビゲーション" className="pn-brand-navigation">
      <div className="pn-brand-navigation-inner">
        <a href="https://craftbaseapp.com/">
          <ArrowLeft size={15} aria-hidden="true" />
          Craftbaseトップ
        </a>
        <span>Prompt Notes</span>
      </div>
    </nav>
  );
}
