# Claude instructions: course material deployment

This repository is the Internal Medical Training platform for Ekagra Advanced Wound and Foot Care Hospital.

## Scope

Author, review, validate, and publish learner-facing course content through GitHub. Course authoring is repository-based; do not build or use a website CMS.

- Repository: `https://github.com/magfurealam-del/Internal-Medical-Training.git`
- Branch: `main`
- Production: `https://internal-medical-training.vercel.app`
- Content root: `content/courses/`

## Lesson files

Store lessons at:

```text
content/courses/<course-slug>/<module-folder>/<lesson-file>.md
```

Example:

```text
content/courses/clinical-team-essentials/module-01/lesson-01.md
```

The database lesson record must use the path relative to `content/`:

```text
courses/clinical-team-essentials/module-01/lesson-01.md
```

Use lowercase kebab-case. Do not include secrets, service-role keys, patient-identifying information, or unreviewed private data in course material.

Recommended lesson structure:

```markdown
# Lesson title

## Learning objectives

- Objective one
- Objective two

## Core concepts

## Practical application

## Key takeaways

## References
```

Use clear, clinically accurate language. If content depends on Ekagra policy or clinical judgment, flag it for human review rather than inventing policy.

## Adding database records

Markdown alone does not create courses, modules, lessons, or quizzes in the application. For new records:

- Add a reviewed migration under `supabase/migrations/`.
- Keep application tables in the `training` schema.
- Preserve RLS and server-side authorization.
- Use stable slugs and conflict-safe seed statements.
- Do not modify unrelated `public` call-center or finance tables.
- Never expose quiz answer keys in learner-facing queries.

If an existing lesson already points to the correct `content_path`, a lesson update usually requires only the Markdown change.

## Validate locally

From the repository root:

```powershell
npm.cmd run lint
npm.cmd run build
git diff --check
git status --short
```

If Next.js reports a Windows/OneDrive `.next` lock, move the generated `.next` directory outside the repository and rerun validation. Never edit generated `.next` files.

## Publish to GitHub

Stage only files belonging to the course change:

```powershell
git status --short
git diff -- content supabase/migrations
git add content supabase/migrations
git commit -m "Add <course or lesson name> training content"
git push origin main
```

Do not use `git add -A` when unrelated work may exist. Never use `git reset --hard` or discard another contributor's changes. If a pull request is requested, use a branch and PR instead of pushing directly to `main`.

## Deployment

After GitHub publishing, the connected Vercel project normally deploys automatically. If explicit production deployment is requested, use the project-specific Vercel command documented in the project context, only after lint and build pass.

After deployment, verify the course page, lesson Markdown, lesson completion, quiz flow, and certificate flow when affected. Never claim deployment succeeded without a successful Git push or Vercel result.

## Security and clinical safeguards

- Never commit Supabase service-role or secret keys.
- Never add patient-identifying information to training content.
- Do not weaken RLS or authorization to fix a content problem.
- Do not change authentication or unrelated schemas without explicit scope.
- Treat clinical content as requiring human clinical review before publication when it contains protocols, treatment guidance, or hospital policy.
