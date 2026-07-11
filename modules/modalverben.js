/* Modalverben — modal-verb sentence builder (data + view).
   Self-contained module registered via window.MischMasch. */
(() => {
  const { useState, useEffect, useCallback } = React;
  const {
    register, useModuleStats, ModuleHeader, ModuleStatsFooter,
    shuffle, capFirst, SUBJECTS, FR_PRON,
  } = window.MischMasch;

// Modalverben drill data (dürfen / müssen / können).
//
// Teaching points:
//   1. Modal conjugation — dürfen: ich darf / du darfst / er darf / wir dürfen…
//   2. Satzklammer — the main verb goes to the END as an infinitive:
//      "Ich muss das Zimmer aufräumen."
//   3. Negation — the choice between "kein" and "nicht":
//        • kein- replaces an indefinite / zero article and declines like ein
//          in the accusative: keinen (m) · keine (f) · kein (n) · keine (pl)
//          → "Ich darf keinen Alkohol trinken." / "…keine Zigaretten rauchen."
//        • nicht negates everything else — a bare verb, a prepositional phrase,
//          or a definite/possessive object (placed just before the infinitive):
//          → "Ich darf nicht mobben." / "…nicht in die Schule gehen."
//          → "Ich muss das Zimmer nicht aufräumen."
//
// Each activity stores the affirmative and negative tails as explicit token
// arrays (everything after the conjugated modal), so the negation form and
// its placement are always correct — no runtime derivation to get wrong.
window.MODALVERBEN_DATA = {
  modals: {
    "dürfen": { fr: "avoir le droit de", ich: "darf",  du: "darfst",  er: "darf",  sie: "darf",  wir: "dürfen" },
    "müssen": { fr: "devoir",            ich: "muss",  du: "musst",   er: "muss",  sie: "muss",  wir: "müssen" },
    "können": { fr: "pouvoir",           ich: "kann",  du: "kannst",  er: "kann",  sie: "kann",  wir: "können" },
  },
  // neg tails cover: kein pl (keine), kein m (keinen), kein n (kein),
  // nicht + bare verb, nicht + prep phrase, nicht + definite object.
  activities: [
    { fr: "jouer au parc",              aff: ["im", "Park", "spielen"],          neg: ["nicht", "im", "Park", "spielen"] },
    { fr: "organiser une fête",         aff: ["eine", "Party", "organisieren"],  neg: ["keine", "Party", "organisieren"] },
    { fr: "jouer aux jeux vidéo",       aff: ["Videospiele", "spielen"],         neg: ["keine", "Videospiele", "spielen"] },
    { fr: "aller nager",                aff: ["schwimmen", "gehen"],             neg: ["nicht", "schwimmen", "gehen"] },
    { fr: "regarder des films",         aff: ["Filme", "sehen"],                 neg: ["keine", "Filme", "sehen"] },
    { fr: "manger une glace",           aff: ["ein", "Eis", "essen"],            neg: ["kein", "Eis", "essen"] },
    { fr: "fumer des cigarettes",       aff: ["Zigaretten", "rauchen"],          neg: ["keine", "Zigaretten", "rauchen"] },
    { fr: "boire de l'alcool",          aff: ["Alkohol", "trinken"],             neg: ["keinen", "Alkohol", "trinken"] },
    { fr: "harceler",                   aff: ["mobben"],                         neg: ["nicht", "mobben"] },
    { fr: "prendre de la drogue",       aff: ["Drogen", "nehmen"],               neg: ["keine", "Drogen", "nehmen"] },
    { fr: "dormir en classe",           aff: ["in", "der", "Klasse", "schlafen"], neg: ["nicht", "in", "der", "Klasse", "schlafen"] },
    { fr: "aller à l'école",            aff: ["in", "die", "Schule", "gehen"],   neg: ["nicht", "in", "die", "Schule", "gehen"] },
    { fr: "faire les devoirs",          aff: ["Hausaufgaben", "machen"],         neg: ["keine", "Hausaufgaben", "machen"] },
    { fr: "ranger la chambre",          aff: ["das", "Zimmer", "aufräumen"],     neg: ["das", "Zimmer", "nicht", "aufräumen"] },
    { fr: "faire du sport",             aff: ["Sport", "machen"],                neg: ["keinen", "Sport", "machen"] },
    { fr: "prendre le petit-déjeuner",  aff: ["frühstücken"],                    neg: ["nicht", "frühstücken"] },
  ],
};

// Sentence builder: conjugate the modal, keep the main verb at the end,
// and choose the right negation (kein-/nicht) for negative rounds.
const NEG_WORDS = ["nicht", "kein", "keine", "keinen"];

function modalverbenRound(data) {
  const modalKeys = Object.keys(data.modals);
  const modalKey = modalKeys[Math.floor(Math.random() * modalKeys.length)];
  const modal = data.modals[modalKey];
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  const activity = data.activities[Math.floor(Math.random() * data.activities.length)];
  const negative = Math.random() < 0.5;
  const tail = negative ? activity.neg : activity.aff;
  const target = [capFirst(subject), modal[subject], ...tail].join(" ");
  return { modalKey, modal, subject, activity, negative, tail, target };
}

function buildModalverbenPool(round, data) {
  const { modal, subject, tail } = round;
  // Two wrong conjugations of the same modal as traps.
  const modalForms = [...new Set(SUBJECTS.map((s) => modal[s]))];
  const modalTraps = shuffle(modalForms.filter((f) => f !== modal[subject])).slice(0, 2);
  // Negation traps: the negation words NOT used in this target (so a kein
  // round offers "nicht" and the other kein forms, and vice versa).
  const negInTarget = tail.filter((t) => NEG_WORDS.includes(t));
  const negTraps = shuffle(NEG_WORDS.filter((w) => !negInTarget.includes(w))).slice(0, 2);
  return shuffle([...new Set([modal[subject], ...modalTraps, ...tail, ...negTraps])]);
}

function ModalverbenView() {
  const data = typeof window !== "undefined" ? window.MODALVERBEN_DATA : null;
  const [round, setRound] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [stats, recordResult] = useModuleStats("modalverben");

  const nextRound = useCallback(() => {
    if (!data) return;
    setRound(modalverbenRound(data));
    setTokens([]);
    setResult(null);
  }, [data]);

  useEffect(() => { nextRound(); }, [nextRound]);

  const addToken = (w) => { if (!result) setTokens((t) => [...t, w]); };
  const removeToken = (idx) => { if (!result) setTokens((t) => t.filter((_, i) => i !== idx)); };
  const clearTokens = () => { if (!result) setTokens([]); };

  const checkAnswer = () => {
    if (!round || result || tokens.length === 0) return;
    const phrase = [capFirst(round.subject), ...tokens].join(" ");
    const isCorrect = phrase === round.target;
    const newStreak = isCorrect ? streak + 1 : 0;
    setResult(isCorrect ? "correct" : "wrong");
    setStreak(newStreak);
    recordResult(isCorrect, newStreak);
  };

  if (!data || !round) {
    return (
      <div className="fade-in" style={{ paddingTop: 32 }}>
        <ModuleHeader title="Modalverben" stats={stats} streak={streak} />
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ color: "var(--ink2)", position: "relative" }}>Loading…</p>
        </div>
      </div>
    );
  }

  const { modal, subject, activity, negative, target } = round;
  const pool = buildModalverbenPool(round, data);
  const starter = capFirst(subject);
  const slotClass = result === "correct" ? "time-slot-correct" : result === "wrong" ? "time-slot-wrong" : "";

  return (
    <div className="fade-in" style={{ paddingTop: 32 }}>
      <ModuleHeader title="Modalverben" stats={stats} streak={streak} />

      <div className="card" style={{ marginBottom: 16, padding: 22, textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: negative ? "var(--red)" : "var(--green)", background: negative ? "#fdecea" : "#e8f8f0" }}>
          {negative ? "✗ négatif" : "✓ affirmatif"}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, marginTop: 12, position: "relative" }}>
          {FR_PRON[subject]} ({subject}) · {modal.fr}
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 700, color: "var(--ink)", marginTop: 4, position: "relative" }}>
          {negative ? "ne pas " : ""}{activity.fr}
        </div>
        {result && (
          <div className="fade-in" style={{ marginTop: 10, position: "relative" }}>
            <div style={{ fontSize: 16, color: result === "correct" ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
              {target}
            </div>
          </div>
        )}
      </div>

      <div className={`time-slot ${slotClass}`}>
        <span className="time-token time-token-locked">{starter}</span>
        {tokens.map((w, i) => (
          <button key={i} className="time-token time-token-selected" onClick={() => removeToken(i)} disabled={result !== null}>
            {w}
          </button>
        ))}
      </div>

      <div className="time-pool">
        {pool.map((w) => (
          <button key={w} className="time-token" onClick={() => addToken(w)} disabled={result !== null}>
            {w}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {result ? (
          <button className="btn btn-primary" onClick={nextRound} style={{ flex: 1 }}>
            Next {"→"}
          </button>
        ) : (
          <>
            <button className="btn btn-outline" onClick={clearTokens} disabled={tokens.length === 0} style={{ flex: 1 }}>
              Clear
            </button>
            <button className="btn btn-primary" onClick={checkAnswer} disabled={tokens.length === 0} style={{ flex: 2 }}>
              Check
            </button>
          </>
        )}
      </div>

      <ModuleStatsFooter stats={stats} />
    </div>
  );
}

  register({ id: "modalverben", icon: "\u{1F6A6}", label: "Modalverben", component: ModalverbenView });
})();
