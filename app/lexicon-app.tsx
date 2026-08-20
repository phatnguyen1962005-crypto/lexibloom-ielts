"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { lexicon, lexiconStats, topics, type WordEntry } from "./lexicon-data";
import { advanceReviewQueue, mistakeSignature, uniqueMistakes } from "./mistake-review.js";

type View = "explore" | "quiz-choice" | "quiz-typing" | "mistakes" | "review-mistakes";
type QuizFocus = "mixed" | "meaning" | "collocation" | "synonym" | "pronunciation";

type Question = {
  kind: Exclude<QuizFocus, "mixed">;
  label: string;
  prompt: string;
  helper?: string;
  answer: string;
  acceptedAnswers?: string[];
  options: string[];
  optionGlosses?: Record<string, string>;
  entry: WordEntry;
};

type Mistake = {
  id: string;
  entryId: string;
  kind: Question["kind"];
  prompt: string;
  submitted: string;
  answer: string;
  createdAt: string;
  helper?: string;
  acceptedAnswers?: string[];
  options?: string[];
  optionGlosses?: Record<string, string>;
};

const focusLabels: Record<QuizFocus, string> = {
  mixed: "Trộn kiến thức",
  meaning: "Nghĩa",
  collocation: "Collocation",
  synonym: "Đồng nghĩa",
  pronunciation: "Phát âm",
};

const navItems: { id: View; label: string; short: string; icon: string }[] = [
  { id: "explore", label: "Kho từ vựng", short: "Kho từ", icon: "⌂" },
  { id: "quiz-choice", label: "Trắc nghiệm", short: "Trắc nghiệm", icon: "◆" },
  { id: "quiz-typing", label: "Tự gõ đáp án", short: "Tự gõ", icon: "✎" },
  { id: "mistakes", label: "Sổ lỗi", short: "Sổ lỗi", icon: "↻" },
];

const topicIcons: Record<string, string> = {
  "Academic Core": "Aa",
  Education: "✦",
  Environment: "⌁",
  Technology: "⌘",
  Health: "+",
  Society: "◎",
  "Economy & Work": "↗",
  "Government & Crime": "§",
  "Cities & Transport": "⌂",
  "Media & Culture": "◉",
  "Data & Trends": "⌁",
  "High-value Language": "★",
  "Academic Word List": "AWL",
  "Science & Research": "⚗",
  "Biology & Evolution": "DNA",
  "Agriculture & Food": "♧",
  "Technology & Engineering": "⚙",
  "Society & Demographics": "◌",
  "History & Archaeology": "⌛",
  "Language & Communication": "abc",
  "Government & Law": "§",
};

type SoundKind = "tap" | "correct" | "wrong" | "collect" | "complete";

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const sample = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const normalise = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ");

type CollocationGap = {
  answer: string;
  entry: WordEntry;
  phrase: string;
  position: "before" | "after";
  prompt: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const collocationGaps = (entry: WordEntry): CollocationGap[] => {
  const termPattern = new RegExp(escapeRegExp(entry.term), "i");

  return entry.collocations.flatMap((phrase): CollocationGap[] => {
    const match = phrase.match(termPattern);
    if (!match || match.index === undefined) return [];

    const before = phrase.slice(0, match.index).trim();
    const after = phrase.slice(match.index + match[0].length).trim();

    if (before) {
      return [{
        answer: before,
        entry,
        phrase,
        position: "before",
        prompt: `_____ ${entry.term}${after ? ` ${after}` : ""}`,
      }];
    }

    if (after) {
      return [{
        answer: after,
        entry,
        phrase,
        position: "after",
        prompt: `${entry.term} _____`,
      }];
    }

    return [];
  });
};

const collocationGloss = (gap: CollocationGap) => {
  const directEntry = lexicon.find((item) => normalise(item.term) === normalise(gap.answer));
  if (directEntry) return directEntry.meaningVi;

  const semanticEntry = lexicon.find((item) =>
    [...item.synonyms, ...item.antonyms, ...item.family].some(
      (word) => normalise(word) === normalise(gap.answer),
    ),
  );
  if (semanticEntry) return semanticEntry.meaningVi;

  return `Cụm mẫu: ${gap.phrase} · ${gap.entry.meaningVi}`;
};

function makeQuestion(focus: QuizFocus, multipleChoice: boolean): Question {
  const available: Question["kind"][] = ["meaning", "collocation", "synonym", "pronunciation"];
  const kind = focus === "mixed" ? sample(available) : focus;
  const eligibleEntries = kind === "collocation"
    ? lexicon.filter((item) => collocationGaps(item).length > 0)
    : kind === "synonym"
      ? lexicon.filter((item) => item.synonyms.length > 0)
      : lexicon;
  const entry = sample(eligibleEntries);

  if (kind === "meaning") {
    const reverse = Math.random() > 0.5;
    if (reverse) {
      const choices = [
        entry,
        ...shuffle(lexicon.filter((item) => item.id !== entry.id)).slice(0, 3),
      ];
      return {
        kind,
        label: "Định nghĩa → từ",
        prompt: entry.definitionEn,
        helper: `Chủ đề · ${entry.topic}`,
        answer: entry.term,
        entry,
        options: shuffle(choices.map((item) => item.term)),
        optionGlosses: Object.fromEntries(choices.map((item) => [item.term, item.meaningVi])),
      };
    }

    return {
      kind,
      label: "Từ → nghĩa",
      prompt: entry.term,
      helper: `${entry.partOfSpeech} · ${entry.ipa}`,
      answer: entry.meaningVi,
      entry,
      options: shuffle([
        entry.meaningVi,
        ...shuffle(lexicon.filter((item) => item.id !== entry.id)).slice(0, 3).map((item) => item.meaningVi),
      ]),
    };
  }

  if (kind === "collocation") {
    const gapPool = lexicon.flatMap(collocationGaps);
    const entryGaps = collocationGaps(entry);
    const correctGap = entryGaps.length ? sample(entryGaps) : sample(gapPool);

    if (!multipleChoice) {
      return {
        kind,
        label: "Hoàn thành collocation",
        prompt: correctGap.prompt,
        helper: correctGap.entry.meaningVi,
        answer: correctGap.answer,
        entry: correctGap.entry,
        options: [],
      };
    }

    const distractors = shuffle(
      gapPool.filter((gap) =>
        gap.entry.id !== correctGap.entry.id
        && gap.position === correctGap.position
        && normalise(gap.answer) !== normalise(correctGap.answer),
      ),
    ).filter((gap, index, items) =>
      items.findIndex((item) => normalise(item.answer) === normalise(gap.answer)) === index,
    ).slice(0, 3);
    const choices = [correctGap, ...distractors];

    return {
      kind,
      label: "Điền từ/cụm còn thiếu",
      prompt: correctGap.prompt,
      helper: correctGap.entry.meaningVi,
      answer: correctGap.answer,
      entry: correctGap.entry,
      options: shuffle(choices.map((choice) => choice.answer)),
      optionGlosses: Object.fromEntries(
        choices.map((choice) => [choice.answer, collocationGloss(choice)]),
      ),
    };
  }

  if (kind === "synonym") {
    const answer = entry.synonyms[0] ?? entry.antonyms[0] ?? entry.term;
    const candidates = shuffle(
      lexicon
        .filter((item) => item.id !== entry.id && item.synonyms.length)
        .map((item) => ({ value: item.synonyms[0], gloss: item.meaningVi })),
    ).slice(0, 3);
    const choices = [{ value: answer, gloss: entry.meaningVi }, ...candidates];

    return {
      kind,
      label: "Đồng nghĩa gần nhất",
      prompt: entry.term,
      helper: entry.definitionEn,
      answer,
      acceptedAnswers: entry.synonyms,
      entry,
      options: shuffle(choices.map((choice) => choice.value)),
      optionGlosses: Object.fromEntries(choices.map((choice) => [choice.value, choice.gloss])),
    };
  }

  const pronunciationChoices = [
    entry,
    ...shuffle(lexicon.filter((item) => item.id !== entry.id)).slice(0, 3),
  ];

  return {
    kind: "pronunciation",
    label: "IPA → từ",
    prompt: entry.ipa,
    helper: `Trọng âm · ${entry.stress}`,
    answer: entry.term,
    entry,
    options: shuffle(pronunciationChoices.map((item) => item.term)),
    optionGlosses: Object.fromEntries(
      pronunciationChoices.map((item) => [item.term, item.meaningVi]),
    ),
  };
}

const reviewOptionGloss = (value: string) => {
  const entry = lexicon.find((item) =>
    normalise(item.term) === normalise(value)
    || normalise(item.meaningVi) === normalise(value)
    || item.synonyms.some((synonym) => normalise(synonym) === normalise(value)),
  );
  if (!entry) return undefined;
  return normalise(entry.meaningVi) === normalise(value) ? entry.term : entry.meaningVi;
};

function makeMistakeQuestion(mistake: Mistake): Question | null {
  const entry = lexicon.find((item) => item.id === mistake.entryId);
  if (!entry) return null;

  const fallbackOptions = mistake.kind === "meaning"
    ? normalise(mistake.answer) === normalise(entry.term)
      ? lexicon.map((item) => item.term)
      : lexicon.map((item) => item.meaningVi)
    : mistake.kind === "synonym"
      ? lexicon.flatMap((item) => item.synonyms.slice(0, 1))
      : mistake.kind === "collocation"
        ? lexicon.flatMap(collocationGaps).map((gap) => gap.answer)
        : lexicon.map((item) => item.term);

  const candidateOptions = [
    mistake.answer,
    ...(mistake.options ?? []),
    ...shuffle(fallbackOptions),
  ].filter((option, index, options) =>
    option.trim()
    && options.findIndex((item) => normalise(item) === normalise(option)) === index,
  ).slice(0, 4);
  const options = shuffle(candidateOptions);
  const generatedGlosses = Object.fromEntries(
    options.flatMap((option) => {
      const gloss = reviewOptionGloss(option);
      return gloss ? [[option, gloss]] : [];
    }),
  );

  return {
    kind: mistake.kind,
    label: focusLabels[mistake.kind],
    prompt: mistake.prompt,
    helper: mistake.helper ?? `${entry.meaningVi} · ${entry.topic}`,
    answer: mistake.answer,
    acceptedAnswers: mistake.acceptedAnswers,
    options,
    optionGlosses: { ...generatedGlosses, ...mistake.optionGlosses },
    entry,
  };
}

function SpeakerButton({ term, compact = false }: { term: string; compact?: boolean }) {
  const speak = (accent: "en-GB" | "en-US") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = accent;
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  if (compact) {
    return (
      <button className="icon-button" type="button" onClick={() => speak("en-GB")} aria-label={`Nghe phát âm ${term}`}>
        ◖
      </button>
    );
  }

  return (
    <div className="speaker-group" aria-label="Chọn giọng phát âm">
      <button type="button" onClick={() => speak("en-GB")}><span>◖</span> UK</button>
      <button type="button" onClick={() => speak("en-US")}><span>◖</span> US</button>
    </div>
  );
}

export default function LexiconApp() {
  const [view, setView] = useState<View>("explore");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("Tất cả");
  const [kind, setKind] = useState("Tất cả");
  const [level, setLevel] = useState("Tất cả");
  const [collectionFilter, setCollectionFilter] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState(lexicon[25].id);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mastered, setMastered] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Mistake[]>([]);
  const [reviewQuestion, setReviewQuestion] = useState<Question | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState("");
  const [reviewAnswered, setReviewAnswered] = useState(false);
  const [reviewCorrect, setReviewCorrect] = useState(false);
  const [reviewInitialCount, setReviewInitialCount] = useState(0);
  const [reviewResolved, setReviewResolved] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [focus, setFocus] = useState<QuizFocus>("mixed");
  const [question, setQuestion] = useState<Question | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastStudyDay, setLastStudyDay] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = (kind: SoundKind, force = false) => {
    if ((!soundEnabled && !force) || typeof window === "undefined") return;
    const AudioContextConstructor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    const context = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();

    const sequences: Record<SoundKind, Array<[number, number, number]>> = {
      tap: [[440, 0, 0.055]],
      correct: [[523, 0, 0.09], [659, 0.08, 0.1], [784, 0.17, 0.13]],
      wrong: [[240, 0, 0.12], [180, 0.1, 0.18]],
      collect: [[659, 0, 0.08], [988, 0.07, 0.14]],
      complete: [[523, 0, 0.12], [659, 0.11, 0.12], [784, 0.22, 0.12], [1047, 0.34, 0.2]],
    };

    const startAt = context.currentTime + 0.015;
    sequences[kind].forEach(([frequency, offset, duration], index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === "wrong" ? "triangle" : index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, startAt + offset);
      gain.gain.setValueAtTime(0.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(kind === "tap" ? 0.04 : 0.085, startAt + offset + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + duration + 0.02);
    });
  };

  const todayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const markStudyDay = () => {
    const today = todayKey();
    if (lastStudyDay === today) return;
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;
    setStreak((current) => (lastStudyDay === yesterday ? current + 1 : 1));
    setLastStudyDay(today);
  };

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser-only progress after mount.
      setFavorites(JSON.parse(localStorage.getItem("ielts-lexicon-favorites") ?? "[]"));
      setMastered(JSON.parse(localStorage.getItem("ielts-lexicon-mastered") ?? "[]"));
      setMistakes(uniqueMistakes(JSON.parse(localStorage.getItem("ielts-lexicon-mistakes") ?? "[]")));
      setSoundEnabled(JSON.parse(localStorage.getItem("ielts-lexicon-sound") ?? "true"));
      setXp(Number(localStorage.getItem("ielts-lexicon-xp") ?? 0));
      setStreak(Number(localStorage.getItem("ielts-lexicon-streak") ?? 0));
      setLastStudyDay(localStorage.getItem("ielts-lexicon-last-study") ?? "");
    } catch {
      // A malformed local value should never prevent the dictionary from loading.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("ielts-lexicon-favorites", JSON.stringify(favorites));
    localStorage.setItem("ielts-lexicon-mastered", JSON.stringify(mastered));
    localStorage.setItem("ielts-lexicon-mistakes", JSON.stringify(mistakes));
    localStorage.setItem("ielts-lexicon-sound", JSON.stringify(soundEnabled));
    localStorage.setItem("ielts-lexicon-xp", String(xp));
    localStorage.setItem("ielts-lexicon-streak", String(streak));
    localStorage.setItem("ielts-lexicon-last-study", lastStudyDay);
  }, [favorites, mastered, mistakes, soundEnabled, xp, streak, lastStudyDay, hydrated]);

  useEffect(() => {
    if (view === "quiz-choice" || view === "quiz-typing") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- changing quiz mode intentionally starts a fresh session.
      setQuestion(makeQuestion(focus, view === "quiz-choice"));
      setSubmitted("");
      setAnswered(false);
      setCorrect(false);
      setScore(0);
      setQuestionNumber(1);
      setSessionComplete(false);
    }
  }, [view, focus]);

  const filtered = useMemo(() => {
    const needle = normalise(query);
    return lexicon.filter((entry) => {
      const haystack = normalise(
        [entry.term, entry.meaningVi, entry.definitionEn, entry.topic, ...entry.collocations, ...entry.synonyms, ...entry.family].join(" "),
      );
      const matchesCollection = collectionFilter === "Tất cả"
        || (collectionFilter === "IELTS Reading 330" && entry.readingSource)
        || (collectionFilter === "AWL 570" && entry.awlSublist !== undefined)
        || (collectionFilter === "Ngoài AWL" && entry.awlSublist === undefined)
        || collectionFilter === `Sublist ${entry.awlSublist}`;
      return (
        (!needle || haystack.includes(needle)) &&
        (topic === "Tất cả" || entry.topic === topic) &&
        (kind === "Tất cả" || entry.kind === kind) &&
        (level === "Tất cả" || entry.level === level) &&
        matchesCollection
      );
    });
  }, [query, topic, kind, level, collectionFilter]);

  const selected = filtered.find((entry) => entry.id === selectedId) ?? filtered[0] ?? lexicon[0];
  const masteredPercent = Math.round((mastered.length / lexicon.length) * 100);
  const featured = lexicon.find((entry) => entry.term === "mitigate") ?? lexicon[0];
  const reviewableMistakes = useMemo(() => uniqueMistakes(mistakes), [mistakes]);

  const navigateTo = (nextView: View) => {
    playSound("tap");
    setView(nextView);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) playSound("tap", true);
  };

  const toggleList = (id: string, current: string[], setter: (items: string[]) => void) => {
    playSound("collect");
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const goToEntry = (entryId: string) => {
    setSelectedId(entryId);
    setQuery("");
    setTopic("Tất cả");
    setKind("Tất cả");
    setLevel("Tất cả");
    setCollectionFilter("Tất cả");
    navigateTo("explore");
  };

  const submitAnswer = (answer: string) => {
    if (!question || answered || !answer.trim()) return;
    const acceptedAnswers = question.acceptedAnswers ?? [question.answer];
    const isCorrect = acceptedAnswers.some((item) => normalise(answer) === normalise(item));
    setSubmitted(answer);
    setAnswered(true);
    setCorrect(isCorrect);
    markStudyDay();
    if (isCorrect) {
      playSound("correct");
      setScore((value) => value + 1);
      setXp((value) => value + 10);
      return;
    }

    playSound("wrong");

    setMistakes((current) => {
      const mistake: Mistake = {
        id: `${Date.now()}-${question.entry.id}`,
        entryId: question.entry.id,
        kind: question.kind,
        prompt: question.prompt,
        submitted: answer,
        answer: question.answer,
        createdAt: new Date().toISOString(),
        helper: question.helper,
        acceptedAnswers: question.acceptedAnswers,
        options: question.options,
        optionGlosses: question.optionGlosses,
      };
      return [
        mistake,
        ...current.filter((item) => mistakeSignature(item) !== mistakeSignature(mistake)),
      ].slice(0, 100);
    });
  };

  const submitTyped = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitAnswer(submitted);
  };

  const nextQuestion = () => {
    if (questionNumber >= 10) {
      setSessionComplete(true);
      playSound("complete");
      return;
    }
    playSound("tap");
    setQuestionNumber((value) => value + 1);
    setQuestion(makeQuestion(focus, view === "quiz-choice"));
    setSubmitted("");
    setAnswered(false);
    setCorrect(false);
  };

  const restartSession = () => {
    playSound("tap");
    setQuestion(makeQuestion(focus, view === "quiz-choice"));
    setSubmitted("");
    setAnswered(false);
    setCorrect(false);
    setScore(0);
    setQuestionNumber(1);
    setSessionComplete(false);
  };

  const startMistakeReview = (source: Mistake[]) => {
    const queue = shuffle(uniqueMistakes(source)).filter((mistake) =>
      lexicon.some((entry) => entry.id === mistake.entryId),
    );
    if (!queue.length) return;
    playSound("tap");
    setReviewQueue(queue);
    setReviewQuestion(makeMistakeQuestion(queue[0]));
    setReviewSubmitted("");
    setReviewAnswered(false);
    setReviewCorrect(false);
    setReviewInitialCount(queue.length);
    setReviewResolved(0);
    setReviewComplete(false);
    setView("review-mistakes");
  };

  const submitReviewAnswer = (answer: string) => {
    if (!reviewQuestion || reviewAnswered || !answer.trim()) return;
    const acceptedAnswers = reviewQuestion.acceptedAnswers ?? [reviewQuestion.answer];
    const isCorrect = acceptedAnswers.some((item) => normalise(answer) === normalise(item));
    setReviewSubmitted(answer);
    setReviewAnswered(true);
    setReviewCorrect(isCorrect);
    markStudyDay();
    if (isCorrect) {
      playSound("correct");
      setXp((value) => value + 5);
    } else {
      playSound("wrong");
    }
  };

  const nextReviewQuestion = () => {
    const currentMistake = reviewQueue[0];
    if (!currentMistake) return;
    const nextQueue = advanceReviewQueue(reviewQueue, reviewCorrect);

    if (reviewCorrect) {
      const resolvedSignature = mistakeSignature(currentMistake);
      setMistakes((current) => current.filter(
        (mistake) => mistakeSignature(mistake) !== resolvedSignature,
      ));
      setReviewResolved((value) => value + 1);
    }

    if (!nextQueue.length) {
      setReviewQueue([]);
      setReviewQuestion(null);
      setReviewComplete(true);
      playSound("complete");
      return;
    }

    playSound("tap");
    setReviewQueue(nextQueue);
    setReviewQuestion(makeMistakeQuestion(nextQueue[0]));
    setReviewSubmitted("");
    setReviewAnswered(false);
    setReviewCorrect(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => navigateTo("explore")}>
          <span className="brand-mark"><b>L</b><i>+</i></span>
          <span><strong>LexiBloom</strong><small>IELTS Vocabulary</small></span>
        </button>

        <nav className="primary-nav" aria-label="Điều hướng chính">
          <p className="nav-caption">Học từ vựng</p>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={view === item.id || (view === "review-mistakes" && item.id === "mistakes") ? "active" : ""}
              onClick={() => navigateTo(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "mistakes" && mistakes.length > 0 && <b>{mistakes.length}</b>}
            </button>
          ))}
        </nav>

        <div className="daily-goal-card">
          <div className="goal-ring" style={{ "--goal": `${Math.min(questionNumber * 10, 100)}%` } as React.CSSProperties}><span>{Math.min(questionNumber, 10)}</span><small>/10</small></div>
          <div><strong>Mục tiêu hôm nay</strong><p>Làm 10 câu để giữ streak.</p><button type="button" onClick={() => navigateTo("quiz-choice")}>Học ngay →</button></div>
        </div>

        <div className="side-progress">
          <div className="side-progress-head"><span>Đã nắm vững</span><strong>{masteredPercent}%</strong></div>
          <div className="progress-track"><span style={{ width: `${masteredPercent}%` }} /></div>
          <p>{mastered.length}/{lexicon.length} mục từ</p>
        </div>

        <p className="side-note">Kho học thuật được tổ chức theo nghĩa, phát âm, cụm, collocation và quan hệ từ.</p>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><b>L</b><i>+</i></span><strong>LexiBloom</strong></div>
          <div className="topbar-actions">
            <span className="metric-pill streak-pill"><i>🔥</i><strong>{streak}</strong><small>streak</small></span>
            <span className="metric-pill xp-pill"><i>⚡</i><strong>{xp}</strong><small>XP</small></span>
            <button type="button" className={`sound-toggle ${soundEnabled ? "on" : ""}`} onClick={toggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}>
              <span aria-hidden="true">{soundEnabled ? "♪" : "×"}</span>
            </button>
            <button type="button" className="avatar" aria-label="Hồ sơ người học"><span>YL</span><i /></button>
          </div>
        </header>

        {view === "explore" && (
          <div className="content-wrap explore-view">
            <section className="learning-hero">
              <div className="hero-copy">
                <span className="hero-badge"><i /> 1.000 mục · 570 AWL · 330 IELTS Reading</span>
                <h1>Biến từ mới thành<br/><em>phản xạ thật.</em></h1>
                <p>Học nghĩa, nghe phát âm, nối collocation và tự kiểm tra — mỗi ngày một chút, nhớ lâu hơn hẳn.</p>
                <div className="hero-actions">
                  <button type="button" className="primary-cta" onClick={() => navigateTo("quiz-choice")}><span>▶</span> Bắt đầu 10 câu</button>
                  <button type="button" className="secondary-cta" onClick={() => navigateTo("quiz-typing")}>Thử chế độ khó <span>→</span></button>
                </div>
              </div>
              <div className="word-of-day">
                <div className="word-card-orbit orbit-one" />
                <div className="word-card-orbit orbit-two" />
                <div className="word-card-inner">
                  <div className="word-card-top"><span>WORD OF THE DAY</span><SpeakerButton term={featured.term} compact /></div>
                  <p>{featured.partOfSpeech} · {featured.level}</p>
                  <h2>{featured.term}</h2>
                  <code>{featured.ipa}</code>
                  <strong>{featured.meaningVi}</strong>
                  <small>{featured.collocations[0]}</small>
                  <button type="button" onClick={() => goToEntry(featured.id)}>Mở hồ sơ từ <span>→</span></button>
                </div>
                <span className="floating-chip chip-one">{featured.synonyms[0]}</span>
                <span className="floating-chip chip-two">{featured.family[0]}</span>
              </div>
            </section>

            <section className="learning-stats" aria-label="Tiến độ học">
              <article><span className="stat-icon purple">Aa</span><div><strong>{lexiconStats.entries.toLocaleString("vi-VN")}</strong><small>Từ & cụm IELTS</small></div></article>
              <article><span className="stat-icon green">AWL</span><div><strong>{lexiconStats.awlHeadwords}</strong><small>Academic headwords</small></div></article>
              <article><span className="stat-icon coral">R</span><div><strong>{lexiconStats.readingVocabulary}</strong><small>Theo IELTS Reading</small></div></article>
              <article><span className="stat-icon orange">✓</span><div><strong>{mastered.length}</strong><small>Đã nắm vững</small></div></article>
            </section>

            <section className="topic-browser">
              <div className="section-heading"><div><span>Học theo chủ đề</span><h2>Chọn một vùng từ vựng</h2></div><small>{lexiconStats.topics} bộ chủ đề</small></div>
              <div className="topic-chips">
                {topics.slice(1).map((item) => (
                  <button type="button" key={item} className={topic === item ? "active" : ""} onClick={() => { playSound("tap"); setCollectionFilter("Tất cả"); setTopic(topic === item ? "Tất cả" : item); }}>
                    <span>{topicIcons[item] ?? "•"}</span><b>{item}</b><small>{lexicon.filter((entry) => entry.topic === item).length}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="search-panel" aria-label="Bộ lọc từ vựng">
              <label className="search-box">
                <span>⌕</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm từ, nghĩa, synonym hoặc collocation..." />
                {query && <button type="button" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm">×</button>}
              </label>
              <div className="filter-row">
                <label><span>Bộ từ</span><select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)}><option>Tất cả</option><option>IELTS Reading 330</option><option>AWL 570</option>{Array.from({ length: 10 }, (_, index) => <option key={index + 1}>Sublist {index + 1}</option>)}<option>Ngoài AWL</option></select></label>
                <label><span>Chủ đề</span><select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label><span>Loại</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option>Tất cả</option><option value="word">Từ đơn</option><option value="phrase">Cụm từ</option><option value="collocation">Collocation</option></select></label>
                <label><span>Trình độ</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>Tất cả</option><option>B1</option><option>B2</option><option>C1</option></select></label>
                <span className="result-count">{filtered.length} kết quả</span>
              </div>
            </section>

            <section className="lexicon-grid">
              <div className="word-list" aria-label="Danh sách từ">
                <div className="list-heading"><span>Mục từ</span><span>Chủ đề</span></div>
                <div className="list-scroll">
                  {filtered.map((entry) => (
                    <button
                      type="button"
                      className={`word-row ${selected.id === entry.id ? "selected" : ""}`}
                      key={entry.id}
                      onClick={() => { playSound("tap"); setSelectedId(entry.id); }}
                    >
                      <span className="word-main"><strong>{entry.term}</strong><small>{entry.ipa} · {entry.partOfSpeech}</small></span>
                      <span className="word-topic">{entry.readingSource ? `Reading · ${entry.topic}` : entry.awlSublist ? `AWL · S${entry.awlSublist}` : entry.topic}</span>
                      <span className={`level-tag level-${entry.level.toLowerCase()}`}>{entry.level}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && <div className="empty-state"><strong>Chưa thấy kết quả.</strong><span>Thử tìm bằng từ tiếng Anh, nghĩa tiếng Việt hoặc collocation.</span></div>}
                </div>
              </div>

              <article className="word-detail">
                <div className="detail-glow" />
                <div className="detail-topline">
                  <div className="chip-row"><span>{selected.topic}</span>{selected.readingSource && <span>IELTS Reading</span>}{selected.awlSublist && <span>AWL · Sublist {selected.awlSublist}</span>}<span>{selected.kind === "word" ? "Từ đơn" : selected.kind === "phrase" ? "Cụm từ" : "Collocation"}</span><span>{selected.level}</span></div>
                  <div className="detail-actions">
                    <button type="button" className={favorites.includes(selected.id) ? "is-on" : ""} onClick={() => toggleList(selected.id, favorites, setFavorites)} aria-label="Lưu từ">{favorites.includes(selected.id) ? "★" : "☆"}</button>
                    <button type="button" className={mastered.includes(selected.id) ? "mastered" : ""} onClick={() => toggleList(selected.id, mastered, setMastered)}>{mastered.includes(selected.id) ? "✓ Đã thuộc" : "Đánh dấu đã thuộc"}</button>
                  </div>
                </div>

                <div className="headword-block">
                  <p>{selected.partOfSpeech}</p>
                  <h2>{selected.term}</h2>
                  <div className="pronunciation-line"><code>{selected.ipa}</code><span>•</span><span>{selected.stress}</span><SpeakerButton term={selected.term} /></div>
                </div>

                <div className="mini-learning-path" aria-label="Các lớp kiến thức của từ">
                  <span className="done"><i>✓</i>Nghĩa</span><b />
                  <span><i>2</i>Phát âm</span><b />
                  <span><i>3</i>Collocation</span><b />
                  <span><i>4</i>Quan hệ từ</span>
                </div>

                <div className="meaning-block">
                  <strong>{selected.meaningVi}</strong>
                  <p>{selected.definitionEn}</p>
                </div>

                <blockquote><span>“</span>{selected.example}</blockquote>

                <div className="detail-section">
                  <div className="section-title"><span>01</span><h3>Collocations & cụm đi kèm</h3></div>
                  <div className="term-cloud green">{selected.collocations.length ? selected.collocations.map((item) => <span key={item}>{item}</span>) : <small>Chưa có collocation đã kiểm chứng cho mục này.</small>}</div>
                </div>

                <div className="detail-columns">
                  <div className="detail-section">
                    <div className="section-title"><span>02</span><h3>Đồng nghĩa</h3></div>
                    <div className="term-cloud">{selected.synonyms.length ? selected.synonyms.map((item) => <span key={item}>{item}</span>) : <small>Không có từ thay thế trực tiếp.</small>}</div>
                  </div>
                  <div className="detail-section">
                    <div className="section-title"><span>03</span><h3>Trái nghĩa</h3></div>
                    <div className="term-cloud coral">{selected.antonyms.length ? selected.antonyms.map((item) => <span key={item}>{item}</span>) : <small>Không có đối nghĩa trực tiếp.</small>}</div>
                  </div>
                </div>

                <div className="detail-section family-section">
                  <div className="section-title"><span>04</span><h3>Word family</h3></div>
                  <div className="family-flow"><strong>{selected.term}</strong><b>→</b>{selected.family.length ? selected.family.map((item) => <span key={item}>{item}</span>) : <span>Không có biến thể thông dụng</span>}</div>
                </div>
              </article>
            </section>
          </div>
        )}

        {(view === "quiz-choice" || view === "quiz-typing") && (
          <div className="content-wrap quiz-view">
            <section className="quiz-heading">
              <div><span className="mode-orb">{view === "quiz-choice" ? "◆" : "✎"}</span><p className="eyebrow">ACTIVE RECALL</p><h1>{view === "quiz-choice" ? "Trắc nghiệm tăng tốc" : "Tự gõ để nhớ sâu"}</h1><p>{view === "quiz-choice" ? "Chọn nhanh, nhận phản hồi ngay và tích XP." : "Không nhìn đáp án — để não tự kéo từ ra khỏi trí nhớ."}</p></div>
              <div className="session-score"><span>Phiên học</span><strong>{score}<small>/ {sessionComplete ? 10 : questionNumber}</small></strong><em>+{score * 10} XP</em></div>
            </section>

            <div className="focus-tabs" role="tablist" aria-label="Chọn kiến thức kiểm tra">
              {(Object.keys(focusLabels) as QuizFocus[]).map((item) => <button type="button" key={item} className={focus === item ? "active" : ""} onClick={() => { playSound("tap"); setFocus(item); }}>{focusLabels[item]}</button>)}
            </div>

            {sessionComplete ? (
              <section className="result-card">
                <div className="confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
                <div className="result-crown">✦</div>
                <p>HOÀN THÀNH PHIÊN HỌC</p>
                <h2>{score >= 8 ? "Quá ổn! Não đang vào guồng." : score >= 5 ? "Tiến bộ rồi, ôn thêm chút nhé." : "Sai để biết chỗ cần nhớ."}</h2>
                <div className="result-score"><strong>{score}<small>/10</small></strong><span>{score * 10}% chính xác</span></div>
                <div className="result-metrics">
                  <article><span>⚡</span><strong>+{score * 10} XP</strong><small>Đã nhận</small></article>
                  <article><span>🔥</span><strong>{streak} ngày</strong><small>Streak hiện tại</small></article>
                  <article><span>↻</span><strong>{10 - score} từ</strong><small>Cần ôn lại</small></article>
                </div>
                <div className="result-actions"><button type="button" onClick={restartSession}>Làm thêm 10 câu</button><button type="button" onClick={() => navigateTo("mistakes")}>Xem sổ lỗi</button></div>
              </section>
            ) : question && (
              <section className={`quiz-card ${answered ? (correct ? "answer-correct" : "answer-wrong") : ""}`}>
                <div className="quiz-progress"><span>Câu {questionNumber}/10</span><div><i style={{ width: `${questionNumber * 10}%` }} /></div><b>{question.label}</b></div>
                <div className="question-copy">
                  <p>{question.label}</p>
                  <h2>{question.prompt}</h2>
                  {question.helper && <span>{question.helper}</span>}
                  {question.kind === "pronunciation" && <SpeakerButton term={question.entry.term} />}
                </div>

                {view === "quiz-choice" ? (
                  <div className="answer-grid">
                    {question.options.map((option, index) => {
                      const optionCorrect = normalise(option) === normalise(question.answer);
                      const optionChosen = normalise(option) === normalise(submitted);
                      return (
                        <button
                          type="button"
                          key={`${option}-${index}`}
                          disabled={answered}
                          className={answered && optionCorrect ? "correct-option" : answered && optionChosen ? "wrong-option" : ""}
                          onClick={() => submitAnswer(option)}
                        >
                          <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                          <span className="answer-copy">
                            <strong>{option}</strong>
                            {answered && question.optionGlosses?.[option] && (
                              <small>{question.optionGlosses[option]}</small>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <form className="typing-form" onSubmit={submitTyped}>
                    <label><span>Câu trả lời của bạn</span><input autoFocus value={submitted} disabled={answered} onChange={(event) => setSubmitted(event.target.value)} placeholder="Gõ đáp án tiếng Anh..." autoComplete="off" /></label>
                    {!answered && <button type="submit" disabled={!submitted.trim()}>Kiểm tra đáp án</button>}
                  </form>
                )}

                {answered && (
                  <div className="answer-feedback">
                    <div className="feedback-icon">{correct ? "✓" : "!"}</div>
                    <div><strong>{correct ? "+10 XP · Chính xác!" : "Chưa đúng — đã lưu vào sổ lỗi."}</strong><p>Đáp án: <b>{question.answer}</b></p><small>{question.entry.example}</small></div>
                    <button type="button" onClick={nextQuestion}>{questionNumber === 10 ? "Xem kết quả" : "Câu tiếp theo"} →</button>
                  </div>
                )}
              </section>
            )}

            <section className="quiz-footnote"><strong>Vì sao có hai chế độ?</strong><p>Trắc nghiệm rèn nhận diện. Tự gõ rèn khả năng nhớ chủ động — khó hơn nhưng bền hơn.</p></section>
          </div>
        )}

        {view === "review-mistakes" && (
          <div className="content-wrap quiz-view review-view">
            <section className="quiz-heading review-heading">
              <div><span className="mode-orb">↻</span><p className="eyebrow">ERROR MASTERY LOOP</p><h1>Làm lại câu sai</h1><p>Trả lời đúng để gỡ câu khỏi sổ lỗi. Nếu vẫn sai, câu đó sẽ xuống cuối hàng đợi và quay lại.</p></div>
              <div className="session-score"><span>Đã sửa</span><strong>{reviewComplete ? reviewInitialCount : reviewResolved}<small>/ {reviewInitialCount}</small></strong><em>+{reviewResolved * 5} XP</em></div>
            </section>

            {reviewComplete ? (
              <section className="result-card review-result">
                <div className="confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
                <div className="result-crown">✓</div>
                <p>ĐÃ KHÉP VÒNG SỬA LỖI</p>
                <h2>Không còn câu nào bị bỏ lại.</h2>
                <div className="result-score"><strong>{reviewInitialCount}<small>/{reviewInitialCount}</small></strong><span>đã trả lời đúng</span></div>
                <div className="result-metrics">
                  <article><span>⚡</span><strong>+{reviewInitialCount * 5} XP</strong><small>Điểm sửa lỗi</small></article>
                  <article><span>✓</span><strong>0 câu</strong><small>Còn trong vòng</small></article>
                  <article><span>↻</span><strong>100%</strong><small>Đã xử lý</small></article>
                </div>
                <div className="result-actions"><button type="button" onClick={() => navigateTo("mistakes")}>Về sổ lỗi</button><button type="button" onClick={() => navigateTo("quiz-choice")}>Học 10 câu mới</button></div>
              </section>
            ) : reviewQuestion && (
              <section className={`quiz-card review-card ${reviewAnswered ? (reviewCorrect ? "answer-correct" : "answer-wrong") : ""}`}>
                <div className="quiz-progress"><span>Còn {reviewQueue.length}</span><div><i style={{ width: `${reviewInitialCount ? (reviewResolved / reviewInitialCount) * 100 : 0}%` }} /></div><b>{reviewQuestion.label}</b></div>
                <div className="question-copy">
                  <p>{reviewQuestion.label}</p>
                  <h2>{reviewQuestion.prompt}</h2>
                  {reviewQuestion.helper && <span>{reviewQuestion.helper}</span>}
                  {reviewQuestion.kind === "pronunciation" && <SpeakerButton term={reviewQuestion.entry.term} />}
                </div>

                <div className="answer-grid">
                  {reviewQuestion.options.map((option, index) => {
                    const optionCorrect = normalise(option) === normalise(reviewQuestion.answer);
                    const optionChosen = normalise(option) === normalise(reviewSubmitted);
                    return (
                      <button
                        type="button"
                        key={`${option}-${index}`}
                        disabled={reviewAnswered}
                        className={reviewAnswered && optionCorrect ? "correct-option" : reviewAnswered && optionChosen ? "wrong-option" : ""}
                        onClick={() => submitReviewAnswer(option)}
                      >
                        <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="answer-copy">
                          <strong>{option}</strong>
                          {reviewAnswered && reviewQuestion.optionGlosses?.[option] && <small>{reviewQuestion.optionGlosses[option]}</small>}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {reviewAnswered && (
                  <div className="answer-feedback">
                    <div className="feedback-icon">{reviewCorrect ? "✓" : "!"}</div>
                    <div><strong>{reviewCorrect ? "+5 XP · Đã sửa được lỗi này!" : "Chưa đúng — câu này sẽ quay lại cuối vòng."}</strong><p>Đáp án: <b>{reviewQuestion.answer}</b></p><small>{reviewQuestion.entry.example}</small></div>
                    <button type="button" onClick={nextReviewQuestion}>{reviewCorrect && reviewQueue.length === 1 ? "Hoàn tất" : reviewCorrect ? "Câu tiếp theo" : "Gặp lại sau"} →</button>
                  </div>
                )}
              </section>
            )}

            {!reviewComplete && <section className="quiz-footnote review-footnote"><strong>Quy tắc của vòng sửa lỗi</strong><p>Một câu chỉ biến mất khỏi Sổ lỗi sau khi bạn tự trả lời đúng.</p></section>}
          </div>
        )}

        {view === "mistakes" && (
          <div className="content-wrap mistakes-view">
            <section className="mistakes-heading">
              <div><p className="eyebrow">PERSONAL ERROR BANK</p><h1>Sổ lỗi của bạn</h1><p>Mỗi câu trả lời sai được giữ lại để bạn biết chính xác mình yếu ở nghĩa, cụm, đồng nghĩa hay phát âm.</p></div>
              {reviewableMistakes.length > 0 && <div className="mistake-heading-actions"><button type="button" onClick={() => startMistakeReview(reviewableMistakes)}>↻ Làm lại {reviewableMistakes.length} câu sai</button><button type="button" onClick={() => { playSound("tap"); setMistakes([]); }}>Xóa toàn bộ</button></div>}
            </section>

            <div className="mistake-summary">
              {(["meaning", "collocation", "synonym", "pronunciation"] as Question["kind"][]).map((item) => {
                const matchingMistakes = reviewableMistakes.filter((mistake) => mistake.kind === item);
                return <button type="button" key={item} disabled={!matchingMistakes.length} onClick={() => startMistakeReview(matchingMistakes)}><span>{focusLabels[item]}</span><strong>{matchingMistakes.length}</strong><small>{matchingMistakes.length ? "Ôn riêng nhóm này →" : "Chưa có lỗi"}</small></button>;
              })}
            </div>

            <section className="mistake-list">
              {mistakes.map((mistake) => {
                const entry = lexicon.find((item) => item.id === mistake.entryId);
                if (!entry) return null;
                return (
                  <article key={mistake.id}>
                    <div className="mistake-type"><span>{focusLabels[mistake.kind]}</span><small>{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(mistake.createdAt))}</small></div>
                    <div className="mistake-copy"><p>{mistake.prompt}</p><div><span>Bạn trả lời: <del>{mistake.submitted}</del></span><span>Đáp án đúng: <strong>{mistake.answer}</strong></span></div></div>
                    <div className="mistake-entry"><strong>{entry.term}</strong><small>{entry.meaningVi}</small></div>
                    <div className="mistake-row-actions"><button type="button" onClick={() => startMistakeReview([mistake])}>Làm lại</button><button type="button" onClick={() => goToEntry(entry.id)}>Mở hồ sơ</button></div>
                  </article>
                );
              })}
              {mistakes.length === 0 && (
                <div className="mistake-empty"><span>✓</span><h2>Sổ lỗi đang trống</h2><p>Làm bài trắc nghiệm hoặc tự gõ. Những câu sai sẽ tự xuất hiện ở đây.</p><button type="button" onClick={() => navigateTo("quiz-choice")}>Bắt đầu trắc nghiệm</button></div>
              )}
            </section>
          </div>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Điều hướng di động">
        {navItems.map((item) => <button type="button" key={item.id} className={view === item.id || (view === "review-mistakes" && item.id === "mistakes") ? "active" : ""} onClick={() => navigateTo(item.id)}><i aria-hidden="true">{item.icon}</i><span>{item.short}</span>{item.id === "mistakes" && mistakes.length > 0 && <b>{mistakes.length}</b>}</button>)}
      </nav>
    </div>
  );
}
