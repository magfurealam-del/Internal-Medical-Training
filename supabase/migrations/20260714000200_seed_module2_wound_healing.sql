-- Module 2: Introduction to Wound Healing
-- 8 lessons, 20-question quiz, 80% pass, 2-attempt limit.

-- ── 1. Delete any existing module at sort_order = 2 ──────────────────────────
delete from training.modules
where course_id = (select id from training.courses where slug = 'clinical-team-essentials' limit 1)
  and sort_order = 2;

-- ── 2. Insert module ──────────────────────────────────────────────────────────
with sel as (
  select id as course_id from training.courses where slug = 'clinical-team-essentials' limit 1
)
insert into training.modules (course_id, title, description, sort_order)
select course_id,
  'Module 2: Introduction to Wound Healing',
  'The four-phase wound healing model, healing intentions, moist wound healing, chronic wounds, and the skin microbiome.',
  2
from sel;

-- ── 3. Insert 8 lessons ───────────────────────────────────────────────────────
with sel as (
  select m.id as module_id
  from training.modules m
  join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 2
  limit 1
)
insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
select module_id, v.title, v.slug, v.content_path, v.sort_order, true
from sel
cross join (values
  ('The Four Phases of Wound Healing',         'four-phases-wound-healing',        'courses/clinical-team-essentials/module-02/lesson-01.md', 1),
  ('Hemostasis: Stopping the Bleed',           'hemostasis-stopping-the-bleed',    'courses/clinical-team-essentials/module-02/lesson-02.md', 2),
  ('Inflammation: The Body''s Defence',        'inflammation-bodys-defence',       'courses/clinical-team-essentials/module-02/lesson-03.md', 3),
  ('Proliferation: Building New Tissue',       'proliferation-building-new-tissue','courses/clinical-team-essentials/module-02/lesson-04.md', 4),
  ('Maturation: Strengthening and Remodelling','maturation-remodelling',           'courses/clinical-team-essentials/module-02/lesson-05.md', 5),
  ('Types of Wound Healing Intention',         'healing-intention-types',          'courses/clinical-team-essentials/module-02/lesson-06.md', 6),
  ('Moist Wound Healing',                      'moist-wound-healing',              'courses/clinical-team-essentials/module-02/lesson-07.md', 7),
  ('Chronic Wounds and the Skin Microbiome',   'chronic-wounds-skin-microbiome',   'courses/clinical-team-essentials/module-02/lesson-08.md', 8)
) as v(title, slug, content_path, sort_order);

-- ── 4. Insert quiz ────────────────────────────────────────────────────────────
with sel as (
  select m.id as module_id, m.course_id
  from training.modules m
  join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 2
  limit 1
)
insert into training.quizzes (course_id, module_id, title, description, pass_percentage, attempt_limit)
select course_id, module_id,
  'Module 2 Assessment: Introduction to Wound Healing',
  'Assess knowledge of the four healing phases, healing intentions, moist wound healing, chronic wounds, and the skin microbiome.',
  80, 2
from sel;

-- ── 5. Insert 20 questions ────────────────────────────────────────────────────
with quiz as (
  select q.id from training.quizzes q
  join training.modules m on m.id = q.module_id
  join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 2
  order by q.sort_order nulls last limit 1
)
insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
select quiz.id, v.prompt, 'single_choice', v.sort_order, v.explanation
from quiz
cross join (values
  ('Which phase of wound healing begins immediately after injury?',                                                                    1,  'Hemostasis is the immediate response to injury — vasoconstriction and clot formation occur within seconds.'),
  ('Which phase is characterised by vasoconstriction and clot formation?',                                                             2,  'Vasoconstriction and platelet aggregation are the hallmarks of hemostasis, the first phase.'),
  ('Which cells are responsible for removing bacteria and dead tissue during the inflammation phase?',                                  3,  'Neutrophils arrive first (days 1–2) and macrophages take over from day 2–3 to phagocytose pathogens and debris.'),
  ('The inflammation phase is typically characterised by which four cardinal signs?',                                                   4,  'Rubor, calor, tumor, and dolor (redness, heat, swelling, pain) are the classical cardinal signs of acute inflammation.'),
  ('During the proliferation phase, which tissue begins to form and is rich in nutrients and oxygen?',                                  5,  'Granulation tissue — the red, moist, glistening tissue formed by fibroblasts and new capillaries — fills the wound bed.'),
  ('What occurs during angiogenesis in the wound healing process?',                                                                    6,  'VEGF stimulates endothelial cells to sprout new capillary loops, supplying the wound bed with oxygen and nutrients.'),
  ('The maturation phase of wound healing can last how long?',                                                                         7,  'Maturation involves collagen remodelling and can continue for up to 12 months after wound closure.'),
  ('Primary intention healing is most commonly used in which type of wound?',                                                          8,  'Primary closure requires clean, well-perfused wounds with minimal tissue loss — the classic example is a surgical incision.'),
  ('Healing by secondary intention occurs when what condition is present?',                                                            9,  'When tissue loss is too great to approximate wound edges, the wound is left open to heal by granulation, contraction, and epithelialisation.'),
  ('Tertiary intention healing (delayed primary closure) is typically used for which type of wound?',                                  10, 'Contaminated wounds are left open for drainage and debridement, then closed surgically once clean.'),
  ('Which wound environment is considered optimal for faster healing and reduced scarring?',                                           11, 'Winter (1962) demonstrated that moist wounds epithelialise twice as fast as dry wounds.'),
  ('Chronic wounds most often remain stuck in which phase of wound healing?',                                                          12, 'Chronic wounds are typically trapped in prolonged inflammation, where excess MMPs destroy growth factors and new tissue.'),
  ('Which of the following is an example of a chronic wound?',                                                                        13, 'Diabetic foot ulcers are a classic chronic wound type, driven by neuropathy, vasculopathy, and impaired healing.'),
  ('Excess wound moisture can lead to which perilesional skin complication?',                                                          14, 'Maceration occurs when surrounding skin is saturated by wound fluid, making it soft, white, and prone to breakdown.'),
  ('What is the primary function of normal skin flora (commensal organisms) in wound healing?',                                        15, 'Commensal organisms such as S. epidermidis prevent pathogen colonisation and help regulate immune responses.'),
  ('Approximately what percentage of the tensile strength of normal skin does a healed scar achieve after full maturation?',           16, 'Even after up to 12 months of collagen remodelling, scar tissue reaches only approximately 80% of normal skin strength.'),
  ('Which growth factor released by platelets during hemostasis is the primary stimulus for angiogenesis?',                           17, 'VEGF (vascular endothelial growth factor) is the key angiogenic signal released by platelets and later by macrophages.'),
  ('What is the term for the contractile cells derived from fibroblasts that pull wound edges together during proliferation?',         18, 'Myofibroblasts are differentiated fibroblasts that generate the mechanical force responsible for wound contraction.'),
  ('What does the term "biofilm" describe in the context of chronic wounds?',                                                          19, 'Biofilm is a structured microbial community encased in a self-produced polysaccharide matrix, highly resistant to antibiotics.'),
  ('In the contamination–colonisation–critical colonisation–infection continuum, which level describes a bacterial burden high enough to delay healing without systemic signs?', 20, 'Critical colonisation is characterised by a bacterial load that stalls healing without overt infection signs; it requires active management.')
) as v(prompt, sort_order, explanation);

-- ── 6. Insert choices and set correct_choice_id ───────────────────────────────
with quiz as (
  select q.id from training.quizzes q
  join training.modules m on m.id = q.module_id
  join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 2
  order by q.sort_order nulls last limit 1
),
data as (
  select * from (values
    ( 1, 3, 'Inflammation',                                                               'Proliferation',                                              'Hemostasis',                                                                      'Maturation'),
    ( 2, 1, 'Hemostasis',                                                                 'Proliferation',                                              'Inflammation',                                                                    'Maturation'),
    ( 3, 2, 'Platelets',                                                                  'Neutrophils and macrophages',                                'Fibroblasts',                                                                     'Keratinocytes'),
    ( 4, 2, 'Decreased blood flow, contraction, and pallor',                              'Heat, swelling, redness, and pain',                          'Scar formation, increased tensile strength, and less vascularity',                'Clot formation and vasoconstriction'),
    ( 5, 1, 'Granulation tissue',                                                         'Scar tissue',                                                'Epithelial tissue',                                                               'Necrotic tissue'),
    ( 6, 2, 'Scar tissue becomes stronger',                                               'New blood vessels form to bring nutrients to the wound',     'The wound bed dries out',                                                         'Pathogens are removed from the wound'),
    ( 7, 3, 'It is the shortest phase, lasting only a few days',                          'It involves active inflammation and swelling',               'It can last up to a year and involves collagen reorganisation',                   'It primarily focuses on vasoconstriction'),
    ( 8, 3, 'Large open wounds',                                                          'Pressure ulcers',                                            'Wounds with minimal tissue loss and surgical wounds',                             'Contaminated wounds'),
    ( 9, 3, 'Wound edges can be easily approximated',                                     'The wound has minimal tissue loss',                          'Tissue loss is extensive and wound edges cannot be brought together',             'Sutures or staples are used to close the wound'),
    (10, 1, 'Contaminated wounds left open for drainage before surgical closure',         'Minor cuts and abrasions',                                   'Acute wounds that heal quickly',                                                  'Pressure ulcers with minimal exudate'),
    (11, 2, 'Dry environment',                                                            'Moist environment',                                          'Excessively wet environment',                                                     'Bacteria-rich environment'),
    (12, 2, 'Hemostasis',                                                                 'Inflammation',                                               'Proliferation',                                                                   'Maturation'),
    (13, 3, 'Surgical incision',                                                          'Minor abrasion',                                             'Diabetic foot ulcer',                                                             'Superficial burn'),
    (14, 3, 'Faster healing',                                                             'Less inflammation',                                          'Maceration',                                                                      'Scar tissue formation'),
    (15, 2, 'Causes infection and delays healing',                                        'Supports skin health and prevents harmful pathogens',        'Disrupts the wound healing process',                                              'Increases inflammation and exudate production'),
    (16, 3, '50%',                                                                        '65%',                                                        '80%',                                                                             '100%'),
    (17, 2, 'PDGF (platelet-derived growth factor)',                                      'VEGF (vascular endothelial growth factor)',                  'TGF-β (transforming growth factor beta)',                                         'EGF (epidermal growth factor)'),
    (18, 2, 'Keratinocytes',                                                              'Myofibroblasts',                                             'Neutrophils',                                                                     'Macrophages'),
    (19, 2, 'A type of wound dressing used to prevent infection',                         'A structured community of bacteria encased in a polysaccharide matrix', 'A normal stage of wound healing in the proliferative phase',           'An antibiotic-resistant strain of Staphylococcus aureus'),
    (20, 3, 'Contamination',                                                              'Colonisation',                                               'Critical colonisation',                                                           'Infection')
  ) as t(sort_order, correct_choice_sort_order, a, b, c, d)
),
inserted as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select q.id, choice.choice_text, choice.choice_sort_order
  from training.questions q
  join quiz on q.quiz_id = quiz.id
  join data on data.sort_order = q.sort_order
  cross join lateral (values
    (data.a, 1),
    (data.b, 2),
    (data.c, 3),
    (data.d, 4)
  ) as choice(choice_text, choice_sort_order)
  returning id, question_id, sort_order
)
update training.questions q
set correct_choice_id = i.id
from inserted i
join data on data.sort_order = q.sort_order
where q.id = i.question_id
  and i.sort_order = data.correct_choice_sort_order;
