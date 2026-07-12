import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function LessonContent({ content }: { content: string }) {
  return (
    <div className="lesson-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
