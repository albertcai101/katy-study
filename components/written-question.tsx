"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Question, BBoxRegion } from "@/lib/questions";
import { fuzzyMatch } from "@/lib/fuzzy-match";
import { ImageWithMasks } from "./image-with-masks";

interface WrittenQuestionProps {
  question: Question;
  bboxes: BBoxRegion[];
  onAnswer: (correct: boolean) => void;
}

export function WrittenQuestion({
  question,
  bboxes,
  onAnswer,
}: WrittenQuestionProps) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    if (revealed || !input.trim()) return;
    const result = fuzzyMatch(input, question.written_accept);
    setIsCorrect(result.matched);
    setRevealed(true);
  }, [input, revealed, question.written_accept]);

  const handleContinue = useCallback(() => {
    if (!revealed) return;
    onAnswer(isCorrect);
  }, [revealed, isCorrect, onAnswer]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && revealed) {
        e.preventDefault();
        handleContinue();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [revealed, handleContinue]);

  return (
    <div className="flex flex-col gap-6">
      {question.type === "image-identify" && question.image && (
        <ImageWithMasks
          src={question.image}
          bboxes={bboxes}
          highlight={question.highlight}
          showLabels={revealed}
        />
      )}

      <p className="text-lg font-medium">{question.question}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!revealed) handleSubmit();
        }}
        className="flex gap-3"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          disabled={revealed}
          className="flex-1"
        />
        {!revealed && (
          <Button type="submit" disabled={!input.trim()}>
            Submit
          </Button>
        )}
      </form>

      {revealed && (
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              "rounded-lg px-4 py-3 text-sm font-medium",
              isCorrect
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isCorrect
              ? `Correct! (${question.answer})`
              : `Incorrect. The answer is: ${question.answer}`}
          </div>
          <Button onClick={handleContinue} className="self-end">
            Continue
            <span className="ml-2 text-xs text-muted-foreground">Enter ↵</span>
          </Button>
        </div>
      )}
    </div>
  );
}
