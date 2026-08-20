import assert from "node:assert/strict";
import test from "node:test";

import {
  makeCorrectionExercise,
  makePrepositionExercise,
  makeWordOrderExercise,
  prepositionGapFromPhrase,
} from "../app/pattern-practice.js";

const entry = {
  id: "evidence",
  term: "evidence of climate change",
  meaningVi: "bằng chứng về biến đổi khí hậu",
  topic: "Environment",
  level: "B2",
  collocations: ["concerns about climate change", "research on renewable energy"],
};

test("creates a clean preposition gap from an academic phrase", () => {
  assert.deepEqual(prepositionGapFromPhrase("evidence of climate change"), {
    answer: "of",
    answerPhrase: "evidence of climate change",
    prompt: "evidence ___ climate change",
  });
});

test("builds a four-choice preposition exercise", () => {
  const exercise = makePrepositionExercise([entry], () => 0);

  assert.equal(exercise.kind, "preposition");
  assert.equal(exercise.options.length, 4);
  assert.ok(exercise.options.includes(exercise.answer));
  assert.ok(exercise.prompt.includes("___"));
});

test("builds a shuffled phrase-order exercise with stable token ids", () => {
  const exercise = makeWordOrderExercise([entry], () => 0);
  const original = exercise.answer.split(/\s+/).join(" ");
  const shuffled = exercise.tokens.map((token) => token.word).join(" ");

  assert.equal(exercise.kind, "builder");
  assert.notEqual(shuffled, original);
  assert.equal(new Set(exercise.tokens.map((token) => token.id)).size, exercise.tokens.length);
});

test("creates an incorrect phrase that the learner must rewrite", () => {
  const exercise = makeCorrectionExercise([entry], () => 0);

  assert.equal(exercise.kind, "correction");
  assert.notEqual(exercise.prompt, exercise.answer);
  assert.equal(exercise.answer, "evidence of climate change");
  assert.equal(exercise.prompt.includes("___"), false);
});
