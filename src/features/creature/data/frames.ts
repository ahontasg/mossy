import { PALETTE } from "./palette";
import type { Mood, GrowthStage } from "../../../types";

const _ = null; // transparent
const D = PALETTE.moss900; // dark (eyes, outlines)
const S = PALETTE.moss700; // shadow
const B = PALETTE.moss500; // body
const H = PALETTE.moss400; // highlight
const L = PALETTE.moss300; // leaf
const A = PALETTE.moss200; // light accent
const W = PALETTE.white; // eye highlight
const E = PALETTE.soil; // soil/earth
const P = PALETTE.pot; // pot
const PD = PALETTE.potDark; // pot dark

export type PixelColor = string | null;
export type Frame = PixelColor[][];

export interface MoodFrames {
  idle1: Frame;
  idle2: Frame;
  blink: Frame;
  talk1: Frame;
  talk2: Frame;
}

// ── Base body (shared across moods) ──
// Differences per mood: eye rows (6-7) and mouth row (8)
// Eyes now span 2 rows (2×2 blocks) for a Clawd-like look

function makeFrames(
  eyeTop: PixelColor[],
  eyeBottom: PixelColor[],
  blinkTop: PixelColor[],
  blinkBottom: PixelColor[],
  mouthRow: PixelColor[],
  talkMouth1?: PixelColor[],
  talkMouth2?: PixelColor[],
): MoodFrames {
  const top: Frame = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 0
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 1
    [_, _, _, _, _, _, L, L, _, _, _, _, _, _, _, _], // 2 leaf sprout
    [_, _, _, _, S, B, B, B, B, H, _, _, _, _, _, _], // 3 dome top (6 wide)
    [_, _, _, S, B, B, B, B, B, B, H, _, _, _, _, _], // 4 dome (8 wide)
    [_, _, S, B, B, B, B, B, B, B, B, B, H, _, _, _], // 5 widest body (10 wide)
  ];
  const bottom: Frame = [
    [_, A, S, B, B, B, B, B, B, B, B, B, H, A, _, _], // 9 lower body + arm stubs
    [_, _, S, S, B, B, B, B, B, B, B, S, S, _, _, _], // 10 body base
    [_, _, _, _, E, E, E, E, E, E, E, _, _, _, _, _], // 11 soil line
    [_, _, _, P, P, P, P, P, P, P, P, P, _, _, _, _], // 12 pot rim
    [_, _, _, P, PD, PD, PD, PD, PD, PD, PD, P, _, _, _, _], // 13 pot body
    [_, _, _, _, P, P, P, P, P, P, P, _, _, _, _, _], // 14 pot base
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 15
  ];

  // idle2: shift highlight on dome top for breathing effect
  const idle2Top: Frame = [
    top[0],
    top[1],
    top[2],
    top[3],
    [_, _, _, S, B, H, B, B, B, S, H, _, _, _, _, _], // 4 - slight shift
    top[5],
  ];

  const idle1: Frame = [...top, eyeTop, eyeBottom, mouthRow, ...bottom];
  const idle2: Frame = [...idle2Top, eyeTop, eyeBottom, mouthRow, ...bottom];
  const blink: Frame = [...top, blinkTop, blinkBottom, mouthRow, ...bottom];

  // Talking frames: normal eyes + alternating mouth shapes
  const mouth1 = talkMouth1 ?? mouthRow;
  const mouth2 = talkMouth2 ?? mouthRow;
  const talk1: Frame = [...top, eyeTop, eyeBottom, mouth1, ...bottom];
  const talk2: Frame = [...top, eyeTop, eyeBottom, mouth2, ...bottom];

  return { idle1, idle2, blink, talk1, talk2 };
}

// ── Mood-specific eye and mouth rows ──

// Happy: squint eyes (highlight bumps up), wide smile
const happyEyeTop: PixelColor[] =    [_, _, S, B, W, D, B, B, B, W, D, B, H, _, _, _];
const happyEyeBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const happyBlinkTop: PixelColor[] =    [_, _, S, B, B, B, B, B, B, B, B, B, H, _, _, _];
const happyBlinkBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const happyMouth: PixelColor[] =       [_, _, S, B, B, _, D, _, D, _, B, B, H, _, _, _];

// Content: normal open eyes, gentle smile
const contentEyeTop: PixelColor[] =    [_, _, S, B, W, D, B, B, B, W, D, B, H, _, _, _];
const contentEyeBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const contentBlinkTop: PixelColor[] =    [_, _, S, B, B, B, B, B, B, B, B, B, H, _, _, _];
const contentBlinkBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const contentMouth: PixelColor[] =       [_, _, S, B, B, B, _, D, D, _, B, B, H, _, _, _];

// Neutral: normal eyes, flat mouth
const neutralEyeTop: PixelColor[] =    [_, _, S, B, W, D, B, B, B, W, D, B, H, _, _, _];
const neutralEyeBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const neutralBlinkTop: PixelColor[] =    [_, _, S, B, B, B, B, B, B, B, B, B, H, _, _, _];
const neutralBlinkBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const neutralMouth: PixelColor[] =       [_, _, S, B, B, B, _, D, _, B, B, B, H, _, _, _];

// Sad: normal eyes, frown
const sadEyeTop: PixelColor[] =    [_, _, S, B, W, D, B, B, B, W, D, B, H, _, _, _];
const sadEyeBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const sadBlinkTop: PixelColor[] =    [_, _, S, B, B, B, B, B, B, B, B, B, H, _, _, _];
const sadBlinkBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const sadMouth: PixelColor[] =       [_, _, S, B, B, D, _, _, _, D, B, B, H, _, _, _];

// Critical: half-closed eyes (top row hidden), tiny dot mouth
const critEyeTop: PixelColor[] =    [_, _, S, B, B, B, B, B, B, B, B, B, H, _, _, _];
const critEyeBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const critBlinkTop: PixelColor[] =    [_, _, S, B, B, B, B, B, B, B, B, B, H, _, _, _];
const critBlinkBottom: PixelColor[] = [_, _, S, B, D, D, B, B, B, D, D, B, H, _, _, _];
const critMouth: PixelColor[] =       [_, _, S, B, B, B, B, D, B, B, B, B, H, _, _, _];

// ── Talk mouth rows (open / closed alternation) ──
// talk1 = mouth open (small O), talk2 = mouth closed (reuse mood mouth or flat)
const happyTalkOpen: PixelColor[] =    [_, _, S, B, B, B, D, D, D, _, B, B, H, _, _, _];
const happyTalkClosed: PixelColor[] =  [_, _, S, B, B, B, _, D, _, B, B, B, H, _, _, _];
const contentTalkOpen: PixelColor[] =  [_, _, S, B, B, B, D, D, D, _, B, B, H, _, _, _];
const contentTalkClosed: PixelColor[] = [_, _, S, B, B, B, B, D, B, B, B, B, H, _, _, _];
const neutralTalkOpen: PixelColor[] =  [_, _, S, B, B, B, D, D, D, _, B, B, H, _, _, _];
const neutralTalkClosed: PixelColor[] = [_, _, S, B, B, B, B, D, B, B, B, B, H, _, _, _];
const sadTalkOpen: PixelColor[] =      [_, _, S, B, B, B, D, D, D, _, B, B, H, _, _, _];
const sadTalkClosed: PixelColor[] =    [_, _, S, B, B, D, B, B, B, D, B, B, H, _, _, _];
const critTalkOpen: PixelColor[] =     [_, _, S, B, B, B, B, D, D, B, B, B, H, _, _, _];
const critTalkClosed: PixelColor[] =   [_, _, S, B, B, B, B, D, B, B, B, B, H, _, _, _];

export const FRAMES: Record<Mood, MoodFrames> = {
  happy: makeFrames(happyEyeTop, happyEyeBottom, happyBlinkTop, happyBlinkBottom, happyMouth, happyTalkOpen, happyTalkClosed),
  content: makeFrames(contentEyeTop, contentEyeBottom, contentBlinkTop, contentBlinkBottom, contentMouth, contentTalkOpen, contentTalkClosed),
  neutral: makeFrames(neutralEyeTop, neutralEyeBottom, neutralBlinkTop, neutralBlinkBottom, neutralMouth, neutralTalkOpen, neutralTalkClosed),
  sad: makeFrames(sadEyeTop, sadEyeBottom, sadBlinkTop, sadBlinkBottom, sadMouth, sadTalkOpen, sadTalkClosed),
  critical: makeFrames(critEyeTop, critEyeBottom, critBlinkTop, critBlinkBottom, critMouth, critTalkOpen, critTalkClosed),
};

// ── Growth stage overlays (sparse frames, only accessory pixels) ──

function emptyFrame(): Frame {
  return Array.from({ length: 16 }, () => Array(16).fill(null) as PixelColor[]);
}

function makeOverlay(pixels: [number, number, string][]): Frame {
  const frame = emptyFrame();
  for (const [row, col, color] of pixels) {
    frame[row][col] = color;
  }
  return frame;
}

export const ACCESSORIES: Record<GrowthStage, Frame> = {
  sprout: makeOverlay([
    [2, 6, L], // leaf sprout (already in base, overlay for consistency)
  ]),
  young: makeOverlay([
    [1, 6, L],
    [1, 7, L],
    [2, 6, L],
    [2, 7, L],
    [2, 8, L],
    [3, 10, L], // bud on right
    [2, 10, A],
  ]),
  mature: makeOverlay([
    [1, 5, L],
    [1, 6, L],
    [1, 7, L],
    [1, 8, L],
    [2, 4, L],
    [2, 5, L],
    [2, 6, L],
    [2, 7, L],
    [2, 8, L],
    [3, 10, L],
    [2, 10, L],
    [1, 10, A], // flower pixel
    [1, 11, A],
  ]),
  elder: makeOverlay([
    [0, 5, L],
    [0, 6, L],
    [1, 4, L],
    [1, 5, L],
    [1, 6, L],
    [1, 7, L],
    [1, 8, L],
    [2, 3, L],
    [2, 4, L],
    [2, 5, L],
    [2, 6, L],
    [2, 7, L],
    [2, 8, L],
    [2, 9, L],
    [3, 10, L],
    [2, 10, L],
    [1, 10, A],
    [1, 11, A],
    [8, 13, S], // mushroom stem (outside wider body)
    [7, 13, PALETTE.moss200], // mushroom cap
    [7, 14, PALETTE.moss200],
  ]),
};

// ── Dormant overlay (wild/overgrown when all stats at floor) ──

export const DORMANT_OVERLAY: Frame = makeOverlay([
  // Droopy overgrowth on top
  [0, 6, L],
  [0, 7, L],
  [0, 8, L],
  [1, 5, S],
  [1, 9, S],
  // Tendrils on left body edge
  [4, 1, S],
  [5, 1, L],
  [5, 2, S],
  [6, 1, L],
  // Tendrils on right body edge
  [4, 13, S],
  [5, 13, L],
  [5, 12, S],
  [6, 13, L],
  // Extra mushrooms left
  [8, 1, A],
  [8, 2, A],
  [9, 2, S],
  // Extra mushrooms right
  [7, 13, A],
  [7, 14, A],
  [8, 14, S],
]);

/** Merge a base frame with a sparse overlay (overlay wins on non-null) */
export function mergeFrames(base: Frame, overlay: Frame): Frame {
  return base.map((row, y) =>
    row.map((pixel, x) => overlay[y]?.[x] ?? pixel),
  );
}
