import { getQuestionData } from "@/lib/questions";
import { ReviewPageClient } from "./client";

export default function ReviewPage() {
  const data = getQuestionData();
  const allQuestions = data.topics.flatMap((t) => t.questions);

  return <ReviewPageClient questions={allQuestions} />;
}
