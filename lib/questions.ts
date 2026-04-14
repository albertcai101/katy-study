import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface Question {
  id: string;
  question: string;
  answer: string;
  written_accept: string[];
  distractors: string[];
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export interface QuestionData {
  topics: Topic[];
}

let cachedData: QuestionData | null = null;

export function getQuestionData(): QuestionData {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "data", "questions.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  cachedData = yaml.load(raw) as QuestionData;
  return cachedData;
}

export function getTopicById(topicId: string): Topic | undefined {
  const data = getQuestionData();
  return data.topics.find((t) => t.id === topicId);
}

export function getAllQuestions(): Question[] {
  const data = getQuestionData();
  return data.topics.flatMap((t) => t.questions);
}
