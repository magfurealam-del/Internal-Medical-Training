-- Align learner-facing lesson titles with the expanded Markdown headers.
with selected_module as (
  select m.id
  from training.modules m
  join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 1
)
update training.lessons l
set title = v.title,
    slug = v.slug
from selected_module m,
(values
  (1, 'Module 1 — Skin as a Living Barrier System', 'skin-as-a-living-barrier-system'),
  (2, 'Module 1 — The Epidermis: The External Defense System', 'the-epidermis-external-defense-system'),
  (3, 'Module 1 — The Dermis: Strength, Elasticity, and Repair Infrastructure', 'the-dermis-strength-elasticity-repair-infrastructure'),
  (4, 'Module 1 — Subcutaneous Tissue: Cushion, Energy, and Pressure Transmission', 'subcutaneous-tissue-cushion-energy-pressure-transmission'),
  (5, 'Module 1 — Skin Functions and the Wound Environment', 'skin-functions-and-wound-environment'),
  (6, 'Module 1 — Skin Integrity, Aging, Diabetes, and Fragility', 'skin-integrity-aging-diabetes-fragility'),
  (7, 'Module 1 — From Intact Skin to Wound Depth', 'from-intact-skin-to-wound-depth'),
  (8, 'Module 1 — Integrated Skin-Anatomy Case Conference', 'integrated-skin-anatomy-case-conference')
) as v(sort_order, title, slug)
where l.module_id = m.id
  and l.sort_order = v.sort_order;

update training.modules
set title = 'Module 1: Skin Anatomy and Physiology',
    description = 'A comprehensive mechanism-based study of skin layers, barrier biology, dermal repair infrastructure, subcutaneous cushioning, vulnerability, anatomical depth, and clinical documentation.'
where id in (
  select m.id
  from training.modules m
  join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 1
);
