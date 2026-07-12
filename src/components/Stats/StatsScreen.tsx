import { useMemo, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { loadMatchHistory, clearMatchHistory } from "../../core/persistence";
import { computeCardStats, computeCharacterStats } from "../../core/stats";
import { BarChart } from "./BarChart";

// dataviz skillの categorical palette から、チャートごとに固定の単色(sequential)を1つずつ割り当てる。
// 「使用率」「勝率」「カード使用数」はそれぞれ別のsequential文脈として扱う。
const HUE_USAGE = "#2a78d6"; // categorical slot1 blue
const HUE_WINRATE = "#1baf7a"; // categorical slot2 aqua
const HUE_CARDS = "#eda100"; // categorical slot3 yellow

export function StatsScreen() {
  const closeStats = useGameStore((s) => s.closeStats);
  const [refreshKey, setRefreshKey] = useState(0);

  const history = useMemo(() => loadMatchHistory(), [refreshKey]);
  const characterStats = useMemo(() => computeCharacterStats(history), [history]);
  const cardStats = useMemo(() => computeCardStats(history), [history]);

  const usageData = characterStats
    .filter((s) => s.gamesPlayed > 0)
    .sort((a, b) => b.usageRatePct - a.usageRatePct)
    .map((s) => ({ label: s.name, value: s.usageRatePct }));

  const winRateData = characterStats
    .filter((s) => s.gamesPlayed > 0)
    .sort((a, b) => b.winRatePct - a.winRatePct)
    .map((s) => ({ label: s.name, value: s.winRatePct }));

  const cardUsageData = cardStats
    .filter((s) => s.timesPlayed > 0)
    .sort((a, b) => b.timesPlayed - a.timesPlayed)
    .slice(0, 15)
    .map((s) => ({ label: s.name, value: s.timesPlayed }));

  return (
    <div
      className="overlay-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 250,
        padding: 16,
      }}
    >
      <div
        className="overlay-panel"
        style={{
          background: "#fcfcfb",
          color: "#0b0b0b",
          borderRadius: 10,
          padding: 24,
          maxWidth: 720,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>対戦データ</h2>
          <button onClick={closeStats} style={{ padding: "6px 14px" }}>
            閉じる
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#52514e" }}>
          記録された対戦数: {history.length}戦。このブラウザでの対戦結果のみを集計しています。
        </p>

        {history.length === 0 ? (
          <p style={{ fontSize: 14 }}>まだ対戦データがありません。対戦を終えると、ここに記録されていきます。</p>
        ) : (
          <>
            <BarChart title="キャラクター使用率" data={usageData} hue={HUE_USAGE} unit="%" />
            <BarChart title="キャラクター勝率" data={winRateData} hue={HUE_WINRATE} unit="%" />
            <BarChart
              title="カード使用回数（上位15枚）"
              data={cardUsageData}
              hue={HUE_CARDS}
              unit="回"
              formatValue={(v) => `${v}回`}
            />
          </>
        )}

        <button
          onClick={() => {
            if (window.confirm("対戦データ（使用率・勝率・カード使用回数の記録）を削除します。よろしいですか？")) {
              clearMatchHistory();
              setRefreshKey((k) => k + 1);
            }
          }}
          style={{ marginTop: 12, fontSize: 12, padding: "6px 12px", color: "#b3261e" }}
        >
          対戦データをリセット
        </button>
      </div>
    </div>
  );
}
