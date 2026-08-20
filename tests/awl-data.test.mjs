import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/awl-data.ts", import.meta.url), "utf8");
const marker = "export const awlSourceEntries: AwlSourceEntry[] = ";
const start = source.indexOf(marker);
const entries = JSON.parse(source.slice(start + marker.length, source.lastIndexOf(";")));

test("contains all 570 unique AWL headwords", () => {
  assert.equal(entries.length, 570);
  assert.equal(new Set(entries.map((entry) => entry.term.toLowerCase())).size, 570);
});

test("preserves the official ten-sublist distribution", () => {
  for (let sublist = 1; sublist <= 10; sublist += 1) {
    const expected = sublist === 10 ? 30 : 60;
    assert.equal(entries.filter((entry) => entry.sublist === sublist).length, expected);
  }
});

test("every AWL entry has the learning fields used by LexiBloom", () => {
  for (const entry of entries) {
    assert.ok(entry.term);
    assert.ok(entry.meaningVi);
    assert.ok(entry.definitionEn);
    assert.ok(entry.ipa);
    assert.ok(entry.partOfSpeech);
    assert.ok(entry.example);
    assert.ok(Array.isArray(entry.family));
    assert.ok(Array.isArray(entry.synonyms));
    assert.ok(Array.isArray(entry.antonyms));
  }
});
