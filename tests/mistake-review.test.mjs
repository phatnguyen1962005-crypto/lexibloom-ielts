import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceReviewQueue,
  mistakeSignature,
  uniqueMistakes,
} from "../app/mistake-review.js";

const first = {
  id: "newest",
  entryId: "term-1",
  kind: "meaning",
  prompt: "What does it mean?",
  answer: "nghĩa",
};

test("deduplicates repeated attempts at the same missed question", () => {
  const olderDuplicate = { ...first, id: "older" };
  const other = { ...first, id: "other", prompt: "A different prompt" };
  assert.deepEqual(uniqueMistakes([first, olderDuplicate, other]).map((item) => item.id), ["newest", "other"]);
  assert.equal(mistakeSignature(first), mistakeSignature(olderDuplicate));
});

test("removes corrected questions from the review queue", () => {
  assert.deepEqual(advanceReviewQueue(["a", "b", "c"], true), ["b", "c"]);
});

test("cycles an incorrect question to the end of the review queue", () => {
  assert.deepEqual(advanceReviewQueue(["a", "b", "c"], false), ["b", "c", "a"]);
  assert.deepEqual(advanceReviewQueue(["a"], false), ["a"]);
});
