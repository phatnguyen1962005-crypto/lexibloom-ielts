const PREPOSITIONS = [
  "of",
  "in",
  "on",
  "to",
  "for",
  "with",
  "about",
  "over",
  "from",
  "by",
  "at",
  "between",
  "among",
  "against",
  "into",
  "through",
];

const unique = (items) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

const shuffle = (items, random = Math.random) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const cleanWord = (word) => word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");

const eligiblePhrases = (entry) => unique([entry.term, ...(entry.collocations ?? [])])
  .filter((phrase) => phrase.length >= 5 && phrase.length <= 90)
  .filter((phrase) => !phrase.includes("...") && !/\bX\b/.test(phrase) && !phrase.includes("+"));

export const prepositionGapFromPhrase = (phrase) => {
  const words = phrase.trim().split(/\s+/);
  const index = words.findIndex((word) => PREPOSITIONS.includes(cleanWord(word)));
  if (index < 0) return null;

  const answer = cleanWord(words[index]);
  const promptWords = [...words];
  promptWords[index] = words[index].replace(new RegExp(answer, "i"), "___");

  return {
    answer,
    answerPhrase: phrase,
    patternKey: words.slice(Math.max(0, index - 2), index + 1).map(cleanWord).join(" "),
    prompt: promptWords.join(" "),
  };
};

const pickBalancedCandidate = (candidates, random, previous) => {
  const deduplicated = [...new Map(candidates.map((candidate) => [candidate.gap.answerPhrase.toLowerCase(), candidate])).values()];
  let pool = deduplicated;

  if (previous?.answerPhrase && pool.some((candidate) => candidate.gap.answerPhrase !== previous.answerPhrase)) {
    pool = pool.filter((candidate) => candidate.gap.answerPhrase !== previous.answerPhrase);
  }
  if (previous?.patternKey && pool.some((candidate) => candidate.gap.patternKey !== previous.patternKey)) {
    pool = pool.filter((candidate) => candidate.gap.patternKey !== previous.patternKey);
  }

  let answers = unique(pool.map((candidate) => candidate.gap.answer));
  if (previous?.answer && answers.length > 1) answers = answers.filter((answer) => answer !== previous.answer);
  const answer = answers[Math.floor(random() * answers.length)];
  const answerPool = pool.filter((candidate) => candidate.gap.answer === answer);
  const patternKeys = unique(answerPool.map((candidate) => candidate.gap.patternKey));
  const patternKey = patternKeys[Math.floor(random() * patternKeys.length)];
  const patternPool = answerPool.filter((candidate) => candidate.gap.patternKey === patternKey);
  return patternPool[Math.floor(random() * patternPool.length)];
};

/** @param {any} previous */
export const makePrepositionExercise = (entries, random = Math.random, previous = null) => {
  const candidates = entries.flatMap((entry) => eligiblePhrases(entry)
    .map((phrase) => ({ entry, gap: prepositionGapFromPhrase(phrase) }))
    .filter((item) => item.gap));

  if (!candidates.length) return null;
  const candidate = pickBalancedCandidate(candidates, random, previous);
  const distractors = shuffle(PREPOSITIONS.filter((item) => item !== candidate.gap.answer), random).slice(0, 3);

  return {
    kind: "preposition",
    entry: candidate.entry,
    prompt: candidate.gap.prompt,
    answer: candidate.gap.answer,
    answerPhrase: candidate.gap.answerPhrase,
    patternKey: candidate.gap.patternKey,
    options: shuffle([candidate.gap.answer, ...distractors], random),
    tokens: [],
  };
};

/** @param {any} previous */
export const makeCorrectionExercise = (entries, random = Math.random, previous = null) => {
  const candidates = entries.flatMap((entry) => eligiblePhrases(entry)
    .map((phrase) => ({ entry, gap: prepositionGapFromPhrase(phrase) }))
    .filter((item) => item.gap));

  if (!candidates.length) return null;
  const candidate = pickBalancedCandidate(candidates, random, previous);
  const wrongPreposition = shuffle(PREPOSITIONS.filter((item) => item !== candidate.gap.answer), random)[0];

  return {
    kind: "correction",
    entry: candidate.entry,
    prompt: candidate.gap.prompt.replace("___", wrongPreposition),
    answer: candidate.gap.answerPhrase,
    answerPhrase: candidate.gap.answerPhrase,
    patternKey: candidate.gap.patternKey,
    options: [],
    tokens: [],
  };
};

/** @param {any} previous */
export const makeWordOrderExercise = (entries, random = Math.random, previous = null) => {
  const candidates = entries.flatMap((entry) => eligiblePhrases(entry)
    .filter((phrase) => {
      const words = phrase.split(/\s+/);
      return words.length >= 3
        && words.length <= 9
        && !PREPOSITIONS.includes(cleanWord(words.at(-1)));
    })
    .map((phrase) => ({ entry, phrase })));

  if (!candidates.length) return null;
  const pool = previous?.answerPhrase && candidates.some((candidate) => candidate.phrase !== previous.answerPhrase)
    ? candidates.filter((candidate) => candidate.phrase !== previous.answerPhrase)
    : candidates;
  const candidate = pool[Math.floor(random() * pool.length)];
  const sourceTokens = candidate.phrase.split(/\s+/).map((word, index) => ({ id: `${index}-${word}`, word }));
  let tokens = shuffle(sourceTokens, random);
  if (tokens.every((token, index) => token.id === sourceTokens[index].id)) tokens = [...sourceTokens].reverse();

  return {
    kind: "builder",
    entry: candidate.entry,
    prompt: candidate.entry.meaningVi,
    answer: candidate.phrase,
    answerPhrase: candidate.phrase,
    options: [],
    tokens,
  };
};
