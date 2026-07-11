/* Uhrzeit — assemble the German phrase for the shown clock time.
   Self-contained module: shared runtime comes from window.MischMasch,
   and the last line registers it into the app. */
(() => {
  const { useState, useEffect, useCallback } = React;
  const {
    register, useModuleStats, ModuleHeader, ModuleStatsFooter,
    ClockFace, germanTime, formatDigital, recordSRItem,
  } = window.MischMasch;

const TIME_WORD_POOL = [
  "ein", "eins", "zwei", "drei", "vier", "fünf", "sechs",
  "sieben", "acht", "neun", "zehn", "elf", "zwölf", "zwanzig",
  "viertel", "halb", "nach", "vor",
];

// Phrase pattern (SR item class) for a given minute — must stay in sync
// with TIME_CLASS_MIN below.
function timeClassOf(m) {
  for (const [cls, mins] of Object.entries(TIME_CLASS_MIN)) {
    if (mins.includes(m)) return cls;
  }
  return "nach";
}

function TimeView() {
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [stats, recordResult] = useModuleStats("time");

  const nextRound = useCallback(() => {
    const h = Math.floor(Math.random() * 12) + 1;
    // Minutes 5..55 in 5-minute steps; skip 0 since the pool has no "Uhr".
    const m = (Math.floor(Math.random() * 11) + 1) * 5;
    setHour(h);
    setMinute(m);
    setTokens([]);
    setResult(null);
  }, []);

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
    if (result || tokens.length === 0) return;
    const phrase = tokens.join(" ");
    const isCorrect = phrase === germanTime(hour, minute);
    const newStreak = isCorrect ? streak + 1 : 0;
    setResult(isCorrect ? "correct" : "wrong");
    setStreak(newStreak);
    recordResult(isCorrect, newStreak);
    recordSRItem("time:" + timeClassOf(minute), isCorrect);
    setTimeout(nextRound, 1800);
  };

  const correctPhrase = germanTime(hour, minute);
  const slotClass = result === "correct"
    ? "time-slot-correct"
    : result === "wrong"
      ? "time-slot-wrong"
      : "";

  return (
    <div className="fade-in" style={{ paddingTop: 32 }}>
      <ModuleHeader title="Uhrzeit" stats={stats} streak={streak} />

      <div className="card" style={{ marginBottom: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <ClockFace hour={hour} minute={minute} />
        </div>
        {result && (
          <div className="fade-in" style={{ marginTop: 12, textAlign: "center", position: "relative" }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
              {formatDigital(hour, minute)}
            </div>
            <div style={{ fontSize: 15, color: result === "correct" ? "var(--green)" : "var(--red)", fontWeight: 600, marginTop: 2 }}>
              {correctPhrase}
            </div>
          </div>
        )}
      </div>

      <div className={`time-slot ${slotClass}`}>
        {tokens.length === 0 ? (
          <span className="time-slot-empty">Tap words below to build the phrase</span>
        ) : (
          tokens.map((w, i) => (
            <button
              key={i}
              className="time-token time-token-selected"
              onClick={() => removeToken(i)}
              disabled={result !== null}
            >
              {w}
            </button>
          ))
        )}
      </div>

      <div className="time-pool">
        {TIME_WORD_POOL.map((w) => (
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
        <button
          className="btn btn-outline"
          onClick={clearTokens}
          disabled={result !== null || tokens.length === 0}
          style={{ flex: 1 }}
        >
          Clear
        </button>
        <button
          className="btn btn-primary"
          onClick={checkAnswer}
          disabled={result !== null || tokens.length === 0}
          style={{ flex: 2 }}
        >
          Check
        </button>
      </div>

      <ModuleStatsFooter stats={stats} />
    </div>
  );
}

  // Auto-Mode: one schedulable item per phrase pattern (the structural
  // skill), so "viertel vor" spaces independently of "halb".
  const TIME_CLASS_MIN = {
    "nach": [5, 10, 20],
    "viertel-nach": [15],
    "vor-halb": [25],
    "halb": [30],
    "nach-halb": [35],
    "viertel-vor": [45],
    "vor": [40, 50, 55],
  };
  function timeRoundFor(cls) {
    const mins = TIME_CLASS_MIN[cls] || [30];
    const minute = mins[Math.floor(Math.random() * mins.length)];
    const hour = Math.floor(Math.random() * 12) + 1;
    return {
      kind: "tokens",
      visual: <ClockFace hour={hour} minute={minute} />,
      pool: TIME_WORD_POOL,
      target: germanTime(hour, minute),
    };
  }

  register({
    id: "time", icon: "\u{1F552}", label: "Uhrzeit", component: TimeView,
    sr: {
      items: () => Object.keys(TIME_CLASS_MIN).map((c) => "time:" + c),
      generateRound: (id) => timeRoundFor(id.slice("time:".length)),
    },
  });
})();
