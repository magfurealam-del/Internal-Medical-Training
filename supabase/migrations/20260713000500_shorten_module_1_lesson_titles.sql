-- Keep Module 1 as the parent heading; use concise learner-facing lesson names.
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
  (1, 'Skin as a Living Organ', 'skin-as-a-living-organ'),
  (2, 'Epidermis: The Surface Barrier', 'epidermis-the-surface-barrier'),
  (3, 'Dermis: Strength and Repair', 'dermis-strength-and-repair'),
  (4, 'Subcutaneous Tissue: Cushioning and Pressure', 'subcutaneous-tissue-cushioning-and-pressure'),
  (5, 'Skin Functions and the Wound Environment', 'skin-functions-and-the-wound-environment'),
  (6, 'Aging, Diabetes, and Skin Fragility', 'aging-diabetes-and-skin-fragility'),
  (7, 'From Skin Integrity to Wound Depth', 'from-skin-integrity-to-wound-depth'),
  (8, 'Integrated Case Conference', 'integrated-case-conference')
) as v(sort_order, title, slug)
where l.module_id = m.id
  and l.sort_order = v.sort_order;
