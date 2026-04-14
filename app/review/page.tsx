import { getQuestionData, getImageBBoxes } from "@/lib/questions";
import { ReviewPageClient } from "./client";

export default function ReviewPage() {
  const data = getQuestionData();
  const allQuestions = data.topics.flatMap((t) => t.questions);
  const bboxData = getImageBBoxes();

  return <ReviewPageClient questions={allQuestions} bboxData={bboxData} />;
}
