# LexiBloom — IELTS Vocabulary

LexiBloom is a Vietnamese-first vocabulary learning app for IELTS. It treats every entry as a connected lexical profile rather than an isolated translation.

## Included

- The complete Academic Word List: 570 headword families across all 10 frequency sublists
- Curated academic words, IELTS phrases, and collocations across 12 topic groups
- Vietnamese meaning, English definition, IPA, stress guide, word class, CEFR level, and example
- Collocations, synonyms, antonyms, and word families
- Search and filters by AWL collection/sublist, topic, entry type, and level
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

The curated IELTS dataset is stored in `app/lexicon-data.ts`. The generated AWL dataset is kept separately in `app/awl-data.ts`, then merged without duplicate headwords at runtime.

## Vocabulary data sources

- AWL headwords, word families, and sublists are adapted from `lpmi-13/machine_readable_wordlists` (CC0), based on Averil Coxhead's Academic Word List.
- English lexical fields in the generated AWL dataset are adapted from English Wiktionary (CC BY-SA 3.0 / GFDL) through Compact Dictionaries.
- Vietnamese glosses are included as short educational translations and should be interpreted in the context of each English definition.

## GitHub Pages

The repository deploys automatically through GitHub Actions whenever `main` is updated. The workflow creates a static export with the repository base path and publishes the generated `out` directory to GitHub Pages.

To verify the Pages build locally:

```bash
npm run build:pages
```

## Notes

IELTS does not publish an official vocabulary list. AWL is a general academic corpus-based list that is highly useful for IELTS reading and writing, but it is not an official IELTS product or band guarantee.
