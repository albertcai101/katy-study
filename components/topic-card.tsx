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

interface TopicCardProps {
  id: string;
  name: string;
  totalQuestions: number;
  masteredCount: number;
}

export function TopicCard({
  id,
  name,
  totalQuestions,
  masteredCount,
}: TopicCardProps) {
  const percentage =
    totalQuestions > 0 ? Math.round((masteredCount / totalQuestions) * 100) : 0;
  const isComplete = masteredCount === totalQuestions && totalQuestions > 0;

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
                {masteredCount}/{totalQuestions}
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
            <p className="text-xs text-muted-foreground">{percentage}% mastered</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
