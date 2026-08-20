import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { buildFamilyProfiles, buildTopicExpansion, enrichLearningProfile } from "../app/lexical-enrichment.js";

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
const b2C1Entries = JSON.parse(
  fs.readFileSync(new URL("../app/b2-c1-data.json", import.meta.url), "utf8"),
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
const coreSourceEntries = [
  ...curatedEntries,
  ...awlSupplement,
  ...readingEntries.filter((entry) => !baseTerms.has(entry.term.toLowerCase())),
];
const sourceEntries = [...coreSourceEntries, ...b2C1Entries];
const enrichedCoreEntries = coreSourceEntries.map(enrichLearningProfile);
const enrichedB2C1Entries = b2C1Entries.map(enrichLearningProfile);
const enrichedEntries = [...enrichedCoreEntries, ...enrichedB2C1Entries];
const sourceIndex = new Map(enrichedEntries.map((entry) => [entry.term.toLowerCase(), entry]));
const profiledCoreEntries = enrichedCoreEntries.map((entry) => ({
  ...entry,
  familyProfiles: buildFamilyProfiles(entry, sourceIndex),
}));
const profiledB2C1Entries = enrichedB2C1Entries.map((entry) => ({
  ...entry,
  familyProfiles: buildFamilyProfiles(entry, sourceIndex),
}));
const generatedEntries = buildTopicExpansion(profiledCoreEntries, 80).map((entry) => ({
  ...entry,
  familyProfiles: buildFamilyProfiles(entry, sourceIndex),
}));
const finalEntries = [...profiledCoreEntries, ...generatedEntries, ...profiledB2C1Entries];

test("adds 1,500 B2-C1 entries while keeping every visible topic above the baseline", () => {
  assert.equal(coreSourceEntries.length, 1000);
  assert.equal(b2C1Entries.length, 1500);
  assert.equal(sourceEntries.length, 2500);
  assert.equal(generatedEntries.length, 1231);
  assert.equal(finalEntries.length, 3731);

  const counts = new Map();
  for (const entry of finalEntries) {
    if (entry.topic === "Academic Word List") continue;
    counts.set(entry.topic, (counts.get(entry.topic) ?? 0) + 1);
  }

  assert.equal(counts.size, 22);
  for (const [topic, count] of counts) {
    assert.ok(count >= 80, `${topic} should contain at least 80 entries`);
  }
});

test("keeps the promised CEFR, collection, and phrase mix", () => {
  assert.equal(b2C1Entries.filter((entry) => entry.level === "B2").length, 1000);
  assert.equal(b2C1Entries.filter((entry) => entry.level === "C1").length, 500);
  assert.equal(b2C1Entries.filter((entry) => entry.b2c1Track === "ielts").length, 900);
  assert.equal(b2C1Entries.filter((entry) => entry.b2c1Track === "general").length, 600);
  assert.equal(b2C1Entries.filter((entry) => entry.kind === "phrase").length, 150);
});

test("keeps every entry unique and gives it a complete lexical profile", () => {
  assert.equal(new Set(finalEntries.map((entry) => entry.term.toLowerCase())).size, finalEntries.length);
  assert.equal(new Set(finalEntries.map((entry) => entry.id)).size, finalEntries.length);

  for (const entry of finalEntries) {
    assert.ok(entry.partOfSpeech, `${entry.term} is missing a word class`);
    assert.ok(entry.family.length >= 1, `${entry.term} is missing its word-family profile`);
    assert.ok(entry.familyProfiles.length >= 1, `${entry.term} is missing structured family details`);
    assert.ok(entry.familyProfiles.every((form) => form.partOfSpeech && form.meaningVi && form.usageFrame));
    assert.ok(entry.collocations.length >= 3, `${entry.term} needs at least three patterns or collocations`);
  }
});

test("uses linked entries to verify word-family meaning, class, and example", () => {
  const source = {
    term: "analyse",
    partOfSpeech: "verb",
    meaningVi: "phân tích",
    family: ["analysis"],
    example: "Researchers analyse the evidence.",
  };
  const linked = {
    term: "analysis",
    partOfSpeech: "noun",
    meaningVi: "sự phân tích",
    family: ["analyse"],
    example: "The analysis revealed a clear trend.",
  };
  const profiles = buildFamilyProfiles(source, new Map([["analyse", source], ["analysis", linked]]));
  const analysis = profiles.find((item) => item.term === "analysis");

  assert.equal(analysis.partOfSpeech, "noun");
  assert.equal(analysis.meaningVi, "sự phân tích");
  assert.equal(analysis.usageFrame, linked.example);
  assert.equal(analysis.verified, true);
});

test("adds both academic patterns and prepositional phrases", () => {
  assert.ok(generatedEntries.some((entry) => entry.kind === "pattern"));
  assert.ok(generatedEntries.some((entry) => entry.kind === "prepositional-phrase"));
  assert.ok(generatedEntries.every((entry) => entry.patternSource));
});
