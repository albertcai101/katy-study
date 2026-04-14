import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface Question {
  id: string;
  type: "text-mc" | "image-identify";
  question: string;
  answer: string;
  written_accept: string[];
  distractors: string[];
  image?: string;
  masks?: "all";
  highlight?: { x: number; y: number };
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export interface QuestionData {
  topics: Topic[];
}

export interface BBoxRegion {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ImageBBoxes = Record<string, BBoxRegion[]>;

let cachedData: QuestionData | null = null;
let cachedBBoxes: ImageBBoxes | null = null;

export function getQuestionData(): QuestionData {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "data", "questions.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  cachedData = yaml.load(raw) as QuestionData;
  return cachedData;
}

export function getImageBBoxes(): ImageBBoxes {
  if (cachedBBoxes) return cachedBBoxes;

  const filePath = path.join(
    process.cwd(),
    "scripts",
    "output",
    "image_bboxes.json"
  );
  const raw = fs.readFileSync(filePath, "utf8");
  cachedBBoxes = JSON.parse(raw) as ImageBBoxes;
  return cachedBBoxes;
}

export function getTopicById(topicId: string): Topic | undefined {
  const data = getQuestionData();
  return data.topics.find((t) => t.id === topicId);
}

export function getAllQuestions(): Question[] {
  const data = getQuestionData();
  return data.topics.flatMap((t) => t.questions);
}
