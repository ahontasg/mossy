export interface MemoryCard {
  id: number; // 0-11 position index
  specimenId: string;
  pairIndex: number; // 0-5 (which pair)
  flipped: boolean;
  matched: boolean;
}

export interface MemoryState {
  cards: MemoryCard[];
  flippedIds: number[]; // currently face-up (max 2)
  matchedPairs: number;
  totalPairs: number; // 6
  startedAt: number;
  status: "playing" | "won" | "time_up";
  timeLimit: number; // 60_000ms
}

/**
 * Fisher-Yates shuffle (in-place). Returns the same array reference.
 */
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
  return array;
}

/**
 * Pick `count` random specimen IDs from the discovered list (no duplicates).
 * Uses Fisher-Yates shuffle on a copy.
 */
export function selectSpecimens(
  discoveredIds: string[],
  count: number,
): string[] {
  const copy = [...discoveredIds];
  shuffle(copy);
  return copy.slice(0, count);
}

/**
 * Create a new Memory Match game from 6 specimen IDs.
 * Produces 12 cards (2 per specimen), shuffled.
 */
export function createGame(specimenIds: string[]): MemoryState {
  const cards: MemoryCard[] = [];
  for (let pairIndex = 0; pairIndex < specimenIds.length; pairIndex++) {
    const specimenId = specimenIds[pairIndex];
    // Two cards per specimen
    cards.push({
      id: -1, // placeholder, assigned after shuffle
      specimenId,
      pairIndex,
      flipped: false,
      matched: false,
    });
    cards.push({
      id: -1,
      specimenId,
      pairIndex,
      flipped: false,
      matched: false,
    });
  }

  shuffle(cards);

  // Assign position-based IDs after shuffle
  for (let i = 0; i < cards.length; i++) {
    cards[i].id = i;
  }

  return {
    cards,
    flippedIds: [],
    matchedPairs: 0,
    totalPairs: specimenIds.length,
    startedAt: Date.now(),
    status: "playing",
    timeLimit: 60_000,
  };
}

/**
 * Flip a card face-up. Returns a new state (immutable).
 *
 * Rules:
 * - Can't flip if game is not "playing"
 * - Can't flip if card is already matched
 * - Can't flip if card is already flipped
 * - Can't flip if 2 cards are already face-up
 */
export function flipCard(state: MemoryState, cardId: number): MemoryState {
  if (state.status !== "playing") return state;
  if (state.flippedIds.length >= 2) return state;

  const card = state.cards[cardId];
  if (!card) return state;
  if (card.matched) return state;
  if (card.flipped) return state;

  const newCards = state.cards.map((c) =>
    c.id === cardId ? { ...c, flipped: true } : c,
  );

  return {
    ...state,
    cards: newCards,
    flippedIds: [...state.flippedIds, cardId],
  };
}

/**
 * Resolve a flip when 2 cards are face-up.
 *
 * If pair matches: mark both matched, increment matchedPairs, check for win.
 * If no match: flip both back.
 * Always clears flippedIds.
 */
export function resolveFlip(state: MemoryState): {
  state: MemoryState;
  matched: boolean;
} {
  if (state.flippedIds.length !== 2) {
    return { state, matched: false };
  }

  const [id1, id2] = state.flippedIds;
  const card1 = state.cards[id1];
  const card2 = state.cards[id2];

  const isMatch = card1.pairIndex === card2.pairIndex;

  let newCards: MemoryCard[];
  let newMatchedPairs = state.matchedPairs;

  if (isMatch) {
    newMatchedPairs += 1;
    newCards = state.cards.map((c) =>
      c.id === id1 || c.id === id2 ? { ...c, matched: true } : c,
    );
  } else {
    newCards = state.cards.map((c) =>
      c.id === id1 || c.id === id2 ? { ...c, flipped: false } : c,
    );
  }

  const won = newMatchedPairs === state.totalPairs;

  return {
    state: {
      ...state,
      cards: newCards,
      flippedIds: [],
      matchedPairs: newMatchedPairs,
      status: won ? "won" : state.status,
    },
    matched: isMatch,
  };
}

/**
 * Calculate score for a Memory Match game.
 *
 * Formula: (matchedPairs * 100) + max(0, (60 - elapsedSeconds) * 5)
 * Max possible: 600 + 300 = 900
 */
export function calculateScore(matchedPairs: number, elapsedMs: number): number {
  const pairScore = matchedPairs * 100;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const timeBonus = Math.max(0, (60 - elapsedSeconds) * 5);
  return pairScore + timeBonus;
}
