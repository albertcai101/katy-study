"use client";

import { useProgress } from "@/lib/use-progress";
import { TopicCard } from "@/components/topic-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useState } from "react";

interface TopicInfo {
  id: string;
  name: string;
  questionCount: number;
  questionIds: string[];
}

interface HomeClientProps {
  topics: TopicInfo[];
}

export function HomeClient({ topics }: HomeClientProps) {
  const { progress, loaded, resetProgress, resetTopic } = useProgress();
  const [showReset, setShowReset] = useState(false);

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const totalQuestions = topics.reduce((s, t) => s + t.questionCount, 0);
  const totalMastered = topics.reduce((s, t) => {
    return (
      s +
      t.questionIds.filter((id) => progress.questions[id]?.box >= 3).length
    );
  }, 0);
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              BIOE 51 Study Guide
            </h1>
            <p className="mt-1 text-muted-foreground">
              Anatomy for Bioengineers
            </p>
          </div>
          <Badge variant="outline" className="h-8 text-sm">
            {totalMastered}/{totalQuestions}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={overallPercentage} className="h-3 flex-1" />
          <span className="text-sm font-medium text-muted-foreground">
            {overallPercentage}%
          </span>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <Link href="/review" className="flex-1">
          <Button className="w-full" size="lg">
            Review All Topics
          </Button>
        </Link>
      </div>

      <Separator className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => {
          const mastered = topic.questionIds.filter(
            (id) => progress.questions[id]?.box >= 3
          ).length;
          return (
            <TopicCard
              key={topic.id}
              id={topic.id}
              name={topic.name}
              totalQuestions={topic.questionCount}
              masteredCount={mastered}
            />
          );
        })}
      </div>

      <Separator className="my-6" />

      <div className="flex justify-center">
        {!showReset ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReset(true)}
          >
            Reset Progress
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              What would you like to reset?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {topics.map((topic) => (
                <Button
                  key={topic.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetTopic(topic.questionIds);
                    setShowReset(false);
                  }}
                >
                  {topic.name}
                </Button>
              ))}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  resetProgress();
                  setShowReset(false);
                }}
              >
                Reset Everything
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReset(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
