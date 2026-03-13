export interface BreakSuggestion {
  category: "physical" | "eyes" | "hydration" | "mindfulness" | "social";
  text: string;
}

export const BREAK_SUGGESTIONS: BreakSuggestion[] = [
  // Physical (8)
  { category: "physical", text: "Stretch your arms above your head" },
  { category: "physical", text: "Stand up and walk around" },
  { category: "physical", text: "Roll your shoulders back and forward" },
  { category: "physical", text: "Do a quick neck stretch" },
  { category: "physical", text: "Touch your toes or stretch your hamstrings" },
  { category: "physical", text: "Do 10 desk push-ups or squats" },
  { category: "physical", text: "Shake out your hands and wiggle your fingers" },
  { category: "physical", text: "Stand on one foot for 30 seconds each side" },

  // Eyes (5)
  { category: "eyes", text: "Look away from the screen for 20 seconds" },
  { category: "eyes", text: "Rest your eyes — close them for a moment" },
  { category: "eyes", text: "Focus on something far away for 20 seconds" },
  { category: "eyes", text: "Blink rapidly 10 times to refresh your eyes" },
  { category: "eyes", text: "Cup your palms over closed eyes for 30 seconds" },

  // Hydration (4)
  { category: "hydration", text: "Refill your water bottle" },
  { category: "hydration", text: "Drink a full glass of water" },
  { category: "hydration", text: "Make yourself a cup of tea" },
  { category: "hydration", text: "Have a small healthy snack" },

  // Mindfulness (5)
  { category: "mindfulness", text: "Take a few deep breaths" },
  { category: "mindfulness", text: "Notice 3 things you can hear right now" },
  { category: "mindfulness", text: "Do a 30-second body scan from head to toes" },
  { category: "mindfulness", text: "Take 5 slow, deep breaths in through your nose" },
  { category: "mindfulness", text: "Sit quietly and just listen for a moment" },

  // Social (4)
  { category: "social", text: "Send a quick message to a friend" },
  { category: "social", text: "Step outside and say hi to someone" },
  { category: "social", text: "Share something you're working on with a colleague" },
  { category: "social", text: "Take a moment to appreciate someone nearby" },
];

export const BREAK_SUGGESTION_TEXTS = BREAK_SUGGESTIONS.map((s) => s.text);
