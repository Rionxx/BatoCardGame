// Web Audio APIによる効果音・BGMの自前生成。外部音源ファイルを一切使わないため
// 著作権の問題がなく、追加のアセット管理も不要。テスト環境(node)では何もしない。

let audioCtx: AudioContext | null = null;

const MUTE_KEY = "romacoCardGame.muted";
let muted =
  typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";

function ctx(): AudioContext | null {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") return null;
  if (!audioCtx) audioCtx = new AudioContext();
  // ブラウザの自動再生ポリシー対策: ユーザー操作起点の呼び出しでresumeする
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

/** 絶対時刻atTimeに1音鳴らす（内部用） */
function toneAt(
  freq: number,
  atTime: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  slideTo?: number
): void {
  const c = ctx();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, atTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, atTime + duration);
  gain.gain.setValueAtTime(volume, atTime);
  gain.gain.exponentialRampToValueAtTime(0.001, atTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(atTime);
  osc.stop(atTime + duration + 0.05);
}

/** 現在時刻からdelay秒後に1音鳴らす */
function tone(
  freq: number,
  delay: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  slideTo?: number
): void {
  const c = ctx();
  if (!c) return;
  toneAt(freq, c.currentTime + delay, duration, type, volume, slideTo);
}

// ---- 効果音 ----

/** ボタン押下: 短いクリック音 */
export function playClick(): void {
  tone(1200, 0, 0.06, "square", 0.025, 600);
}

/** カードをプレイ: シュッ→キラン */
export function playCardPlay(): void {
  tone(500, 0, 0.09, "triangle", 0.05, 900);
  tone(900, 0.06, 0.12, "triangle", 0.04, 1400);
}

/** カードを引く: めくる風切り音 */
export function playCardDraw(): void {
  tone(300, 0, 0.12, "sawtooth", 0.02, 1200);
}

/** キャラクター/難易度の選択決定: 2音チャイム */
export function playSelect(): void {
  tone(660, 0, 0.1, "triangle", 0.05);
  tone(880, 0.09, 0.16, "triangle", 0.05);
}

/** 勝利ファンファーレ */
export function playVictory(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.24, "triangle", 0.06));
  tone(1319, 0.55, 0.4, "triangle", 0.05);
}

/** 敗北: 下降音 */
export function playDefeat(): void {
  [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.28, "sine", 0.05));
}

// ---- BGM（対戦中の8ビット風ループ） ----

let bgmTimer: number | null = null;
let nextNoteTime = 0;
let step = 0;

export type BgmMode = "normal" | "legend";
let bgmMode: BgmMode = "normal";

// モードごとの演奏パターン。切り替えてもスケジューラ（nextNoteTime/step）は
// 触らないため、BGMはリセットされずにそのまま曲調だけが変わる。
const BGM_PATTERNS: Record<
  BgmMode,
  {
    bass: number[];
    ratios: number[];
    secondsPerStep: number;
    bassVol: number;
    arpVol: number;
    arpType: OscillatorType;
  }
> = {
  normal: {
    bass: [110, 110, 131, 131, 98, 98, 123, 123], // A2 C3 G2 B2
    ratios: [2, 3, 4, 3],
    secondsPerStep: 60 / 116 / 2, // BPM116の8分音符
    bassVol: 0.028,
    arpVol: 0.011,
    arpType: "square",
  },
  legend: {
    // レジェンド覚醒中: 低いEのパワーコード進行＋速いテンポ＋広いアルペジオで疾走感を出す
    bass: [82.4, 82.4, 98, 98, 110, 110, 73.4, 92.5], // E2 G2 A2 D2 F#2
    ratios: [2, 4, 6, 4],
    secondsPerStep: 60 / 152 / 2, // BPM152
    bassVol: 0.036,
    arpVol: 0.018,
    arpType: "sawtooth",
  },
};

/** BGMの曲調を切り替える。再生位置はリセットしない（連続して発動しても曲は途切れない）。 */
export function setBgmMode(mode: BgmMode): void {
  bgmMode = mode;
}

export function getBgmMode(): BgmMode {
  return bgmMode;
}

export function startBgm(): void {
  const c = ctx();
  if (!c || bgmTimer !== null) return;
  nextNoteTime = c.currentTime + 0.05;
  step = 0;
  // 先読みスケジューラ: 100msごとに、直近0.25秒分の音を予約する
  bgmTimer = window.setInterval(() => {
    const cc = ctx();
    if (!cc) return;
    while (nextNoteTime < cc.currentTime + 0.25) {
      const p = BGM_PATTERNS[bgmMode]; // 毎ステップ現在のモードを参照する
      if (!muted) {
        const bass = p.bass[Math.floor(step / 4) % p.bass.length];
        if (step % 2 === 0) {
          toneAt(bass, nextNoteTime, p.secondsPerStep * 1.6, "triangle", p.bassVol);
        }
        const arp = bass * p.ratios[step % p.ratios.length];
        toneAt(arp, nextNoteTime, p.secondsPerStep * 0.55, p.arpType, p.arpVol);
      }
      nextNoteTime += p.secondsPerStep;
      step += 1;
    }
  }, 100);
}

/** レジェンドカード発動時のスティング（上昇パワーコード） */
export function playLegendActivate(): void {
  [164.8, 220, 329.6, 440, 659.3].forEach((f, i) => tone(f, i * 0.09, 0.35, "sawtooth", 0.045));
  tone(880, 0.5, 0.5, "triangle", 0.05);
}

export function stopBgm(): void {
  if (bgmTimer !== null) {
    window.clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

// ---- ミュート ----

export function isMuted(): boolean {
  return muted;
}

export function toggleMuted(): boolean {
  muted = !muted;
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // 無視
  }
  return muted;
}
