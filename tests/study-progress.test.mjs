import assert from "node:assert/strict";
import test from "node:test";

import {
  dateKey,
  dueReviewIds,
  recordDailyAnswer,
  scheduleReview,
  wordOfDayIndex,
} from "../app/study-progress.js";

const morning = new Date(2026, 7, 20, 9, 30);

test("keeps a daily answer count and resets it on a new local day", () => {
  const first = recordDailyAnswer(undefined, true, morning);
  const second = recordDailyAnswer(first, false, morning);
  const tomorrow = new Date(2026, 7, 21, 8, 0);

  assert.deepEqual(second, { date: "2026-08-20", answered: 2, correct: 1 });
  assert.deepEqual(recordDailyAnswer(second, true, tomorrow), {
    date: "2026-08-21",
    answered: 1,
    correct: 1,
  });
});

test("expands review intervals after correct recalls and resets after a miss", () => {
  const first = scheduleReview(undefined, true, morning);
  const second = scheduleReview(first, true, morning);
  const missed = scheduleReview(second, false, morning);

  assert.equal(first.intervalDays, 1);
  assert.equal(first.dueOn, "2026-08-21");
  assert.equal(second.intervalDays, 3);
  assert.equal(second.dueOn, "2026-08-23");
  assert.equal(missed.correctStreak, 0);
  assert.equal(missed.dueOn, dateKey(morning));
});

test("returns only reviews that are due, oldest first", () => {
  const ids = dueReviewIds({
    later: { dueOn: "2026-08-22" },
    today: { dueOn: "2026-08-20" },
    older: { dueOn: "2026-08-18" },
  }, morning);

  assert.deepEqual(ids, ["older", "today"]);
});

test("selects a stable rotating word of the day", () => {
  assert.equal(wordOfDayIndex(1000, morning), wordOfDayIndex(1000, new Date(2026, 7, 20, 23, 59)));
  assert.notEqual(wordOfDayIndex(1000, morning), wordOfDayIndex(1000, new Date(2026, 7, 21, 9, 30)));
});
