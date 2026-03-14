export type StatIcon = "energy" | "hydration" | "happiness" | "hunger";

export const STAT_ICONS: StatIcon[] = [
  "hunger",
  "hydration",
  "happiness",
  "energy",
];

export interface MossySaysState {
  sequence: StatIcon[];
  playerInput: StatIcon[];
  round: number; // starts at 1
  phase: "showing" | "input" | "success" | "fail" | "timeout";
  showingIndex: number; // which element is lit during showing phase
  startedAt: number;
  timeLimit: number; // 120_000ms
}

/**
 * Pick a random icon from STAT_ICONS.
 */
function randomIcon(): StatIcon {
  return STAT_ICONS[Math.floor(Math.random() * STAT_ICONS.length)];
}

/**
 * Create a new Mossy Says game.
 * Starts with a sequence of 3 random icons, round 1.
 */
export function createGame(): MossySaysState {
  const sequence: StatIcon[] = [];
  for (let i = 0; i < 3; i++) {
    sequence.push(randomIcon());
  }

  return {
    sequence,
    playerInput: [],
    round: 1,
    phase: "showing",
    showingIndex: -1,
    startedAt: Date.now(),
    timeLimit: 120_000,
  };
}

/**
 * Extend the sequence by 1 random icon and advance to the next round.
 * Resets playerInput, sets phase to "showing", showingIndex to -1.
 */
export function extendSequence(state: MossySaysState): MossySaysState {
  return {
    ...state,
    sequence: [...state.sequence, randomIcon()],
    playerInput: [],
    round: state.round + 1,
    phase: "showing",
    showingIndex: -1,
  };
}

/**
 * Handle a player input.
 *
 * - Appends icon to playerInput
 * - Checks if it matches the expected sequence element
 * - Wrong: phase -> "fail"
 * - Correct + complete: phase -> "success"
 * - Correct + incomplete: continues
 */
export function handleInput(
  state: MossySaysState,
  icon: StatIcon,
): { state: MossySaysState; correct: boolean; roundComplete: boolean } {
  const inputIndex = state.playerInput.length;
  const expected = state.sequence[inputIndex];
  const newPlayerInput = [...state.playerInput, icon];

  if (icon !== expected) {
    return {
      state: {
        ...state,
        playerInput: newPlayerInput,
        phase: "fail",
      },
      correct: false,
      roundComplete: false,
    };
  }

  const roundComplete = newPlayerInput.length === state.sequence.length;

  return {
    state: {
      ...state,
      playerInput: newPlayerInput,
      phase: roundComplete ? "success" : state.phase,
    },
    correct: true,
    roundComplete,
  };
}

/**
 * Calculate the score for a Mossy Says game.
 *
 * Returns the longest fully completed sequence length:
 * - On "success" phase: return `round` (current round was completed)
 * - Otherwise: return `round - 1` (current round was not completed)
 */
export function calculateScore(state: MossySaysState): number {
  if (state.phase === "success") {
    return state.round;
  }
  return state.round - 1;
}
