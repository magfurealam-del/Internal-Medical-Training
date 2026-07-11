import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function LessonContent({ content }: { content: string }) {
  return <div className="prose prose-slate max-w-none prose-headings:text-[#002f65] prose-a:text-[#007c8b] prose-strong:text-[#002f65]"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div>;
}
