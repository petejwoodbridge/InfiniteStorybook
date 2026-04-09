import { useState, useEffect, useRef } from "react";
import { F, P, GENRES } from "./constants";
import { loadLibrary, deleteBookFromLib, saveBookToLib, saveCharImg, loadCoverImg, loadCharImg } from "./App";
import { generateBookCover, generateCharacter } from "./api";

const GENRE_GRADIENTS = {
  Adventure:   "linear-gradient(160deg,#1a3a2a,#2d6a4f)",
  Funny:       "linear-gradient(160deg,#3d2a00,#7c5200)",
  Magical:     "linear-gradient(160deg,#1a0a2e,#4a1a6e)",
  Mystery:     "linear-gradient(160deg,#0a0a1a,#1a1a3a)",
  Friendship:  "linear-gradient(160deg,#2a0a1a,#6e1a3a)",
  Learning:    "linear-gradient(160deg,#0a1a2a,#1a3a5a)",
  Bedtime:     "linear-gradient(160deg,#0a0a2a,#1a1a4a)",
  Spooky:      "linear-gradient(160deg,#0a0a0a,#1a0a2a)",
  "Sci-Fi":    "linear-gradient(160deg,#001a2a,#003a5a)",
  Fantasy:     "linear-gradient(160deg,#1a0a2e,#3a1a5e)",
};

function TextCoverPlaceholder({ book }) {
  const genre = book.genre || "Adventure";
  const genreInfo = GENRES.find(g => g.id === genre) || { emoji: "📖", id: genre };
  const bg = GENRE_GRADIENTS[genre] || GENRE_GRADIENTS.Adventure;
  return (
    <div style={{ width:"100%", height:"100%", background:bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:"10px 8px 8px", position:"relative", overflow:"hidden" }}>
      {/* Decorative top rule */}
      <div style={{ width:"70%", height:1, background:"rgba(255,255,255,0.25)", flexShrink:0 }} />
      {/* Title */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"4px 0" }}>
        <p style={{ fontFamily:F.heading, fontSize:"clamp(8px,2vw,10px)", color:"#fff", margin:0, lineHeight:1.4, textAlign:"center", textShadow:"0 2px 8px rgba(0,0,0,0.8)", wordBreak:"break-word" }}>
          {book.title || "Untitled Story"}
        </p>
      </div>
      {/* Author */}
      <p style={{ fontFamily:F.body, fontSize:7, color:"rgba(255,255,255,0.6)", margin:"0 0 4px", textAlign:"center" }}>by {book.childName || "Anonymous"}</p>
      {/* Decorative bottom rule + genre */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0 }}>
        <div style={{ width:"70%", height:1, background:"rgba(255,255,255,0.25)" }} />
        <span style={{ fontSize:12 }}>{genreInfo.emoji}</span>
      </div>
    </div>
  );
}

export default function LibraryScreen({ gemKey, onOpenBook, onNewStory }) {
  const [books, setBooks] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [regenningCovers, setRegenningCovers] = useState(new Set());
  const coverGenSet = useRef(new Set());

  useEffect(() => {
    const lib = loadLibrary();
    setBooks(lib);
    // Load images from IndexedDB async — much faster than generating them
    (async () => {
      const withImages = await Promise.all(lib.map(async b => ({
        ...b,
        coverImage: await loadCoverImg(b.id),
        charImage:  await loadCharImg(b.id),
      })));
      setBooks(withImages);
      setImagesLoaded(true);
    })();
  }, []);

  // For every book that has no cover: generate a character reference first (for
  // visual consistency across pages), save it, then generate the cover with it.
  // Only runs after async image load is done so we don't regenerate saved covers.
  useEffect(() => {
    if (!gemKey || !imagesLoaded) return;
    const missing = books.filter(b => !b.coverImage && !coverGenSet.current.has(b.id));
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const book of missing) {
        if (cancelled) break;
        coverGenSet.current.add(book.id);
        try {
          // Reuse cached char image if we already generated one; otherwise make one now
          let charImg = await loadCharImg(book.id);
          if (!charImg && book.charDesc) {
            const styleDesc =
              book.charDesc +
              " Bold marker illustration style — thick ink outlines, vibrant flat colours. " +
              "Character sheet: neutral standing pose, plain white background. " +
              "NO text, labels, names or lettering.";
            charImg = await generateCharacter(gemKey, styleDesc).catch(() => null);
            if (charImg) saveCharImg(book.id, charImg);
          }
          const img = await generateBookCover(
            gemKey, book.title, book.charDesc, book.genre,
            charImg, null, book.childName
          );
          if (!img || cancelled) continue;
          // saveCoverImg is called inside saveBookToLib automatically
          const updated = { ...book, coverImage: img };
          saveBookToLib(updated);
          setBooks(prev => prev.map(b => b.id === book.id ? updated : b));
        } catch { /* silent — cover stays as placeholder */ }
      }
    })();
    return () => { cancelled = true; };
  }, [gemKey, imagesLoaded]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this story?")) return;
    deleteBookFromLib(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleRegenCover = async (book, e) => {
    e.stopPropagation();
    if (regenningCovers.has(book.id)) return;
    setRegenningCovers(prev => new Set([...prev, book.id]));
    try {
      let charImg = await loadCharImg(book.id);
      if (!charImg && book.charDesc) {
        const styleDesc =
          book.charDesc +
          " Bold marker illustration style — thick ink outlines, vibrant flat colours. " +
          "Character sheet: neutral standing pose, plain white background. " +
          "NO text, labels, names or lettering.";
        charImg = await generateCharacter(gemKey, styleDesc).catch(() => null);
        if (charImg) saveCharImg(book.id, charImg);
      }
      const img = await generateBookCover(gemKey, book.title, book.charDesc, book.genre, charImg, null, book.childName);
      if (img) {
        const updated = { ...book, coverImage: img };
        saveBookToLib(updated);
        setBooks(prev => prev.map(b => b.id === book.id ? updated : b));
      }
    } catch {}
    setRegenningCovers(prev => { const next = new Set(prev); next.delete(book.id); return next; });
  };

  const cover = {
    position: "relative",
    borderRadius: "2px 10px 10px 2px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: `-4px 0 0 ${P.desk}, -6px 4px 18px rgba(0,0,0,0.55), 3px 3px 12px rgba(0,0,0,0.25)`,
    transition: "transform 0.2s, box-shadow 0.2s",
    background: P.leatherL,
    aspectRatio: "2/3",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32, animation: "fadeUp .5s" }}>
        <svg width="110" height="54" viewBox="0 0 100 48" fill="none" style={{ display:"block", margin:"0 auto 8px" }}>
          <defs>
            <linearGradient id="libLogoGrad" x1="-100" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor={P.ink}   />
              <stop offset="28%"  stopColor={P.gold}  />
              <stop offset="72%"  stopColor={P.berry} />
              <stop offset="100%" stopColor={P.gold}  />
              <animateTransform attributeName="gradientTransform" type="translate" from="100 0" to="-100 0" dur="4s" repeatCount="indefinite" />
            </linearGradient>
            <filter id="libGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="1.8" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path d="M 50,24 C 50,7 35,3 25,9 C 13,15 13,33 25,39 C 35,45 50,41 50,24 C 50,7 65,3 75,9 C 87,15 87,33 75,39 C 65,45 50,41 50,24 Z"
            stroke="url(#libLogoGrad)" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#libGlow)" />
        </svg>
        <h1 style={{
          fontFamily: F.display,
          fontSize: "clamp(22px,4vw,32px)",
          background: `linear-gradient(90deg,${P.ink},${P.gold},${P.berry},${P.gold},${P.ink})`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 4s linear infinite",
          margin: "0 0 6px",
        }}>My Story Library</h1>
        <p style={{ fontFamily: F.body, fontSize: 14, color: P.inkL, margin: 0 }}>
          {books.length === 0 ? "Your stories will appear here" : `${books.length} ${books.length === 1 ? "story" : "stories"} saved`}
        </p>
      </div>

      {/* New Story button */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <button
          onClick={onNewStory}
          style={{
            padding: "13px 36px",
            background: `linear-gradient(135deg, ${P.gold}, ${P.berry})`,
            color: P.warm, border: "none", borderRadius: 28,
            fontFamily: F.heading, fontSize: 16, cursor: "pointer",
            boxShadow: `0 4px 20px ${P.berry}55`,
          }}
        >
          ✨ New Story
        </button>
      </div>

      {/* Empty state */}
      {books.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: `linear-gradient(160deg, ${P.leatherMid}, ${P.leather})`, borderRadius: 20,
          border: `2px dashed ${P.leatherL}`,
          animation: "fadeUp .6s",
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📖</div>
          <p style={{ fontFamily: F.story, fontSize: 18, color: P.inkL, fontStyle: "italic" }}>
            "Once upon a time, there were no stories yet…"
          </p>
          <p style={{ fontFamily: F.body, fontSize: 13, color: P.inkL, marginTop: 8 }}>
            Create your first story to fill this shelf!
          </p>
        </div>
      )}

      {/* Book grid */}
      {books.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 28,
          padding: "0 4px",
        }}>
          {books.map((book) => (
            <div key={book.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Book cover */}
              <div
                style={cover}
                onClick={() => onOpenBook(book)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px) rotate(1deg)";
                  e.currentTarget.style.boxShadow = `-4px 0 0 ${P.desk}, -8px 8px 28px rgba(0,0,0,0.65), 3px 3px 14px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = `-4px 0 0 ${P.desk}, -6px 4px 18px rgba(0,0,0,0.55), 3px 3px 12px rgba(0,0,0,0.25)`;
                }}
              >
                {/* Cover image — full bleed */}
                {book.coverImage ? (
                  <img
                    src={`data:image/png;base64,${book.coverImage}`}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : book.charImage ? (
                  <>
                    <img
                      src={`data:image/png;base64,${book.charImage}`}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(transparent 40%, rgba(0,0,0,0.75))", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"8px 6px 6px" }}>
                      <p style={{ fontFamily:F.heading, fontSize:8, color:"#fff", margin:0, lineHeight:1.3, textAlign:"center", textShadow:"0 1px 4px rgba(0,0,0,0.9)", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                        {book.title || "Untitled Story"}
                      </p>
                      <p style={{ fontFamily:F.body, fontSize:7, color:"rgba(255,255,255,0.7)", margin:"2px 0 0", textAlign:"center" }}>by {book.childName || "Anonymous"}</p>
                    </div>
                  </>
                ) : (
                  <TextCoverPlaceholder book={book} />
                )}

                {/* Spine line */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0, left: 0, width: 5,
                  background: `linear-gradient(to right, rgba(0,0,0,0.25), transparent)`,
                }} />

                {/* Title + author overlay — only when a real cover image is shown */}
                {book.coverImage && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "22px 8px 7px",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
                  }}>
                    <p style={{
                      fontFamily: F.heading, fontSize: 9, color: "#fff",
                      margin: "0 0 2px", lineHeight: 1.3, textAlign: "center",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}>
                      {book.title || "Untitled Story"}
                    </p>
                    <p style={{ fontFamily: F.body, fontSize: 7, color: "rgba(255,255,255,0.7)", margin: 0, textAlign: "center" }}>
                      by {book.childName || "Anonymous"}
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={() => onOpenBook(book)}
                  style={{
                    padding: "7px 0",
                    background: `linear-gradient(135deg,${P.sky},${P.forest})`,
                    color: P.warm, border: "none", borderRadius: 8,
                    fontFamily: F.heading, fontSize: 12, cursor: "pointer",
                  }}
                >
                  📖 Read
                </button>
                {gemKey && (
                  <button
                    onClick={() => onOpenBook({ ...book, continueMode: true })}
                    style={{
                      padding: "6px 0",
                      background: `linear-gradient(135deg,${P.gold},${P.berry})`,
                      color: P.warm, border: "none", borderRadius: 8,
                      fontFamily: F.heading, fontSize: 10, cursor: "pointer",
                    }}
                  >
                    ✨ Continue
                  </button>
                )}
                {gemKey && (
                  <button
                    onClick={(e) => handleRegenCover(book, e)}
                    disabled={regenningCovers.has(book.id)}
                    style={{
                      padding: "6px 0",
                      background: regenningCovers.has(book.id) ? P.leatherMid : "transparent",
                      color: regenningCovers.has(book.id) ? P.inkFaint : P.inkL,
                      border: `1px solid ${P.leatherL}`,
                      borderRadius: 8, fontFamily: F.body, fontSize: 10,
                      cursor: regenningCovers.has(book.id) ? "default" : "pointer",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => { if (!regenningCovers.has(book.id)) { e.currentTarget.style.background = `${P.gold}22`; e.currentTarget.style.color = P.goldL; e.currentTarget.style.borderColor = P.gold; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = P.inkL; e.currentTarget.style.borderColor = P.leatherL; }}
                  >
                    {regenningCovers.has(book.id) ? "✦ Painting…" : "🎨 New Cover"}
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(book.id, e)}
                  style={{
                    padding: "5px 0",
                    background: "transparent",
                    color: P.inkL, border: `1px solid ${P.leatherL}`,
                    borderRadius: 8, fontFamily: F.body, fontSize: 10,
                    cursor: "pointer", transition: "all .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${P.berry}22`; e.currentTarget.style.color = P.berry; e.currentTarget.style.borderColor = P.berry; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = P.inkL; e.currentTarget.style.borderColor = P.leatherL; }}
                >
                  🗑 Delete
                </button>
              </div>

              {/* Date */}
              <p style={{
                fontFamily: F.body, fontSize: 9, color: P.inkL,
                textAlign: "center", margin: 0,
              }}>
                {book.savedAt ? new Date(book.savedAt).toLocaleDateString() : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
