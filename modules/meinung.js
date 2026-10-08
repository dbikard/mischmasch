/* Meine Meinung — giving an opinion, with and without a subordinate clause
   (data + view). Self-contained module registered via window.MischMasch. */
(() => {
  const { useState, useEffect, useCallback } = React;
  const {
    register, useModuleStats, ModuleHeader, ModuleStatsFooter,
    shuffle, recordSRItem,
  } = window.MischMasch;

// "Je donne mon avis" (5e) — the two verb positions from the lesson:
//   1. sans subordonnée — an opener takes position 1, so the conjugated
//      verb comes 2nd, before the subject (inversion):
//        "Für mich ist Sport gut gegen Stress."
//        "Was mich betrifft, ist Sport gut gegen Stress."
//   2. avec subordonnée — "Ich denke / meine / finde, dass …": the
//      conjugated verb goes to the END of the dass-clause:
//        "Ich denke, dass Sport gut gegen Stress ist."
//
// Each statement is split into subject / conjugated verb / middle / final
// infinitive so both word orders are built from the same parts:
//   Hauptsatz   verb + subj + mid + end
//   Nebensatz   subj + mid + end + verb
// The statements use the 5e vocabulary (Gesundheit & Sport).
window.MEINUNG_DATA = {
  openers: [
    { id: "fuer-mich",         de: "Für mich",            fr: "Pour moi" },
    { id: "meiner-meinung",    de: "Meiner Meinung nach", fr: "À mon avis" },
    { id: "was-mich-betrifft", de: "Was mich betrifft,",  fr: "En ce qui me concerne" },
  ],
  dassVerbs: [
    { de: "Ich denke, dass", fr: "Je pense que" },
    { de: "Ich meine, dass", fr: "Je pense que" },
    { de: "Ich finde, dass", fr: "Je trouve que" },
  ],
  statements: [
    { fr: "le sport est bon contre le stress",      subj: ["Sport"],           verb: "ist",   mid: ["gut", "gegen", "Stress"] },
    { fr: "le sport est bon contre le stress du quotidien", subj: ["Sport"],   verb: "ist",   mid: ["gut", "gegen", "Alltagsstress"] },
    { fr: "le sport est bon pour la santé",         subj: ["Sport"],           verb: "ist",   mid: ["gesund"] },
    { fr: "le sport, c'est amusant",                subj: ["Sport"],           verb: "macht", mid: ["Spaß"] },
    { fr: "on réfléchit mieux",                     subj: ["das", "Denken"],   verb: "klappt", mid: ["besser"] },
    { fr: "il ne faut pas exagérer",                subj: ["man"],             verb: "soll",  mid: ["nicht"], end: ["übertreiben"] },
    { fr: "le sport est pénible",                   subj: ["Sport"],           verb: "ist",   mid: ["anstrengend"] },
    { fr: "le sport est dangereux",                 subj: ["Sport"],           verb: "ist",   mid: ["gefährlich"] },
    { fr: "on peut se blesser",                     subj: ["man"],             verb: "kann",  mid: ["sich"], end: ["verletzen"] },
    { fr: "on a des courbatures",                   subj: ["man"],             verb: "hat",   mid: ["Muskelkater"] },
    { fr: "le sport est ennuyeux",                  subj: ["Sport"],           verb: "ist",   mid: ["langweilig"] },
    { fr: "la natation est bonne pour la santé",    subj: ["Schwimmen"],       verb: "ist",   mid: ["gesund"] },
    { fr: "le tennis, c'est amusant",               subj: ["Tennis"],          verb: "macht", mid: ["Spaß"] },
    { fr: "le football est dangereux",              subj: ["Fußball"],         verb: "ist",   mid: ["gefährlich"] },
    // From the debate table "für oder gegen Sport"
    { fr: "le sport est bon pour le cerveau",       subj: ["Sport"],           verb: "ist",   mid: ["gut", "für", "das", "Gehirn"] },
    { fr: "le sport est bon pour le corps",         subj: ["Sport"],           verb: "ist",   mid: ["gut", "für", "den", "Körper"] },
    { fr: "le sport est fatigant",                  subj: ["Sport"],           verb: "ist",   mid: ["ermüdend"] },
    { fr: "le sport est cher",                      subj: ["Sport"],           verb: "ist",   mid: ["teuer"] },
    { fr: "on peut se défouler",                    subj: ["man"],             verb: "kann",  mid: ["sich"], end: ["austoben"] },
    { fr: "on peut voir des amis",                  subj: ["man"],             verb: "kann",  mid: ["Freunde"], end: ["treffen"] },
    { fr: "on pense à autre chose",                 subj: ["man"],             verb: "denkt", mid: ["an", "etwas", "anderes"] },
    { fr: "on est sous pression",                   subj: ["man"],             verb: "ist",   mid: ["unter", "Druck"] },
    { fr: "il faut beaucoup d'énergie",             subj: ["man"],             verb: "braucht", mid: ["viel", "Energie"] },
  ],
};

// "que" + vowel → "qu'" (Je pense qu'on …).
function frJoin(opener, clause, dass) {
  if (!dass) return `${opener}, ${clause}`;
  return /^[aeiouhéè]/i.test(clause) ? `${opener.slice(0, -1)}'${clause}` : `${opener} ${clause}`;
}

// kind: an opener id (Hauptsatz, verb 2nd) or "dass" (Nebensatz, verb last).
function meinungRound(kind) {
  const data = window.MEINUNG_DATA;
  const st = data.statements[Math.floor(Math.random() * data.statements.length)];
  const end = st.end || [];
  const dass = kind === "dass";
  const opener = dass
    ? data.dassVerbs[Math.floor(Math.random() * data.dassVerbs.length)]
    : data.openers.find((o) => o.id === kind);
  const tail = dass
    ? [...st.subj, ...st.mid, ...end, st.verb]
    : [st.verb, ...st.subj, ...st.mid, ...end];
  return {
    kind, dass, opener, statement: st,
    starter: opener.de,
    target: [opener.de, ...tail].join(" "),
    pool: shuffle(tail),
    prompt: frJoin(opener.fr, st.fr, dass),
  };
}

// On a miss, restate the rule of the round — with this sentence's verb.
function meinungHint(round) {
  const v = round.statement.verb;
  return round.dass
    ? `Nebensatz mit „dass“: das Verb „${v}“ steht am Ende`
    : `Nach „${round.opener.de.replace(/,$/, "")}“ steht das Verb „${v}“ an 2. Stelle — vor dem Subjekt`;
}

const BADGE = (dass) => (dass ? "avec subordonnée · verbe à la fin" : "sans subordonnée · verbe en 2e position");

function MeinungView() {
  const [round, setRound] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [stats, recordResult] = useModuleStats("meinung");

  const nextRound = useCallback(() => {
    // Half the rounds with a dass-clause, half spread over the openers.
    const openers = window.MEINUNG_DATA.openers;
    const kind = Math.random() < 0.5 ? "dass" : openers[Math.floor(Math.random() * openers.length)].id;
    setRound(meinungRound(kind));
    setTokens([]);
    setResult(null);
  }, []);

  useEffect(() => { nextRound(); }, [nextRound]);

  const addToken = (i) => { if (!result) setTokens((t) => [...t, i]); };
  const removeToken = (idx) => { if (!result) setTokens((t) => t.filter((_, j) => j !== idx)); };
  const clearTokens = () => { if (!result) setTokens([]); };

  const checkAnswer = () => {
    if (!round || result || tokens.length === 0) return;
    const phrase = [round.starter, ...tokens.map((i) => round.pool[i])].join(" ");
    const isCorrect = phrase === round.target;
    const newStreak = isCorrect ? streak + 1 : 0;
    setResult(isCorrect ? "correct" : "wrong");
    setStreak(newStreak);
    recordResult(isCorrect, newStreak);
    recordSRItem("meinung:" + round.kind, isCorrect);
  };

  if (!round) {
    return (
      <div className="fade-in" style={{ paddingTop: 32 }}>
        <ModuleHeader title="Meine Meinung" stats={stats} streak={streak} />
      </div>
    );
  }

  const slotClass = result === "correct" ? "time-slot-correct" : result === "wrong" ? "time-slot-wrong" : "";

  return (
    <div className="fade-in" style={{ paddingTop: 32 }}>
      <ModuleHeader title="Meine Meinung" stats={stats} streak={streak} />

      <div className="card" style={{ marginBottom: 16, padding: 22, textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: round.dass ? "var(--accent)" : "var(--green)", background: round.dass ? "#fef5f2" : "#e8f8f0" }}>
          {BADGE(round.dass)}
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, color: "var(--ink)", marginTop: 12, position: "relative" }}>
          {round.prompt}
        </div>
        {result && (
          <div className="fade-in" style={{ marginTop: 10, fontSize: 16, color: result === "correct" ? "var(--green)" : "var(--red)", fontWeight: 600, position: "relative" }}>
            {round.target}.
          </div>
        )}
        {result === "wrong" && (
          <div className="fade-in" style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "#fef5e7", fontSize: 12, fontWeight: 600, color: "var(--accent)", position: "relative" }}>
            {"\u{1F4A1}"} {meinungHint(round)}
          </div>
        )}
      </div>

      <div className={`time-slot ${slotClass}`}>
        <span className="time-token time-token-locked">{round.starter}</span>
        {tokens.map((i, idx) => (
          <button key={idx} className="time-token time-token-selected" onClick={() => removeToken(idx)} disabled={result !== null}>
            {round.pool[i]}
          </button>
        ))}
      </div>

      <div className="time-pool">
        {round.pool.map((w, i) => (
          <button key={i} className="time-token" onClick={() => addToken(i)} disabled={result !== null || tokens.includes(i)} style={tokens.includes(i) ? { opacity: 0.35 } : undefined}>
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
            <button className="btn btn-primary" onClick={checkAnswer} disabled={tokens.length !== round.pool.length} style={{ flex: 2 }}>
              Check
            </button>
          </>
        )}
      </div>

      <ModuleStatsFooter stats={stats} />
    </div>
  );
}

  // Auto-Mode: one item per opener (verb 2nd) plus one for dass (verb last).
  register({
    id: "meinung", icon: "\u{1F4AC}", label: "Meine Meinung", year: "5e", component: MeinungView,
    sr: {
      items: () => [...window.MEINUNG_DATA.openers.map((o) => "meinung:" + o.id), "meinung:dass"],
      generateRound: (id) => {
        const round = meinungRound(id.split(":")[1]);
        return {
          kind: "tokens",
          badge: BADGE(round.dass),
          badgeNeg: false,
          prompt: round.prompt,
          starter: round.starter,
          pool: round.pool,
          target: round.target,
          wrongHint: () => meinungHint(round),
        };
      },
    },
  });
})();
