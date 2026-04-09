import { useState } from "react";
import { F, P } from "./constants";

/* ─── Loading spinner ─── */
export function Loader({ msg }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "36px 0",
      }}
    >
      <div
        style={{
          fontSize: 36,
          animation: "quill 1.2s ease-in-out infinite",
          transformOrigin: "bottom center",
        }}
      >
        ✒️
      </div>
      <p
        style={{
          fontFamily: F.body,
          fontSize: 15,
          color: P.inkL,
          fontWeight: 500,
          textAlign: "center",
          animation: "pulse 2s infinite",
        }}
      >
        {msg}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: P.gold,
              animation: `dots 1s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Text input ─── */
export function Input({ label, emoji, value, onChange, placeholder, type = "text", mono }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label
          style={{
            fontFamily: F.body,
            fontSize: 13,
            fontWeight: 700,
            color: P.inkL,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {emoji && <span style={{ fontSize: 18 }}>{emoji}</span>}
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: mono ? "monospace" : F.body,
          fontSize: 15,
          fontWeight: 500,
          padding: "12px 14px",
          border: `2.5px solid ${focused ? P.gold : P.parchDark}`,
          borderRadius: 12,
          background: P.warm,
          color: P.ink,
          outline: "none",
          transition: "all .3s",
          boxShadow: focused ? `0 0 0 4px ${P.gold}22` : "none",
        }}
      />
    </div>
  );
}

/* ─── Branching choice button ─── */
export function ChoiceBtn({ text, emoji, onClick, idx }) {
  const [hovered, setHovered] = useState(false);
  const cols = [{ bg: P.sky }, { bg: P.forest }, { bg: P.berry }];
  const c = cols[idx % 3];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "8px 12px",
        background: hovered ? c.bg : P.warm,
        color: hovered ? P.warm : P.ink,
        border: `2px solid ${c.bg}`,
        borderRadius: 10,
        fontFamily: F.body,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all .3s",
        transform: hovered ? "translateX(4px)" : "none",
        boxShadow: hovered ? `0 3px 10px ${c.bg}44` : "0 1px 4px #0001",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
      <span style={{ flex: 1 }}>{text}</span>
      <span
        style={{
          fontSize: 16,
          transition: "transform .3s",
          transform: hovered ? "translateX(3px)" : "none",
        }}
      >
        →
      </span>
    </button>
  );
}

/* ─── Pill selector grid ─── */
export function Pills({ options, value, onChange, cols = 3 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 5,
        marginTop: 4,
      }}
    >
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            padding: "8px 5px",
            borderRadius: 10,
            border: `2px solid ${value === o ? P.gold : P.parchDark}`,
            background: value === o ? `${P.gold}22` : P.warm,
            fontFamily: F.body,
            fontSize: 12,
            fontWeight: 600,
            color: value === o ? P.ink : P.inkL,
            cursor: "pointer",
            transition: "all .2s",
            lineHeight: 1.3,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
