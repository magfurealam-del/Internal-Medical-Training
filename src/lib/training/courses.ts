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
