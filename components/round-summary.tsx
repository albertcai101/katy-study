"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

interface RoundSummaryProps {
  round: number;
  correct: number;
  total: number;
  newlyMastered: number;
  allMastered: boolean;
  onContinue: () => void;
  onQuit: () => void;
}

export function RoundSummary({
  round,
  correct,
  total,
  newlyMastered,
  allMastered,
  onContinue,
  onQuit,
}: RoundSummaryProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter") onContinue();
      if (e.key === "Escape") onQuit();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onContinue, onQuit]);

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          {allMastered ? "Topic Complete!" : `Round ${round} Summary`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 text-center">
          {allMastered && (
            <div className="text-4xl">🎉</div>
          )}
          <div className="text-3xl font-bold text-primary">
            {correct}/{total}
          </div>
          <p className="text-muted-foreground">
            {percentage}% correct this round
          </p>
          {newlyMastered > 0 && (
            <p className="font-medium text-primary">
              {newlyMastered} question{newlyMastered !== 1 ? "s" : ""} newly
              mastered!
            </p>
          )}
          {allMastered && (
            <p className="text-muted-foreground">
              You&apos;ve mastered every question in this set. Amazing work!
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-3">
        <Button variant="outline" onClick={onQuit}>
          Back Home
          <span className="ml-1 text-xs text-muted-foreground">Esc</span>
        </Button>
        {!allMastered && (
          <Button onClick={onContinue}>
            Next Round
            <span className="ml-1 text-xs text-muted-foreground">Enter ↵</span>
          </Button>
        )}
        {allMastered && (
          <Button onClick={onQuit}>
            Done
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
