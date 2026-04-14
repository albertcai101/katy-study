"use client";

import type { Topic } from "@/lib/questions";
import { useProgress } from "@/lib/use-progress";
import { StudySession } from "@/components/study-session";

interface StudyPageClientProps {
  topic: Topic;
}

export function StudyPageClient({ topic }: StudyPageClientProps) {
  const { progress, loaded, updateProgress } = useProgress();

  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <StudySession
        questions={topic.questions}
        progress={progress}
        onUpdateProgress={updateProgress}
        title={topic.name}
      />
    </div>
  );
}
