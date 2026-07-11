/* Akkusativ — accusative-article drill (data + view).
   Self-contained module registered via window.MischMasch. */
(() => {
  const { useState, useEffect, useCallback } = React;
  const {
    register, useModuleStats, ModuleHeader, ModuleStatsFooter,
    shuffle, capFirst, SUBJECTS, FR_PRON,
  } = window.MischMasch;

// Akkusativ (COD ⇒ accusatif) drill data.
//
// The learner builds "Subjekt + Verb + Artikel + Nomen" and must pick the
// correct accusative article. The teaching point (from the lesson): only the
// masculine article changes in the accusative —
//   bestimmt (défini):   der → den,  die → die,  das → das,  die(pl) → die
//   unbestimmt (indéfini): ein → einen, eine → eine, ein → ein
//
// Each verb carries its present-tense forms for ich/du/er/sie/wir plus a
// French infinitive gloss. Each noun carries its gender (m/f/n/pl), a French
// gloss, and the list of verbs it makes sense with, so rounds never produce
// nonsense like "sie liest einen Apfelsaft".
window.AKKUSATIV_DATA = {
  verbs: {
    essen:      { fr: "manger",   ich: "esse",     du: "isst",     er: "isst",     sie: "isst",     wir: "essen" },
    trinken:    { fr: "boire",    ich: "trinke",   du: "trinkst",  er: "trinkt",   sie: "trinkt",   wir: "trinken" },
    lesen:      { fr: "lire",     ich: "lese",     du: "liest",    er: "liest",    sie: "liest",    wir: "lesen" },
    machen:     { fr: "faire",    ich: "mache",    du: "machst",   er: "macht",    sie: "macht",    wir: "machen" },
    treffen:    { fr: "rencontrer", ich: "treffe", du: "triffst",  er: "trifft",   sie: "trifft",   wir: "treffen" },
    kaufen:     { fr: "acheter",  ich: "kaufe",    du: "kaufst",   er: "kauft",    sie: "kauft",    wir: "kaufen" },
    haben:      { fr: "avoir",    ich: "habe",     du: "hast",     er: "hat",      sie: "hat",      wir: "haben" },
    sehen:      { fr: "voir",     ich: "sehe",     du: "siehst",   er: "sieht",    sie: "sieht",    wir: "sehen" },
    bestellen:  { fr: "commander", ich: "bestelle", du: "bestellst", er: "bestellt", sie: "bestellt", wir: "bestellen" },
    mögen:      { fr: "aimer",    ich: "mag",      du: "magst",    er: "mag",      sie: "mag",      wir: "mögen" },
    nehmen:     { fr: "prendre",  ich: "nehme",    du: "nimmst",   er: "nimmt",    sie: "nimmt",    wir: "nehmen" },
    suchen:     { fr: "chercher", ich: "suche",    du: "suchst",   er: "sucht",    sie: "sucht",    wir: "suchen" },
  },
  nouns: [
    // masculine (der → den / ein → einen) — the forms that change
    { de: "Apfelkuchen", g: "m", fr: "le gâteau aux pommes", verbs: ["essen", "mögen", "bestellen", "kaufen", "nehmen"] },
    { de: "Apfelstrudel", g: "m", fr: "le strudel aux pommes", verbs: ["essen", "mögen", "bestellen", "kaufen"] },
    { de: "Apfelsaft", g: "m", fr: "le jus de pomme", verbs: ["trinken", "mögen", "bestellen", "kaufen", "nehmen"] },
    { de: "Tee", g: "m", fr: "le thé", verbs: ["trinken", "mögen", "bestellen", "kaufen"] },
    { de: "Kaffee", g: "m", fr: "le café", verbs: ["trinken", "mögen", "bestellen", "kaufen"] },
    { de: "Ball", g: "m", fr: "le ballon", verbs: ["haben", "kaufen", "suchen", "sehen", "nehmen"] },
    { de: "Film", g: "m", fr: "le film", verbs: ["sehen", "mögen", "suchen"] },
    // feminine (die → die) — no change
    { de: "Freundin", g: "f", fr: "l'amie", verbs: ["treffen", "haben", "sehen", "suchen"] },
    { de: "Cola", g: "f", fr: "le coca", verbs: ["trinken", "mögen", "bestellen", "kaufen", "nehmen"] },
    { de: "Limo", g: "f", fr: "la limonade", verbs: ["trinken", "mögen", "bestellen", "kaufen"] },
    { de: "Linzertorte", g: "f", fr: "la tarte de Linz", verbs: ["essen", "mögen", "bestellen", "kaufen"] },
    { de: "Pizza", g: "f", fr: "la pizza", verbs: ["essen", "mögen", "bestellen", "kaufen", "nehmen"] },
    // neuter (das → das) — no change
    { de: "Buch", g: "n", fr: "le livre", verbs: ["lesen", "haben", "kaufen", "suchen", "sehen", "mögen", "nehmen"] },
    { de: "Eis", g: "n", fr: "la glace", verbs: ["essen", "mögen", "bestellen", "kaufen", "nehmen"] },
    { de: "Mineralwasser", g: "n", fr: "l'eau minérale", verbs: ["trinken", "mögen", "bestellen", "kaufen"] },
    { de: "Fahrrad", g: "n", fr: "le vélo", verbs: ["haben", "kaufen", "suchen", "sehen", "nehmen"] },
    { de: "Auto", g: "n", fr: "la voiture", verbs: ["haben", "kaufen", "suchen", "sehen"] },
    // plural (die → die) — no change; only definite article used
    { de: "Hausaufgaben", g: "pl", fr: "les devoirs", verbs: ["machen", "haben", "sehen"] },
    { de: "Spaghetti", g: "pl", fr: "les spaghettis", verbs: ["essen", "mögen", "bestellen", "kaufen"] },
    { de: "Freunde", g: "pl", fr: "les amis", verbs: ["treffen", "haben", "sehen", "suchen"] },
  ],
};

// Nominative → accusative article forms. Only the masculine column
// changes; everything else is identical to the nominative.
const AKK_DEF = { m: "den", f: "die", n: "das", pl: "die" };
const AKK_INDEF = { m: "einen", f: "eine", n: "ein" };
const NOM_ART = { m: "der", f: "die", n: "das", pl: "die" };

function akkusativRound(data) {
  const noun = data.nouns[Math.floor(Math.random() * data.nouns.length)];
  const verbInf = noun.verbs[Math.floor(Math.random() * noun.verbs.length)];
  const verb = data.verbs[verbInf];
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  // Plural has no indefinite article, so those rounds are always definite.
  const definite = noun.g === "pl" ? true : Math.random() < 0.5;
  const correct = definite ? AKK_DEF[noun.g] : AKK_INDEF[noun.g];
  const options = definite
    ? shuffle(["den", "die", "das"])
    : shuffle(["einen", "eine", "ein"]);
  return { noun, verb, verbInf, subject, definite, correct, options };
}

function AkkusativView() {
  const data = typeof window !== "undefined" ? window.AKKUSATIV_DATA : null;
  const [round, setRound] = useState(null);
  const [picked, setPicked] = useState(null);
  const [streak, setStreak] = useState(0);
  const [stats, recordResult] = useModuleStats("akkusativ");

  const nextRound = useCallback(() => {
    if (!data) return;
    setRound(akkusativRound(data));
    setPicked(null);
  }, [data]);

  useEffect(() => { nextRound(); }, [nextRound]);

  const choose = (opt) => {
    if (picked || !round) return;
    const isCorrect = opt === round.correct;
    const newStreak = isCorrect ? streak + 1 : 0;
    setPicked(opt);
    setStreak(newStreak);
    recordResult(isCorrect, newStreak);
  };

  if (!data || !round) {
    return (
      <div className="fade-in" style={{ paddingTop: 32 }}>
        <ModuleHeader title="Akkusativ" stats={stats} streak={streak} />
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ color: "var(--ink2)", position: "relative" }}>Loading…</p>
        </div>
      </div>
    );
  }

  const { noun, verb, subject, definite, correct, options } = round;
  const genderTag = { m: "masculin", f: "féminin", n: "neutre", pl: "pluriel" }[noun.g];
  const nomArticle = NOM_ART[noun.g];
  const changes = noun.g === "m"; // only the masculine article changes

  return (
    <div className="fade-in" style={{ paddingTop: 32 }}>
      <ModuleHeader title="Akkusativ" stats={stats} streak={streak} />

      <div className="card" style={{ marginBottom: 16, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "var(--ink2)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, position: "relative" }}>
          {FR_PRON[subject]} · {verb.fr} · {noun.fr}
        </div>
        <div style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 700, color: "var(--ink)", marginTop: 12, position: "relative", lineHeight: 1.35 }}>
          {capFirst(subject)} {verb[subject]}{" "}
          <span style={{ color: picked ? (picked === correct ? "var(--green)" : "var(--red)") : "var(--accent)", borderBottom: "2px solid currentColor", padding: "0 4px", minWidth: 44, display: "inline-block" }}>
            {picked || "?"}
          </span>{" "}
          {noun.de}.
        </div>
        <div style={{ fontSize: 12, color: "var(--ink2)", marginTop: 10, position: "relative" }}>
          {nomArticle} {noun.de} · {genderTag} · {definite ? "défini" : "indéfini"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {options.map((opt) => {
          let cls = "choice-btn";
          if (picked) {
            if (opt === correct) cls += " choice-correct";
            else if (opt === picked) cls += " choice-wrong";
          }
          return (
            <button key={opt} className={cls} onClick={() => choose(opt)} disabled={picked !== null}>
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="fade-in card" style={{ padding: 18, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 700, color: "var(--green)", position: "relative" }}>
            {capFirst(subject)} {verb[subject]} {correct} {noun.de}.
          </div>
          <div style={{ fontSize: 13, color: "var(--ink2)", marginTop: 8, position: "relative" }}>
            {changes
              ? `${genderTag} : ${nomArticle} → ${correct} (seul le masculin change !)`
              : `${genderTag} : ${nomArticle} → ${correct} (pas de changement)`}
          </div>
        </div>
      )}

      {picked && (
        <button className="btn btn-primary" onClick={nextRound}>
          Next {"→"}
        </button>
      )}

      <ModuleStatsFooter stats={stats} />
    </div>
  );
}

  register({ id: "akkusativ", icon: "\u{1F3AF}", label: "Akkusativ", component: AkkusativView });
})();
