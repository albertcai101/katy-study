#!/usr/bin/env python3
"""Parse BIOE51Notes.html into a structured topic map JSON."""

import json
import os
import re
from bs4 import BeautifulSoup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
HTML_PATH = os.path.join(PROJECT_ROOT, "source-notes", "BIOE51Notes.html")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "output", "topic_map.json")

TOPIC_SPLITS = [
    {
        "id": "intro-body-orientation",
        "name": "Intro & Body Orientation",
        "start_marker": "INTRO & BODY ORIENTATION",
        "end_marker": "Anatomical movement",
    },
    {
        "id": "anatomical-movements",
        "name": "Anatomical Movements",
        "start_marker": "Anatomical movement",
        "end_marker": "Thorax 1",
    },
    {
        "id": "thorax-1",
        "name": "Thorax 1",
        "start_marker": "Thorax 1",
        "end_marker": "Thorax 2",
    },
    {
        "id": "thorax-2",
        "name": "Thorax 2",
        "start_marker": "Thorax 2",
        "end_marker": "Upper Limb 1",
    },
    {
        "id": "upper-limb-1",
        "name": "Upper Limb 1",
        "start_marker": "Upper Limb 1",
        "end_marker": "Upper Limb 2",
    },
    {
        "id": "upper-limb-2",
        "name": "Upper Limb 2",
        "start_marker": "Upper Limb 2",
        "end_marker": None,
    },
]


def extract_elements(soup):
    """Flatten all content-bearing elements in document order."""
    body = soup.find("body")
    elements = []
    seen_texts = set()

    for el in body.find_all(["h3", "p", "ul", "li", "img"]):
        if el.name == "img":
            src = el.get("src", "")
            if src.startswith("images/"):
                elements.append({"type": "image", "src": os.path.basename(src)})
        elif el.name == "h3":
            text = el.get_text(strip=True)
            if text:
                elements.append({"type": "heading", "content": text})
        elif el.name in ("p", "li"):
            text = el.get_text(strip=True)
            if text and text not in seen_texts:
                seen_texts.add(text)
                elements.append({"type": "text", "content": text})

    return elements


def deduplicate(elements):
    """Remove consecutive duplicate text entries."""
    deduped = []
    for el in elements:
        if el["type"] == "text" and deduped and deduped[-1].get("content") == el.get("content"):
            continue
        deduped.append(el)
    return deduped


def split_into_topics(elements):
    """Split the flat element list into topic sections."""
    topics = []

    for topic_def in TOPIC_SPLITS:
        start_idx = None
        end_idx = len(elements)

        for i, el in enumerate(elements):
            content = el.get("content", "")
            if start_idx is None and topic_def["start_marker"] in content:
                start_idx = i
            elif start_idx is not None and topic_def["end_marker"] and topic_def["end_marker"] in content:
                # For h3 markers, check if this is the heading itself
                if el["type"] == "heading" and topic_def["end_marker"] in content:
                    end_idx = i
                    break
                elif topic_def["end_marker"] == content[:len(topic_def["end_marker"])]:
                    end_idx = i
                    break

        if start_idx is None:
            print(f"Warning: Could not find start marker '{topic_def['start_marker']}'")
            continue

        section_elements = elements[start_idx:end_idx]

        notes = []
        images = []
        for el in section_elements:
            if el["type"] == "image":
                images.append(el["src"])
            elif el["type"] == "text":
                notes.append(el["content"])

        topics.append({
            "id": topic_def["id"],
            "name": topic_def["name"],
            "notes": notes,
            "images": images,
            "noteCount": len(notes),
            "imageCount": len(images),
        })

    return topics


def main():
    with open(HTML_PATH, "r") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    elements = extract_elements(soup)
    elements = deduplicate(elements)
    topics = split_into_topics(elements)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump({"topics": topics}, f, indent=2)

    print(f"Wrote {OUTPUT_PATH}")
    for t in topics:
        print(f"  {t['name']}: {t['noteCount']} notes, {t['imageCount']} images")


if __name__ == "__main__":
    main()
