/**
 * Build a stable identity for one missed question so repeated wrong attempts do
 * not fill the error bank with duplicate cards.
 *
 * @param {{ entryId: string, kind: string, prompt: string, answer: string }} mistake
 */
export function mistakeSignature(mistake) {
  return [mistake.entryId, mistake.kind, mistake.prompt, mistake.answer]
    .map((value) => String(value).trim().toLowerCase().replace(/\s+/g, " "))
    .join("::");
}

/**
 * Keep the newest occurrence of each missed question. The UI stores mistakes
 * newest-first, so the first matching card is the useful one to retain.
 *
 * @template T
 * @param {T[]} mistakes
 * @returns {T[]}
 */
export function uniqueMistakes(mistakes) {
  const seen = new Set();
  return mistakes.filter((mistake) => {
    const signature = mistakeSignature(mistake);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

/**
 * A correct answer leaves the mastery queue. A wrong answer moves to the end,
 * creating a simple repeat-until-correct loop.
 *
 * @template T
 * @param {T[]} queue
 * @param {boolean} wasCorrect
 * @returns {T[]}
 */
export function advanceReviewQueue(queue, wasCorrect) {
  if (queue.length === 0) return [];
  if (wasCorrect) return queue.slice(1);
  return [...queue.slice(1), queue[0]];
}
