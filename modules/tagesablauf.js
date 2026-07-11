/* Tagesablauf — daily-routine sentence builder (data + view).
   Self-contained module registered via window.MischMasch. */
(() => {
  const { useState, useEffect, useCallback } = React;
  const {
    register, useModuleStats, ModuleHeader, ModuleStatsFooter,
    ClockFace, germanTime, formatDigital, shuffle, pickWithDistractors,
    capFirst, SUBJECTS, FR_PRON,
  } = window.MischMasch;

// complement = what goes mid-clause at the end but before any separable
// particle (e.g. "eine Freundin", "in die Schule", "zu Mittag"). An empty
// complement means there is none.
// particle = separable prefix that drops to the very end of the clause
// in a main clause ("auf", "an", "fern"). Empty when the verb is not
// separable.
// reflexive = optional per-subject pronoun for reflexive verbs
// (mich/dich/sich/sich/uns). Placed right after the subject pronoun.
// Omit for non-reflexive verbs.
window.TAGESABLAUF_DATA = [
  {
    inf: "auf/stehen",
    fr: "se lever",
    complement: "",
    particle: "auf",
    ich: "stehe",
    du: "stehst",
    er: "steht",
    sie: "steht",
    wir: "stehen",
  },
  {
    inf: "frühstücken",
    fr: "prendre le petit-déjeuner",
    complement: "",
    particle: "",
    ich: "frühstücke",
    du: "frühstückst",
    er: "frühstückt",
    sie: "frühstückt",
    wir: "frühstücken",
  },
  {
    inf: "in die Schule gehen",
    fr: "aller à l'école",
    complement: "in die Schule",
    particle: "",
    ich: "gehe",
    du: "gehst",
    er: "geht",
    sie: "geht",
    wir: "gehen",
  },
  {
    inf: "zu Mittag essen",
    fr: "déjeuner",
    complement: "zu Mittag",
    particle: "",
    ich: "esse",
    du: "isst",
    er: "isst",
    sie: "isst",
    wir: "essen",
  },
  {
    inf: "nach Hause gehen",
    fr: "rentrer à la maison",
    complement: "nach Hause",
    particle: "",
    ich: "gehe",
    du: "gehst",
    er: "geht",
    sie: "geht",
    wir: "gehen",
  },
  {
    inf: "eine Freundin an/rufen",
    fr: "appeler une amie",
    complement: "eine Freundin",
    particle: "an",
    ich: "rufe",
    du: "rufst",
    er: "ruft",
    sie: "ruft",
    wir: "rufen",
  },
  {
    inf: "zu Abend essen",
    fr: "dîner",
    complement: "zu Abend",
    particle: "",
    ich: "esse",
    du: "isst",
    er: "isst",
    sie: "isst",
    wir: "essen",
  },
  {
    inf: "fern/sehen",
    fr: "regarder la télé",
    complement: "",
    particle: "fern",
    ich: "sehe",
    du: "siehst",
    er: "sieht",
    sie: "sieht",
    wir: "sehen",
  },
  {
    inf: "schlafen gehen",
    fr: "aller se coucher",
    complement: "schlafen",
    particle: "",
    ich: "gehe",
    du: "gehst",
    er: "geht",
    sie: "geht",
    wir: "gehen",
  },
  {
    inf: "sich an/ziehen",
    fr: "s'habiller",
    complement: "",
    particle: "an",
    reflexive: { ich: "mich", du: "dich", er: "sich", sie: "sich", wir: "uns" },
    ich: "ziehe",
    du: "ziehst",
    er: "zieht",
    sie: "zieht",
    wir: "ziehen",
  },
  {
    inf: "duschen",
    fr: "se doucher",
    complement: "",
    particle: "",
    ich: "dusche",
    du: "duschst",
    er: "duscht",
    sie: "duscht",
    wir: "duschen",
  },
  {
    inf: "Zähne putzen",
    fr: "se laver les dents",
    complement: "die Zähne",
    particle: "",
    ich: "putze",
    du: "putzt",
    er: "putzt",
    sie: "putzt",
    wir: "putzen",
  },
  {
    inf: "Schultasche packen",
    fr: "faire son cartable",
    complement: "die Schultasche",
    particle: "",
    ich: "packe",
    du: "packst",
    er: "packt",
    sie: "packt",
    wir: "packen",
  },
];

// Six moments of the day. Index doubles as position along the horizon
// (sunrise → noon → sunset → night).
const MOMENTS = [
  { prep: "am", noun: "Morgen" },
  { prep: "am", noun: "Vormittag" },
  { prep: "am", noun: "Mittag" },
  { prep: "am", noun: "Nachmittag" },
  { prep: "am", noun: "Abend" },
  { prep: "in", noun: "der Nacht" },
];


// Horizon face for moment-of-day rounds: an unlabeled sun travelling
// the arc (low east → high south → low west) with a moon for night,
// so the learner has to identify the moment from the position.
function MomentFace({ moment }) {
  const size = 240;
  const horizonY = size * 0.7;
  const idx = MOMENTS.indexOf(moment);
  const positions = [
    { x: size * 0.15, y: size * 0.55, kind: "sun" },
    { x: size * 0.30, y: size * 0.35, kind: "sun" },
    { x: size * 0.50, y: size * 0.20, kind: "sun" },
    { x: size * 0.70, y: size * 0.35, kind: "sun" },
    { x: size * 0.85, y: size * 0.55, kind: "sun" },
    { x: size * 0.50, y: size * 0.30, kind: "moon" },
  ];
  const { x, y, kind } = positions[idx];
  const isNight = kind === "moon";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect x="0" y="0" width={size} height={horizonY} fill={isNight ? "#1a2332" : "#fef5e7"} />
      <rect x="0" y={horizonY} width={size} height={size - horizonY} fill={isNight ? "#0d1521" : "#e8d4b8"} />
      <line x1="0" y1={horizonY} x2={size} y2={horizonY} stroke="#2c2416" strokeWidth="2" />
      {!isNight && (
        <path
          d={`M ${size * 0.1} ${horizonY} Q ${size / 2} ${size * 0.05} ${size * 0.9} ${horizonY}`}
          fill="none" stroke="#c45a3c" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4"
        />
      )}
      {isNight && [[0.2, 0.15, 1.5], [0.35, 0.4, 1], [0.7, 0.2, 1.5], [0.8, 0.45, 1], [0.15, 0.5, 1]].map(([sx, sy, sr], i) => (
        <circle key={i} cx={size * sx} cy={size * sy} r={sr} fill="#fff" />
      ))}
      {isNight ? (
        <g>
          <circle cx={x} cy={y} r="22" fill="#f4f1ea" />
          <circle cx={x + 8} cy={y - 4} r="20" fill="#1a2332" />
        </g>
      ) : (
        <g>
          <circle cx={x} cy={y} r="22" fill="#f39c12" stroke="#c45a3c" strokeWidth="2" />
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={x + Math.cos(angle) * 28}
                y1={y + Math.sin(angle) * 28}
                x2={x + Math.cos(angle) * 36}
                y2={y + Math.sin(angle) * 36}
                stroke="#c45a3c" strokeWidth="3" strokeLinecap="round"
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}

// One round targets exactly one sentence. Template A seeds "Um"
// (time round) or "Am"/"In" (moment round) at the start; template B
// seeds the capitalized subject pronoun. The starter is locked in
// the slot, so only one string can be correct. The clause ends with
// the complement (if any) then the separable particle (if any),
// matching German main-clause word order.
function tagesablaufRound(round) {
  const { verb, subject, template, kind } = round;
  const verbForm = verb[subject];
  const tail = [verb.complement, verb.particle].filter(Boolean).join(" ");
  const tailPart = tail ? " " + tail : "";
  const reflexivePart = verb.reflexive ? " " + verb.reflexive[subject] : "";
  if (kind === "moment") {
    const { prep, noun } = round.moment;
    if (template === "A") {
      return {
        starter: capFirst(prep),
        target: `${capFirst(prep)} ${noun} ${verbForm} ${subject}${reflexivePart}${tailPart}`,
      };
    }
    return {
      starter: capFirst(subject),
      target: `${capFirst(subject)} ${verbForm}${reflexivePart} ${prep} ${noun}${tailPart}`,
    };
  }
  const { hour, minute } = round;
  const timePhrase = germanTime(hour, minute);
  if (template === "A") {
    return {
      starter: "Um",
      target: `Um ${timePhrase} ${verbForm} ${subject}${reflexivePart}${tailPart}`,
    };
  }
  return {
    starter: capFirst(subject),
    target: `${capFirst(subject)} ${verbForm}${reflexivePart} um ${timePhrase}${tailPart}`,
  };
}

function pickTimeDistractors(hour, minute, count) {
  const correct = germanTime(hour, minute);
  const out = new Set();
  let guard = 0;
  while (out.size < count && guard < 80) {
    guard++;
    const h = Math.floor(Math.random() * 12) + 1;
    const m = (Math.floor(Math.random() * 11) + 1) * 5;
    const phrase = germanTime(h, m);
    if (phrase !== correct) out.add(phrase);
  }
  return [...out];
}

function buildTagesablaufPool(round) {
  // The time / moment phrase is delivered as a single fully-formed chunk
  // since the focus is sentence structure, not phrase composition. The
  // complement stays as one chunk, but the separable particle is always
  // its own token so the learner places it at the very end of the clause.
  // Each form-group only exposes a handful of distractors so the pool
  // stays a structure exercise, not a search task.
  const { verb, subject, template, kind } = round;
  const allConjugations = [...new Set(SUBJECTS.map((s) => verb[s]))];
  const conjugations = pickWithDistractors(verb[subject], allConjugations, 2);
  const tailTokens = [];
  if (verb.complement) tailTokens.push(verb.complement);
  if (verb.particle) tailTokens.push(verb.particle);
  // Trap: for separable verbs, slip a couple of joined-prefix
  // conjugations into the pool ("anrufe", "aufstehe"...). Picking one
  // means forgetting to split the particle off in a main clause.
  const traps = verb.particle
    ? shuffle(SUBJECTS.map((s) => verb.particle + verb[s])).slice(0, 2)
    : [];
  const verbChoices = shuffle([...conjugations, ...traps]);
  const reflexives = verb.reflexive
    ? pickWithDistractors(verb.reflexive[subject], [...new Set(SUBJECTS.map((s) => verb.reflexive[s]))], 2)
    : [];
  if (kind === "moment") {
    const nouns = pickWithDistractors(round.moment.noun, MOMENTS.map((m) => m.noun), 3);
    const prepOptions = template === "B" ? ["am", "in"] : [];
    const extras = template === "A" ? [subject] : [];
    return [...new Set([
      ...nouns,
      ...prepOptions,
      ...verbChoices,
      ...reflexives,
      ...tailTokens,
      ...extras,
    ])];
  }
  const { hour, minute } = round;
  const timeOptions = shuffle([germanTime(hour, minute), ...pickTimeDistractors(hour, minute, 2)]);
  const extras = template === "A" ? [subject] : ["um"];
  return [...new Set([
    ...timeOptions,
    ...verbChoices,
    ...reflexives,
    ...tailTokens,
    ...extras,
  ])];
}

function TagesablaufView() {
  const data = typeof window !== "undefined" ? window.TAGESABLAUF_DATA : null;
  const [round, setRound] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [stats, recordResult] = useModuleStats("tagesablauf");

  const nextRound = useCallback(() => {
    if (!data || data.length === 0) return;
    const verb = data[Math.floor(Math.random() * data.length)];
    const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    const template = Math.random() < 0.5 ? "A" : "B";
    if (Math.random() < 2 / 3) {
      const moment = MOMENTS[Math.floor(Math.random() * MOMENTS.length)];
      setRound({ kind: "moment", verb, subject, moment, template });
    } else {
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = (Math.floor(Math.random() * 11) + 1) * 5;
      setRound({ kind: "time", verb, subject, hour, minute, template });
    }
    setTokens([]);
    setResult(null);
  }, [data]);

  useEffect(() => { nextRound(); }, [nextRound]);

  const addToken = (word) => {
    if (result) return;
    setTokens((t) => [...t, word]);
  };

  const removeToken = (idx) => {
    if (result) return;
    setTokens((t) => t.filter((_, i) => i !== idx));
  };

  const clearTokens = () => {
    if (result) return;
    setTokens([]);
  };

  const checkAnswer = () => {
    if (!round || result || tokens.length === 0) return;
    const { starter, target } = tagesablaufRound(round);
    const phrase = [starter, ...tokens].join(" ");
    const isCorrect = phrase === target;
    const newStreak = isCorrect ? streak + 1 : 0;
    setResult(isCorrect ? "correct" : "wrong");
    setStreak(newStreak);
    recordResult(isCorrect, newStreak);
  };

  if (!data || !round) {
    return (
      <div className="fade-in" style={{ paddingTop: 32 }}>
        <ModuleHeader title="Tagesablauf" stats={stats} streak={streak} />
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ color: "var(--ink2)", position: "relative" }}>Loading…</p>
        </div>
      </div>
    );
  }

  const { verb, subject } = round;
  const pool = buildTagesablaufPool(round);
  const { starter, target } = tagesablaufRound(round);
  const slotClass = result === "correct"
    ? "time-slot-correct"
    : result === "wrong"
      ? "time-slot-wrong"
      : "";
  const cueLabel = round.kind === "moment"
    ? `${round.moment.prep} ${round.moment.noun}`
    : formatDigital(round.hour, round.minute);

  return (
    <div className="fade-in" style={{ paddingTop: 32 }}>
      <ModuleHeader title="Tagesablauf" stats={stats} streak={streak} />

      <div className="card" style={{ marginBottom: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          {round.kind === "moment"
            ? <MomentFace moment={round.moment} />
            : <ClockFace hour={round.hour} minute={round.minute} />}
        </div>
        <div style={{ position: "relative", marginTop: 12, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
            {FR_PRON[subject]} ({subject})
          </div>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>
            {verb.fr}
          </div>
        </div>
        {result && (
          <div className="fade-in" style={{ marginTop: 10, textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: 13, color: "var(--ink2)", fontWeight: 500 }}>
              {cueLabel}
            </div>
            <div style={{ fontSize: 15, color: result === "correct" ? "var(--green)" : "var(--red)", fontWeight: 600, marginTop: 2 }}>
              {target}
            </div>
          </div>
        )}
      </div>

      <div className={`time-slot ${slotClass}`}>
        <span className="time-token time-token-locked">{starter}</span>
        {tokens.map((w, i) => (
          <button
            key={i}
            className="time-token time-token-selected"
            onClick={() => removeToken(i)}
            disabled={result !== null}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="time-pool">
        {pool.map((w) => (
          <button
            key={w}
            className="time-token"
            onClick={() => addToken(w)}
            disabled={result !== null}
          >
            {w}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {result ? (
          <button className="btn btn-primary" onClick={nextRound} style={{ flex: 1 }}>
            Next {"\u2192"}
          </button>
        ) : (
          <>
            <button
              className="btn btn-outline"
              onClick={clearTokens}
              disabled={tokens.length === 0}
              style={{ flex: 1 }}
            >
              Clear
            </button>
            <button
              className="btn btn-primary"
              onClick={checkAnswer}
              disabled={tokens.length === 0}
              style={{ flex: 2 }}
            >
              Check
            </button>
          </>
        )}
      </div>

      <ModuleStatsFooter stats={stats} />
    </div>
  );
}

  register({ id: "tagesablauf", icon: "\u{1F305}", label: "Alltag", component: TagesablaufView });
})();
