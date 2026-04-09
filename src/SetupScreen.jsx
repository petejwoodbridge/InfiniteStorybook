import { useState, useEffect } from "react";
import { F, P, COLORS, TRAITS, AGE_RANGES, GENRES } from "./constants";
import { generateCharacter, generateBookCover } from "./api";
import { Loader, Input, Pills } from "./components";

const RAND_CHARS = [
  "tiny dragon","giant tortoise","sleepy owl","bouncy rabbit","sneaky fox",
  "purple elephant","glowing jellyfish","clockwork cat","baby kraken","moon wolf",
  "fluffy yeti","crystal deer","dancing crab","cloud bear","tiny wizard",
  "grumpy walrus","singing frog","invisible hamster","fire salamander","sky whale",
];
const RAND_PLACES = [
  "the bottom of the ocean","a floating island","an enchanted library","the back of the moon",
  "a bakery that bakes dreams","a rainbow staircase","a giant's coat pocket",
  "an underground carnival","a cloud city","a time-frozen forest",
  "a treehouse that moves","the inside of a snow globe","a glowing cave",
  "a desert made of sugar","a pirate ship in the stars",
];
const RAND_SURPRISES = [
  "a talking map","an upside-down house","a jar of bottled laughter","squeaky shoes",
  "a pet that speaks in riddles","invisible glue","a clock that runs backwards",
  "candy that changes your voice","a door with no wall","a friendly storm cloud",
  "a suitcase full of questions","glasses that show the future","a vanishing bridge",
  "exploding bubbles","a magic rubber duck",
];
const RAND_OUTFITS = [
  "a starry cape","a patchwork jacket","polka dot boots","a tiny top hat",
  "rainbow dungarees","a scarf made of clouds","a flower crown","golden armour",
  "a baker's apron","a velvet cloak","stripy socks","a detective's coat",
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export default function SetupScreen({ gemKey, setGemKey, onStart, onLibrary }) {
  const [prompts, setPrompts] = useState(["", "", ""]);
  const [childName, setChildName] = useState("");

  const [ageRange, setAgeRange] = useState("4-6");
  const [genre, setGenre]       = useState("Adventure");

  const [color, setColor] = useState("Orange");
  const [trait, setTrait] = useState("Brave");
  const [outfit, setOutfit] = useState("");
  const [charExtra, setCharExtra] = useState("");
  const [charImage, setCharImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [designing, setDesigning] = useState(false);
  const [designPhase, setDesignPhase] = useState(""); // "character" | "cover" | ""
  const [error, setError] = useState(null);

  /* Auto-populate character options from prompts[0] */
  useEffect(() => {
    const text = prompts[0].toLowerCase();
    if (!text.trim()) return;

    const matchedTrait = TRAITS.find((t) => text.includes(t.toLowerCase()));
    if (matchedTrait) setTrait(matchedTrait);

    const colorKeywords = [
      ["black",  "Midnight black"],
      ["white",  "Snow white"],
      ["grey",   "Soft grey"],
      ["gray",   "Soft grey"],
      ["purple", "Royal purple"],
      ["lavender", "Lavender"],
      ["blue",   "Sky blue"],
      ["teal",   "Teal"],
      ["green",  "Emerald green"],
      ["pink",   "Sunset pink"],
      ["rose",   "Rose gold"],
      ["golden", "Golden yellow"],
      ["yellow", "Golden yellow"],
      ["brown",  "Chocolate brown"],
      ["red",    "Rusty red"],
      ["cream",  "Cream"],
      ["orange", "Orange"],
    ];
    for (const [kw, val] of colorKeywords) {
      if (text.includes(kw)) { setColor(val); break; }
    }
  }, [prompts[0]]);

  const buildCharDesc = () =>
    `A ${color.toLowerCase()} ${prompts[0].trim() || "character"} for a children's storybook. ` +
    `The character is ${trait.toLowerCase()}` +
    (outfit.trim() ? ` and wears ${outfit.trim().toLowerCase()}.` : ".") +
    (charExtra ? " " + charExtra : "");

  const randomizeIngredients = () => {
    setPrompts([pick(RAND_CHARS), pick(RAND_PLACES), pick(RAND_SURPRISES)]);
    setGenre(pick(GENRES).id);
    setAgeRange(pick(AGE_RANGES).id);
    setCharImage(null);
    setCoverImage(null);
  };

  const randomizeCharacter = () => {
    setColor(pick(COLORS));
    setTrait(pick(TRAITS));
    setOutfit(pick(RAND_OUTFITS));
    setCharImage(null);
    setCoverImage(null);
  };

  const designCharacter = async () => {
    setDesigning(true);
    setDesignPhase("character");
    setError(null);
    const desc =
      buildCharDesc() +
      " The style is a warm, whimsical children's book illustration with soft " +
      "watercolor textures, friendly rounded features, and expressive eyes. " +
      "Character sheet showing the character in a neutral standing pose, " +
      "centered, on a plain white background. " +
      "NO text, labels, names, captions, or lettering anywhere in the image.";
    try {
      const b64 = await generateCharacter(gemKey, desc);
      setCharImage(b64);
      setDesignPhase("cover");
      const coverDesc = buildCharDesc();
      const img = await generateBookCover(gemKey, `${prompts[0]} ${genre} Story`, coverDesc, genre, b64, null, childName)
        .catch(() => null);
      if (img) setCoverImage(img);
    } catch (e) {
      setError(e.message);
    }
    setDesigning(false);
    setDesignPhase("");
  };

  const canStart = prompts.filter((p) => p.trim()).length >= 2 && charImage && gemKey;

  const handleStart = () => {
    onStart({
      prompts,
      childName,
      charImage,
      charDesc: buildCharDesc(),
      color,
      trait,
      outfit,
      ageRange,
      genre,
      coverImage,
    });
  };

  const card = {
    background: `linear-gradient(160deg, ${P.parchLight} 0%, ${P.parchment} 100%)`,
    borderRadius: 16,
    padding: "24px 22px",
    boxShadow: `0 4px 24px ${P.inkMid}12, inset 0 1px 0 rgba(255,255,255,0.6)`,
    border: `1px solid ${P.parchDeep}55`,
    animation: "fadeUp .6s ease-out",
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      {/* ── Title ── */}
      <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeUp .6s", position: "relative" }}>
        {onLibrary && (
          <button
            onClick={onLibrary}
            style={{
              position: "absolute", top: 0, right: 0,
              background: "none", border: `2px solid ${P.parchDark}`,
              borderRadius: 10, padding: "6px 12px",
              fontFamily: F.body, fontSize: 12, fontWeight: 600,
              color: P.inkL, cursor: "pointer",
            }}
          >
            📚 Library
          </button>
        )}
        {/* Infinity-OO logo */}
        <svg width="120" height="58" viewBox="0 0 100 48" fill="none" style={{ marginBottom: 4, display:"block", margin:"0 auto 4px" }}>
          <defs>
            <linearGradient id="infLogoGrad" x1="-100" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={P.ink}   />
              <stop offset="28%"  stopColor={P.gold}  />
              <stop offset="72%"  stopColor={P.berry} />
              <stop offset="100%" stopColor={P.gold}  />
              <animateTransform attributeName="gradientTransform" type="translate" from="100 0" to="-100 0" dur="4s" repeatCount="indefinite" />
            </linearGradient>
            <filter id="infGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Two loops that meet in the middle — like ∞ / the double-O in stoOObook */}
          <path
            d="M 50,24 C 50,7 35,3 25,9 C 13,15 13,33 25,39 C 35,45 50,41 50,24 C 50,7 65,3 75,9 C 87,15 87,33 75,39 C 65,45 50,41 50,24 Z"
            stroke="url(#infLogoGrad)"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#infGlow)"
          />
        </svg>
        <h1
          style={{
            fontFamily: F.display,
            fontSize: "clamp(26px,6vw,40px)",
            background: `linear-gradient(90deg,${P.ink},${P.gold},${P.berry},${P.gold},${P.ink})`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
            margin: "0 0 6px",
          }}
        >
          Infinite Storybook
        </h1>
        <p
          style={{
            fontFamily: F.story,
            fontSize: 17,
            color: P.inkL,
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Every story is one of a kind, just like you ✨
        </p>
      </div>

      {/* ── API Key ── */}
      <div style={{ ...card, marginBottom: 14 }}>
        <h2
          style={{
            fontFamily: F.heading,
            fontSize: 15,
            color: P.inkMid,
            textAlign: "center",
            margin: "0 0 6px",
            letterSpacing: "0.04em",
          }}
        >
          🔑 Gemini API Key
        </h2>
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: P.inkL,
            textAlign: "center",
            margin: "0 0 10px",
          }}
        >
          Free from{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            style={{ color: P.sky, fontWeight: 600 }}
          >
            aistudio.google.com/apikey
          </a>{" "}
          — never leaves your browser
        </p>
        <Input value={gemKey} onChange={setGemKey} placeholder="AIzaSy..." type="password" mono />
      </div>

      {/* ── Story Ingredients ── */}
      <div style={{ ...card, marginBottom: 14 }}>
        <h2
          style={{
            fontFamily: F.heading,
            fontSize: 15,
            color: P.inkMid,
            textAlign: "center",
            margin: "0 0 4px",
            letterSpacing: "0.04em",
          }}
        >
          🧪 Story Ingredients
        </h2>
        <div style={{ textAlign:"center", marginBottom:12 }}>
          <button onClick={randomizeIngredients} style={{ padding:"6px 18px", background:`linear-gradient(135deg,${P.gold},${P.berry})`, color:P.warm, border:"none", borderRadius:20, fontFamily:F.body, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:0.3 }}>🎲 Surprise Me!</button>
        </div>

        {/* Age range */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: P.inkL, display: "block", marginBottom: 6 }}>👶 Age Range</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {AGE_RANGES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAgeRange(a.id)}
                title={a.hint}
                style={{
                  padding: "7px 12px",
                  borderRadius: 10,
                  border: `2px solid ${ageRange === a.id ? P.gold : P.parchDark}`,
                  background: ageRange === a.id ? `${P.gold}22` : P.warm,
                  fontFamily: F.body, fontSize: 12, fontWeight: 700,
                  color: ageRange === a.id ? P.ink : P.inkL,
                  cursor: "pointer", transition: "all .2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                }}
              >
                <span>{a.label}</span>
                <span style={{ fontSize: 9, fontWeight: 400, color: ageRange === a.id ? P.inkL : P.inkFaint }}>{a.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Genre */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: P.inkL, display: "block", marginBottom: 6 }}>📖 Story Type</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGenre(g.id)}
                style={{
                  padding: "8px 4px",
                  borderRadius: 10,
                  border: `2px solid ${genre === g.id ? P.berry : P.parchDark}`,
                  background: genre === g.id ? `${P.berry}18` : P.warm,
                  fontFamily: F.body, fontSize: 11, fontWeight: 700,
                  color: genre === g.id ? P.berry : P.inkL,
                  cursor: "pointer", transition: "all .2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}
              >
                <span style={{ fontSize: 16 }}>{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input
            label="A Character"
            emoji="🦁"
            value={prompts[0]}
            onChange={(v) => setPrompts([v, prompts[1], prompts[2]])}
            placeholder="e.g., a brave unicorn"
          />
          <Input
            label="A Place or Thing"
            emoji="🌙"
            value={prompts[1]}
            onChange={(v) => setPrompts([prompts[0], v, prompts[2]])}
            placeholder="e.g., the moon"
          />
          <Input
            label="A Surprise Element"
            emoji="🎪"
            value={prompts[2]}
            onChange={(v) => setPrompts([prompts[0], prompts[1], v])}
            placeholder="e.g., marshmallows"
          />
          <Input
            label="Child's Name (optional)"
            emoji="👤"
            value={childName}
            onChange={setChildName}
            placeholder="e.g., Luna"
          />
        </div>
      </div>

      {/* ── Character Designer — only shown once a character has been typed ── */}
      {prompts[0].trim() && (
      <div style={{ ...card, marginBottom: 14, animation: "fadeUp .5s ease-out" }}>
        <h2
          style={{
            fontFamily: F.heading,
            fontSize: 15,
            color: P.inkMid,
            textAlign: "center",
            margin: "0 0 4px",
            letterSpacing: "0.04em",
          }}
        >
          🎨 Design Your Character
        </h2>
        <div style={{ textAlign:"center", marginBottom:6 }}>
          <button onClick={randomizeCharacter} style={{ padding:"5px 16px", background:`linear-gradient(135deg,${P.sky},${P.forest})`, color:P.warm, border:"none", borderRadius:20, fontFamily:F.body, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:0.3 }}>🎲 Random Character</button>
        </div>
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: P.inkL,
            textAlign: "center",
            margin: "0 0 4px",
          }}
        >
          Powered by <strong>Nano Banana</strong> — your character stays consistent in
          every illustration
        </p>
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: P.forest,
            fontWeight: 600,
            textAlign: "center",
            margin: "0 0 14px",
          }}
        >
          ✨ Options suggested from &ldquo;{prompts[0]}&rdquo; — tweak as you like!
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: P.inkL }}>
              🎨 Colour
            </label>
            <Pills options={COLORS} value={color} onChange={setColor} cols={4} />
          </div>
          <div>
            <label style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: P.inkL }}>
              💫 Personality
            </label>
            <Pills options={TRAITS} value={trait} onChange={setTrait} cols={4} />
          </div>
          <Input
            label="Outfit (optional)"
            emoji="👔"
            value={outfit}
            onChange={setOutfit}
            placeholder="e.g., a tiny cape and boots"
          />
          <Input
            label="Extra details (optional)"
            emoji="✏️"
            value={charExtra}
            onChange={setCharExtra}
            placeholder="e.g., tiny scar on left ear, carries a lantern"
          />
        </div>

        <button
          onClick={designCharacter}
          disabled={!gemKey || designing}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "13px",
            background:
              !gemKey || designing
                ? P.parchDark
                : `linear-gradient(135deg, ${P.sky}, ${P.forest})`,
            color: !gemKey || designing ? P.inkL : P.warm,
            border: "none",
            borderRadius: 14,
            fontFamily: F.heading,
            fontSize: 14,
            cursor: !gemKey || designing ? "not-allowed" : "pointer",
            transition: "all .3s",
          }}
        >
          {designing
            ? "🖌️ Generating…"
            : charImage
              ? "🔄 Regenerate Character"
              : "🖌️ Generate Character"}
        </button>

        {designing && <Loader msg="Nano Banana is drawing your character…" />}

        {charImage && !designing && (
          <div style={{ marginTop: 14, animation: "fadeUp .5s" }}>
            <img
              src={`data:image/png;base64,${charImage}`}
              alt="Your character"
              style={{
                width: "100%",
                borderRadius: 14,
                border: `3px solid ${P.gold}`,
                boxShadow: `0 4px 24px ${P.gold}33`,
              }}
            />
            <p
              style={{
                fontFamily: F.body,
                fontSize: 12,
                color: P.forest,
                fontWeight: 600,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              ✅ Character locked! This is who stars in your story.
            </p>
          </div>
        )}
      </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div
          style={{
            ...card,
            marginBottom: 14,
            borderColor: P.berryL,
            background: `${P.berry}0d`,
          }}
        >
          <p
            style={{
              fontFamily: F.body,
              fontSize: 13,
              color: P.berry,
              margin: 0,
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* ── Begin ── */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        style={{
          width: "100%",
          padding: "16px",
          background: canStart
            ? `linear-gradient(135deg, ${P.gold}, ${P.berry})`
            : P.parchDark,
          color: canStart ? P.warm : P.inkL,
          border: "none",
          borderRadius: 16,
          fontFamily: F.heading,
          fontSize: 18,
          cursor: canStart ? "pointer" : "not-allowed",
          transition: "all .3s",
          boxShadow: canStart ? `0 4px 20px ${P.berry}44` : "none",
        }}
      >
        ✨ Begin the Story ✨
      </button>
      {!canStart && (
        <p
          style={{
            fontFamily: F.body,
            fontSize: 11,
            color: P.inkL,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {!gemKey
            ? "Enter your Gemini API key"
            : !charImage
              ? "Generate your character first"
              : "Fill at least 2 story ingredients"}
        </p>
      )}
    </div>
  );
}
