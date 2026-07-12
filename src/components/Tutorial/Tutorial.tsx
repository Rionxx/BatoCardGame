import type { CSSProperties } from "react";
import { WEAKNESS_BY_PERSONALITY } from "../../core/engine/types";
import { useGameStore } from "../../store/useGameStore";

export function Tutorial() {
  const closeTutorial = useGameStore((s) => s.closeTutorial);

  return (
    <div
      className="overlay-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        className="overlay-panel"
        style={{
          background: "#fff",
          color: "#111",
          borderRadius: 10,
          padding: 24,
          maxWidth: 640,
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: "sans-serif",
        }}
      >
        <h2 style={{ marginTop: 0 }}>遊び方</h2>

        <h3>目的</h3>
        <p>
          相手の「誇りゲージ」を0にすれば勝ち。対戦設定で選んだ人数（3〜9人）の相手に
          連続で勝てばランクリアです。誇りゲージが0になると敗北し、ランは最初からやり直しになります。
        </p>
        <p style={{ fontSize: 13, color: "#555" }}>
          進行状況は自動でブラウザに保存されます。戦闘画面の「中断」ボタンから休憩でき、
          タブを閉じても次に開いたときに続きから再開できます。
        </p>

        <h3>ターンの流れ</h3>
        <ol>
          <li>ターンが始まると「コスト」が回復します（ターン1は1、ターン2は2、…最大で10まで増えます）。</li>
          <li>手札は最初4枚。毎ターン1枚ずつ引いて増えていきます（上限10枚）。使わずに溜めるのも作戦です。</li>
          <li>手札からカードを選んでプレイします。コストの合計が予算を超えるカードは使えません。</li>
          <li>使い終わったら「ターン終了」を押すと、相手（CPU）が行動します。相手が何のカードを使ったかは画面下部の「対戦ログ」と、相手フィールドのカード表示で確認できます。</li>
          <li>これを繰り返し、先に相手の誇りを0にした方が勝ちです。</li>
        </ol>

        <h3>レジェンドカード</h3>
        <p>
          全員のデッキに1枚だけ入っている切り札「レジェンド覚醒」（コスト7）を使うと、
          発動ターンを含む5ターンの間、<strong>与えるダメージが2倍・受けるダメージが半減</strong>します。
          発動中は対戦BGMも激しい曲調に切り替わります。使いどころが勝負の分かれ目です。
        </p>

        <h3>カードの種類</h3>
        <ul>
          <li><strong>攻撃（罵倒）カード</strong>: 相手の誇りゲージを減らします。</li>
          <li><strong>防御（受け流し）カード</strong>: 次に受けるダメージを軽減・無効化します。</li>
          <li><strong>強化（バフ）カード</strong>: 自分の誇りを回復したり、怒りゲージを溜めたりします。</li>
        </ul>

        <h3>属性と弱点</h3>
        <p>
          攻撃カードには「煽り」「正論」「皮肉」「自虐からの逆転」のいずれかの属性があります。
          対戦相手にはそれぞれ性格タイプがあり、対応する弱点属性が1つ決まっています。
          <strong>弱点属性が一致するカードを当てると、追加ダメージが入ります。</strong>
          戦闘画面では相手の弱点属性をはっきり表示し、手札の中で弱点を突けるカードには
          「弱点！」のマークが付きます。
        </p>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={thStyle}>性格タイプ</th>
              <th style={thStyle}>弱点属性</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(WEAKNESS_BY_PERSONALITY).map(([personality, attribute]) => (
              <tr key={personality}>
                <td style={tdStyle}>{personality}</td>
                <td style={tdStyle}>{attribute}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>怒りゲージ</h3>
        <p>
          攻撃カードを使うと自分の怒りゲージが溜まっていきます。一定値に達すると
          強力な罵倒カードが手札に追加されます。
        </p>

        <button onClick={closeTutorial} style={{ marginTop: 20, padding: "10px 20px", fontSize: 16 }}>
          はじめる
        </button>
      </div>
    </div>
  );
}

const thStyle: CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: "4px 8px",
};

const tdStyle: CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "4px 8px",
};
