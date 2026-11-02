import Image from "next/image";
import Link from "next/link";
import { Check, FileText, LockKeyhole, Plus } from "lucide-react";
import "./landing.css";

const workExamples = [
  {
    work: "メールを書く",
    title: "返信のたびに、伝え方で迷わない。",
    description: "相手への配慮、文章の長さ、最後のひと言。自分らしく書けた指示を残して、次の返信にも。",
    example: "提案メール・日程調整・お礼の返信",
  },
  {
    work: "議事録を整理する",
    title: "いつもの形式で、次の会議も。",
    description: "決定事項と担当者、期限を分けてまとめる。必要な項目を一度決めたら、会議の内容を差し替えて使えます。",
    example: "打ち合わせの要約・次のアクション整理",
  },
  {
    work: "発信を続ける",
    title: "書き出す前の準備を、少なく。",
    description: "誰に、何を、どんな口調で伝えるか。記事やSNSの指示を、自分用の型としてまとめておけます。",
    example: "記事の構成・SNS投稿の下書き",
  },
];

const questions = [
  {
    question: "登録せずに、どこまで使えますか？",
    answer: "メモやプロンプトの作成・保存、テンプレートの条件の差し替えなどを試せます。登録なしで保存した内容は、この端末のこのブラウザ内に残ります。別の端末での利用やクラウド同期には、無料アカウントが必要です。",
  },
  {
    question: "登録なしで保存した内容は、ずっと残りますか？",
    answer: "同じ端末・同じブラウザで再訪すると、保存した内容を使えます。ただし、ブラウザのデータを削除すると内容も消えます。プライベートブラウズでは、画面を閉じたときに消える場合があります。大切な指示は、コピーやエクスポートで控えを残してください。",
  },
  {
    question: "ChatGPTなどのAIに、自動で送信されますか？",
    answer: "自動送信ではありません。アプリの「AIで使う」は指示をコピーして、選んだAIのページを開く機能です。開いた先で貼り付けて、送信してください。各AIの利用には、そのサービスのアカウントや利用条件が適用されます。",
  },
  {
    question: "AI Reviewでは、何ができますか？",
    answer: "指示の明確さ、具体性、構成、背景情報、制約の5つの観点で、改善のヒントを得られます。無料アカウントで月10回まで利用できます。AIによる提案のため、正しさや期待する回答を保証するものではありません。結果を確認してから取り入れてください。",
  },
  {
    question: "保存した指示は、他の人にも見えますか？",
    answer: "作成時は非公開です。公開する場合は、自分で公開設定を変更します。顧客名や個人情報など、他の人に見せたくない情報が含まれていないか、公開前に確認してください。",
  },
];

// 保存する内容と差し替える条件を伝えるための、操作を持たない画面例。
function WorkspaceExample() {
  return (
    <figure className="pn-workspace">
      <figcaption className="pn-workspace-caption">
        <span>保存・再利用の画面例</span>
        <span>内容はサンプルです</span>
      </figcaption>
      <div className="pn-workspace-window">
        <div className="pn-workspace-bar">
          <span className="pn-workspace-breadcrumb"><FileText size={16} aria-hidden="true" /> 自分のプロンプト</span>
          <span className="pn-workspace-private"><LockKeyhole size={13} aria-hidden="true" /> 非公開</span>
        </div>
        <div className="pn-workspace-document">
          <div className="pn-document-category">テンプレート</div>
          <h2>提案メールをつくる</h2>
          <div className="pn-document-content">
            <p className="pn-document-label">お願いしたいこと</p>
            <p>初めてご連絡する相手に、サービスの提案メールを書いてください。</p>
            <p className="pn-document-label">今回の条件</p>
            <p>提案する内容：<mark>{"{{サービス}}"}</mark><br />
              伝えたい強み：<mark>{"{{強み}}"}</mark></p>
            <p className="pn-document-label">文章のルール</p>
            <ul>
              <li>丁寧で、押しつけない口調にする</li>
              <li>本文は300文字以内にまとめる</li>
              <li>最後に、15分の打ち合わせを提案する</li>
            </ul>
          </div>
        </div>
        <div className="pn-workspace-variables">
          <p><span className="pn-variable-symbol" aria-hidden="true">{"{ }"}</span> 次に使うときは、ここを差し替え。</p>
          <dl>
            <div><dt>サービス</dt><dd>Webサイトの制作</dd></div>
            <div><dt>強み</dt><dd>公開後の更新もサポート</dd></div>
          </dl>
        </div>
      </div>
      <p className="pn-workspace-note">いつもの指示はそのままに。今回の条件だけ、新しく。</p>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="pn-landing">
      <a className="pn-skip-link" href="#pn-main">本文へ移動</a>
      <header className="pn-header">
        <div className="pn-container pn-header-inner">
          <Link href="/" aria-label="Prompt Notes ホーム" className="pn-logo">
            <Image src="/logo-horizontal.png" alt="Prompt Notes" width={1385} height={353} sizes="176px" priority />
          </Link>
          <nav aria-label="メインナビゲーション" className="pn-nav">
            <a className="pn-nav-info" href="#how-it-works">使い方</a>
            <a className="pn-nav-info" href="#pricing">料金</a>
            <Link href="/auth" className="pn-login">ログイン</Link>
            <Link href="/notes" className="pn-button pn-button-small pn-button-dark">登録せずに使う</Link>
          </nav>
        </div>
      </header>

      <main id="pn-main">
        <section className="pn-container pn-hero" aria-labelledby="pn-hero-heading">
          <div className="pn-hero-copy">
            <p className="pn-hero-intro">AIへの指示を、あなたの仕事道具に。</p>
            <h1 id="pn-hero-heading"><span>うまくいった</span><span>AIへの指示を、</span><span>次の仕事でも。</span></h1>
            <p className="pn-hero-description">メールの返信も、議事録の整理も。<br />使えた指示を保存して、条件を変えて、また使う。<br className="pn-desktop-break" />Prompt Notesは、そのためのノートです。</p>
            <div className="pn-hero-actions">
              <Link href="/notes" className="pn-button pn-button-dark">登録せずに使う</Link>
              <Link href="/feed" className="pn-button pn-button-outline">テンプレートを見る</Link>
            </div>
            <p className="pn-hero-condition">無料で始められます。登録なしの保存先は、この端末のブラウザ内です。</p>
          </div>
          <WorkspaceExample />
        </section>

        <section className="pn-work-section" aria-labelledby="pn-work-heading">
          <div className="pn-container pn-work-layout">
            <div className="pn-section-intro">
              <h2 id="pn-work-heading">毎回、ゼロから<br />書かなくていい。</h2>
              <p>チャットの履歴に埋もれていた指示を、<br className="pn-desktop-break" />次の仕事に使える形で残しましょう。</p>
            </div>
            <div className="pn-work-examples">
              {workExamples.map((example) => (
                <article className="pn-work-example" key={example.work}>
                  <p className="pn-work-name">{example.work}</p>
                  <div>
                    <h3>{example.title}</h3>
                    <p>{example.description}</p>
                    <p className="pn-work-example-caption">{example.example}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pn-container pn-process" id="how-it-works" aria-labelledby="pn-process-heading">
          <div className="pn-section-heading">
            <h2 id="pn-process-heading">残す。差し替える。また使う。</h2>
            <p>ひとつの指示から、次の仕事へ。</p>
          </div>
          <ol className="pn-steps">
            <li>
              <span className="pn-step-number">1</span>
              <h3>うまくいった指示を保存</h3>
              <p>AIとのやりとりで使えた指示を、タイトルと一緒に残します。まずは普段の依頼文を、ひとつ。</p>
              <div className="pn-step-example"><FileText size={18} aria-hidden="true" /><span>提案メールをつくる</span></div>
            </li>
            <li>
              <span className="pn-step-number">2</span>
              <h3>今回の条件に差し替え</h3>
              <p>相手やテーマなど、毎回変わる部分は変数に。<code>{"{{サービス}}"}</code>のように書けば、まとめて入力できます。</p>
              <div className="pn-step-example pn-step-replace"><span>Webサイトの制作</span><span aria-hidden="true">→</span><strong>ロゴの制作</strong></div>
            </li>
            <li>
              <span className="pn-step-number">3</span>
              <h3>コピーして、いつものAIへ</h3>
              <p>「AIで使う」で指示をコピーして、AIを開きます。開いた先で貼り付けて、送信します。</p>
              <p className="pn-step-ai">ChatGPT / Claude / Gemini など</p>
            </li>
          </ol>
          <div className="pn-template-invitation"><p>何を残すか迷ったら、テンプレートから。</p><Link href="/feed" className="pn-text-link">仕事に使えるテンプレートを見る</Link></div>
        </section>

        <section className="pn-pricing-section" id="pricing" aria-labelledby="pn-pricing-heading">
          <div className="pn-container pn-pricing-layout">
            <div className="pn-section-intro">
              <h2 id="pn-pricing-heading">まずは、無料で。<br />自分の仕事に合うか<br className="pn-desktop-break" />試してください。</h2>
              <p>保存と再利用から始められます。<br />端末をまたいで使うなら、<br className="pn-desktop-break" />無料アカウントを。</p>
            </div>
            <div className="pn-plans">
              <div className="pn-free-plan">
                <div className="pn-plan-heading"><h3>Free</h3><p>¥0</p></div>
                <p className="pn-plan-description">日々の指示を、保存して使う。</p>
                <ul className="pn-plan-features">
                  <li><Check size={17} aria-hidden="true" />メモ・プロンプトの作成と保存</li>
                  <li><Check size={17} aria-hidden="true" />変数を使ったテンプレートの再利用</li>
                  <li><Check size={17} aria-hidden="true" />テンプレートの閲覧・自分用にコピー</li>
                </ul>
                <div className="pn-account-features">
                  <p>無料アカウントを作ると</p>
                  <ul><li>クラウド同期で、別の端末でも使える</li><li>AI Reviewで指示を見直せる（月10回まで）</li></ul>
                </div>
                <div className="pn-plan-actions"><Link href="/notes" className="pn-button pn-button-dark">登録せずに使う</Link><Link href="/auth?mode=signup" className="pn-text-link">無料アカウントを作成</Link></div>
              </div>
              <div className="pn-pro-plan"><div><h3>Pro <span>準備中 / Coming soon</span></h3><p>現在はお申し込みいただけません。</p></div><p className="pn-pro-price">¥980<span> / 月（予定）</span></p></div>
            </div>
          </div>
        </section>

        <section className="pn-container pn-faq" aria-labelledby="pn-faq-heading">
          <h2 id="pn-faq-heading">使い始める前に。</h2>
          <div className="pn-questions">
            {questions.map((item) => (
              <details key={item.question}>
                <summary>{item.question}<Plus size={18} aria-hidden="true" /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
            <Link href="/howto" className="pn-text-link pn-howto-link">詳しい使い方を見る</Link>
          </div>
        </section>

        <section className="pn-final-section" aria-labelledby="pn-final-heading">
          <div className="pn-container pn-final-inner">
            <div><h2 id="pn-final-heading">次も使いたい指示を、<br />ひとつ残してみませんか。</h2><p>いつものAIへの依頼文から、始めましょう。</p></div>
            <div className="pn-final-action"><Link href="/notes" className="pn-button pn-button-white">登録せずに使う</Link><p>無料・この端末のブラウザ内に保存</p></div>
          </div>
        </section>
      </main>

      <footer className="pn-footer">
        <div className="pn-container">
          <div className="pn-footer-top"><Link href="/" className="pn-logo" aria-label="Prompt Notes ホーム"><Image src="/logo-horizontal.png" alt="Prompt Notes" width={1385} height={353} sizes="176px" /></Link><a href="https://craftbaseapp.com/" className="pn-text-link">Craftbaseトップへ戻る</a></div>
          <div className="pn-footer-bottom"><p>運営：合同会社WonderPlace</p><nav aria-label="フッターナビゲーション"><Link href="/terms">利用規約</Link><Link href="/privacy">プライバシーポリシー</Link><Link href="/howto">使い方</Link></nav><p>© 2026 Prompt Notes</p></div>
        </div>
      </footer>
    </div>
  );
}
