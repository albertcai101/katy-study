"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/questions";
import type { StudyProgress } from "@/lib/study-engine";
import {
  prepareRound,
  updateQuestionState,
  getUnmasteredQuestions,
  getMasteredCount,
  getWeightedPercentage,
} from "@/lib/study-engine";
import { QuestionCard } from "./question-card";
import { RoundSummary } from "./round-summary";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StudySessionProps {
  questions: Question[];
  progress: StudyProgress;
  onUpdateProgress: (updater: (prev: StudyProgress) => StudyProgress) => void;
  title: string;
}

export function StudySession({
  questions,
  progress,
  onUpdateProgress,
  title,
}: StudySessionProps) {
  const router = useRouter();
  const [round, setRound] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<Question[]>(() =>
    prepareRound(questions, progress)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundTotal, setRoundTotal] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [masteredBeforeRound, setMasteredBeforeRound] = useState(() =>
    getMasteredCount(questions, progress)
  );

  const currentQuestion = roundQuestions[currentIndex];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !showSummary) {
        router.push("/");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router, showSummary]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      onUpdateProgress((prev) =>
        updateQuestionState(prev, currentQuestion.id, correct)
      );

      setRoundCorrect((c) => c + (correct ? 1 : 0));
      setRoundTotal((t) => t + 1);

      if (currentIndex + 1 < roundQuestions.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setShowSummary(true);
      }
    },
    [currentQuestion, currentIndex, roundQuestions.length, onUpdateProgress]
  );

  const handleNextRound = useCallback(() => {
    const newRound = prepareRound(questions, progress);
    if (newRound.length === 0) {
      setShowSummary(true);
      return;
    }
    setRoundQuestions(newRound);
    setCurrentIndex(0);
    setRoundCorrect(0);
    setRoundTotal(0);
    setShowSummary(false);
    setMasteredBeforeRound(getMasteredCount(questions, progress));
    setRound((r) => r + 1);
  }, [questions, progress]);

  const unmasteredCount = getUnmasteredQuestions(questions, progress).length;
  const allMastered = unmasteredCount === 0;
  const currentMastered = getMasteredCount(questions, progress);
  const newlyMastered = currentMastered - masteredBeforeRound;
  const questionIds = questions.map((q) => q.id);
  const sessionProgress = getWeightedPercentage(questionIds, progress);

  if (showSummary) {
    return (
      <RoundSummary
        round={round}
        correct={roundCorrect}
        total={roundTotal}
        newlyMastered={Math.max(0, newlyMastered)}
        allMastered={allMastered}
        onContinue={handleNextRound}
        onQuit={() => router.push("/")}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center text-muted-foreground">
        No more questions available. You&apos;ve mastered everything!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-lg font-medium">{title}</h2>
          <Badge variant="secondary">Round {round}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          Quit
          <span className="ml-1 text-xs text-muted-foreground">Esc</span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Progress value={sessionProgress} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground">
          {currentMastered}/{questions.length}
        </span>
      </div>

      <div className="text-xs text-muted-foreground">
        Question {currentIndex + 1} of {roundQuestions.length}
      </div>

      <QuestionCard
        key={currentQuestion.id + "-" + round}
        question={currentQuestion}
        progress={progress}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
