import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { buildTopicExpansion, enrichLearningProfile } from "../app/lexical-enrichment.js";

const readJsonExport = (path, marker) => {
  const source = fs.readFileSync(new URL(path, import.meta.url), "utf8");
  return JSON.parse(source.slice(source.indexOf(marker) + marker.length, source.lastIndexOf(";")));
};

const awlEntries = readJsonExport(
  "../app/awl-data.ts",
  "export const awlSourceEntries: AwlSourceEntry[] = ",
);
const readingEntries = readJsonExport(
  "../app/reading-vocabulary-data.ts",
  "export const readingVocabularyEntries: ReadingVocabularyEntry[] = ",
);

const lexiconSource = fs.readFileSync(new URL("../app/lexicon-data.ts", import.meta.url), "utf8");
const rawLexicon = lexiconSource.match(/const rawLexicon = String\.raw`([\s\S]*?)`\.trim\(\);/)[1].trim();
const splitList = (value) => value.split(";").map((item) => item.trim()).filter((item) => item && item !== "—");
const curatedEntries = rawLexicon.split("\n").map((line, index) => {
  const [
    term,
    ipa,
    partOfSpeech,
    meaningVi,
    definitionEn,
    topic,
    level,
    kind,
    stress,
    collocations,
    synonyms,
    antonyms,
    family,
    example,
  ] = line.split("|");

  return {
    id: `curated-${index}`,
    term,
    ipa,
    partOfSpeech,
    meaningVi,
    definitionEn,
    topic,
    level,
    kind,
    stress,
    collocations: splitList(collocations),
    synonyms: splitList(synonyms),
    antonyms: splitList(antonyms),
    family: splitList(family),
    example,
  };
});

const curatedTerms = new Set(curatedEntries.map((entry) => entry.term.toLowerCase()));
const awlSupplement = awlEntries
  .filter((entry) => !curatedTerms.has(entry.term.toLowerCase()))
  .map((entry) => ({
    ...entry,
    id: `awl-${entry.term}`,
    topic: "Academic Word List",
    kind: "word",
  }));
const baseTerms = new Set([...curatedTerms, ...awlSupplement.map((entry) => entry.term.toLowerCase())]);
const sourceEntries = [
  ...curatedEntries,
  ...awlSupplement,
  ...readingEntries.filter((entry) => !baseTerms.has(entry.term.toLowerCase())),
];
const enrichedEntries = sourceEntries.map(enrichLearningProfile);
const generatedEntries = buildTopicExpansion(enrichedEntries, 80);
const finalEntries = [...enrichedEntries, ...generatedEntries];

test("expands every visible topic to exactly 80 entries", () => {
  assert.equal(sourceEntries.length, 1000);
  assert.equal(generatedEntries.length, 1231);
  assert.equal(finalEntries.length, 2231);

  const counts = new Map();
  for (const entry of finalEntries) {
    if (entry.topic === "Academic Word List") continue;
    counts.set(entry.topic, (counts.get(entry.topic) ?? 0) + 1);
  }

  assert.equal(counts.size, 21);
  for (const [topic, count] of counts) {
    assert.equal(count, 80, `${topic} should contain 80 entries`);
  }
});

test("keeps every entry unique and gives it a complete lexical profile", () => {
  assert.equal(new Set(finalEntries.map((entry) => entry.term.toLowerCase())).size, finalEntries.length);
  assert.equal(new Set(finalEntries.map((entry) => entry.id)).size, finalEntries.length);

  for (const entry of finalEntries) {
    assert.ok(entry.partOfSpeech, `${entry.term} is missing a word class`);
    assert.ok(entry.family.length >= 1, `${entry.term} is missing its word-family profile`);
    assert.ok(entry.collocations.length >= 3, `${entry.term} needs at least three patterns or collocations`);
  }
});

test("adds both academic patterns and prepositional phrases", () => {
  assert.ok(generatedEntries.some((entry) => entry.kind === "pattern"));
  assert.ok(generatedEntries.some((entry) => entry.kind === "prepositional-phrase"));
  assert.ok(generatedEntries.every((entry) => entry.patternSource));
});
