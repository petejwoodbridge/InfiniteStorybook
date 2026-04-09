import { useState, useEffect } from "react";
import { P } from "./constants";
import SetupScreen from "./SetupScreen";
import StoryScreen from "./StoryScreen";
import LibraryScreen from "./LibraryScreen";
import { SAMPLE_BOOKS } from "./sampleBooks";
import { imgSave, imgLoad, imgDelete } from "./imageStore";

/* Inject Google Fonts */
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Nunito:wght@400;500;600;700;800&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

/* ── Global CSS ── */
const GLOBAL_CSS = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes quill {
  0%, 100% { transform: rotate(-5deg); }
  50%      { transform: rotate(5deg) translateY(-4px); }
}
@keyframes dots {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

/* ── Page turn: 3D perspective swipe ── */
@keyframes pageFadeOut {
  0%   { opacity: 1; transform: perspective(1400px) rotateY(0deg)    translateX(0); }
  100% { opacity: 0; transform: perspective(1400px) rotateY(8deg)     translateX(20px) brightness(0.85); }
}
@keyframes pageTurnIn {
  0%   { opacity: 0; transform: perspective(1400px) rotateY(-14deg) translateX(-30px); filter: brightness(0.85); }
  60%  {             transform: perspective(1400px) rotateY(2deg)   translateX(4px);  filter: brightness(1.04); }
  100% { opacity: 1; transform: perspective(1400px) rotateY(0deg)   translateX(0);   filter: brightness(1); }
}

.page-turn-out { animation: pageFadeOut 0.2s ease-in  forwards; }
.page-turn-in  { animation: pageTurnIn  0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

/* ── Two-page spread — portrait pages ── */
.book-spread {
  display: flex;
  aspect-ratio: 3 / 2;
}
.book-page-left {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-width: 0;
  aspect-ratio: 3 / 4;
}
.book-page-right {
  flex: 1;
  overflow-y: auto;
  position: relative;
  min-width: 0;
  aspect-ratio: 3 / 4;
  border-left: 2px solid rgba(44,24,16,0.12);
  box-shadow: inset 8px 0 24px rgba(44,24,16,0.08);
  display: flex;
  flex-direction: column;
}

/* Gutter spine shadow */
.book-page-left::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 20px; height: 100%;
  background: linear-gradient(to left, rgba(28,14,8,0.12), transparent);
  pointer-events: none;
}

/* Full-bleed cover — sized by its parent (fills one page slot) */
.book-cover {
  width: 100%; height: 100%;
  position: relative;
  overflow: hidden;
}
.book-cover img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.book-cover-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 32px;
  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%);
}

@media (max-width: 640px) {
  .book-spread { flex-direction: column; aspect-ratio: auto; }
  .book-page-left  { aspect-ratio: 4 / 3; }
  .book-page-right { aspect-ratio: auto; min-height: 280px;
    border-left: none; border-top: 2px solid rgba(44,24,16,0.1);
    box-shadow: inset 0 6px 18px rgba(44,24,16,0.07); }
  .book-page-left::after { display: none; }
  .book-shell-mobile { border-left-width: 8px !important; border-radius: 3px 10px 10px 3px !important; }
}
`;

/* ── localStorage helpers ── */
const LS_KEY   = "isb_library";
const SEED_KEY = "isb_seeded_v3"; // bump to re-seed with updated sample books + names

const CHILD_NAMES = [
  "Mia","Leo","Zara","Sam","Alex","Lily","Noah","Emma",
  "Finn","Ava","Jake","Luna","Eli","Chloe","Oscar",
  "Ruby","Max","Isla","Theo","Nora",
];
function randomChildName() {
  return CHILD_NAMES[Math.floor(Math.random() * CHILD_NAMES.length)];
}

// Image helpers — IndexedDB (no quota limit), with localStorage migration
export async function saveCoverImg(id, b64) { await imgSave(`cover_${id}`, b64); }
export async function saveCharImg(id, b64)  { await imgSave(`char_${id}`,  b64); }

export async function loadCoverImg(id) {
  const val = await imgLoad(`cover_${id}`);
  if (val) return val;
  // Migrate from old localStorage key if present
  try {
    const ls = localStorage.getItem(`isb_cover_${id}`);
    if (ls) { imgSave(`cover_${id}`, ls); localStorage.removeItem(`isb_cover_${id}`); return ls; }
  } catch {}
  return null;
}
export async function loadCharImg(id) {
  const val = await imgLoad(`char_${id}`);
  if (val) return val;
  // Migrate from old localStorage key if present
  try {
    const ls = localStorage.getItem(`isb_char_${id}`);
    if (ls) { imgSave(`char_${id}`, ls); localStorage.removeItem(`isb_char_${id}`); return ls; }
  } catch {}
  return null;
}

export function loadLibrary() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

    // Migration: strip any embedded image blobs still in the JSON (move to IndexedDB)
    let dirty = false;
    const migrated = raw.map(b => {
      const out = { ...b };
      if (out.coverImage) { saveCoverImg(out.id, out.coverImage); delete out.coverImage; dirty = true; }
      if (out.charImage)  { saveCharImg(out.id,  out.charImage);  delete out.charImage;  dirty = true; }
      return out;
    });
    if (dirty) localStorage.setItem(LS_KEY, JSON.stringify(migrated));

    // Ensure every book has a childName (assign random if missing)
    const named = migrated.map(b => {
      if (b.childName) return b;
      const sample = SAMPLE_BOOKS.find(s => s.id === b.id);
      return { ...b, childName: sample?.childName || randomChildName() };
    });
    if (named.some((b, i) => b !== migrated[i])) {
      localStorage.setItem(LS_KEY, JSON.stringify(named));
    }

    // Seed new sample books if not done for this version
    if (!localStorage.getItem(SEED_KEY)) {
      localStorage.setItem(SEED_KEY, "1");
      const existingIds = new Set(named.map(b => b.id));
      const toAdd = SAMPLE_BOOKS.filter(b => !existingIds.has(b.id));
      if (toAdd.length > 0) {
        const merged = [...toAdd, ...named];
        localStorage.setItem(LS_KEY, JSON.stringify(merged));
        return merged;
      }
    }

    return named;
  } catch { return []; }
}

export function saveBookToLib(book) {
  try {
    if (book.coverImage) saveCoverImg(book.id, book.coverImage); // fire-and-forget async
    const { coverImage: _c, charImage: _ch, ...lean } = book;
    const lib = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } })();
    const idx = lib.findIndex((b) => b.id === lean.id);
    if (idx >= 0) lib[idx] = lean; else lib.unshift(lean);
    localStorage.setItem(LS_KEY, JSON.stringify(lib.slice(0, 20)));
  } catch(e) { console.warn("Library save failed:", e.message); }
}

export function deleteBookFromLib(id) {
  const lib = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } })();
  localStorage.setItem(LS_KEY, JSON.stringify(lib.filter((b) => b.id !== id)));
  imgDelete(`cover_${id}`);
  imgDelete(`char_${id}`);
  try { localStorage.removeItem(`isb_cover_${id}`); } catch {}
  try { localStorage.removeItem(`isb_char_${id}`);  } catch {}
}

/* ── sessionStorage for API key ── */
const SS_KEY = "isb_gemkey";
function loadGemKey() { try { return sessionStorage.getItem(SS_KEY) || ""; } catch { return ""; } }
function saveGemKey(k) { try { sessionStorage.setItem(SS_KEY, k); } catch {} }

export default function App() {
  const [screen, setScreen]           = useState("setup"); // "setup" | "story" | "library"
  const [gemKey, setGemKey]           = useState(loadGemKey);
  const [storyConfig, setStoryConfig] = useState(null);   // active story (new or restored)

  /* Inject global CSS once */
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* Persist key to session whenever it changes */
  useEffect(() => { saveGemKey(gemKey); }, [gemKey]);

  const handleStart = (config) => {
    const id = Date.now().toString();
    const childName = config.childName || randomChildName();
    saveBookToLib({ id, title: "New Story\u2026", savedAt: new Date().toISOString(),
      charDesc: config.charDesc,
      prompts: config.prompts, childName,
      ageRange: config.ageRange, genre: config.genre,
      segments: [], choices: null, isComplete: false, coverImage: config.coverImage || null });
    setStoryConfig({ ...config, id, isNew: true, childName });
    setScreen("story");
  };

  const handleOpenBook = (savedBook) => {
    setStoryConfig({ ...savedBook, isNew: false });
    setScreen("story");
  };

  const handleGoToLibrary = () => {
    setStoryConfig(null);
    setScreen("library");
  };

  const handleNewStory = () => {
    setStoryConfig(null);
    setScreen("setup");
  };

  const wrapStyle = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0D0C1A 0%, #13111F 40%, #1A1730 70%, #0F0E1C 100%)",
    fontFamily: "'Nunito', sans-serif",
    padding: "24px 16px 80px",
  };

  return (
    <div style={wrapStyle}>
      {screen === "setup" && (
        <SetupScreen
          gemKey={gemKey}
          setGemKey={setGemKey}
          onStart={handleStart}
          onLibrary={handleGoToLibrary}
        />
      )}
      {screen === "library" && (
        <LibraryScreen
          gemKey={gemKey}
          onOpenBook={handleOpenBook}
          onNewStory={handleNewStory}
        />
      )}
      {screen === "story" && storyConfig && (
        <StoryScreen
          gemKey={gemKey}
          storyConfig={storyConfig}
          onGoToLibrary={handleGoToLibrary}
          onNewStory={handleNewStory}
        />
      )}
    </div>
  );
}



