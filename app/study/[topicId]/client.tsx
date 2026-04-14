"use client";

import type { Topic, ImageBBoxes } from "@/lib/questions";
import { useProgress } from "@/lib/use-progress";
import { useImageOnly } from "@/lib/use-image-only";
import { StudySession } from "@/components/study-session";

interface StudyPageClientProps {
  topic: Topic;
  bboxData: ImageBBoxes;
}

export function StudyPageClient({ topic, bboxData }: StudyPageClientProps) {
  const { progress, loaded, updateProgress } = useProgress();
  const { imageOnly, toggle } = useImageOnly();

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
        bboxData={bboxData}
        progress={progress}
        onUpdateProgress={updateProgress}
        title={topic.name}
        imageOnly={imageOnly}
        onToggleImageOnly={toggle}
      />
    </div>
  );
}
