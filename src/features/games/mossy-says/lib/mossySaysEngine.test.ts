import { describe, it, expect } from "vitest";
import {
  STAT_ICONS,
  createGame,
  extendSequence,
  handleInput,
  calculateScore,
} from "./mossySaysEngine";
import type { MossySaysState } from "./mossySaysEngine";

describe("createGame", () => {
  it("starts with sequence length 3", () => {
    const game = createGame();
    expect(game.sequence).toHaveLength(3);
  });

  it("starts at round 1", () => {
    const game = createGame();
    expect(game.round).toBe(1);
  });

  it("starts in showing phase", () => {
    const game = createGame();
    expect(game.phase).toBe("showing");
  });

  it("starts with showingIndex -1", () => {
    const game = createGame();
    expect(game.showingIndex).toBe(-1);
  });

  it("starts with empty playerInput", () => {
    const game = createGame();
    expect(game.playerInput).toEqual([]);
  });

  it("has timeLimit of 120_000", () => {
    const game = createGame();
    expect(game.timeLimit).toBe(120_000);
  });

  it("all sequence elements are valid StatIcons", () => {
    const game = createGame();
    for (const icon of game.sequence) {
      expect(STAT_ICONS).toContain(icon);
    }
  });
});

describe("extendSequence", () => {
  it("adds exactly 1 element to the sequence", () => {
    const game = createGame();
    const extended = extendSequence(game);
    expect(extended.sequence).toHaveLength(game.sequence.length + 1);
  });

  it("increments the round", () => {
    const game = createGame();
    const extended = extendSequence(game);
    expect(extended.round).toBe(game.round + 1);
  });

  it("resets playerInput to empty", () => {
    const game = createGame();
    // Simulate some input first
    const withInput = { ...game, playerInput: [game.sequence[0]] };
    const extended = extendSequence(withInput);
    expect(extended.playerInput).toEqual([]);
  });

  it("sets phase to showing", () => {
    const game = createGame();
    const withSuccess = { ...game, phase: "success" as const };
    const extended = extendSequence(withSuccess);
    expect(extended.phase).toBe("showing");
  });

  it("sets showingIndex to -1", () => {
    const game = createGame();
    const extended = extendSequence(game);
    expect(extended.showingIndex).toBe(-1);
  });

  it("preserves the original sequence elements", () => {
    const game = createGame();
    const originalSequence = [...game.sequence];
    const extended = extendSequence(game);
    expect(extended.sequence.slice(0, originalSequence.length)).toEqual(
      originalSequence,
    );
  });

  it("new element is a valid StatIcon", () => {
    const game = createGame();
    const extended = extendSequence(game);
    const newIcon = extended.sequence[extended.sequence.length - 1];
    expect(STAT_ICONS).toContain(newIcon);
  });
});

describe("handleInput", () => {
  function makeTestGame(sequence: MossySaysState["sequence"]): MossySaysState {
    return {
      sequence,
      playerInput: [],
      round: 1,
      phase: "input",
      showingIndex: -1,
      startedAt: Date.now(),
      timeLimit: 120_000,
    };
  }

  it("correct input advances playerInput", () => {
    const game = makeTestGame(["hunger", "hydration", "happiness"]);
    const { state, correct, roundComplete } = handleInput(game, "hunger");
    expect(correct).toBe(true);
    expect(roundComplete).toBe(false);
    expect(state.playerInput).toEqual(["hunger"]);
  });

  it("wrong input sets phase to fail", () => {
    const game = makeTestGame(["hunger", "hydration", "happiness"]);
    const { state, correct, roundComplete } = handleInput(game, "energy");
    expect(correct).toBe(false);
    expect(roundComplete).toBe(false);
    expect(state.phase).toBe("fail");
  });

  it("wrong input still appends to playerInput", () => {
    const game = makeTestGame(["hunger", "hydration", "happiness"]);
    const { state } = handleInput(game, "energy");
    expect(state.playerInput).toEqual(["energy"]);
  });

  it("correct full sequence sets phase to success and roundComplete true", () => {
    const game = makeTestGame(["hunger", "hydration", "happiness"]);

    const r1 = handleInput(game, "hunger");
    expect(r1.correct).toBe(true);
    expect(r1.roundComplete).toBe(false);

    const r2 = handleInput(r1.state, "hydration");
    expect(r2.correct).toBe(true);
    expect(r2.roundComplete).toBe(false);

    const r3 = handleInput(r2.state, "happiness");
    expect(r3.correct).toBe(true);
    expect(r3.roundComplete).toBe(true);
    expect(r3.state.phase).toBe("success");
  });

  it("handles single-element sequence correctly", () => {
    const game = makeTestGame(["energy"]);
    const { state, correct, roundComplete } = handleInput(game, "energy");
    expect(correct).toBe(true);
    expect(roundComplete).toBe(true);
    expect(state.phase).toBe("success");
  });

  it("fails on second input when wrong", () => {
    const game = makeTestGame(["hunger", "hydration", "happiness"]);
    const r1 = handleInput(game, "hunger");
    const r2 = handleInput(r1.state, "energy"); // wrong
    expect(r2.correct).toBe(false);
    expect(r2.state.phase).toBe("fail");
    expect(r2.state.playerInput).toEqual(["hunger", "energy"]);
  });
});

describe("calculateScore", () => {
  function makeState(
    round: number,
    phase: MossySaysState["phase"],
  ): MossySaysState {
    return {
      sequence: [],
      playerInput: [],
      round,
      phase,
      showingIndex: -1,
      startedAt: Date.now(),
      timeLimit: 120_000,
    };
  }

  it("returns round on success", () => {
    expect(calculateScore(makeState(3, "success"))).toBe(3);
  });

  it("returns round - 1 on fail", () => {
    expect(calculateScore(makeState(3, "fail"))).toBe(2);
  });

  it("returns round - 1 on timeout", () => {
    expect(calculateScore(makeState(5, "timeout"))).toBe(4);
  });

  it("returns 0 for fail on round 1", () => {
    expect(calculateScore(makeState(1, "fail"))).toBe(0);
  });

  it("returns 1 for success on round 1", () => {
    expect(calculateScore(makeState(1, "success"))).toBe(1);
  });
});
