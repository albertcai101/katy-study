import { getQuestionData } from "@/lib/questions";
import { HomeClient } from "./home-client";

export default function HomePage() {
  const data = getQuestionData();

  const topics = data.topics.map((t) => ({
    id: t.id,
    name: t.name,
    questionCount: t.questions.length,
    questionIds: t.questions.map((q) => q.id),
  }));

  return <HomeClient topics={topics} />;
}
