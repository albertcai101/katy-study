"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { StudyProgress } from "@/lib/study-engine";
import { getWeightedPercentage, getBoxCounts } from "@/lib/study-engine";

interface TopicCardProps {
  id: string;
  name: string;
  questionIds: string[];
  progress: StudyProgress;
}

export function TopicCard({
  id,
  name,
  questionIds,
  progress,
}: TopicCardProps) {
  const totalQuestions = questionIds.length;
  const percentage = getWeightedPercentage(questionIds, progress);
  const { learning, reviewing, mastered } = getBoxCounts(questionIds, progress);
  const isComplete = mastered === totalQuestions && totalQuestions > 0;

  const segments: string[] = [];
  if (mastered > 0) segments.push(`${mastered} mastered`);
  if (reviewing > 0) segments.push(`${reviewing} reviewing`);
  if (learning > 0 && (mastered > 0 || reviewing > 0))
    segments.push(`${learning} left`);

  return (
    <Link href={`/study/${id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{name}</CardTitle>
            {isComplete ? (
              <Badge>Mastered</Badge>
            ) : (
              <Badge variant="secondary">
                {percentage}%
              </Badge>
            )}
          </div>
          <CardDescription>
            {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {segments.length > 0 ? segments.join(" · ") : "Not started"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
