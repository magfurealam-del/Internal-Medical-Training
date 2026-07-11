import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  content_version: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content_path: string;
  sort_order: number;
  is_required: boolean;
};

export async function listCourses() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, content_version")
    .eq("status", "published")
    .order("title");

  if (error) throw new Error(error.message);
  return (data ?? []) as Course[];
}

export async function getCourse(courseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, slug, description, status, content_version")
    .eq("id", courseId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Course | null;
}

export async function listModules(courseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("modules")
    .select("id, course_id, title, description, sort_order")
    .eq("course_id", courseId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as Module[];
}

export async function getModule(moduleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("modules")
    .select("id, course_id, title, description, sort_order")
    .eq("id", moduleId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Module | null;
}

export async function listLessons(moduleId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, module_id, title, slug, content_path, sort_order, is_required")
    .eq("module_id", moduleId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as Lesson[];
}

export async function getLesson(lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, module_id, title, slug, content_path, sort_order, is_required")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Lesson | null;
}

export async function getCourseProgress(courseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { completed: 0, total: 0, percentage: 0 };

  const [{ data: lessons, error: lessonsError }, { data: progress, error: progressError }] = await Promise.all([
    supabase.from("lessons").select("id, modules!inner(course_id)").eq("modules.course_id", courseId).eq("is_required", true),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).not("completed_at", "is", null),
  ]);

  if (lessonsError) throw new Error(lessonsError.message);
  if (progressError) throw new Error(progressError.message);
  const lessonIds = new Set((lessons ?? []).map((lesson) => lesson.id));
  const completed = (progress ?? []).filter((item) => lessonIds.has(item.lesson_id)).length;
  const total = lessonIds.size;
  return { completed, total, percentage: total === 0 ? 0 : Math.round((completed / total) * 100) };
}
