import type { Question } from "./questions";

export type Box = 1 | 2 | 3;

export interface QuestionState {
  box: Box;
  timesSeen: number;
  timesCorrect: number;
  lastSeen: string;
}

export interface StudyProgress {
  version: 1;
  questions: Record<string, QuestionState>;
}

export function getQuestionState(
  progress: StudyProgress,
  questionId: string
): QuestionState {
  return (
    progress.questions[questionId] ?? {
      box: 1,
      timesSeen: 0,
      timesCorrect: 0,
      lastSeen: "",
    }
  );
}

export function updateQuestionState(
  progress: StudyProgress,
  questionId: string,
  correct: boolean
): StudyProgress {
  const current = getQuestionState(progress, questionId);
  const now = new Date().toISOString();

  let newBox: Box;
  if (correct) {
    newBox = current.box === 1 ? 2 : current.box === 2 ? 3 : 3;
  } else {
    newBox = 1;
  }

  return {
    ...progress,
    questions: {
      ...progress.questions,
      [questionId]: {
        box: newBox,
        timesSeen: current.timesSeen + 1,
        timesCorrect: current.timesCorrect + (correct ? 1 : 0),
        lastSeen: now,
      },
    },
  };
}

export function getUnmasteredQuestions(
  questions: Question[],
  progress: StudyProgress
): Question[] {
  return questions.filter((q) => {
    const state = getQuestionState(progress, q.id);
    return state.box < 3;
  });
}

export function getMasteredCount(
  questions: Question[],
  progress: StudyProgress
): number {
  return questions.filter((q) => {
    const state = getQuestionState(progress, q.id);
    return state.box >= 3;
  }).length;
}

export function getTopicProgress(
  questions: Question[],
  progress: StudyProgress
): { mastered: number; total: number; percentage: number } {
  const mastered = getMasteredCount(questions, progress);
  const total = questions.length;
  return {
    mastered,
    total,
    percentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
  };
}

const BOX_WEIGHT: Record<Box, number> = { 1: 0, 2: 0.5, 3: 1 };

export function getWeightedPercentage(
  questionIds: string[],
  progress: StudyProgress
): number {
  if (questionIds.length === 0) return 0;
  const sum = questionIds.reduce((acc, id) => {
    const box = (progress.questions[id]?.box ?? 1) as Box;
    return acc + BOX_WEIGHT[box];
  }, 0);
  return Math.round((sum / questionIds.length) * 100);
}

export function getBoxCounts(
  questionIds: string[],
  progress: StudyProgress
): { learning: number; reviewing: number; mastered: number } {
  let learning = 0;
  let reviewing = 0;
  let mastered = 0;
  for (const id of questionIds) {
    const box = progress.questions[id]?.box ?? 1;
    if (box >= 3) mastered++;
    else if (box === 2) reviewing++;
    else learning++;
  }
  return { learning, reviewing, mastered };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickDistractors(
  allDistractors: string[],
  count: number
): string[] {
  return shuffleArray(allDistractors).slice(0, count);
}

export function buildChoices(
  answer: string,
  distractors: string[]
): string[] {
  const picked = pickDistractors(distractors, 3);
  return shuffleArray([answer, ...picked]);
}

export function prepareRound(
  questions: Question[],
  progress: StudyProgress
): Question[] {
  const unmastered = getUnmasteredQuestions(questions, progress);
  return shuffleArray(unmastered);
}

export function getQuestionMode(
  progress: StudyProgress,
  questionId: string
): "mc" | "written" {
  const state = getQuestionState(progress, questionId);
  return state.box === 1 ? "mc" : "written";
}

export function getWeightedReviewQuestions(
  allQuestions: Question[],
  progress: StudyProgress,
  maxCount = 20
): Question[] {
  const unmastered = getUnmasteredQuestions(allQuestions, progress);

  const weighted = unmastered.map((q) => {
    const state = getQuestionState(progress, q.id);
    const weight = state.box === 1 ? 3 : 1;
    return { question: q, weight };
  });

  const shuffled = shuffleArray(weighted);
  shuffled.sort((a, b) => b.weight - a.weight);

  return shuffled.slice(0, maxCount).map((w) => w.question);
}

export function emptyProgress(): StudyProgress {
  return { version: 1, questions: {} };
}
