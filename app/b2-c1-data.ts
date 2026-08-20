import rawEntries from "./b2-c1-data.json";

export type B2C1SourceEntry = {
  id: string;
  term: string;
  ipa: string;
  partOfSpeech: string;
  meaningVi: string;
  definitionEn: string;
  topic: string;
  level: "B2" | "C1";
  kind: "word" | "phrase";
  stress: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  family: string[];
  example: string;
  sourceCollection: "B2–C1 IELTS" | "B2–C1 General";
  b2c1Track: "ielts" | "general";
  cefrSource: string;
};

export const B2_C1_ENTRY_COUNT = 1500;
export const B2_C1_IELTS_COUNT = 900;
export const B2_C1_GENERAL_COUNT = 600;

export const b2C1Entries = rawEntries as unknown as B2C1SourceEntry[];
