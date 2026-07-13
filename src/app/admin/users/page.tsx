import Link from "next/link";
import { requireTrainingStaff } from "@/lib/training/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { InviteUserForm } from "./InviteUserForm";
import { RoleSelect } from "./RoleSelect";

export default async function AdminUsersPage() {
  await requireTrainingStaff();

  const adminClient = getSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();

  const [authUsersResult, { data: profiles }, { data: enrollmentCounts }] = await Promise.all([
    adminClient.auth.admin.listUsers({ perPage: 200 }),
    supabase.from("profiles").select("id, full_name, role"),
    supabase.from("enrollments").select("user_id, status"),
  ]);
  const authUsers = authUsersResult.data;

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const enrollCountMap = new Map<string, { total: number; completed: number }>();
  for (const e of enrollmentCounts ?? []) {
    const existing = enrollCountMap.get(e.user_id) ?? { total: 0, completed: 0 };
    existing.total++;
    if (e.status === "completed") existing.completed++;
    enrollCountMap.set(e.user_id, existing);
  }

  const users = (authUsers?.users ?? [] as { id: string; email?: string; app_metadata?: Record<string, unknown>; last_sign_in_at?: string | null; created_at: string; email_confirmed_at?: string | null }[])
    .map((u) => {
      const profile = profileMap.get(u.id);
      const counts = enrollCountMap.get(u.id) ?? { total: 0, completed: 0 };
      return {
        id: u.id,
        email: u.email ?? "—",
        fullName: profile?.full_name ?? null,
        role: profile?.role ?? (u.app_metadata?.role as string | undefined) ?? "learner",
        lastSignIn: u.last_sign_in_at ?? null,
        createdAt: u.created_at,
        enrollments: counts.total,
        completed: counts.completed,
        confirmed: Boolean(u.email_confirmed_at),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const roleCount = { learner: 0, instructor: 0, administrator: 0 } as Record<string, number>;
  for (const u of users) roleCount[u.role] = (roleCount[u.role] ?? 0) + 1;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <Link href="/admin" className="text-sm font-medium text-[#007c8b]">← Administration</Link>

      <div className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#007c8b]">User management</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[#002f65]">Platform users</h1>
        <p className="mt-4 text-[#526b78]">Invite staff, manage roles, and monitor training activity.</p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-[#002f65] p-5 text-white">
          <p className="text-sm text-white/65">Total users</p>
          <p className="mt-2 text-3xl font-semibold">{users.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Learners</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{roleCount.learner ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Instructors</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{roleCount.instructor ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#d5e9ed]">
          <p className="text-sm text-[#526b78]">Admins</p>
          <p className="mt-2 text-3xl font-semibold text-[#002f65]">{roleCount.administrator ?? 0}</p>
        </div>
      </div>

      {/* Invite */}
      <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <h2 className="text-xl font-semibold text-[#002f65]">Invite new user</h2>
        <p className="mt-1 text-sm text-[#526b78]">
          An email with a sign-in link will be sent. The user sets their own password on first login.
        </p>
        <div className="mt-5">
          <InviteUserForm />
        </div>
      </section>

      {/* User table */}
      <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-[#d5e9ed]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#002f65]">All users</h2>
          <span className="text-sm text-[#526b78]">{users.length} accounts</span>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-[#d5e9ed]">
          <table className="w-full text-sm">
            <thead className="bg-[#f6feff]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#002f65]">User</th>
                <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Enrolled</th>
                <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Completed</th>
                <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[#002f65]">Last active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[#d5e9ed]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#002f65]">{user.fullName ?? user.email}</p>
                    {user.fullName && <p className="text-xs text-[#526b78]">{user.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={user.id} currentRole={user.role} />
                  </td>
                  <td className="px-4 py-3 text-[#526b78]">{user.enrollments}</td>
                  <td className="px-4 py-3 text-[#526b78]">{user.completed}</td>
                  <td className="px-4 py-3">
                    {user.confirmed ? (
                      <span className="rounded-full bg-[#e4f7ec] px-2.5 py-1 text-xs font-semibold text-[#145c36]">Active</span>
                    ) : (
                      <span className="rounded-full bg-[#fff8f0] px-2.5 py-1 text-xs font-semibold text-[#7c4a00]">Invite pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#526b78]">
                    {user.lastSignIn
                      ? new Date(user.lastSignIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
