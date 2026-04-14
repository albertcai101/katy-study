"use client";

import { useState } from "react";
import type { BBoxRegion } from "@/lib/questions";

interface ImageWithMasksProps {
  src: string;
  bboxes: BBoxRegion[];
  highlight?: { x: number; y: number };
  showLabels?: boolean;
}

export function ImageWithMasks({
  src,
  bboxes,
  highlight,
  showLabels = false,
}: ImageWithMasksProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-muted">
      <img
        src={`/images/${src}`}
        alt="Anatomy diagram"
        className="block w-full"
        onLoad={() => setLoaded(true)}
        draggable={false}
      />

      {loaded && !showLabels &&
        bboxes.map((bbox, i) => (
          <div
            key={i}
            className="absolute rounded bg-muted"
            style={{
              left: `${bbox.x}%`,
              top: `${bbox.y}%`,
              width: `${bbox.w}%`,
              height: `${bbox.h}%`,
            }}
          />
        ))}

      {loaded && highlight && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${highlight.x}%`,
            top: `${highlight.y}%`,
          }}
        >
          <div className="size-6 animate-ping rounded-full bg-primary/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-3 rounded-full bg-primary ring-2 ring-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
