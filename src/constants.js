/* ─── Palette ─── */
export const P = {
  // Page surface (clean off-white — unchanged so book pages stay legible)
  parchment:  "#F8F4EE",
  parchLight: "#FFFCF7",
  parchDark:  "#EDE6D8",
  parchDeep:  "#D4C9B0",
  // Ink
  ink:        "#12111A",
  inkMid:     "#2A2840",
  inkL:       "#5C5880",
  inkFaint:   "#9896B0",
  // Primary accent — indigo/violet
  gold:       "#6C63FF",
  goldL:      "#9D97FF",
  goldGlow:   "#D4D1FF",
  // Secondary accent — coral/rose
  berry:      "#E8445A",
  berryL:     "#F28A97",
  // Tertiary accents
  forest:     "#00B894",
  forestL:    "#55D8BF",
  sky:        "#0984E3",
  skyL:       "#74B9FF",
  // App shell — deep slate
  desk:       "#0D0C1A",
  leather:    "#13111F",
  leatherMid: "#1E1B30",
  leatherL:   "#2D2A45",
  // Utility
  warm:       "#FFFFFF",
  cream:      "#F0EEF8",
};

/* ─── Fonts ─── */
export const F = {
  display: "'Cinzel Decorative', serif",   // Big display titles only
  heading: "'Cinzel', serif",              // Section headers, book title
  body:    "'Nunito', sans-serif",         // UI labels, buttons, meta
  story:   "'EB Garamond', serif",         // Story body text
};

/* ─── Character Options ─── */
export const COLORS = [
  "Orange", "Golden yellow", "Rusty red", "Chocolate brown",
  "Midnight black", "Soft grey", "Snow white", "Cream",
  "Sky blue", "Teal", "Emerald green", "Forest green",
  "Royal purple", "Lavender", "Sunset pink", "Rose gold",
];

export const TRAITS = [
  "Brave", "Curious", "Mischievous", "Kind",
  "Clever", "Silly", "Adventurous", "Shy",
];

/* ─── Story Settings ─── */
export const AGE_RANGES = [
  { label: "2 – 4",  id: "2-4",   desc: "Toddler",    hint: "Tiny sentences, big sounds, lots of repetition (~40 words/page)" },
  { label: "4 – 6",  id: "4-6",   desc: "Pre-school",  hint: "Simple words, playful rhythm (~60 words/page)" },
  { label: "6 – 8",  id: "6-8",   desc: "Early reader", hint: "Richer descriptions, more plot (~100 words/page)" },
  { label: "8 – 10", id: "8-10",  desc: "Confident",    hint: "Chapter-book style, complex vocab (~130 words/page)" },
  { label: "10 – 12",id: "10-12", desc: "Pre-teen",     hint: "Sophisticated themes and character depth (~160 words/page)" },
];

export const GENRES = [
  { id: "Adventure", emoji: "⚔️",  label: "Adventure" },
  { id: "Funny",     emoji: "😂",  label: "Funny" },
  { id: "Magical",   emoji: "✨",  label: "Magical" },
  { id: "Mystery",   emoji: "🔍",  label: "Mystery" },
  { id: "Friendship",emoji: "🤝",  label: "Friendship" },
  { id: "Learning",  emoji: "🧠",  label: "Learning" },
  { id: "Bedtime",   emoji: "🌙",  label: "Bedtime" },
  { id: "Spooky",    emoji: "👻",  label: "Spooky" },
];

/* ─── Loading Messages ─── */
export const STORY_LOADING_MSGS = [
  "Dipping the quill in magic ink…",
  "Asking the story owl for ideas…",
  "Sprinkling imagination dust…",
  "Whispering to the characters…",
  "Painting the scene with watercolours…",
  "The story tree is growing its branches…",
  "Consulting the ancient storybook…",
  "Mixing colours for the illustration…",
];
