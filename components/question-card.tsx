"use client";

import type { Question, BBoxRegion } from "@/lib/questions";
import type { StudyProgress } from "@/lib/study-engine";
import { getQuestionMode } from "@/lib/study-engine";
import { MCQuestion } from "./mc-question";
import { WrittenQuestion } from "./written-question";

interface QuestionCardProps {
  question: Question;
  bboxes: BBoxRegion[];
  progress: StudyProgress;
  onAnswer: (correct: boolean) => void;
}

export function QuestionCard({
  question,
  bboxes,
  progress,
  onAnswer,
}: QuestionCardProps) {
  const mode = getQuestionMode(progress, question.id);

  if (mode === "written") {
    return (
      <WrittenQuestion
        key={question.id}
        question={question}
        bboxes={bboxes}
        onAnswer={onAnswer}
      />
    );
  }

  return (
    <MCQuestion
      key={question.id}
      question={question}
      bboxes={bboxes}
      onAnswer={onAnswer}
    />
  );
}
