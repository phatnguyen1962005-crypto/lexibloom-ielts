"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { lexicon, lexiconStats, topics, type WordEntry } from "./lexicon-data";

type View = "explore" | "quiz-choice" | "quiz-typing" | "mistakes";
type QuizFocus = "mixed" | "meaning" | "collocation" | "synonym" | "pronunciation";

type Question = {
  kind: Exclude<QuizFocus, "mixed">;
  label: string;
  prompt: string;
  helper?: string;
  answer: string;
  acceptedAnswers?: string[];
  options: string[];
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
};

const focusLabels: Record<QuizFocus, string> = {
  mixed: "Trộn kiến thức",
  meaning: "Nghĩa",
  collocation: "Collocation",
  synonym: "Đồng nghĩa",
  pronunciation: "Phát âm",
};

const navItems: { id: View; label: string; short: string }[] = [
  { id: "explore", label: "Kho từ vựng", short: "Kho từ" },
  { id: "quiz-choice", label: "Trắc nghiệm", short: "Chọn đáp án" },
  { id: "quiz-typing", label: "Tự gõ đáp án", short: "Tự gõ" },
  { id: "mistakes", label: "Sổ lỗi", short: "Sổ lỗi" },
];

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

function makeQuestion(focus: QuizFocus, multipleChoice: boolean): Question {
  const entry = sample(lexicon);
  const available: Question["kind"][] = ["meaning", "collocation", "synonym", "pronunciation"];
  const kind = focus === "mixed" ? sample(available) : focus;

  if (kind === "meaning") {
    const reverse = Math.random() > 0.5;
    if (reverse) {
      return {
        kind,
        label: "Định nghĩa → từ",
        prompt: entry.definitionEn,
        helper: `Chủ đề · ${entry.topic}`,
        answer: entry.term,
        entry,
        options: shuffle([
          entry.term,
          ...shuffle(lexicon.filter((item) => item.id !== entry.id)).slice(0, 3).map((item) => item.term),
        ]),
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
    const collocation = sample(entry.collocations);
    const escapedTerm = entry.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const canBlank = new RegExp(escapedTerm, "i").test(collocation);

    if (!multipleChoice && canBlank) {
      return {
        kind,
        label: "Hoàn thành collocation",
        prompt: collocation.replace(new RegExp(escapedTerm, "i"), "________"),
        helper: entry.meaningVi,
        answer: entry.term,
        entry,
        options: [],
      };
    }

    return {
      kind,
      label: "Chọn cụm tự nhiên",
      prompt: `Cụm nào đi tự nhiên với “${entry.term}”?`,
      helper: entry.meaningVi,
      answer: collocation,
      entry,
      options: shuffle([
        collocation,
        ...shuffle(lexicon.filter((item) => item.id !== entry.id)).slice(0, 3).map((item) => sample(item.collocations)),
      ]),
    };
  }

  if (kind === "synonym") {
    const answer = entry.synonyms[0] ?? entry.antonyms[0] ?? entry.term;
    const candidates = shuffle(
      lexicon
        .filter((item) => item.id !== entry.id && item.synonyms.length)
        .map((item) => item.synonyms[0]),
    ).slice(0, 3);

    return {
      kind,
      label: "Đồng nghĩa gần nhất",
      prompt: entry.term,
      helper: entry.definitionEn,
      answer,
      acceptedAnswers: entry.synonyms,
      entry,
      options: shuffle([answer, ...candidates]),
    };
  }

  return {
    kind: "pronunciation",
    label: "IPA → từ",
    prompt: entry.ipa,
    helper: `Trọng âm · ${entry.stress}`,
    answer: entry.term,
    entry,
    options: shuffle([
      entry.term,
      ...shuffle(lexicon.filter((item) => item.id !== entry.id)).slice(0, 3).map((item) => item.term),
    ]),
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
  const [selectedId, setSelectedId] = useState(lexicon[25].id);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mastered, setMastered] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [focus, setFocus] = useState<QuizFocus>("mixed");
  const [question, setQuestion] = useState<Question | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("ielts-lexicon-favorites") ?? "[]"));
      setMastered(JSON.parse(localStorage.getItem("ielts-lexicon-mastered") ?? "[]"));
      setMistakes(JSON.parse(localStorage.getItem("ielts-lexicon-mistakes") ?? "[]"));
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
  }, [favorites, mastered, mistakes, hydrated]);

  useEffect(() => {
    if (view === "quiz-choice" || view === "quiz-typing") {
      setQuestion(makeQuestion(focus, view === "quiz-choice"));
      setSubmitted("");
      setAnswered(false);
      setCorrect(false);
      setScore(0);
      setQuestionNumber(1);
    }
  }, [view, focus]);

  const filtered = useMemo(() => {
    const needle = normalise(query);
    return lexicon.filter((entry) => {
      const haystack = normalise(
        [entry.term, entry.meaningVi, entry.definitionEn, entry.topic, ...entry.collocations, ...entry.synonyms].join(" "),
      );
      return (
        (!needle || haystack.includes(needle)) &&
        (topic === "Tất cả" || entry.topic === topic) &&
        (kind === "Tất cả" || entry.kind === kind) &&
        (level === "Tất cả" || entry.level === level)
      );
    });
  }, [query, topic, kind, level]);

  const selected = lexicon.find((entry) => entry.id === selectedId) ?? filtered[0] ?? lexicon[0];
  const masteredPercent = Math.round((mastered.length / lexicon.length) * 100);

  const toggleList = (id: string, current: string[], setter: (items: string[]) => void) => {
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const goToEntry = (entryId: string) => {
    setSelectedId(entryId);
    setQuery("");
    setTopic("Tất cả");
    setKind("Tất cả");
    setLevel("Tất cả");
    setView("explore");
  };

  const submitAnswer = (answer: string) => {
    if (!question || answered || !answer.trim()) return;
    const acceptedAnswers = question.acceptedAnswers ?? [question.answer];
    const isCorrect = acceptedAnswers.some((item) => normalise(answer) === normalise(item));
    setSubmitted(answer);
    setAnswered(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      setScore((value) => value + 1);
      return;
    }

    setMistakes((current) => [
      {
        id: `${Date.now()}-${question.entry.id}`,
        entryId: question.entry.id,
        kind: question.kind,
        prompt: question.prompt,
        submitted: answer,
        answer: question.answer,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ].slice(0, 100));
  };

  const submitTyped = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitAnswer(submitted);
  };

  const nextQuestion = () => {
    const nextNumber = questionNumber >= 10 ? 1 : questionNumber + 1;
    setQuestionNumber(nextNumber);
    if (questionNumber >= 10) setScore(0);
    setQuestion(makeQuestion(focus, view === "quiz-choice"));
    setSubmitted("");
    setAnswered(false);
    setCorrect(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => setView("explore")}>
          <span className="brand-mark">Lx</span>
          <span><strong>IELTS Lexicon</strong><small>Build your word power</small></span>
        </button>

        <nav className="primary-nav" aria-label="Điều hướng chính">
          <p className="nav-caption">Học từ vựng</p>
          {navItems.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
            >
              <span className="nav-index">0{index + 1}</span>
              <span>{item.label}</span>
              {item.id === "mistakes" && mistakes.length > 0 && <b>{mistakes.length}</b>}
            </button>
          ))}
        </nav>

        <div className="side-progress">
          <div className="side-progress-head"><span>Đã nắm vững</span><strong>{masteredPercent}%</strong></div>
          <div className="progress-track"><span style={{ width: `${masteredPercent}%` }} /></div>
          <p>{mastered.length}/{lexicon.length} mục từ</p>
        </div>

        <p className="side-note">Kho học thuật được tổ chức theo nghĩa, phát âm, cụm, collocation và quan hệ từ.</p>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">Lx</span><strong>IELTS Lexicon</strong></div>
          <div className="topbar-actions">
            <span className="data-pill"><i /> {lexiconStats.entries} mục từ sẵn có</span>
            <button type="button" className="avatar" aria-label="Hồ sơ người học">YL</button>
          </div>
        </header>

        {view === "explore" && (
          <div className="content-wrap explore-view">
            <section className="hero-panel">
              <div>
                <p className="eyebrow">IELTS VOCABULARY SYSTEM</p>
                <h1>Một từ, cả <em>mạng lưới</em> kiến thức.</h1>
                <p>Tra cứu từ học thuật cùng phát âm, collocation, đồng nghĩa, word family và cách dùng — trong một hồ sơ duy nhất.</p>
              </div>
              <div className="hero-stats" aria-label="Thống kê kho từ">
                <article><strong>{lexiconStats.entries}</strong><span>Từ & cụm</span></article>
                <article><strong>{lexiconStats.collocations}</strong><span>Collocations</span></article>
                <article><strong>{lexiconStats.topics}</strong><span>Chủ đề</span></article>
              </div>
            </section>

            <section className="search-panel" aria-label="Bộ lọc từ vựng">
              <label className="search-box">
                <span>⌕</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm từ, nghĩa, synonym hoặc collocation..." />
                {query && <button type="button" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm">×</button>}
              </label>
              <div className="filter-row">
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
                      onClick={() => setSelectedId(entry.id)}
                    >
                      <span className="word-main"><strong>{entry.term}</strong><small>{entry.ipa} · {entry.partOfSpeech}</small></span>
                      <span className="word-topic">{entry.topic}</span>
                      <span className={`level-tag level-${entry.level.toLowerCase()}`}>{entry.level}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && <div className="empty-state"><strong>Chưa thấy kết quả.</strong><span>Thử tìm bằng từ tiếng Anh, nghĩa tiếng Việt hoặc collocation.</span></div>}
                </div>
              </div>

              <article className="word-detail">
                <div className="detail-topline">
                  <div className="chip-row"><span>{selected.topic}</span><span>{selected.kind === "word" ? "Từ đơn" : selected.kind === "phrase" ? "Cụm từ" : "Collocation"}</span><span>{selected.level}</span></div>
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

                <div className="meaning-block">
                  <strong>{selected.meaningVi}</strong>
                  <p>{selected.definitionEn}</p>
                </div>

                <blockquote><span>“</span>{selected.example}</blockquote>

                <div className="detail-section">
                  <div className="section-title"><span>01</span><h3>Collocations & cụm đi kèm</h3></div>
                  <div className="term-cloud green">{selected.collocations.map((item) => <span key={item}>{item}</span>)}</div>
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
              <div><p className="eyebrow">ACTIVE RECALL</p><h1>{view === "quiz-choice" ? "Chọn đáp án đúng" : "Tự gõ từ bạn nhớ"}</h1><p>{view === "quiz-choice" ? "Nhận diện nhanh qua bốn lựa chọn." : "Không có gợi ý đáp án — buộc não tự truy xuất."}</p></div>
              <div className="session-score"><span>Điểm phiên này</span><strong>{score}<small>/ {questionNumber}</small></strong></div>
            </section>

            <div className="focus-tabs" role="tablist" aria-label="Chọn kiến thức kiểm tra">
              {(Object.keys(focusLabels) as QuizFocus[]).map((item) => <button type="button" key={item} className={focus === item ? "active" : ""} onClick={() => setFocus(item)}>{focusLabels[item]}</button>)}
            </div>

            {question && (
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
                          <span>{String.fromCharCode(65 + index)}</span>{option}
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
                    <div><strong>{correct ? "Chính xác." : "Chưa đúng."}</strong><p>Đáp án: <b>{question.answer}</b></p><small>{question.entry.example}</small></div>
                    <button type="button" onClick={nextQuestion}>{questionNumber === 10 ? "Phiên mới" : "Câu tiếp theo"} →</button>
                  </div>
                )}
              </section>
            )}

            <section className="quiz-footnote"><strong>Vì sao có hai chế độ?</strong><p>Trắc nghiệm rèn nhận diện. Tự gõ rèn khả năng nhớ chủ động — khó hơn nhưng bền hơn.</p></section>
          </div>
        )}

        {view === "mistakes" && (
          <div className="content-wrap mistakes-view">
            <section className="mistakes-heading">
              <div><p className="eyebrow">PERSONAL ERROR BANK</p><h1>Sổ lỗi của bạn</h1><p>Mỗi câu trả lời sai được giữ lại để bạn biết chính xác mình yếu ở nghĩa, cụm, đồng nghĩa hay phát âm.</p></div>
              {mistakes.length > 0 && <button type="button" onClick={() => setMistakes([])}>Xóa toàn bộ</button>}
            </section>

            <div className="mistake-summary">
              {(["meaning", "collocation", "synonym", "pronunciation"] as Question["kind"][]).map((item) => (
                <article key={item}><span>{focusLabels[item]}</span><strong>{mistakes.filter((mistake) => mistake.kind === item).length}</strong><small>lỗi đã ghi</small></article>
              ))}
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
                    <button type="button" onClick={() => goToEntry(entry.id)}>Mở hồ sơ →</button>
                  </article>
                );
              })}
              {mistakes.length === 0 && (
                <div className="mistake-empty"><span>✓</span><h2>Sổ lỗi đang trống</h2><p>Làm bài trắc nghiệm hoặc tự gõ. Những câu sai sẽ tự xuất hiện ở đây.</p><button type="button" onClick={() => setView("quiz-choice")}>Bắt đầu trắc nghiệm</button></div>
              )}
            </section>
          </div>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Điều hướng di động">
        {navItems.map((item) => <button type="button" key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.short}</span>{item.id === "mistakes" && mistakes.length > 0 && <b>{mistakes.length}</b>}</button>)}
      </nav>
    </div>
  );
}
