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
