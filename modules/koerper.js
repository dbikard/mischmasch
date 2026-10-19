/* Körper-Blitz — body-parts game on a tappable cartoon kid (data + view).
   Self-contained module registered via window.MischMasch. */
(() => {
  const { useState, useEffect, useCallback, useRef } = React;
  const {
    register, useModuleStats, shuffle, recordSRItem,
  } = window.MischMasch;

// "Der Körper — Die Körperteile" (5e). Each part lists its tap anchors on
// the figure below (viewBox 0 0 200 350); a tap counts for the part whose
// anchor is nearest. Decoys (T-shirt, shorts) catch taps on the clothes so
// they are not mistaken for a body part.
const PARTS = [
  { id: "kopf",     art: "der", de: "Kopf",     fr: "la tête",    at: [[100, 57], [70, 97], [130, 97]] },
  { id: "haare",    art: "die", de: "Haare",    fr: "les cheveux", plural: true, at: [[100, 31], [66, 42], [134, 42], [48, 122], [152, 122]] },
  { id: "augen",    art: "die", de: "Augen",    fr: "les yeux",    plural: true, at: [[84, 74], [116, 74]] },
  { id: "ohr",      art: "das", de: "Ohr",      fr: "l'oreille",  at: [[55, 77], [145, 77]] },
  { id: "nase",     art: "die", de: "Nase",     fr: "le nez",     at: [[100, 88]] },
  { id: "mund",     art: "der", de: "Mund",     fr: "la bouche",  at: [[100, 103]] },
  { id: "hals",     art: "der", de: "Hals",     fr: "le cou",     at: [[100, 126]] },
  { id: "schulter", art: "die", de: "Schulter", fr: "l'épaule",   at: [[68, 140], [132, 140]] },
  { id: "arm",      art: "der", de: "Arm",      fr: "le bras",    at: [[50, 190], [150, 190]] },
  { id: "hand",     art: "die", de: "Hand",     fr: "la main",    at: [[45, 222], [155, 222]] },
  { id: "knie",     art: "das", de: "Knie",     fr: "le genou",   at: [[82, 278], [118, 278]] },
  { id: "bein",     art: "das", de: "Bein",     fr: "la jambe",   at: [[82, 303], [118, 303], [82, 256], [118, 256]] },
  { id: "fuss",     art: "der", de: "Fuß",      fr: "le pied",    at: [[74, 330], [126, 330]] },
];
const DECOYS = [
  { id: "tshirt", label: "mein T-Shirt",        at: [[100, 172], [100, 196], [118, 150], [82, 150]] },
  { id: "hose",   label: "meine kurze Hose",    at: [[100, 228], [80, 236], [120, 236]] },
];
const ANCHORS = [
  ...PARTS.flatMap((p) => p.at.map(([x, y]) => ({ x, y, part: p }))),
  ...DECOYS.flatMap((d) => d.at.map(([x, y]) => ({ x, y, decoy: d }))),
];
const TAP_RADIUS = 30;
// Where to show a part (glow / answer rings): a singular word marks ONE
// spot (das Knie → one knee, not "die Knie"); plurals mark all of them.
const showAt = (p) => (p.plural ? p.at : [p.at[0]]);

// "Zeig mir den Kopf!" — accusative article; "das ist mein/meine …".
const acc = (p) => (p.art === "der" ? "den" : p.art);
const poss = (p) => (p.art === "die" ? "meine" : "mein");
// "das ist mein Arm" / "das sind meine Haare"
const thatIs = (p) => `das ${p.plural ? "sind" : "ist"} ${poss(p)} ${p.de}`;
const nom = (p) => `${p.art} ${p.de}`;
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const PRAISE = ["Super!", "Genau!", "Toll!", "Prima!", "Klasse!", "Richtig!", "Hihi, das kitzelt! 😆"];

// Four answers for "Was ist das?": the right one, the same word with a
// wrong article (trains der/die/das), and two other parts.
function nameOptions(part) {
  const wrongArt = pick(["der", "die", "das"].filter((a) => a !== part.art));
  const others = shuffle(PARTS.filter((p) => p.id !== part.id)).slice(0, 2).map(nom);
  return shuffle([nom(part), `${wrongArt} ${part.de}`, ...others]);
}

/* ── the figure ─────────────────────────────────────────────── */
// mood: "idle" | "yay" | "ouch". glow: part ids to pulse. marks: rings
// [{x, y, ok}] drawn where the learner tapped / where the answer was.
function BodyFigure({ mood = "idle", glow = [], marks = [], onTap, width = 240 }) {
  const ref = useRef(null);
  const skin = "#f6d2b5", hair = "#8a5a3b", shirt = "#3c7a6e", shorts = "#4a5a8a", line = "#2c2416";
  const handle = (e) => {
    if (!onTap || !ref.current) return;
    const svg = ref.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    onTap(p.x, p.y);
  };
  const glowParts = PARTS.filter((p) => glow.includes(p.id));
  return (
    <svg ref={ref} viewBox="0 0 200 350" width={width} style={{ maxWidth: "100%", height: "auto", touchAction: "manipulation", cursor: onTap ? "pointer" : "default", userSelect: "none" }} onPointerDown={handle}>
      {/* hair back + pigtails */}
      <ellipse cx="100" cy="72" rx="49" ry="50" fill={hair} />
      <ellipse cx="48" cy="122" rx="10" ry="22" fill={hair} />
      <ellipse cx="152" cy="122" rx="10" ry="22" fill={hair} />
      <circle cx="48" cy="100" r="4" fill="#c45a3c" />
      <circle cx="152" cy="100" r="4" fill="#c45a3c" />
      {/* ears + neck */}
      <circle cx="55" cy="77" r="9" fill={skin} stroke={line} strokeWidth="1" />
      <circle cx="145" cy="77" r="9" fill={skin} stroke={line} strokeWidth="1" />
      <rect x="91" y="114" width="18" height="18" fill={skin} />
      {/* face + bangs */}
      <ellipse cx="100" cy="80" rx="41" ry="42" fill={skin} stroke={line} strokeWidth="1" />
      <path d="M58,66 Q58,26 100,26 Q142,26 142,66 Q128,50 114,55 Q100,45 86,55 Q72,50 58,66 Z" fill={hair} />
      <circle cx="74" cy="95" r="6" fill="#f08a8a" opacity="0.35" />
      <circle cx="126" cy="95" r="6" fill="#f08a8a" opacity="0.35" />
      {/* eyes */}
      {mood === "yay" ? (
        <g stroke={line} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M77,76 Q84,68 91,76" /><path d="M109,76 Q116,68 123,76" />
        </g>
      ) : mood === "ouch" ? (
        <g stroke={line} strokeWidth="2.5" strokeLinecap="round">
          <path d="M79,70 L89,78 M79,78 L89,70" /><path d="M111,70 L121,78 M111,78 L121,70" />
        </g>
      ) : (
        <g>
          <ellipse cx="84" cy="74" rx="6.5" ry="7.5" fill="#fff" stroke={line} strokeWidth="1" />
          <ellipse cx="116" cy="74" rx="6.5" ry="7.5" fill="#fff" stroke={line} strokeWidth="1" />
          <circle cx="85" cy="75" r="3.5" fill={line} className="kb-blink" />
          <circle cx="117" cy="75" r="3.5" fill={line} className="kb-blink" />
        </g>
      )}
      {/* nose + mouth */}
      <path d="M100,84 Q96,91 101,92" stroke={line} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {mood === "yay" ? (
        <path d="M88,99 Q100,114 112,99 Z" fill="#b8403a" stroke={line} strokeWidth="1.5" strokeLinejoin="round" />
      ) : mood === "ouch" ? (
        <path d="M89,105 Q94,100 100,105 Q106,110 111,105" stroke={line} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M90,101 Q100,109 110,101" stroke={line} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {/* arms + hands */}
      <line x1="55" y1="168" x2="46" y2="212" stroke={skin} strokeWidth="13" strokeLinecap="round" />
      <line x1="145" y1="168" x2="154" y2="212" stroke={skin} strokeWidth="13" strokeLinecap="round" />
      <circle cx="45" cy="222" r="9" fill={skin} stroke={line} strokeWidth="1" />
      <circle cx="155" cy="222" r="9" fill={skin} stroke={line} strokeWidth="1" />
      {/* legs + feet */}
      <line x1="82" y1="240" x2="82" y2="320" stroke={skin} strokeWidth="16" strokeLinecap="round" />
      <line x1="118" y1="240" x2="118" y2="320" stroke={skin} strokeWidth="16" strokeLinecap="round" />
      <path d="M76,278 Q82,282 88,278 M112,278 Q118,282 124,278" stroke={line} strokeWidth="1" fill="none" opacity="0.5" />
      <ellipse cx="74" cy="330" rx="15" ry="8" fill={skin} stroke={line} strokeWidth="1" />
      <ellipse cx="126" cy="330" rx="15" ry="8" fill={skin} stroke={line} strokeWidth="1" />
      {/* shorts + T-shirt with the sun */}
      <path d="M63,206 L137,206 L141,246 L105,246 L100,228 L95,246 L59,246 Z" fill={shorts} stroke={line} strokeWidth="1" />
      <path d="M62,135 Q100,124 138,135 L156,168 L141,175 L136,162 L136,210 L64,210 L64,162 L59,175 L44,168 Z" fill={shirt} stroke={line} strokeWidth="1" strokeLinejoin="round" />
      <circle cx="100" cy="168" r="9" fill="#f2c94c" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1={100 + 12 * Math.cos(a * Math.PI / 180)} y1={168 + 12 * Math.sin(a * Math.PI / 180)} x2={100 + 16 * Math.cos(a * Math.PI / 180)} y2={168 + 16 * Math.sin(a * Math.PI / 180)} stroke="#f2c94c" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      {/* highlights */}
      {glowParts.flatMap((p) => showAt(p).map(([x, y], i) => (
        <circle key={p.id + i} cx={x} cy={y} r="13" className="kb-glow" />
      )))}
      {marks.map((m, i) => (
        <circle key={"m" + i} cx={m.x} cy={m.y} r="13" fill="none" stroke={m.ok ? "#2d8659" : "#c0392b"} strokeWidth="4" className="kb-pop" />
      ))}
    </svg>
  );
}

const KB_CSS = `
.kb-glow { fill: rgba(242, 201, 76, 0.35); stroke: #e0a100; stroke-width: 3; transform-box: fill-box; transform-origin: center; animation: kbPulse 0.9s ease-in-out infinite; }
@keyframes kbPulse { 0%,100% { transform: scale(0.85); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 1; } }
.kb-pop { transform-box: fill-box; transform-origin: center; animation: kbPop 0.35s ease-out; }
@keyframes kbPop { from { transform: scale(0.2); } to { transform: scale(1); } }
.kb-blink { animation: kbBlink 4s infinite; transform-box: fill-box; transform-origin: center; }
@keyframes kbBlink { 0%,96%,100% { transform: scaleY(1); } 98% { transform: scaleY(0.1); } }
.kb-shake { animation: kbShake 0.4s; }
@keyframes kbShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
.kb-bounce { animation: kbBounce 0.45s; }
@keyframes kbBounce { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-10px); } }
.kb-float { position: absolute; left: 50%; top: 30%; transform: translateX(-50%); font-weight: 800; font-size: 26px; color: var(--green); pointer-events: none; animation: kbFloat 1s ease-out forwards; }
@keyframes kbFloat { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -60px); } }
.kb-timer { height: 8px; border-radius: 99px; background: #eadfce; overflow: hidden; margin: 10px 0 6px; }
.kb-timer > div { height: 100%; border-radius: 99px; transition: width 0.1s linear; }
.kb-bubble { position: relative; background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 10px 14px; font-family: 'Lora', serif; font-weight: 700; font-size: 20px; text-align: center; min-height: 52px; display: flex; flex-direction: column; justify-content: center; }
.kb-bubble:after { content: ""; position: absolute; bottom: -10px; left: 50%; margin-left: -9px; border-width: 10px 9px 0; border-style: solid; border-color: var(--ink) transparent transparent; }
.kb-mode { display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; padding: 14px 16px; margin-bottom: 10px; border-radius: 16px; border: 2px solid #eadfce; background: #fffdf8; cursor: pointer; font-family: inherit; color: var(--ink); }
.kb-mode:active { border-color: var(--accent); }
.kb-opt { padding: 12px 8px; border-radius: 12px; border: 2px solid #eadfce; background: #fffdf8; font-size: 17px; font-weight: 700; font-family: inherit; color: var(--ink); cursor: pointer; }
.kb-opt.ok { border-color: var(--green); background: #e8f8f0; color: var(--green); }
.kb-opt.bad { border-color: var(--red); background: #fdecea; color: var(--red); }
`;

const MODES = {
  zeig:  { icon: "👉", title: "Zeig mal!",     desc: "Lis le mot, touche la bonne partie du corps." },
  was:   { icon: "🔦", title: "Was ist das?",  desc: "Une partie s'allume : choisis le mot avec le bon article." },
  simon: { icon: "🎩", title: "Simon sagt",    desc: "Touche seulement si « Simon sagt » ! Attention aux pièges…" },
};
const BEST_KEY = "vocab-de-fr-koerper-best";
const loadBest = () => { try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch { return {}; } };
const LIVES = 3;

function KoerperView() {
  const [, recordResult] = useModuleStats("koerper");
  const [phase, setPhase] = useState("menu"); // menu | play | over
  const [mode, setMode] = useState("zeig");
  const [round, setRound] = useState(null);
  const [fb, setFb] = useState(null); // feedback of the current round
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(0);
  const [missed, setMissed] = useState([]);
  const [best, setBest] = useState(loadBest);
  const [newBest, setNewBest] = useState(false);
  const [now, setNow] = useState(Date.now());
  const timers = useRef([]);
  const lastPart = useRef(null);
  const state = useRef({});
  state.current = { round, fb, lives, score, combo, level, mode };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  const newRound = useCallback((lvl, m) => {
    const part = pick(PARTS.filter((p) => p.id !== lastPart.current));
    lastPart.current = part.id;
    const kind = m === "was" ? "name" : m === "simon" && lvl >= 2 && Math.random() < 0.25 ? "trick" : "tap";
    const duration = Math.max(3000, (kind === "name" ? 9000 : 7000) - 300 * lvl);
    setRound({ part, kind, options: kind === "name" ? nameOptions(part) : null, start: Date.now(), duration });
    setFb(null);
  }, []);

  const start = (m) => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setMode(m); setLives(LIVES); setScore(0); setCombo(0); setLevel(0); setMissed([]); setNewBest(false);
    setPhase("play");
    newRound(0, m);
  };

  const finish = useCallback((finalScore, m) => {
    const b = loadBest();
    if (finalScore > (b[m] || 0)) {
      b[m] = finalScore;
      try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch {}
      setNewBest(finalScore > 0);
    }
    setBest(b);
    setPhase("over");
  }, []);

  // ok: true/false. info: { msg, marks, picked, vocab } — vocab=false for
  // Simon tricks (attention, not a word the learner missed).
  const resolve = useCallback((ok, info) => {
    const s = state.current;
    if (!s.round || s.fb) return;
    const remaining = Math.max(0, s.round.start + s.round.duration - Date.now());
    const mult = Math.min(3, 1 + Math.floor(s.combo / 3));
    const gained = ok ? Math.round((100 + 100 * remaining / s.round.duration) / 10) * 10 * mult : 0;
    setFb({ ok, gained, mult, ...info });
    if (info.vocab !== false) {
      recordResult(ok, ok ? s.combo + 1 : 0);
      recordSRItem("koerper:" + s.round.part.id, ok);
    }
    const lives = ok ? s.lives : s.lives - 1;
    const score = s.score + gained;
    setScore(score); setLives(lives);
    setCombo(ok ? s.combo + 1 : 0);
    if (!ok && info.vocab !== false) setMissed((m) => (m.includes(s.round.part) ? m : [...m, s.round.part]));
    const lvl = s.level + (ok ? 1 : 0);
    setLevel(lvl);
    later(() => (lives <= 0 ? finish(score, s.mode) : newRound(lvl, s.mode)), ok ? 1100 : 2300);
  }, [finish, newRound, recordResult]);

  // Countdown — a timeout loses the round, except a Simon trick round,
  // where waiting it out is exactly right.
  useEffect(() => {
    if (phase !== "play" || !round || fb) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= round.start + round.duration) {
        clearInterval(id);
        if (round.kind === "trick") resolve(true, { msg: "Gut aufgepasst! Simon hat nichts gesagt 😎", vocab: false });
        else resolve(false, { msg: "Zu langsam! ⏰", marks: showAt(round.part).map(([x, y]) => ({ x, y, ok: true })) });
      }
    }, 80);
    return () => clearInterval(id);
  }, [phase, round, fb, resolve]);

  const onTap = (x, y) => {
    if (!round || fb || round.kind === "name") return;
    let bestA = null, d = Infinity;
    ANCHORS.forEach((a) => { const dd = Math.hypot(a.x - x, a.y - y); if (dd < d) { d = dd; bestA = a; } });
    if (!bestA || d > TAP_RADIUS) return; // tapped the background — no penalty
    const tapped = { x: bestA.x, y: bestA.y };
    const target = round.part;
    if (round.kind === "trick") {
      resolve(false, { msg: "Reingefallen! Simon hat nichts gesagt 😜", marks: [{ ...tapped, ok: false }], vocab: false });
    } else if (bestA.part && bestA.part.id === target.id) {
      resolve(true, { msg: pick(PRAISE), marks: [{ ...tapped, ok: true }] });
    } else {
      const what = bestA.part ? thatIs(bestA.part) : `das ist ${bestA.decoy.label}`;
      resolve(false, {
        msg: `Nein, ${what}!`,
        marks: [{ ...tapped, ok: false }, ...showAt(target).map(([px, py]) => ({ x: px, y: py, ok: true }))],
      });
    }
  };

  const onPick = (opt) => {
    if (!round || fb) return;
    const ok = opt === nom(round.part);
    resolve(ok, { msg: ok ? pick(PRAISE) : `Nein, ${thatIs(round.part)}!`, picked: opt });
  };

  /* ── screens ── */
  const style = <style>{KB_CSS}</style>;

  if (phase === "menu") {
    return (
      <div className="fade-in" style={{ paddingTop: 24 }}>
        {style}
        <h1 style={{ textAlign: "center", marginBottom: 4 }}>Körper-Blitz ⚡</h1>
        <p style={{ textAlign: "center", color: "var(--ink2)", fontSize: 14, marginBottom: 8 }}>Die Körperteile — 3 ❤️, sois rapide !</p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <BodyFigure mood="yay" width={150} />
        </div>
        {Object.entries(MODES).map(([k, m]) => (
          <button key={k} className="kb-mode" onClick={() => start(k)}>
            <span style={{ fontSize: 30 }}>{m.icon}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontWeight: 700, fontSize: 17 }}>{m.title}</span>
              <span style={{ display: "block", fontSize: 13, color: "var(--ink2)" }}>{m.desc}</span>
            </span>
            {best[k] > 0 && <span className="streak-badge">🏆 {best[k]}</span>}
          </button>
        ))}
      </div>
    );
  }

  if (phase === "over") {
    return (
      <div className="fade-in" style={{ paddingTop: 24, textAlign: "center" }}>
        {style}
        <h1 style={{ marginBottom: 6 }}>{newBest ? "Neuer Rekord! 🏆" : "Spiel vorbei!"}</h1>
        <div style={{ color: "var(--ink2)", marginBottom: 8 }}>{MODES[mode].icon} {MODES[mode].title}</div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 54, fontWeight: 700, color: "var(--accent)" }}>{score}</div>
        <div style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 14 }}>Rekord : {best[mode] || 0}</div>
        <div style={{ display: "flex", justifyContent: "center" }}><BodyFigure mood={newBest ? "yay" : "idle"} width={120} /></div>
        {missed.length > 0 && (
          <div className="card" style={{ padding: 16, margin: "14px 0", textAlign: "left" }}>
            <div style={{ fontWeight: 700, marginBottom: 6, position: "relative" }}>Das übst du noch :</div>
            {missed.map((p) => (
              <div key={p.id} style={{ fontSize: 15, padding: "3px 0", position: "relative" }}>
                <b>{nom(p)}</b> <span style={{ color: "var(--ink2)" }}>— {p.fr}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPhase("menu")}>Modi</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => start(mode)}>Nochmal! 🔁</button>
        </div>
      </div>
    );
  }

  if (!round) return null;
  const { part, kind } = round;
  const left = fb ? 0 : Math.max(0, round.start + round.duration - now);
  const frac = left / round.duration;
  const mood = fb ? (fb.ok ? "yay" : "ouch") : "idle";
  const simonPrefix = mode === "simon" && kind === "tap" ? "Simon sagt: " : "";
  const prompt = kind === "name" ? "Was ist das?" : `${simonPrefix}Zeig mir ${acc(part)} ${part.de}!`;
  const glow = kind === "name" ? [part.id] : [];
  const mult = Math.min(3, 1 + Math.floor(combo / 3));

  return (
    <div className="fade-in" style={{ paddingTop: 16 }}>
      {style}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 20, letterSpacing: 2 }}>
          {Array.from({ length: LIVES }, (_, i) => (i < lives ? "❤️" : "🤍")).join("")}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {mult > 1 && <div className="streak-badge">🔥 x{mult}</div>}
          <div className="streak-badge" style={{ fontWeight: 800 }}>{score}</div>
        </div>
      </div>
      <div className="kb-timer">
        <div style={{ width: `${frac * 100}%`, background: frac > 0.5 ? "var(--green)" : frac > 0.25 ? "#e0a100" : "var(--red)" }} />
      </div>

      <div className={`kb-bubble ${fb ? (fb.ok ? "kb-bounce" : "kb-shake") : ""}`} style={{ margin: "8px 0 14px" }}>
        {fb ? (
          <>
            <span style={{ color: fb.ok ? "var(--green)" : "var(--red)" }}>{fb.msg}</span>
            {kind !== "trick" && (
              <span style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "var(--ink2)", fontWeight: 600, marginTop: 2 }}>
                {nom(part)} = {part.fr}
              </span>
            )}
          </>
        ) : (
          <span>{prompt}</span>
        )}
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <BodyFigure mood={mood} glow={glow} marks={fb && fb.marks ? fb.marks : []} onTap={kind === "name" ? null : onTap} width={kind === "name" ? 190 : 250} />
        {fb && fb.ok && fb.gained > 0 && <div key={score} className="kb-float">+{fb.gained}{fb.mult > 1 ? ` 🔥x${fb.mult}` : ""}</div>}
      </div>

      {kind === "name" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {round.options.map((o) => {
            let cls = "kb-opt";
            if (fb) { if (o === nom(part)) cls += " ok"; else if (o === fb.picked) cls += " bad"; }
            return <button key={o} className={cls} onClick={() => onPick(o)} disabled={!!fb}>{o}</button>;
          })}
        </div>
      )}
    </div>
  );
}

  // Auto-Mode: one item per body part — the part glows, pick its name.
  register({
    id: "koerper", icon: "\u{1F9CD}", label: "Körper-Blitz", year: "5e", component: KoerperView,
    sr: {
      items: () => PARTS.map((p) => "koerper:" + p.id),
      generateRound: (id) => {
        const part = PARTS.find((p) => "koerper:" + p.id === id);
        return {
          kind: "choice",
          visual: <><style>{KB_CSS}</style><BodyFigure glow={[part.id]} width={130} /></>,
          cue: "Was ist das?",
          pre: "Das ist",
          post: "",
          options: nameOptions(part),
          correct: nom(part),
        };
      },
    },
  });
})();
