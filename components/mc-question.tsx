"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question, BBoxRegion } from "@/lib/questions";
import { buildChoices } from "@/lib/study-engine";
import { ImageWithMasks } from "./image-with-masks";

interface MCQuestionProps {
  question: Question;
  bboxes: BBoxRegion[];
  onAnswer: (correct: boolean) => void;
}

export function MCQuestion({ question, bboxes, onAnswer }: MCQuestionProps) {
  const [choices] = useState(() =>
    buildChoices(question.answer, question.distractors)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = useCallback(
    (choice: string) => {
      if (revealed) return;
      setSelected(choice);
      setRevealed(true);
    },
    [revealed]
  );

  const handleContinue = useCallback(() => {
    if (!revealed || selected === null) return;
    onAnswer(selected === question.answer);
  }, [revealed, selected, question.answer, onAnswer]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;

      if (!revealed) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= choices.length) {
          handleSelect(choices[num - 1]);
        }
      } else if (e.key === "Enter") {
        handleContinue();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [revealed, choices, handleSelect, handleContinue]);

  const isCorrect = selected === question.answer;

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

      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map((choice, i) => {
          let variant: "outline" | "default" | "destructive" = "outline";
          if (revealed) {
            if (choice === question.answer) variant = "default";
            else if (choice === selected) variant = "destructive";
          }

          return (
            <Button
              key={choice}
              variant={variant}
              className={cn(
                "h-auto min-h-12 justify-start whitespace-normal px-4 py-3 text-left",
                revealed &&
                  choice === question.answer &&
                  "animate-correct-pulse ring-2 ring-primary",
                revealed &&
                  choice === selected &&
                  choice !== question.answer &&
                  "animate-shake"
              )}
              onClick={() => handleSelect(choice)}
              disabled={revealed}
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground">
                {i + 1}
              </span>
              {choice}
            </Button>
          );
        })}
      </div>

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
            {isCorrect ? "Correct!" : `Incorrect. The answer is: ${question.answer}`}
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
