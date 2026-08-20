import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const readingSource = fs.readFileSync(new URL("../app/reading-vocabulary-data.ts", import.meta.url), "utf8");
const readingMarker = "export const readingVocabularyEntries: ReadingVocabularyEntry[] = ";
const readingEntries = JSON.parse(
  readingSource.slice(readingSource.indexOf(readingMarker) + readingMarker.length, readingSource.lastIndexOf(";")),
);
const seeds = JSON.parse(fs.readFileSync(new URL("../data/reading-vocabulary-seeds.json", import.meta.url), "utf8"));

const awlSource = fs.readFileSync(new URL("../app/awl-data.ts", import.meta.url), "utf8");
const awlMarker = "export const awlSourceEntries: AwlSourceEntry[] = ";
const awlEntries = JSON.parse(
  awlSource.slice(awlSource.indexOf(awlMarker) + awlMarker.length, awlSource.lastIndexOf(";")),
);

const lexiconSource = fs.readFileSync(new URL("../app/lexicon-data.ts", import.meta.url), "utf8");
const rawLexicon = lexiconSource.match(/const rawLexicon = String\.raw`([\s\S]*?)`\.trim\(\);/)[1].trim();
const curatedTerms = rawLexicon.split("\n").map((line) => line.split("|")[0].toLowerCase());

test("contains 330 unique IELTS Reading vocabulary items", () => {
  assert.equal(readingEntries.length, 330);
  assert.equal(new Set(readingEntries.map((entry) => entry.term.toLowerCase())).size, 330);
});

test("keeps 15 balanced Reading topic groups", () => {
  assert.equal(Object.keys(seeds).length, 15);
  for (const [topic, terms] of Object.entries(seeds)) {
    assert.equal(terms.length, 22);
    assert.equal(readingEntries.filter((entry) => entry.topic === topic).length, 22);
  }
});

test("adds only new entries beyond the curated lexicon and AWL", () => {
  const existing = new Set([...curatedTerms, ...awlEntries.map((entry) => entry.term.toLowerCase())]);
  assert.deepEqual(readingEntries.filter((entry) => existing.has(entry.term.toLowerCase())), []);
  assert.equal(new Set([...existing, ...readingEntries.map((entry) => entry.term.toLowerCase())]).size, 1000);
});

test("every Reading item has a complete learning profile", () => {
  for (const entry of readingEntries) {
    assert.ok(entry.term);
    assert.ok(entry.meaningVi);
    assert.ok(entry.definitionEn);
    assert.ok(entry.ipa.startsWith("/") && entry.ipa.endsWith("/"));
    assert.ok(entry.partOfSpeech);
    assert.ok(entry.example);
    assert.equal(entry.readingSource, true);
    assert.ok(Array.isArray(entry.collocations));
    assert.ok(Array.isArray(entry.family));
    assert.ok(Array.isArray(entry.synonyms));
    assert.ok(Array.isArray(entry.antonyms));
  }
});
