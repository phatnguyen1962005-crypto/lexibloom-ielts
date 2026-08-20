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
    prompt: promptWords.join(" "),
  };
};

export const makePrepositionExercise = (entries, random = Math.random) => {
  const candidates = entries.flatMap((entry) => eligiblePhrases(entry)
    .map((phrase) => ({ entry, gap: prepositionGapFromPhrase(phrase) }))
    .filter((item) => item.gap));

  if (!candidates.length) return null;
  const candidate = candidates[Math.floor(random() * candidates.length)];
  const distractors = shuffle(PREPOSITIONS.filter((item) => item !== candidate.gap.answer), random).slice(0, 3);

  return {
    kind: "preposition",
    entry: candidate.entry,
    prompt: candidate.gap.prompt,
    answer: candidate.gap.answer,
    answerPhrase: candidate.gap.answerPhrase,
    options: shuffle([candidate.gap.answer, ...distractors], random),
    tokens: [],
  };
};

export const makeCorrectionExercise = (entries, random = Math.random) => {
  const candidates = entries.flatMap((entry) => eligiblePhrases(entry)
    .map((phrase) => ({ entry, gap: prepositionGapFromPhrase(phrase) }))
    .filter((item) => item.gap));

  if (!candidates.length) return null;
  const candidate = candidates[Math.floor(random() * candidates.length)];
  const wrongPreposition = shuffle(PREPOSITIONS.filter((item) => item !== candidate.gap.answer), random)[0];

  return {
    kind: "correction",
    entry: candidate.entry,
    prompt: candidate.gap.prompt.replace("___", wrongPreposition),
    answer: candidate.gap.answerPhrase,
    answerPhrase: candidate.gap.answerPhrase,
    options: [],
    tokens: [],
  };
};

export const makeWordOrderExercise = (entries, random = Math.random) => {
  const candidates = entries.flatMap((entry) => eligiblePhrases(entry)
    .filter((phrase) => {
      const words = phrase.split(/\s+/);
      return words.length >= 3
        && words.length <= 9
        && !PREPOSITIONS.includes(cleanWord(words.at(-1)));
    })
    .map((phrase) => ({ entry, phrase })));

  if (!candidates.length) return null;
  const candidate = candidates[Math.floor(random() * candidates.length)];
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
