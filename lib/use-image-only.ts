"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "katy-study-image-only";

export function useImageOnly() {
  const [imageOnly, setImageOnly] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setImageOnly(true);
  }, []);

  const toggle = useCallback(() => {
    setImageOnly((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { imageOnly, toggle };
}
