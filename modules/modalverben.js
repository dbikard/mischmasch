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
