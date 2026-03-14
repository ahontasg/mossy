import { describe, it, expect } from "vitest";
import {
  selectSpecimens,
  createGame,
  flipCard,
  resolveFlip,
  calculateScore,
} from "./memoryEngine";

describe("selectSpecimens", () => {
  const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];

  it("picks the correct count", () => {
    const picked = selectSpecimens(ids, 6);
    expect(picked).toHaveLength(6);
  });

  it("returns no duplicates", () => {
    const picked = selectSpecimens(ids, 6);
    expect(new Set(picked).size).toBe(6);
  });

  it("only contains IDs from the source list", () => {
    const picked = selectSpecimens(ids, 6);
    for (const id of picked) {
      expect(ids).toContain(id);
    }
  });

  it("handles count equal to list length", () => {
    const picked = selectSpecimens(ids, ids.length);
    expect(picked).toHaveLength(ids.length);
    expect(new Set(picked).size).toBe(ids.length);
  });
});

describe("createGame", () => {
  const specimenIds = ["s1", "s2", "s3", "s4", "s5", "s6"];

  it("produces 12 cards", () => {
    const state = createGame(specimenIds);
    expect(state.cards).toHaveLength(12);
  });

  it("has 6 pairs", () => {
    const state = createGame(specimenIds);
    expect(state.totalPairs).toBe(6);
  });

  it("each specimen appears exactly twice", () => {
    const state = createGame(specimenIds);
    const counts: Record<string, number> = {};
    for (const card of state.cards) {
      counts[card.specimenId] = (counts[card.specimenId] || 0) + 1;
    }
    for (const id of specimenIds) {
      expect(counts[id]).toBe(2);
    }
  });

  it("assigns unique position IDs 0-11", () => {
    const state = createGame(specimenIds);
    const ids = state.cards.map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("starts with status playing and 0 matched pairs", () => {
    const state = createGame(specimenIds);
    expect(state.status).toBe("playing");
    expect(state.matchedPairs).toBe(0);
    expect(state.flippedIds).toEqual([]);
  });

  it("has timeLimit of 60_000", () => {
    const state = createGame(specimenIds);
    expect(state.timeLimit).toBe(60_000);
  });

  it("all cards start face-down and unmatched", () => {
    const state = createGame(specimenIds);
    for (const card of state.cards) {
      expect(card.flipped).toBe(false);
      expect(card.matched).toBe(false);
    }
  });
});

describe("flipCard", () => {
  function makeTestGame() {
    // Deterministic game for testing — cards in known order
    return createGame(["s1", "s2", "s3", "s4", "s5", "s6"]);
  }

  it("flips a face-down card", () => {
    const game = makeTestGame();
    const next = flipCard(game, 0);
    expect(next.cards[0].flipped).toBe(true);
    expect(next.flippedIds).toEqual([0]);
  });

  it("can't flip an already-flipped card", () => {
    const game = makeTestGame();
    const flipped = flipCard(game, 0);
    const same = flipCard(flipped, 0);
    expect(same.flippedIds).toEqual([0]);
  });

  it("can't flip a matched card", () => {
    const game = makeTestGame();
    const withMatched = {
      ...game,
      cards: game.cards.map((c) =>
        c.id === 0 ? { ...c, matched: true } : c,
      ),
    };
    const result = flipCard(withMatched, 0);
    expect(result.flippedIds).toEqual([]);
  });

  it("can't flip more than 2 cards", () => {
    const game = makeTestGame();
    const flip1 = flipCard(game, 0);
    const flip2 = flipCard(flip1, 1);
    expect(flip2.flippedIds).toHaveLength(2);
    const flip3 = flipCard(flip2, 2);
    // Should be unchanged — still 2 flipped
    expect(flip3.flippedIds).toHaveLength(2);
    expect(flip3.cards[2].flipped).toBe(false);
  });

  it("can't flip when game is not playing", () => {
    const game = makeTestGame();
    const wonGame = { ...game, status: "won" as const };
    const result = flipCard(wonGame, 0);
    expect(result.flippedIds).toEqual([]);
  });
});

describe("resolveFlip", () => {
  it("detects a matching pair", () => {
    const game = createGame(["s1", "s2", "s3", "s4", "s5", "s6"]);
    // Find the two cards with the same pairIndex
    const pair = game.cards.filter((c) => c.pairIndex === 0);
    expect(pair).toHaveLength(2);

    let state = flipCard(game, pair[0].id);
    state = flipCard(state, pair[1].id);

    const { state: resolved, matched } = resolveFlip(state);
    expect(matched).toBe(true);
    expect(resolved.matchedPairs).toBe(1);
    expect(resolved.flippedIds).toEqual([]);
    expect(resolved.cards[pair[0].id].matched).toBe(true);
    expect(resolved.cards[pair[1].id].matched).toBe(true);
  });

  it("resets non-matching pair", () => {
    const game = createGame(["s1", "s2", "s3", "s4", "s5", "s6"]);
    // Find two cards with different pairIndexes
    const card1 = game.cards.find((c) => c.pairIndex === 0)!;
    const card2 = game.cards.find((c) => c.pairIndex === 1)!;

    let state = flipCard(game, card1.id);
    state = flipCard(state, card2.id);

    const { state: resolved, matched } = resolveFlip(state);
    expect(matched).toBe(false);
    expect(resolved.matchedPairs).toBe(0);
    expect(resolved.flippedIds).toEqual([]);
    expect(resolved.cards[card1.id].flipped).toBe(false);
    expect(resolved.cards[card2.id].flipped).toBe(false);
  });

  it("does nothing when fewer than 2 cards are flipped", () => {
    const game = createGame(["s1", "s2", "s3", "s4", "s5", "s6"]);
    const state = flipCard(game, 0);
    const { state: resolved, matched } = resolveFlip(state);
    expect(matched).toBe(false);
    expect(resolved).toBe(state); // same reference, no change
  });

  it("detects win when all 6 pairs matched", () => {
    const game = createGame(["s1", "s2", "s3", "s4", "s5", "s6"]);

    let state = game;
    for (let pairIdx = 0; pairIdx < 6; pairIdx++) {
      const pair = state.cards.filter((c) => c.pairIndex === pairIdx);
      state = flipCard(state, pair[0].id);
      state = flipCard(state, pair[1].id);
      const result = resolveFlip(state);
      state = result.state;
    }

    expect(state.matchedPairs).toBe(6);
    expect(state.status).toBe("won");
  });
});

describe("calculateScore", () => {
  it("gives full score for instant completion of all pairs", () => {
    // 6 pairs * 100 + (60 - 0) * 5 = 600 + 300 = 900
    expect(calculateScore(6, 0)).toBe(900);
  });

  it("gives 0 time bonus at exactly 60 seconds", () => {
    // 6 pairs * 100 + (60 - 60) * 5 = 600 + 0 = 600
    expect(calculateScore(6, 60_000)).toBe(600);
  });

  it("gives 0 time bonus after 60 seconds", () => {
    expect(calculateScore(6, 90_000)).toBe(600);
  });

  it("returns 0 for 0 pairs and elapsed time past limit", () => {
    expect(calculateScore(0, 61_000)).toBe(0);
  });

  it("returns only time bonus for 0 pairs at 0ms", () => {
    // 0 * 100 + (60 - 0) * 5 = 0 + 300 = 300
    expect(calculateScore(0, 0)).toBe(300);
  });

  it("applies formula correctly for partial completion", () => {
    // 3 pairs * 100 + (60 - 30) * 5 = 300 + 150 = 450
    expect(calculateScore(3, 30_000)).toBe(450);
  });
});
