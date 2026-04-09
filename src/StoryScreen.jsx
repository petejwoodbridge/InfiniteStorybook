import { useState, useEffect, useRef } from "react";
import { F, P, STORY_LOADING_MSGS } from "./constants";
import { geminiStory, generateIllustration, generateBookCover, generateCharacter } from "./api";
import { Loader, ChoiceBtn } from "./components";
import { saveBookToLib } from "./App";

export default function StoryScreen({ gemKey, storyConfig, onGoToLibrary, onNewStory }) {
  const {
    id, isNew, continueMode,
    charImage, charDesc, prompts = [], childName,
    ageRange = "4-6", genre = "Adventure",
  } = storyConfig;

  /* Writing style instructions derived from user picks */
  const AGE_GUIDE = {
    "2-4":  "Write for toddlers aged 2-4. Use VERY simple words (max 2 syllables), sentences of 4-6 words only, lots of repetition, sound words (boom! splash! woof!), and big clear emotions. Maximum ~40 words per page.",
    "4-6":  "Write for children aged 4-6. Use simple vocabulary, short playful sentences, gentle rhythm. Maximum ~65 words per page.",
    "6-8":  "Write for children aged 6-8. Use richer descriptions and some longer sentences. A hint of suspense is great. Maximum ~110 words per page.",
    "8-10": "Write for confident readers aged 8-10. Chapter-book style: varied sentence length, active verbs, vivid imagery, mild tension. Maximum ~140 words per page.",
    "10-12":"Write for preteens aged 10-12. Sophisticated storytelling: layered characters, emotional depth, subplots, themes. Maximum ~170 words per page.",
  };
  const GENRE_GUIDE = {
    Adventure:  "Genre: ADVENTURE. Pack it with action, discovery, and brave choices. Every paragraph should propel the hero forward into exciting new territory.",
    Funny:      "Genre: FUNNY. Make it laugh-out-loud hilarious with silly wordplay, absurd situations, comic timing, and unexpected puns.",
    Magical:    "Genre: MAGICAL. Fill every sentence with wonder. Impossible things feel real — enchanted objects, whimsical spells, creatures that sparkle and glow.",
    Mystery:    "Genre: MYSTERY. Plant clues subtly. Build a creeping sense of intrigue. Every scene should tease a surprising reveal.",
    Friendship: "Genre: FRIENDSHIP. Centre the story on kindness, teamwork and empathy. Characters help each other grow and learn together.",
    Learning:   "Genre: LEARNING. Weave fascinating real-world facts (science, nature, history) naturally into the adventure so the child learns without noticing.",
    Bedtime:    "Genre: BEDTIME. Keep the pace calm, soothing and dreamy. Soft imagery, gentle events, quiet wonder — the story should drift peacefully toward rest.",
    Spooky:     "Genre: SPOOKY (age-appropriate). Create a slightly eerie, thrilling atmosphere with harmless scares, clever twists and a reassuring resolution.",
  };
  const ageInstruction   = AGE_GUIDE[ageRange]   || AGE_GUIDE["4-6"];
  const genreInstruction = GENRE_GUIDE[genre]     || GENRE_GUIDE["Adventure"];

  const [storyTitle, setStoryTitle] = useState(storyConfig.title || "");
  const [segments,   setSegments]   = useState(storyConfig.segments || []);
  const [choices,    setChoices]    = useState(storyConfig.choices   || null);
  const [isComplete, setIsComplete] = useState(storyConfig.isComplete || false);
  const [loading,    setLoading]    = useState(false);
  const [loadMsg,    setLoadMsg]    = useState("");
  const [error,      setError]      = useState(null);
  const [coverImage, setCoverImage] = useState(storyConfig.coverImage || null);
  // charImage is kept in local state only — not persisted to library (too large, fills quota)
  const [charImageLocal, setCharImageLocal] = useState(storyConfig.charImage || null);

  const [currentSpread, setCurrentSpread] = useState(0);

  const started = useRef(false);
  const regenSet = useRef(new Set());
  const canInteract = !!gemKey;

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(
      () => setLoadMsg(STORY_LOADING_MSGS[Math.floor(Math.random() * STORY_LOADING_MSGS.length)]),
      2800,
    );
    return () => clearInterval(iv);
  }, [loading]);

  useEffect(() => {
    if (!storyTitle) return;
    // charImage deliberately omitted — ~400KB per book fills localStorage fast
    const segmentsForLib = segments.map(({ image: _img, ...rest }) => rest);
    saveBookToLib({ id, title: storyTitle, savedAt: new Date().toISOString(), charDesc, prompts, childName, ageRange, genre, segments: segmentsForLib, choices, isComplete, coverImage });
  }, [storyTitle, segments, choices, isComplete, coverImage]);

  useEffect(() => {
    if (segments.length > 0) goToSpread(segments.length, segments.length === 1);
  }, [segments.length]);

  useEffect(() => {
    if (!isNew || started.current) return;
    started.current = true;
    startStory();
  }, []);

  // Lazily regenerate illustration for any segment missing its image (e.g. loaded from library)
  useEffect(() => {
    if (currentSpread < 1 || !gemKey || loading || regenSet.current.has(currentSpread)) return;
    const idx = currentSpread - 1;
    const s = segments[idx];
    if (!s || s.image) return;
    regenSet.current.add(currentSpread);
    const prevImg = idx > 0 ? segments[idx - 1]?.image : null;
    generateIllustration(gemKey, s.sceneDesc || s.text.substring(0, 150), charImageLocal, prevImg)
      .then(img => {
        if (!img) return;
        setSegments(prev => prev.map((seg, i) => i === idx ? { ...seg, image: img } : seg));
      })
      .catch(() => {});
  }, [currentSpread, segments]);

  const goToSpread = (newSpread, instant = false) => {
    if (newSpread === currentSpread) return;
    setCurrentSpread(newSpread);
  };

  // Simple fade-in key — increments on every page change to trigger CSS animation
  const [pageKey, setPageKey] = useState(0);
  useEffect(() => { setPageKey(k => k + 1); }, [currentSpread]);

  const startStory = async () => {
    setLoading(true); setLoadMsg("Writing the opening chapter…"); setError(null);
    try {
      const result = await geminiStory(gemKey, [{
        role: "user",
        content:
          `Create the opening page of a children's storybook.\n` +
          `STYLE: ${ageInstruction}\n` +
          `${genreInstruction}\n` +
          `Story elements to include: "${prompts[0]}", "${prompts[1]}", "${prompts[2]}".\n` +
          `Main character: ${charDesc}.` +
          (childName ? ` Companion character named ${childName}.` : "") +
          `\n\nRespond in JSON:\n` +
          `{"title":"catchy storybook title","text":"Opening page text following the STYLE instruction above. End at an exciting decision point.",` +
          `"scene_description":"One vivid sentence for an illustrator describing the key visual moment.",` +
          `"choices":[{"emoji":"\u2694\ufe0f","text":"choice 1 (8-15 words)"},{"emoji":"\u2728","text":"choice 2"},{"emoji":"\ud83d\udd0d","text":"choice 3"}]}`,
      }]);
      setStoryTitle(result.title);
      setLoadMsg("Painting the opening scene…");
      // Generate illustration and cover in parallel — both ready before user opens the book
      const [img, coverImg] = await Promise.all([
        generateIllustration(gemKey, result.scene_description || result.text.substring(0,150), charImageLocal),
        generateBookCover(gemKey, result.title, charDesc, genre, charImageLocal, null, childName).catch(() => null),
      ]);
      setSegments([{ text: result.text, choiceMade: null, sceneDesc: result.scene_description || result.text.substring(0,150), image: img }]);
      setChoices(result.choices);
      if (coverImg) setCoverImage(coverImg);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const makeChoice = async (choice) => {
    if (!canInteract) return;
    setLoading(true); setLoadMsg("Turning the page…"); setError(null); setChoices(null);

    const storySoFar = segments.map((s) => s.text).join("\n\n");
    try {
      const result = await geminiStory(gemKey, [{
        role: "user",
        content:
          `Continue this children's storybook.\n` +
          `STYLE: ${ageInstruction}\n` +
          `${genreInstruction}\n` +
          `Story so far:\n"""\n${storySoFar}\n"""\n` +
          `The child chose: "${choice.text}"\n` +
          `Write the next page. End at a decision point with three new choices.` +
          `\n\nJSON: {"text":"Next page text following the STYLE instruction above. End at a decision point."` +
          `,"scene_description":"One vivid sentence describing the key visual moment."` +
          `,"choices":[{"emoji":"\u2694\ufe0f","text":"choice 1"},{"emoji":"\u2728","text":"choice 2"},{"emoji":"\ud83d\udd0d","text":"choice 3"}]}`,
      }]);
      setLoadMsg("Painting the scene…");
      const prevImg = segments.length > 0 ? segments[segments.length-1].image : null;
      const img = await generateIllustration(gemKey, result.scene_description || result.text.substring(0,150), charImageLocal, prevImg);
      const newSeg = { text: result.text, choiceMade: choice.text, sceneDesc: result.scene_description || result.text.substring(0,150), image: img };
      setSegments((prev) => [...prev, newSeg]);
      setChoices(result.choices || null);
    } catch (e) { setError(e.message); setChoices([choice]); }
    setLoading(false);
  };

  const totalSpreads = segments.length;
  const seg = currentSpread >= 1 ? segments[currentSpread - 1] : null;
  const isLatestSpread = currentSpread === totalSpreads;

  const renderLeftPage = () => {
    if (!seg) return <div className="book-page-left" style={{ background: P.parchDark, minHeight: 320 }} />;
    return (
      <div className="book-page-left" style={{ background: "#1a0e08" }}>
        {seg.image
          ? <img src={`data:image/png;base64,${seg.image}`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          : <div style={{ height:"100%", minHeight:320, display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(160deg,${P.parchment},${P.parchDark})`, fontSize:48 }}>📖</div>
        }
      </div>
    );
  };

  const renderRightPage = () => {
    if (!seg) return (
      <div className="book-page-right" style={{ display:"flex", alignItems:"center", justifyContent:"center", background:P.parchment, padding:24 }}>
        <Loader msg={loadMsg || "Beginning your story…"} />
      </div>
    );

    return (
      <div className="book-page-right" style={{ background:P.parchment, padding:"16px 18px 14px", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexShrink:0 }}>
          <span style={{ fontFamily:F.heading, fontSize:10, color:P.gold, background:`${P.gold}18`, padding:"2px 8px", borderRadius:16 }}>Page {currentSpread}</span>
          {seg.choiceMade && (
            <span style={{ fontFamily:F.body, fontSize:9, color:P.inkL, fontStyle:"italic" }}>✨ {seg.choiceMade}</span>
          )}
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <p style={{ fontFamily:F.story, fontSize:"clamp(10px, 1.4vw, 14px)", lineHeight:1.6, color:P.ink, margin:0 }}>
            <span style={{ fontFamily:F.display, fontSize:"clamp(22px, 2.8vw, 36px)", float:"left", lineHeight:0.78, marginRight:4, marginTop:4, color:P.gold }}>
              {seg.text.charAt(0)}
            </span>
            {seg.text.substring(1)}
          </p>
        </div>

        {isLatestSpread && choices && !loading && canInteract && (
          <div style={{ borderTop:`1px dashed ${P.gold}55`, paddingTop:8, marginTop:6, flexShrink:0 }}>
            <h3 style={{ fontFamily:F.heading, fontSize:11, color:P.ink, textAlign:"center", margin:"0 0 5px" }}>✨ What happens next?</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {choices.map((c,i) => <ChoiceBtn key={i} idx={i} text={c.text} emoji={c.emoji} onClick={() => makeChoice(c)} />)}
            </div>
          </div>
        )}

        {isLatestSpread && choices && !loading && !canInteract && (
          <p style={{ fontFamily:F.story, fontSize:12, color:P.inkL, fontStyle:"italic", textAlign:"center", marginTop:"auto" }}>Add an API key to continue…</p>
        )}

        {isLatestSpread && loading && <div style={{ marginTop:8, flexShrink:0 }}><Loader msg={loadMsg} /></div>}
      </div>
    );
  };

  const bookShell = currentSpread === 0 ? {
    borderRadius: "12px",
    boxShadow: "0 16px 56px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.2)",
    overflow: "hidden",
    position: "relative",
    background: P.parchment,
  } : {
    borderRadius: "4px 12px 12px 4px",
    borderLeft: `14px solid ${P.ink}`,
    boxShadow: `-4px 0 0 ${P.inkL}, -12px 6px 36px rgba(0,0,0,0.5), 6px 6px 28px rgba(0,0,0,0.15), inset 10px 0 28px rgba(0,0,0,0.06)`,
    overflow: "hidden",
    position: "relative",
    background: P.parchment,
  };

  const renderCover = () => (
    <div className="book-cover">
      {coverImage ? (
        <img src={`data:image/png;base64,${coverImage}`} alt="" />
      ) : (
        <div style={{ width:"100%", height:"100%", background:`linear-gradient(165deg,${P.leatherL} 0%,${P.leatherMid} 55%,${P.leatherL} 100%)` }}>
          {charImageLocal && (
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:140, height:140, borderRadius:"50%", border:`4px solid ${P.gold}`, overflow:"hidden" }}>
              <img src={`data:image/png;base64,${charImageLocal}`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
          )}
        </div>
      )}
      <div className="book-cover-overlay">
        <div style={{ position:"absolute", inset:12, border:"2px solid rgba(255,255,255,0.25)", borderRadius:8, pointerEvents:"none" }} />
        {loading && !storyTitle
          ? <div style={{ background:"rgba(255,255,255,0.2)", backdropFilter:"blur(12px)", borderRadius:20, padding:"28px 36px", boxShadow:"0 4px 30px rgba(0,0,0,0.25)" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:36, animation:"quill 1.2s ease-in-out infinite", transformOrigin:"bottom center" }}>✒️</span>
                <p style={{ fontFamily:F.body, fontSize:16, color:"#fff", fontWeight:600, textAlign:"center", textShadow:"0 2px 8px rgba(0,0,0,0.5)", margin:0, animation:"pulse 2s infinite" }}>{loadMsg || "Creating your story…"}</p>
                <div style={{ display:"flex", gap:6 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:"#fff", animation:`dots 1.4s ${i*0.2}s ease-in-out infinite` }} />)}
                </div>
              </div>
            </div>
          : (<>
              <h1 style={{ fontFamily:F.heading, fontSize:"clamp(22px,5vw,38px)", color:"#fff", margin:"0 0 8px", lineHeight:1.2, textShadow:"0 2px 16px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.3)", maxWidth:"80%" }}>
                {storyTitle || "Once Upon a Time…"}
              </h1>
              {childName && (
                <p style={{ fontFamily:F.body, fontSize:"clamp(12px,2vw,16px)", color:"rgba(255,255,255,0.85)", margin:0, textShadow:"0 1px 8px rgba(0,0,0,0.6)", letterSpacing:1 }}>
                  by {childName}
                </p>
              )}
              {storyTitle && (
                <button onClick={() => goToSpread(1)} style={{ marginTop:16, padding:"12px 30px", background:"rgba(255,255,255,0.2)", backdropFilter:"blur(8px)", color:"#fff", border:"2px solid rgba(255,255,255,0.4)", borderRadius:28, fontFamily:F.heading, fontSize:16, cursor:"pointer", letterSpacing:0.5, textShadow:"0 1px 4px rgba(0,0,0,0.4)", transition:"all .2s" }}>
                Open Book →
                </button>
              )}
            </>)
        }
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onGoToLibrary} style={{ background:"none", border:`2px solid ${P.parchDark}`, borderRadius:10, padding:"6px 13px", fontFamily:F.body, fontSize:13, fontWeight:600, color:P.inkL, cursor:"pointer" }}>📚 Library</button>
          <button onClick={onNewStory} style={{ background:"none", border:`2px solid ${P.parchDark}`, borderRadius:10, padding:"6px 13px", fontFamily:F.body, fontSize:13, fontWeight:600, color:P.inkL, cursor:"pointer" }}>✦ New</button>
        </div>
        {storyTitle && <span style={{ fontFamily:F.display, fontSize:13, color:P.inkL, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"40%" }}>{storyTitle}</span>}
        <span style={{ fontFamily:F.body, fontSize:12, color:P.inkL, fontWeight:600 }}>{currentSpread===0 ? "📖 Cover" : `📖 ${currentSpread} / ${totalSpreads}`}</span>
      </div>

      <div style={bookShell}>
        {currentSpread === 0
          ? <div key={`cover-${pageKey}`} className="page-turn-in" style={{ display:"flex", justifyContent:"center", background:P.parchment }}>
              <div style={{ width:"50%", aspectRatio:"3/4", position:"relative", overflow:"hidden", flexShrink:0 }}>
                {renderCover()}
              </div>
            </div>
          : (
            <div key={`spread-${pageKey}`} className="book-spread page-turn-in">
              {renderLeftPage()}
              {renderRightPage()}
            </div>
          )
        }
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14 }}>
        <button onClick={() => goToSpread(currentSpread-1)} disabled={currentSpread===0} style={{ padding:"9px 20px", background:currentSpread>0?P.parchDark:"transparent", border:`2px solid ${currentSpread>0?P.parchDark:"transparent"}`, borderRadius:10, fontFamily:F.body, fontSize:14, fontWeight:700, color:currentSpread>0?P.inkL:"transparent", cursor:currentSpread>0?"pointer":"default", transition:"all .2s" }}>← Prev</button>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {[...Array(totalSpreads+1)].map((_,i) => (
            <div key={i} onClick={() => i!==currentSpread && goToSpread(i)} title={i===0?"Cover":`Page ${i}`} style={{ width:i===currentSpread?20:7, height:7, borderRadius:4, background:i===currentSpread?P.gold:P.parchDark, cursor:i!==currentSpread?"pointer":"default", transition:"all .3s" }} />
          ))}
        </div>
        <button onClick={() => goToSpread(currentSpread+1)} disabled={currentSpread>=totalSpreads} style={{ padding:"9px 20px", background:currentSpread<totalSpreads?P.parchDark:"transparent", border:`2px solid ${currentSpread<totalSpreads?P.parchDark:"transparent"}`, borderRadius:10, fontFamily:F.body, fontSize:14, fontWeight:700, color:currentSpread<totalSpreads?P.inkL:"transparent", cursor:currentSpread<totalSpreads?"pointer":"default", transition:"all .2s" }}>Next →</button>
      </div>

      {error && (
        <div style={{ marginTop:14, background:`${P.berry}0d`, border:`1px solid ${P.berryL}`, borderRadius:12, padding:"14px 18px", textAlign:"center" }}>
          <p style={{ fontFamily:F.body, fontSize:13, color:P.berry, fontWeight:600, margin:"0 0 8px" }}>⚠️ {error}</p>
          <button onClick={() => { setError(null); if(segments.length===0) startStory(); }} style={{ background:P.berry, color:P.warm, border:"none", borderRadius:8, padding:"7px 16px", fontFamily:F.body, fontWeight:600, fontSize:13, cursor:"pointer" }}>Try Again</button>
        </div>
      )}
    </div>
  );
}
