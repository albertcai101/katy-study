"use client";

import type { Question, ImageBBoxes } from "@/lib/questions";
import { useProgress } from "@/lib/use-progress";
import { useImageOnly } from "@/lib/use-image-only";
import { getWeightedReviewQuestions } from "@/lib/study-engine";
import { StudySession } from "@/components/study-session";
import { useMemo } from "react";

interface ReviewPageClientProps {
  questions: Question[];
  bboxData: ImageBBoxes;
}

export function ReviewPageClient({
  questions,
  bboxData,
}: ReviewPageClientProps) {
  const { progress, loaded, updateProgress } = useProgress();
  const { imageOnly, toggle } = useImageOnly();

  const reviewQuestions = useMemo(() => {
    if (!loaded) return [];
    return getWeightedReviewQuestions(questions, progress, 30);
  }, [questions, progress, loaded]);

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (reviewQuestions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 text-center">
        <h2 className="font-heading text-xl font-medium">All Mastered!</h2>
        <p className="mt-2 text-muted-foreground">
          You&apos;ve mastered all questions. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <StudySession
        questions={reviewQuestions}
        bboxData={bboxData}
        progress={progress}
        onUpdateProgress={updateProgress}
        title="Review All"
        imageOnly={imageOnly}
        onToggleImageOnly={toggle}
      />
    </div>
  );
}
