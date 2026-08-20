# LexiBloom — IELTS Vocabulary

LexiBloom is a Vietnamese-first vocabulary learning app for IELTS. It treats every entry as a connected lexical profile rather than an isolated translation.

## Included

- 118 curated academic words, phrases, and collocations across 11 IELTS topic groups
- Vietnamese meaning, English definition, IPA, stress guide, word class, CEFR level, and example
- Collocations, synonyms, antonyms, and word families
- Search and filters by topic, entry type, and level
- UK/US browser pronunciation
- Multiple-choice and typed-answer quizzes for meaning, collocation, synonym, and pronunciation
- Built-in sound effects for taps, correct answers, mistakes, collection actions, and session completion
- Daily goals, XP, learning streaks, session results, and animated feedback
- Local favorites, mastery progress, sound preference, and an automatic mistake notebook
- Responsive desktop and mobile layouts

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by the development server.

## Production build

```bash
npm run build
```

The vocabulary dataset is stored in `app/lexicon-data.ts`. Add a new pipe-delimited row using the same 14-field format to extend the library.

## Notes

IELTS does not publish an official vocabulary list. The included entries are selected for broad academic relevance and common IELTS themes; they are not an official IELTS product or band guarantee.
