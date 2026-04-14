#!/usr/bin/env python3
"""Run Tesseract OCR on all source images to extract text bounding boxes."""

import json
import os
from PIL import Image
import pytesseract

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
IMAGES_DIR = os.path.join(PROJECT_ROOT, "source-notes", "images")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "output", "image_bboxes.json")

VERTICAL_CLUSTER_THRESHOLD = 20  # pixels


def cluster_words(words, img_w, img_h):
    """Group nearby words into label regions and convert to percentage coords."""
    if not words:
        return []

    words.sort(key=lambda w: (w["top"], w["left"]))

    clusters = []
    current_cluster = [words[0]]

    for word in words[1:]:
        last = current_cluster[-1]
        if abs(word["top"] - last["top"]) <= VERTICAL_CLUSTER_THRESHOLD:
            current_cluster.append(word)
        else:
            clusters.append(current_cluster)
            current_cluster = [word]
    clusters.append(current_cluster)

    regions = []
    for cluster in clusters:
        text = " ".join(w["text"] for w in cluster)
        x = min(w["left"] for w in cluster)
        y = min(w["top"] for w in cluster)
        x2 = max(w["left"] + w["width"] for w in cluster)
        y2 = max(w["top"] + w["height"] for w in cluster)

        padding_x = max(4, (x2 - x) * 0.05)
        padding_y = max(2, (y2 - y) * 0.1)
        x = max(0, x - padding_x)
        y = max(0, y - padding_y)
        x2 = min(img_w, x2 + padding_x)
        y2 = min(img_h, y2 + padding_y)

        regions.append({
            "text": text,
            "x": round(x / img_w * 100, 2),
            "y": round(y / img_h * 100, 2),
            "w": round((x2 - x) / img_w * 100, 2),
            "h": round((y2 - y) / img_h * 100, 2),
        })

    return regions


def process_image(filepath):
    """Run OCR on a single image, return list of label regions."""
    try:
        img = Image.open(filepath)
    except Exception as e:
        print(f"  Could not open {filepath}: {e}")
        return []

    img_w, img_h = img.size
    if img_w < 50 or img_h < 50:
        return []

    try:
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
    except Exception as e:
        print(f"  Tesseract failed on {filepath}: {e}")
        return []

    words = []
    for i in range(len(data["text"])):
        text = data["text"][i].strip()
        conf = int(data["conf"][i])
        if text and conf > 30 and len(text) > 1:
            words.append({
                "text": text,
                "left": data["left"][i],
                "top": data["top"][i],
                "width": data["width"][i],
                "height": data["height"][i],
            })

    return cluster_words(words, img_w, img_h)


def main():
    image_files = sorted(
        [f for f in os.listdir(IMAGES_DIR) if f.endswith(".png")],
        key=lambda f: int("".join(c for c in f if c.isdigit()) or "0"),
    )

    print(f"Processing {len(image_files)} images...")
    results = {}
    for i, filename in enumerate(image_files):
        filepath = os.path.join(IMAGES_DIR, filename)
        regions = process_image(filepath)
        results[filename] = regions
        if (i + 1) % 25 == 0:
            print(f"  Processed {i + 1}/{len(image_files)}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(results, f, indent=2)

    total_regions = sum(len(v) for v in results.values())
    images_with_text = sum(1 for v in results.values() if v)
    print(f"\nDone! Wrote {OUTPUT_PATH}")
    print(f"  {images_with_text}/{len(image_files)} images had detectable text")
    print(f"  {total_regions} total text regions found")


if __name__ == "__main__":
    main()
