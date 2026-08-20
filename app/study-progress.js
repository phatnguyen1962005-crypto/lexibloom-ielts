const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

export const dateKey = (value = new Date()) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

const addDays = (value, days) => {
  const result = new Date(value);
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
};

export const recordDailyAnswer = (progress, correct, now = new Date()) => {
  const today = dateKey(now);
  const current = progress?.date === today
    ? progress
    : { date: today, answered: 0, correct: 0 };

  return {
    date: today,
    answered: current.answered + 1,
    correct: current.correct + (correct ? 1 : 0),
  };
};

export const scheduleReview = (current, correct, now = new Date()) => {
  if (!correct) {
    return {
      correctStreak: 0,
      dueOn: dateKey(now),
      intervalDays: 0,
      lastReviewedAt: now.toISOString(),
    };
  }

  const correctStreak = (current?.correctStreak ?? 0) + 1;
  const intervalDays = REVIEW_INTERVALS[Math.min(correctStreak - 1, REVIEW_INTERVALS.length - 1)];

  return {
    correctStreak,
    dueOn: dateKey(addDays(now, intervalDays)),
    intervalDays,
    lastReviewedAt: now.toISOString(),
  };
};

export const dueReviewIds = (schedule, now = new Date()) => {
  const today = dateKey(now);
  return Object.entries(schedule ?? {})
    .filter(([, item]) => item?.dueOn && item.dueOn <= today)
    .sort(([, left], [, right]) => left.dueOn.localeCompare(right.dueOn))
    .map(([entryId]) => entryId);
};

export const wordOfDayIndex = (length, now = new Date()) => {
  if (length <= 0) return 0;
  const localDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(localDay.getTime() / 86_400_000) % length;
};
