---
name: BIOE 51 Study App
overview: Build an Anki-style anatomy study app for Katy's BIOE 51 class using Next.js 16 + shadcn amber theme, with a Python build pipeline that parses her Google Docs HTML export, runs Tesseract OCR on 149 images to detect text bounding boxes for label masking, and generates a hand-authored YAML question bank of atomic questions with curated distractors. The app uses Leitner 3-box mastery (MC -> Written -> Mastered), round-based sessions with infinite stream continuation, topic-based navigation, and localStorage persistence.
todos:
  - id: python-deps
    content: Install Python dependencies (pytesseract, Pillow, beautifulsoup4, pyyaml)
    status: pending
  - id: parse-html
    content: Write and run scripts/parse_html.py to extract structured topic map from HTML export
    status: pending
  - id: ocr-images
    content: Write and run scripts/ocr_images.py to Tesseract all 149 images and output bounding boxes JSON
    status: pending
  - id: copy-images
    content: Copy source-notes/images/* to public/images/
    status: pending
  - id: author-yaml
    content: Hand-author data/questions.yaml with all atomic questions, curated distractors, image refs, and highlight coordinates
    status: pending
  - id: shadcn-components
    content: Install needed shadcn components (card, progress, badge, input, separator, alert)
    status: pending
  - id: lib-modules
    content: "Build lib/ modules: questions loader, study engine (Leitner boxes + rounds), fuzzy match, localStorage progress hook"
    status: pending
  - id: image-masks
    content: Build ImageWithMasks component with CSS overlay masking using OCR bounding box data
    status: pending
  - id: home-page
    content: Build home page with topic cards, progress bars, Review All button, reset options
    status: pending
  - id: study-session
    content: Build study session page with MC and Written question modes, round summaries, infinite stream continuation
    status: pending
  - id: review-all
    content: Build Review All page pulling from all topics weighted by lowest mastery
    status: pending
  - id: polish
    content: Add keyboard shortcuts (1-4, Enter, Escape), feedback animations, responsive layout, end-to-end testing
    status: pending
isProject: false
---

# BIOE 51 Study App for Katy

## Architecture Overview

```mermaid
flowchart TB
  subgraph buildPipeline [Build Pipeline -- Python scripts, run once]
    HTML["source-notes/BIOE51Notes.html\n626 text chunks + 149 images"]
    ParseHTML["scripts/parse_html.py\nExtract text + image mapping per topic"]
    OCR["scripts/ocr_images.py\nTesseract on each image\nOutput: bounding boxes per image"]
    ParseHTML --> TopicMap["Structured topic/note/image mapping"]
    OCR --> BBoxJSON["Image text bounding boxes JSON"]
    HTML --> ParseHTML
    HTML --> OCR
    TopicMap --> AuthorYAML["Hand-author questions.yaml\nAtomic questions + curated distractors"]
    BBoxJSON --> AuthorYAML
  end

  subgraph appRuntime [Next.js App -- runtime]
    YAML["data/questions.yaml\nLoaded at build time via import"]
    Images["public/images/\n149 anatomy images"]
    LocalStorage["localStorage\nPer-question box state + timestamps"]
    YAML --> App["React App"]
    Images --> App
    LocalStorage <--> App
  end

  AuthorYAML --> YAML
  HTML --> Images
```

## Data Pipeline (Phase 1)

### Step 1: Install Python dependencies

```bash
pip3 install pytesseract Pillow beautifulsoup4 pyyaml
```

Tesseract 5.4.1 is already installed at `/opt/homebrew/bin/tesseract`.

### Step 2: Parse HTML into structured topic map

Script: `scripts/parse_html.py`

- Parse [source-notes/BIOE51Notes.html](source-notes/BIOE51Notes.html) with BeautifulSoup
- Split content into 6 topics by detecting section headers:
  1. Intro and Body Orientation
  2. Anatomical Movements
  3. Thorax 1
  4. Thorax 2
  5. Upper Limb 1
  6. Upper Limb 2
- For each topic, extract ordered list of: text notes (bullet points, definitions, facts) and image references (`image53.png`, etc.) with their surrounding text context
- Output: `scripts/output/topic_map.json`

### Step 3: OCR all images for text bounding boxes

Script: `scripts/ocr_images.py`

- Run Tesseract on each of the 149 images in `source-notes/images/`
- Extract word-level bounding boxes (using `pytesseract.image_to_data()`)
- Group nearby words into label regions (cluster words within ~20px vertical proximity)
- Output: `scripts/output/image_bboxes.json` -- keyed by image filename, value is array of `{ text, x, y, w, h }` as percentage-of-image coordinates (so they scale with any render size)

### Step 4: Copy images to public directory

```bash
cp source-notes/images/* public/images/
```

### Step 5: Hand-author the question bank

File: `data/questions.yaml`

This is the core intellectual work. Every atomic fact from Katy's notes becomes a question. The YAML schema:

```yaml
topics:
  - id: "intro-body-orientation"
    name: "Intro & Body Orientation"
    questions:
      - id: "ibo-001"
        type: "image-identify"        # image with masked labels
        image: "image53.png"
        masks: "all"                   # mask all OCR-detected text
        highlight:                     # arrow/indicator pointing to target
          x: 45                        # percentage
          y: 32
        question: "What type of muscle is shown here?"
        answer: "Skeletal muscle"
        written_accept:                # fuzzy match targets for written mode
          - "skeletal muscle"
          - "skeletal"
        distractors:
          - "Cardiac muscle"
          - "Smooth muscle"
          - "Connective tissue"

      - id: "ibo-002"
        type: "text-mc"               # pure text question
        question: "What connects muscle to bone?"
        answer: "Tendon"
        written_accept:
          - "tendon"
          - "tendons"
        distractors:
          - "Ligament"
          - "Cartilage"
          - "Periosteum"
          - "Fascia"

      - id: "ibo-003"
        type: "image-identify"
        image: "image8.png"
        masks: "all"
        highlight:
          x: 50
          y: 85
        question: "What joint is indicated?"
        answer: "Glenohumeral joint"
        written_accept:
          - "glenohumeral joint"
          - "glenohumeral"
          - "shoulder joint"
        distractors:
          - "Acromioclavicular joint"
          - "Sternoclavicular joint"
          - "Scapulothoracic joint"
```

Key rules for authoring:
- **Only Katy's notes** generate questions -- if she didn't write it down, it's not a question
- **Atomic**: one fact per question, never compound
- **Curated distractors**: always same category/region (muscles with muscles, joints with joints, nerves with nerves)
- **3-5 distractors per question**: runtime picks 3 randomly + correct answer = 4 choices shuffled
- **written_accept**: list of acceptable fuzzy match targets (lowercase)
- **image-identify questions**: reference an image file + use `masks: "all"` to block all OCR text + a highlight coordinate pointing to the structure being asked about

## Question Type Flows (Phase 2)

### Multiple Choice Flow (Box 1)

```mermaid
flowchart LR
  ShowQ["Show question\n+ image with masked labels\n+ highlight indicator"]
  ShowQ --> ShowMC["Show 4 shuffled choices\n1 correct + 3 random distractors"]
  ShowMC --> UserPick["User picks answer\nor presses 1/2/3/4"]
  UserPick --> Correct{"Correct?"}
  Correct -->|Yes| GreenFeedback["Green flash\nShow correct answer\nMove to Box 2"]
  Correct -->|No| RedFeedback["Red flash\nShow correct answer\nStay in Box 1"]
  GreenFeedback --> NextQ["Next question\npress Enter"]
  RedFeedback --> NextQ
```

### Written Mode Flow (Box 2)

```mermaid
flowchart LR
  ShowQ2["Show question\n+ image with masked labels\n+ highlight indicator"]
  ShowQ2 --> TextInput["Show text input field\nUser types answer"]
  TextInput --> Submit["User presses Enter"]
  Submit --> FuzzyMatch{"Levenshtein >= 80%\nvs written_accept list?"}
  FuzzyMatch -->|Match| GreenFB["Green: Correct!\nShow canonical spelling\nMove to Box 3 = Mastered"]
  FuzzyMatch -->|No match| RedFB["Red: Incorrect\nShow correct answer\nBack to Box 1"]
  GreenFB --> NextQ2["Next question"]
  RedFB --> NextQ2
```

### Image Masking at Render Time

```mermaid
flowchart TB
  LoadImage["Load image from public/images/"]
  LoadBBox["Load bounding boxes from image_bboxes.json"]
  Render["Render image in container\nwith position: relative"]
  LoadImage --> Render
  LoadBBox --> Overlay["For each bbox:\nRender absolute-positioned div\nbg-muted rounded\ncovers text region"]
  Overlay --> Render
  Render --> Highlight["Render pulsing indicator\nat highlight x,y coordinates\npointing to target structure"]
```

The masking is pure CSS -- `<div>` overlays positioned absolutely over the image using percentage coordinates from the OCR data. No canvas manipulation needed.

## Session Flow (Phase 3)

```mermaid
flowchart TB
  Home["Home Screen\n6 topic cards with progress bars\n+ Review All button\n+ Reset options"]
  Home -->|Pick topic| StartSession["Load unmastered questions\nfor selected topic"]
  Home -->|Review All| StartReview["Load unmastered questions\nacross ALL topics\nweighted by lowest mastery"]
  
  StartSession --> Round
  StartReview --> Round
  
  subgraph sessionLoop [Study Session]
    Round["Round N begins\nShuffle all unmastered questions"]
    Round --> ShowQuestion["Show next question\nMC if Box 1, Written if Box 2"]
    ShowQuestion --> Answer["User answers"]
    Answer --> UpdateBox["Update box state\nSave to localStorage"]
    UpdateBox --> MoreInRound{"More questions\nin this round?"}
    MoreInRound -->|Yes| ShowQuestion
    MoreInRound -->|No| Summary["Round Summary\nX/Y correct\nZ newly mastered"]
    Summary --> AllMastered{"All questions\nmastered?"}
    AllMastered -->|No| Round
    AllMastered -->|Yes| Complete["Topic Complete!\nCelebration screen"]
  end
  
  Complete --> Home
```

## localStorage Schema

```typescript
interface StudyProgress {
  version: 1;
  questions: Record<string, {
    box: 1 | 2 | 3;          // Leitner box (3 = mastered)
    timesSeen: number;
    timesCorrect: number;
    lastSeen: string;         // ISO timestamp
  }>;
}
```

Stored under key `"katy-study-progress"`. Loaded on app mount, written after every answer.

## Component Architecture

```mermaid
flowchart TB
  Layout["app/layout.tsx\nFonts, global styles"]
  Layout --> HomePage["app/page.tsx\nTopic grid + progress bars + Review All"]
  Layout --> StudyPage["app/study/[topicId]/page.tsx\nSession engine"]
  Layout --> ReviewPage["app/review/page.tsx\nReview All session"]
  
  subgraph components [Components]
    TopicCard["TopicCard\nName, progress bar, mastered count"]
    QuestionCard["QuestionCard\nRoutes to MC or Written"]
    MCQuestion["MCQuestion\nImage + 4 choices + keyboard nav"]
    WrittenQuestion["WrittenQuestion\nImage + text input + fuzzy match"]
    ImageWithMasks["ImageWithMasks\nImage + CSS overlay divs for bboxes\n+ highlight indicator"]
    RoundSummary["RoundSummary\nStats + continue button"]
    ProgressBar["ProgressBar\nAnimated mastery indicator"]
  end
  
  StudyPage --> QuestionCard
  ReviewPage --> QuestionCard
  HomePage --> TopicCard
  QuestionCard --> MCQuestion
  QuestionCard --> WrittenQuestion
  MCQuestion --> ImageWithMasks
  WrittenQuestion --> ImageWithMasks
  StudyPage --> RoundSummary
```

### Key files to create

| File | Purpose |
|------|---------|
| `scripts/parse_html.py` | Parse HTML export into structured topic map |
| `scripts/ocr_images.py` | Tesseract OCR on all images, output bounding boxes |
| `data/questions.yaml` | Complete question bank (~200-400 questions) |
| `data/image_bboxes.json` | OCR bounding boxes for all 149 images |
| `lib/questions.ts` | Load + type the YAML data |
| `lib/study-engine.ts` | Leitner box logic, round management, question selection |
| `lib/fuzzy-match.ts` | Levenshtein distance for written mode |
| `lib/use-progress.ts` | localStorage hook for persisting progress |
| `app/page.tsx` | Home screen with topic cards + progress |
| `app/study/[topicId]/page.tsx` | Study session page |
| `app/review/page.tsx` | Review All session page |
| `components/question-card.tsx` | Routes between MC and Written modes |
| `components/mc-question.tsx` | Multiple choice UI + keyboard shortcuts |
| `components/written-question.tsx` | Text input + fuzzy match feedback |
| `components/image-with-masks.tsx` | Image renderer with CSS text masking |
| `components/round-summary.tsx` | End-of-round stats |
| `components/topic-card.tsx` | Topic selection card with progress |

### shadcn components to install

```bash
npx shadcn@latest add card progress badge input separator alert
```

These cover: topic cards (Card), mastery bars (Progress), status indicators (Badge), written answer input (Input), layout dividers (Separator), and feedback messages (Alert).

## Design Details

- **Warm amber theme**: Already configured in [app/globals.css](app/globals.css) with oklch amber tokens
- **Encouraging feedback**: Green pulse animation on correct, gentle red shake on incorrect, always show correct answer
- **Progress bars**: Amber-filled progress bars on each topic card showing mastered/total
- **Round summaries**: Celebratory tone ("Nice! 8 new questions mastered this round")
- **Keyboard-first**: 1/2/3/4 for MC answers, Enter to submit written answers and advance, Escape to quit session
- **Responsive**: Works on laptop and phone (Katy might study from either)

## Execution Order

The work breaks into 3 phases that must be sequential:

**Phase 1 -- Data pipeline** (highest risk, do first)
1. Install Python deps
2. Write + run `parse_html.py` to understand the full note structure
3. Write + run `ocr_images.py` to get bounding boxes for all 149 images
4. Copy images to `public/images/`
5. Author `questions.yaml` -- the bulk of the work, requires reading every note and image

**Phase 2 -- App infrastructure**
1. Install shadcn components
2. Build `lib/` modules (questions loader, study engine, fuzzy match, progress hook)
3. Build `ImageWithMasks` component (the core visual mechanic)

**Phase 3 -- Pages and UX**
1. Home page with topic cards + progress
2. Study session page with round logic
3. Review All page
4. Feedback animations, keyboard shortcuts
5. Test the full flow end-to-end
