# B2–C1 vocabulary data attribution

The 1,500-entry dataset in `app/b2-c1-data.json` is a transformed educational subset assembled for LexiBloom. It contains 1,000 B2 entries, 500 C1 entries, 900 IELTS/academic-track entries, 600 general-English entries, and 150 multiword expressions.

## Sources

- **CEFR-J Vocabulary Profile 1.5** — compiled by Yukio Tono, Tono Laboratory, Tokyo University of Foreign Studies. The source permits research and commercial use without charge when properly cited. Source mirror: <https://github.com/openlanguageprofiles/olp-en-cefrj>.
- **Octanove Vocabulary Profile C1/C2 1.0** — used for C1 labels and distributed under CC BY-SA 4.0. Source: <https://github.com/openlanguageprofiles/olp-en-cefrj>.
- **Skypedia English–Vietnamese Dictionary** — Vietnamese definitions, IPA, and example sentences, derived from the MinhQND Dictionary and other credited open linguistic resources. Licensed CC BY-SA 4.0. Source: <https://github.com/skypediacode/english-vietnamese-dictionary>.
- **Princeton WordNet**, accessed through the MIT-licensed `wordnet` package — English definitions and synonym sets. WordNet license: <https://wordnet.princeton.edu/license-and-commercial-use>.
- **FrequencyWords English 50k** — used only to rank candidate usefulness for everyday English. Content licensed CC BY-SA 4.0 and derived from OpenSubtitles. Source: <https://github.com/hermitdave/FrequencyWords>.

## Transformation

LexiBloom filters the source profiles to B2/C1, removes entries already present in the original lexicon, ranks candidates for academic/IELTS and general-English utility, attaches Vietnamese meanings and examples, and groups each result into a learning topic. Multiword entries either have a direct CEFR profile or are common dictionary expressions built around a CEFR-profiled headword.

The derived data in `app/b2-c1-data.json` is distributed under **Creative Commons Attribution-ShareAlike 4.0**. This data notice does not change the license of unrelated application code.
