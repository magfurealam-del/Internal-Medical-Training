import { readFile } from "node:fs/promises";
import path from "node:path";

const contentRoot = path.resolve(process.cwd(), "content");

export async function readLessonContent(contentPath: string) {
  const safePath = path.resolve(contentRoot, contentPath);
  if (!safePath.startsWith(`${contentRoot}${path.sep}`)) return null;
  try {
    return await readFile(safePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
