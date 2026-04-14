import { getQuestionData } from "@/lib/questions";
import { notFound } from "next/navigation";
import { StudyPageClient } from "./client";

export function generateStaticParams() {
  const data = getQuestionData();
  return data.topics.map((t) => ({ topicId: t.id }));
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const data = getQuestionData();
  const topic = data.topics.find((t) => t.id === topicId);

  if (!topic) notFound();

  return <StudyPageClient topic={topic} />;
}
