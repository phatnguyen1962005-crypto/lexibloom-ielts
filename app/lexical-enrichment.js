const unique = (items) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

const slugify = (value) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const nounTemplates = [
  { kind: "pattern", term: (term) => `the role of ${term} in ...`, vi: (meaning) => `vai trò của ${meaning} trong ...` },
  { kind: "pattern", term: (term) => `the impact of ${term} on ...`, vi: (meaning) => `tác động của ${meaning} lên ...` },
  { kind: "prepositional-phrase", term: (term) => `evidence of ${term}`, vi: (meaning) => `bằng chứng về ${meaning}` },
  { kind: "prepositional-phrase", term: (term) => `research on ${term}`, vi: (meaning) => `nghiên cứu về ${meaning}` },
  { kind: "prepositional-phrase", term: (term) => `changes in ${term}`, vi: (meaning) => `những thay đổi về ${meaning}` },
  { kind: "prepositional-phrase", term: (term) => `concerns about ${term}`, vi: (meaning) => `những lo ngại về ${meaning}` },
  { kind: "prepositional-phrase", term: (term) => `debate over ${term}`, vi: (meaning) => `tranh luận xoay quanh ${meaning}` },
  { kind: "prepositional-phrase", term: (term) => `an approach to ${term}`, vi: (meaning) => `một cách tiếp cận đối với ${meaning}` },
  { kind: "prepositional-phrase", term: (term) => `policy on ${term}`, vi: (meaning) => `chính sách về ${meaning}` },
  { kind: "prepositional-phrase", term: (term) => `data on ${term}`, vi: (meaning) => `dữ liệu về ${meaning}` },
  { kind: "pattern", term: (term) => `the relationship between ${term} and ...`, vi: (meaning) => `mối liên hệ giữa ${meaning} và ...` },
  { kind: "prepositional-phrase", term: (term) => `the need for ${term}`, vi: (meaning) => `nhu cầu về ${meaning}` },
];

const verbTemplates = [
  { kind: "pattern", term: (term) => `X can ${term} ...`, vi: (meaning) => `X có thể ${meaning} ...` },
  { kind: "pattern", term: (term) => `X may ${term} ...`, vi: (meaning) => `X có thể ${meaning} ...` },
  { kind: "pattern", term: (term) => `X is likely to ${term} ...`, vi: (meaning) => `X có khả năng ${meaning} ...` },
  { kind: "pattern", term: (term) => `X tends to ${term} ...`, vi: (meaning) => `X có xu hướng ${meaning} ...` },
  { kind: "pattern", term: (term) => `X continues to ${term} ...`, vi: (meaning) => `X tiếp tục ${meaning} ...` },
  { kind: "pattern", term: (term) => `X appears to ${term} ...`, vi: (meaning) => `X dường như ${meaning} ...` },
  { kind: "pattern", term: (term) => `X is expected to ${term} ...`, vi: (meaning) => `X được kỳ vọng sẽ ${meaning} ...` },
  { kind: "pattern", term: (term) => `whether X will ${term} ...`, vi: (meaning) => `liệu X có ${meaning} ... hay không` },
  { kind: "pattern", term: (term) => `the extent to which X can ${term} ...`, vi: (meaning) => `mức độ mà X có thể ${meaning} ...` },
  { kind: "pattern", term: (term) => `conditions in which X may ${term} ...`, vi: (meaning) => `các điều kiện mà trong đó X có thể ${meaning} ...` },
  { kind: "pattern", term: (term) => `factors that make X ${term} ...`, vi: (meaning) => `các yếu tố khiến X ${meaning} ...` },
  { kind: "pattern", term: (term) => `evidence that X will ${term} ...`, vi: (meaning) => `bằng chứng rằng X sẽ ${meaning} ...` },
];

const adjectiveTemplates = [
  { kind: "pattern", term: (term) => `X becomes increasingly ${term}`, vi: (meaning) => `X ngày càng trở nên ${meaning}` },
  { kind: "pattern", term: (term) => `X remains ${term}`, vi: (meaning) => `X vẫn ${meaning}` },
  { kind: "pattern", term: (term) => `X appears ${term}`, vi: (meaning) => `X có vẻ ${meaning}` },
  { kind: "pattern", term: (term) => `X seems ${term}`, vi: (meaning) => `X dường như ${meaning}` },
  { kind: "pattern", term: (term) => `X is considered ${term}`, vi: (meaning) => `X được xem là ${meaning}` },
  { kind: "pattern", term: (term) => `a highly ${term} + noun`, vi: (meaning) => `một danh từ mang tính ${meaning} cao` },
  { kind: "pattern", term: (term) => `relatively ${term}`, vi: (meaning) => `tương đối ${meaning}` },
  { kind: "pattern", term: (term) => `factors that are ${term}`, vi: (meaning) => `các yếu tố ${meaning}` },
  { kind: "pattern", term: (term) => `conditions that are ${term}`, vi: (meaning) => `các điều kiện ${meaning}` },
  { kind: "pattern", term: (term) => `X proves ${term}`, vi: (meaning) => `X cho thấy là ${meaning}` },
  { kind: "pattern", term: (term) => `X is widely regarded as ${term}`, vi: (meaning) => `X được xem rộng rãi là ${meaning}` },
  { kind: "pattern", term: (term) => `whether X is ${term}`, vi: (meaning) => `liệu X có ${meaning}` },
];

const adverbTemplates = [
  { kind: "pattern", term: (term) => `${term}, the evidence suggests that`, vi: (meaning) => `${meaning}, bằng chứng cho thấy rằng` },
  { kind: "pattern", term: (term) => `X changes ${term}`, vi: (meaning) => `X thay đổi ${meaning}` },
  { kind: "pattern", term: (term) => `X varies ${term}`, vi: (meaning) => `X biến đổi ${meaning}` },
  { kind: "pattern", term: (term) => `X is ${term} distributed`, vi: (meaning) => `X được phân bố ${meaning}` },
  { kind: "pattern", term: (term) => `X responds ${term}`, vi: (meaning) => `X phản ứng ${meaning}` },
  { kind: "pattern", term: (term) => `X develops ${term}`, vi: (meaning) => `X phát triển ${meaning}` },
  { kind: "pattern", term: (term) => `X occurs ${term}`, vi: (meaning) => `X xảy ra ${meaning}` },
  { kind: "pattern", term: (term) => `X is measured ${term}`, vi: (meaning) => `X được đo lường ${meaning}` },
  { kind: "pattern", term: (term) => `X works ${term}`, vi: (meaning) => `X hoạt động ${meaning}` },
  { kind: "pattern", term: (term) => `X is explained ${term}`, vi: (meaning) => `X được giải thích ${meaning}` },
  { kind: "pattern", term: (term) => `X differs ${term}`, vi: (meaning) => `X khác biệt ${meaning}` },
  { kind: "pattern", term: (term) => `X is interpreted ${term}`, vi: (meaning) => `X được diễn giải ${meaning}` },
];

const templatesFor = (partOfSpeech) => {
  const value = partOfSpeech.toLowerCase();
  if (value.includes("verb")) return verbTemplates;
  if (value.includes("adjective")) return adjectiveTemplates;
  if (value.includes("adverb")) return adverbTemplates;
  return nounTemplates;
};

const profilePatterns = (entry) => templatesFor(entry.partOfSpeech)
  .slice(0, 3)
  .map((template) => template.term(entry.term));

export const enrichLearningProfile = (entry) => ({
  ...entry,
  collocations: unique([...(entry.collocations ?? []), ...profilePatterns(entry)]),
  family: unique(entry.family?.length ? entry.family : [entry.term]),
});

export const inferWordFormType = (term, fallback = "word form") => {
  const value = term.toLowerCase();
  if (/ly$/.test(value)) return "adverb";
  if (/(tion|sion|ment|ness|ity|ism|ance|ence|ship|hood|acy|ure|er|or)$/.test(value)) return "noun";
  if (/(ise|ize|ify|ate|en)$/.test(value)) return "verb";
  if (/(ive|al|ous|ful|less|able|ible|ic|ary|ory|ent|ant)$/.test(value)) return "adjective";
  return fallback;
};

const wordClassVi = (partOfSpeech) => {
  const value = partOfSpeech.toLowerCase();
  if (value.includes("noun")) return "danh từ";
  if (value.includes("verb")) return "động từ";
  if (value.includes("adjective")) return "tính từ";
  if (value.includes("adverb")) return "trạng từ";
  return "dạng từ";
};

const usageFrameFor = (term, partOfSpeech) => {
  const value = partOfSpeech.toLowerCase();
  if (value.includes("adverb")) return `[verb/adjective] + ${term}`;
  if (value.includes("adjective")) return `${term} + [noun] / become ${term}`;
  if (value.includes("verb")) return `[subject] + ${term} + [object/complement]`;
  if (value.includes("noun")) return `[adjective] + ${term} / the ${term} of ...`;
  return `use “${term}” in an academic sentence`;
};

/**
 * @param {any} entry
 * @param {any[] | Map<string, any>} entriesOrIndex
 */
export const buildFamilyProfiles = (entry, entriesOrIndex = []) => {
  const index = entriesOrIndex instanceof Map
    ? entriesOrIndex
    : new Map(entriesOrIndex.map((item) => [item.term.toLowerCase(), item]));

  return unique([entry.term, ...(entry.family ?? [])]).map((term) => {
    const linkedEntry = index.get(term.toLowerCase());
    const partOfSpeech = linkedEntry?.partOfSpeech
      ?? (term.toLowerCase() === entry.term.toLowerCase()
        ? entry.partOfSpeech
        : inferWordFormType(term));

    return {
      term,
      partOfSpeech,
      meaningVi: linkedEntry?.meaningVi
        ?? `${wordClassVi(partOfSpeech)} cùng họ với “${entry.term}”, mang nghĩa liên quan đến ${entry.meaningVi}`,
      usageFrame: linkedEntry?.example ?? usageFrameFor(term, partOfSpeech),
      verified: Boolean(linkedEntry),
    };
  });
};

const patternExample = (pattern, source) => `Academic frame: “${pattern}” Source example: ${source.example}`;

export const buildTopicExpansion = (entries, targetPerTopic = 80) => {
  const topics = new Map();
  for (const entry of entries) {
    if (entry.topic === "Academic Word List") continue;
    const group = topics.get(entry.topic) ?? [];
    group.push(entry);
    topics.set(entry.topic, group);
  }

  const usedTerms = new Set(entries.map((entry) => entry.term.toLowerCase()));
  const expanded = [];

  for (const [topic, topicEntries] of topics) {
    const missing = Math.max(0, targetPerTopic - topicEntries.length);
    let attempts = 0;
    let addedForTopic = 0;

    while (addedForTopic < missing && attempts < 20_000) {
      const source = topicEntries[attempts % topicEntries.length];
      const templates = templatesFor(source.partOfSpeech);
      const template = templates[Math.floor(attempts / topicEntries.length) % templates.length];
      const term = template.term(source.term).replace(/\s+/g, " ").trim();
      attempts += 1;

      const key = term.toLowerCase();
      if (!term || usedTerms.has(key)) continue;
      usedTerms.add(key);
      addedForTopic += 1;

      expanded.push({
        id: `pattern-${slugify(topic)}-${String(addedForTopic).padStart(3, "0")}-${slugify(term)}`,
        term,
        ipa: source.ipa,
        partOfSpeech: template.kind === "prepositional-phrase" ? "prepositional pattern" : "academic pattern",
        meaningVi: template.vi(source.meaningVi),
        definitionEn: `A reusable academic pattern built around “${source.term}” for discussing ${topic.toLowerCase()}.`,
        topic,
        level: source.level,
        kind: template.kind,
        stress: `Từ trọng tâm · ${source.term}`,
        collocations: unique([term, ...(source.collocations ?? []).slice(0, 3)]),
        synonyms: [],
        antonyms: [],
        family: unique([source.term, ...(source.family ?? [])]),
        example: patternExample(term, source),
        patternSource: source.term,
      });
    }

    if (addedForTopic < missing) {
      throw new Error(`Could not generate ${missing} unique patterns for ${topic}`);
    }
  }

  return expanded;
};
