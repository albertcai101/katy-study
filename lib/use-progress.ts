"use client";

import { useState, useEffect, useCallback } from "react";
import type { StudyProgress } from "./study-engine";
import { emptyProgress } from "./study-engine";

const STORAGE_KEY = "katy-study-progress";

function loadProgress(): StudyProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyProgress();
    const parsed = JSON.parse(stored) as StudyProgress;
    if (parsed.version !== 1) return emptyProgress();
    return parsed;
  } catch {
    return emptyProgress();
  }
}

function saveProgress(progress: StudyProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState<StudyProgress>(emptyProgress);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setLoaded(true);
  }, []);

  const updateProgress = useCallback(
    (updater: (prev: StudyProgress) => StudyProgress) => {
      setProgress((prev) => {
        const next = updater(prev);
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const resetProgress = useCallback(() => {
    const empty = emptyProgress();
    saveProgress(empty);
    setProgress(empty);
  }, []);

  const resetTopic = useCallback(
    (questionIds: string[]) => {
      setProgress((prev) => {
        const next = { ...prev, questions: { ...prev.questions } };
        for (const id of questionIds) {
          delete next.questions[id];
        }
        saveProgress(next);
        return next;
      });
    },
    []
  );

  return { progress, loaded, updateProgress, resetProgress, resetTopic };
}
