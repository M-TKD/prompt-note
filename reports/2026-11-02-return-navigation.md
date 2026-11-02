# Craftbaseトップへ戻る導線

本人指摘：「それぞれのページの導線で、craftbaseのトップページに戻ってくる導線がない」。公開までの委任を引き継ぐ。

前回はCraftbaseから製品を試す導線を整えたが、製品からブランドへ戻る入口はフッター・設定内にあり、見つけにくかった。チームで対象をPrompt NotesとDocument Generatorに分担し、各サービス上部へ明示する方針とした。

- AppShellの全分岐で「Craftbaseトップ」を表示。紹介、認証、公開、作業、読み込み中を共通化。
- URLは `https://craftbaseapp.com/`。同じタブで移動する通常のリンクにして、既存の未保存beforeunloadガードを維持。
- ナビ45px分を編集領域の高さから除き、下ナビと重ならないようにした。
- 既存フッターの表記も「Craftbaseトップへ戻る」へ明確化。再発防止をAGENTS.mdへ記録。

検証：17回帰成功、lintは0 error・既存7 warning、TypeScriptを含むproduction build成功、差分チェック成功。紹介・ノート・探す・検索・新規登録・使い方・設定・コレクション・プロフィール・利用規約・プライバシー・ゴミ箱・編集の13画面で320/390/1440pxのリンク表示とURLを確認。実クリックでCraftbase公開トップへ遷移。320/390pxの編集領域と下ナビの非重複を確認。

共通枠を通る公開共有ページは既存SSR回帰とソースで確認。実ログイン・クラウド上の共有データ・実課金・メール送信は操作しない。Previewの既存環境設定不足は適用範囲を変更せず、ローカル本番ビルドと表示確認を根拠にProduction公開後も確認する。

Claude Codeによる両repoの読み取りレビュー原文と対応、Document Generator側の変更記録はCraftbase repoの `reports/2026-11-02-return-navigation/` に保存する。
