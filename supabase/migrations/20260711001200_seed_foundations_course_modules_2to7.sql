-- Course 1 (Foundations of Wound Care), Modules 2-7: lessons + quizzes.
-- Continues the pilot seeded in 20260711001100_seed_foundations_course_pilot.sql.
-- Course remains 'draft' pending clinical review.

with selected_course as (
  select id from training.courses where slug = 'foundations-of-wound-care'
)

-- ===================== Module 2: Skin Anatomy and Physiology =====================
, m2 as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Skin Anatomy and Physiology', 'Layers of the skin, the six functions of skin, and why aging skin is more vulnerable to injury.', 2
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), sel_m2 as (
  select id, course_id from m2
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 2
  limit 1
), l2 as (
  insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
  select id, 'Skin Anatomy and Physiology', 'skin-anatomy-and-physiology',
    'courses/foundations-of-wound-care/module-02/lesson-01.md', 1, true
  from sel_m2
  on conflict (module_id, slug) do update set content_path = excluded.content_path
  returning id
), quiz2 as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select sc.id, sm.id, 'Skin Anatomy and Physiology: Knowledge Check', 'Checks understanding of skin layers, functions, and aging changes.', 80
  from selected_course sc cross join sel_m2 sm
  on conflict do nothing
  returning id
), sel_quiz2 as (
  select id from quiz2
  union all
  select q.id from training.quizzes q join selected_course c on c.id = q.course_id where q.title = 'Skin Anatomy and Physiology: Knowledge Check'
  limit 1
), q2_1 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which of the following is NOT a main function of the skin?', 'single_choice', 1,
    'The skin thermoregulates, protects, senses, excretes waste, synthesizes vitamin D, and communicates -- digestion is not a skin function.'
  from sel_quiz2 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q2_1 as (select id, quiz_id from q2_1 union all select q.id, q.quiz_id from training.questions q join sel_quiz2 z on z.id = q.quiz_id where q.sort_order = 1 limit 1
), c2_1 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q2_1 cross join (values ('Digestion',1),('Thermoregulation',2),('Protection',3),('Sensation',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u2_1 as (update training.questions q set correct_choice_id = c.id from c2_1 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q2_2 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which layer of the skin acts as insulation and cushioning?', 'single_choice', 2,
    'The subcutaneous layer (hypodermis) is mostly adipose tissue, providing insulation, cushioning, and energy storage.'
  from sel_quiz2 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q2_2 as (select id, quiz_id from q2_2 union all select q.id, q.quiz_id from training.questions q join sel_quiz2 z on z.id = q.quiz_id where q.sort_order = 2 limit 1
), c2_2 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q2_2 cross join (values ('Subcutaneous layer',1),('Epidermis',2),('Dermis',3),('Stratum corneum',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u2_2 as (update training.questions q set correct_choice_id = c.id from c2_2 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q2_3 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which cell type is primarily responsible for producing keratin in the epidermis?', 'single_choice', 3,
    'Keratinocytes make up 90% of the epidermis and produce keratin, which waterproofs and protects the skin.'
  from sel_quiz2 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q2_3 as (select id, quiz_id from q2_3 union all select q.id, q.quiz_id from training.questions q join sel_quiz2 z on z.id = q.quiz_id where q.sort_order = 3 limit 1
), c2_3 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q2_3 cross join (values ('Keratinocytes',1),('Melanocytes',2),('Langerhans cells',3),('Merkel cells',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u2_3 as (update training.questions q set correct_choice_id = c.id from c2_3 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q2_4 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which layer of the epidermis is found only in thick skin, such as the palms and soles?', 'single_choice', 4,
    'The stratum lucidum is an extra layer present only in thick skin areas like the palms and soles.'
  from sel_quiz2 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q2_4 as (select id, quiz_id from q2_4 union all select q.id, q.quiz_id from training.questions q join sel_quiz2 z on z.id = q.quiz_id where q.sort_order = 4 limit 1
), c2_4 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q2_4 cross join (values ('Stratum lucidum',1),('Stratum basale',2),('Stratum spinosum',3),('Stratum corneum',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u2_4 as (update training.questions q set correct_choice_id = c.id from c2_4 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q2_5 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Collagen and elastin in the dermis are primarily responsible for:', 'single_choice', 5,
    'Collagen provides tensile strength and elastin provides flexibility/recoil -- together, the skin''s strength and elasticity.'
  from sel_quiz2 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q2_5 as (select id, quiz_id from q2_5 union all select q.id, q.quiz_id from training.questions q join sel_quiz2 z on z.id = q.quiz_id where q.sort_order = 5 limit 1
), c2_5 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q2_5 cross join (values ('Strength and elasticity of the skin',1),('Thermoregulation and excretion',2),('Vitamin D synthesis and sensation',3),('Protection against pathogens',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u2_5 as (update training.questions q set correct_choice_id = c.id from c2_5 c where q.id = c.question_id and c.sort_order = 1 returning q.id

-- ===================== Module 3: Wound Healing Biology =====================
), m3 as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Wound Healing Biology: Why Wounds Fail', 'The four phases of healing, primary/secondary/tertiary intention, and why chronic wounds stall.', 3
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), sel_m3 as (
  select id, course_id from m3
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 3
  limit 1
), l3 as (
  insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
  select id, 'Wound Healing Biology: Why Wounds Fail', 'wound-healing-biology',
    'courses/foundations-of-wound-care/module-03/lesson-01.md', 1, true
  from sel_m3
  on conflict (module_id, slug) do update set content_path = excluded.content_path
  returning id
), quiz3 as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select sc.id, sm.id, 'Wound Healing Biology: Knowledge Check', 'Checks understanding of the four healing phases and why chronic wounds stall.', 80
  from selected_course sc cross join sel_m3 sm
  on conflict do nothing
  returning id
), sel_quiz3 as (
  select id from quiz3
  union all
  select q.id from training.quizzes q join selected_course c on c.id = q.course_id where q.title = 'Wound Healing Biology: Knowledge Check'
  limit 1
), q3_1 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which phase of wound healing begins immediately after injury?', 'single_choice', 1,
    'Hemostasis is the body''s immediate response: vasoconstriction and platelet clot formation.'
  from sel_quiz3 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q3_1 as (select id, quiz_id from q3_1 union all select q.id, q.quiz_id from training.questions q join sel_quiz3 z on z.id = q.quiz_id where q.sort_order = 1 limit 1
), c3_1 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q3_1 cross join (values ('Hemostasis',1),('Inflammation',2),('Proliferation',3),('Maturation',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u3_1 as (update training.questions q set correct_choice_id = c.id from c3_1 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q3_2 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which cells are responsible for removing bacteria and dead tissue during the inflammation phase?', 'single_choice', 2,
    'Neutrophils and macrophages arrive during inflammation to clear bacteria and debris.'
  from sel_quiz3 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q3_2 as (select id, quiz_id from q3_2 union all select q.id, q.quiz_id from training.questions q join sel_quiz3 z on z.id = q.quiz_id where q.sort_order = 2 limit 1
), c3_2 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q3_2 cross join (values ('Neutrophils and macrophages',1),('Platelets',2),('Fibroblasts',3),('Keratinocytes',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u3_2 as (update training.questions q set correct_choice_id = c.id from c3_2 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q3_3 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'The inflammation phase is typically characterized by:', 'single_choice', 3,
    'Classic signs of inflammation: heat, swelling, redness, and pain.'
  from sel_quiz3 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q3_3 as (select id, quiz_id from q3_3 union all select q.id, q.quiz_id from training.questions q join sel_quiz3 z on z.id = q.quiz_id where q.sort_order = 3 limit 1
), c3_3 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q3_3 cross join (values ('Heat, swelling, redness, and pain',1),('Decreased blood flow and pallor',2),('Scar formation and increased tensile strength',3),('Clot formation and vasoconstriction',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u3_3 as (update training.questions q set correct_choice_id = c.id from c3_3 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q3_4 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'During the proliferation phase, which tissue forms and is rich in nutrients and oxygen?', 'single_choice', 4,
    'Granulation tissue forms during proliferation, supported by new blood vessel growth (angiogenesis).'
  from sel_quiz3 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q3_4 as (select id, quiz_id from q3_4 union all select q.id, q.quiz_id from training.questions q join sel_quiz3 z on z.id = q.quiz_id where q.sort_order = 4 limit 1
), c3_4 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q3_4 cross join (values ('Granulation tissue',1),('Scar tissue',2),('Epithelial tissue',3),('Necrotic tissue',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u3_4 as (update training.questions q set correct_choice_id = c.id from c3_4 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q3_5 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'The maturation phase of wound healing:', 'single_choice', 5,
    'Maturation can last up to a year and involves collagen fiber reorganization, increasing tensile strength.'
  from sel_quiz3 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q3_5 as (select id, quiz_id from q3_5 union all select q.id, q.quiz_id from training.questions q join sel_quiz3 z on z.id = q.quiz_id where q.sort_order = 5 limit 1
), c3_5 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q3_5 cross join (values ('Can last up to a year and involves collagen fiber reorganization',1),('Is the shortest phase, lasting only a few days',2),('Involves inflammation and swelling',3),('Occurs before hemostasis',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u3_5 as (update training.questions q set correct_choice_id = c.id from c3_5 c where q.id = c.question_id and c.sort_order = 1 returning q.id

-- ===================== Module 4: Wound Types and Classification by Etiology =====================
), m4 as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Wound Types and Classification by Etiology', 'Acute vs chronic wounds, the four major chronic wound types, and wound-bed tissue classification.', 4
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), sel_m4 as (
  select id, course_id from m4
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 4
  limit 1
), l4 as (
  insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
  select id, 'Wound Types and Classification by Etiology', 'wound-classification-by-etiology',
    'courses/foundations-of-wound-care/module-04/lesson-01.md', 1, true
  from sel_m4
  on conflict (module_id, slug) do update set content_path = excluded.content_path
  returning id
), quiz4 as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select sc.id, sm.id, 'Wound Classification: Knowledge Check', 'Checks understanding of chronic wound etiologies and wound-bed tissue types.', 80
  from selected_course sc cross join sel_m4 sm
  on conflict do nothing
  returning id
), sel_quiz4 as (
  select id from quiz4
  union all
  select q.id from training.quizzes q join selected_course c on c.id = q.course_id where q.title = 'Wound Classification: Knowledge Check'
  limit 1
), q4_1 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which of the following is a characteristic of an arterial ulcer?', 'single_choice', 1,
    'Arterial ulcers have a distinctive punched-out appearance with well-defined borders, from reduced arterial blood flow.'
  from sel_quiz4 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q4_1 as (select id, quiz_id from q4_1 union all select q.id, q.quiz_id from training.questions q join sel_quiz4 z on z.id = q.quiz_id where q.sort_order = 1 limit 1
), c4_1 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q4_1 cross join (values ('Punched-out appearance with well-defined edges',1),('Dark red color with hemosiderin staining',2),('Occurs on lower legs due to blood pooling',3),('Caused by external trauma only',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u4_1 as (update training.questions q set correct_choice_id = c.id from c4_1 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q4_2 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'A diabetic foot ulcer is most commonly found on which part of the foot?', 'single_choice', 2,
    'DFUs typically form on high-pressure areas: the heel and ball of the foot.'
  from sel_quiz4 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q4_2 as (select id, quiz_id from q4_2 union all select q.id, q.quiz_id from training.questions q join sel_quiz4 z on z.id = q.quiz_id where q.sort_order = 2 limit 1
), c4_2 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q4_2 cross join (values ('Heel and ball of the foot',1),('Top of the foot',2),('Ankle',3),('Arch',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u4_2 as (update training.questions q set correct_choice_id = c.id from c4_2 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q4_3 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which type of tissue appears black or brown in a wound and impedes healing?', 'single_choice', 3,
    'Necrotic tissue is dead, black/brown tissue that blocks new tissue growth and requires debridement.'
  from sel_quiz4 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q4_3 as (select id, quiz_id from q4_3 union all select q.id, q.quiz_id from training.questions q join sel_quiz4 z on z.id = q.quiz_id where q.sort_order = 3 limit 1
), c4_3 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q4_3 cross join (values ('Necrotic tissue',1),('Granulation tissue',2),('Epithelial tissue',3),('Sloughy tissue',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u4_3 as (update training.questions q set correct_choice_id = c.id from c4_3 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q4_4 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which factor is considered intrinsic in affecting wound healing?', 'single_choice', 4,
    'Intrinsic factors originate within the patient: age-related skin changes, medical conditions, nutrition. Smoking/infection/hygiene are extrinsic or lifestyle factors.'
  from sel_quiz4 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q4_4 as (select id, quiz_id from q4_4 union all select q.id, q.quiz_id from training.questions q join sel_quiz4 z on z.id = q.quiz_id where q.sort_order = 4 limit 1
), c4_4 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q4_4 cross join (values ('Age-related skin changes',1),('Smoking',2),('Poor hygiene practices',3),('Infection',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u4_4 as (update training.questions q set correct_choice_id = c.id from c4_4 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q4_5 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which of these tissue types represents the final stage of wound healing?', 'single_choice', 5,
    'Epithelial (pink) tissue represents the final phase, as new skin forms across the wound surface.'
  from sel_quiz4 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q4_5 as (select id, quiz_id from q4_5 union all select q.id, q.quiz_id from training.questions q join sel_quiz4 z on z.id = q.quiz_id where q.sort_order = 5 limit 1
), c4_5 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q4_5 cross join (values ('Epithelial tissue',1),('Necrotic tissue',2),('Sloughy tissue',3),('Granulation tissue',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u4_5 as (update training.questions q set correct_choice_id = c.id from c4_5 c where q.id = c.question_id and c.sort_order = 1 returning q.id

-- ===================== Module 5: Whole-Patient Assessment =====================
), m5 as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Whole-Patient Assessment Before Wound Therapy', 'Patient history, vital signs, and the VIP (Vascular, Infection/Inflammation, Pressure) safety screen.', 5
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), sel_m5 as (
  select id, course_id from m5
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 5
  limit 1
), l5 as (
  insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
  select id, 'Whole-Patient Assessment Before Wound Therapy', 'whole-patient-assessment',
    'courses/foundations-of-wound-care/module-05/lesson-01.md', 1, true
  from sel_m5
  on conflict (module_id, slug) do update set content_path = excluded.content_path
  returning id
), quiz5 as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select sc.id, sm.id, 'Whole-Patient Assessment: Knowledge Check', 'Checks understanding of patient assessment components and the VIP safety screen.', 80
  from selected_course sc cross join sel_m5 sm
  on conflict do nothing
  returning id
), sel_quiz5 as (
  select id from quiz5
  union all
  select q.id from training.quizzes q join selected_course c on c.id = q.course_id where q.title = 'Whole-Patient Assessment: Knowledge Check'
  limit 1
), q5_1 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Why is a comprehensive patient and wound assessment necessary?', 'single_choice', 1,
    'A comprehensive assessment establishes the baseline needed to create an effective, individualized treatment plan.'
  from sel_quiz5 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q5_1 as (select id, quiz_id from q5_1 union all select q.id, q.quiz_id from training.questions q join sel_quiz5 z on z.id = q.quiz_id where q.sort_order = 1 limit 1
), c5_1 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q5_1 cross join (values ('To create an effective treatment plan',1),('To provide a single snapshot of the wound',2),('To assess if the patient needs surgery',3),('To prescribe medication',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u5_1 as (update training.questions q set correct_choice_id = c.id from c5_1 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q5_2 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which of the following is a key component of patient assessment (separate from the wound itself)?', 'single_choice', 2,
    'Social factors and medical history are core patient-assessment components, distinct from wound-specific measurements.'
  from sel_quiz5 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q5_2 as (select id, quiz_id from q5_2 union all select q.id, q.quiz_id from training.questions q join sel_quiz5 z on z.id = q.quiz_id where q.sort_order = 2 limit 1
), c5_2 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q5_2 cross join (values ('Social factors and medical history',1),('Location of the wound',2),('Size and depth of the wound',3),('Color of wound dressing',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u5_2 as (update training.questions q set correct_choice_id = c.id from c5_2 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q5_3 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which vital sign can indicate circulatory compromise that may impact wound healing?', 'single_choice', 3,
    'Abnormal blood pressure (high or low) can indicate circulatory compromise affecting healing.'
  from sel_quiz5 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q5_3 as (select id, quiz_id from q5_3 union all select q.id, q.quiz_id from training.questions q join sel_quiz5 z on z.id = q.quiz_id where q.sort_order = 3 limit 1
), c5_3 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q5_3 cross join (values ('Blood pressure',1),('Temperature',2),('Respiratory rate',3),('Oxygen saturation',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u5_3 as (update training.questions q set correct_choice_id = c.id from c5_3 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q5_4 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Why is a patient''s socioeconomic status relevant to wound assessment?', 'single_choice', 4,
    'Socioeconomic status affects access to care and support systems, which measurably affects healing capacity.'
  from sel_quiz5 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q5_4 as (select id, quiz_id from q5_4 union all select q.id, q.quiz_id from training.questions q join sel_quiz5 z on z.id = q.quiz_id where q.sort_order = 4 limit 1
), c5_4 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q5_4 cross join (values ('It can affect the patient''s access to care and support systems',1),('It indicates the severity of the wound',2),('It determines the type of medication the patient will use',3),('It provides information about the patient''s diet',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u5_4 as (update training.questions q set correct_choice_id = c.id from c5_4 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q5_5 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'A nurse finds cool toes, weak pulses, and pallor before a scheduled compression dressing change. Per the VIP approach, what should happen first?', 'single_choice', 5,
    'VIP requires a vascular screen before proceeding -- these findings suggest possible arterial compromise, where compression could be unsafe.'
  from sel_quiz5 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q5_5 as (select id, quiz_id from q5_5 union all select q.id, q.quiz_id from training.questions q join sel_quiz5 z on z.id = q.quiz_id where q.sort_order = 5 limit 1
), c5_5 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q5_5 cross join (values ('Pause and complete a vascular assessment before proceeding with compression',1),('Apply the compression dressing as scheduled',2),('Document the finding only and proceed at the next visit',3),('Increase compression strength to improve circulation',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u5_5 as (update training.questions q set correct_choice_id = c.id from c5_5 c where q.id = c.question_id and c.sort_order = 1 returning q.id

-- ===================== Module 6: Standardized Documentation and Classification =====================
), m6 as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Standardized Wound Documentation and Classification Systems', 'Standard descriptors, the Wagner/NPUAP/UT classification systems, and documentation/photography standards.', 6
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), sel_m6 as (
  select id, course_id from m6
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 6
  limit 1
), l6 as (
  insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
  select id, 'Standardized Wound Documentation and Classification Systems', 'standardized-documentation',
    'courses/foundations-of-wound-care/module-06/lesson-01.md', 1, true
  from sel_m6
  on conflict (module_id, slug) do update set content_path = excluded.content_path
  returning id
), quiz6 as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select sc.id, sm.id, 'Documentation and Classification: Knowledge Check', 'Checks understanding of standardized descriptors and the Wagner/NPUAP classification systems.', 80
  from selected_course sc cross join sel_m6 sm
  on conflict do nothing
  returning id
), sel_quiz6 as (
  select id from quiz6
  union all
  select q.id from training.quizzes q join selected_course c on c.id = q.course_id where q.title = 'Documentation and Classification: Knowledge Check'
  limit 1
), q6_1 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'What does the presence of yellow tissue (slough) in a wound bed indicate?', 'single_choice', 1,
    'Sloughy (yellow) tissue must be removed via debridement before healthy granulation tissue can form.'
  from sel_quiz6 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q6_1 as (select id, quiz_id from q6_1 union all select q.id, q.quiz_id from training.questions q join sel_quiz6 z on z.id = q.quiz_id where q.sort_order = 1 limit 1
), c6_1 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q6_1 cross join (values ('Tissue that requires debridement for granulation to occur',1),('Healthy tissue ready for healing',2),('Dead tissue that needs no further action',3),('Final stage of wound closure',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u6_1 as (update training.questions q set correct_choice_id = c.id from c6_1 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q6_2 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'What is the purpose of using standardized descriptors in wound assessment?', 'single_choice', 2,
    'Standardized descriptors ensure any two clinicians describe the same wound consistently, enabling comparison over time and across staff.'
  from sel_quiz6 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q6_2 as (select id, quiz_id from q6_2 union all select q.id, q.quiz_id from training.questions q join sel_quiz6 z on z.id = q.quiz_id where q.sort_order = 2 limit 1
), c6_2 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q6_2 cross join (values ('To ensure consistency in documentation and communication',1),('To simplify the documentation process',2),('To meet hospital requirements only',3),('To provide faster healing of the wound',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u6_2 as (update training.questions q set correct_choice_id = c.id from c6_2 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q6_3 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'In wound assessment, what does erythema and swelling around the wound usually indicate?', 'single_choice', 3,
    'Erythema and swelling are classic signs of infection or inflammation and should prompt further infection screening.'
  from sel_quiz6 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q6_3 as (select id, quiz_id from q6_3 union all select q.id, q.quiz_id from training.questions q join sel_quiz6 z on z.id = q.quiz_id where q.sort_order = 3 limit 1
), c6_3 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q6_3 cross join (values ('Infection or inflammation',1),('Presence of granulation tissue',2),('End stage of wound healing',3),('Increased blood pressure',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u6_3 as (update training.questions q set correct_choice_id = c.id from c6_3 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q6_4 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which classification system is used to categorize diabetic foot ulcers based on depth, infection, and gangrene?', 'single_choice', 4,
    'The Wagner Classification (Grades 0-5) categorizes DFUs by depth, infection, and gangrene.'
  from sel_quiz6 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q6_4 as (select id, quiz_id from q6_4 union all select q.id, q.quiz_id from training.questions q join sel_quiz6 z on z.id = q.quiz_id where q.sort_order = 4 limit 1
), c6_4 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q6_4 cross join (values ('Wagner Classification',1),('NPUAP',2),('University of Texas System',3),('ISTAP',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u6_4 as (update training.questions q set correct_choice_id = c.id from c6_4 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q6_5 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'According to the NPUAP staging system, which stage is full-thickness tissue loss with exposed bone, tendon, or muscle?', 'single_choice', 5,
    'NPUAP Stage 4 is full-thickness tissue loss with exposed bone, tendon, or muscle.'
  from sel_quiz6 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q6_5 as (select id, quiz_id from q6_5 union all select q.id, q.quiz_id from training.questions q join sel_quiz6 z on z.id = q.quiz_id where q.sort_order = 5 limit 1
), c6_5 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q6_5 cross join (values ('Stage 4',1),('Stage 1',2),('Stage 2',3),('Stage 3',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u6_5 as (update training.questions q set correct_choice_id = c.id from c6_5 c where q.id = c.question_id and c.sort_order = 1 returning q.id

-- ===================== Module 7: Core Clinical Frameworks =====================
), m7 as (
  insert into training.modules (course_id, title, description, sort_order)
  select id, 'Core Clinical Frameworks: VIP, TIME, MOIST, Wound Balance, Triangle of Assessment', 'How the five frameworks fit together as one sequential decision process.', 7
  from selected_course
  on conflict (course_id, sort_order) do update set description = excluded.description
  returning id, course_id
), sel_m7 as (
  select id, course_id from m7
  union all
  select m.id, m.course_id from training.modules m join selected_course c on c.id = m.course_id where m.sort_order = 7
  limit 1
), l7 as (
  insert into training.lessons (module_id, title, slug, content_path, sort_order, is_required)
  select id, 'Core Clinical Frameworks: VIP, TIME, MOIST, Wound Balance, Triangle of Assessment', 'core-clinical-frameworks',
    'courses/foundations-of-wound-care/module-07/lesson-01.md', 1, true
  from sel_m7
  on conflict (module_id, slug) do update set content_path = excluded.content_path
  returning id
), quiz7 as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage)
  select sc.id, sm.id, 'Core Clinical Frameworks: Knowledge Check', 'Checks understanding of TIME, MOIST, and how the five frameworks sequence together.', 80
  from selected_course sc cross join sel_m7 sm
  on conflict do nothing
  returning id
), sel_quiz7 as (
  select id from quiz7
  union all
  select q.id from training.quizzes q join selected_course c on c.id = q.course_id where q.title = 'Core Clinical Frameworks: Knowledge Check'
  limit 1
), q7_1 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Why is oxygen important in wound healing (the "O" consideration behind MOIST)?', 'single_choice', 1,
    'Adequate oxygenation supports collagen synthesis and blood vessel growth (angiogenesis) during proliferation.'
  from sel_quiz7 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q7_1 as (select id, quiz_id from q7_1 union all select q.id, q.quiz_id from training.questions q join sel_quiz7 z on z.id = q.quiz_id where q.sort_order = 1 limit 1
), c7_1 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q7_1 cross join (values ('It supports collagen synthesis and blood vessel growth',1),('It reduces the need for antibiotics',2),('It cools the wound environment',3),('It prevents infection on its own',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u7_1 as (update training.questions q set correct_choice_id = c.id from c7_1 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q7_2 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which debridement technique (part of the "T" in TIME) is least likely to harm surrounding healthy tissue?', 'single_choice', 2,
    'Autolytic debridement uses the body''s own moisture-retentive processes and is the gentlest on surrounding healthy tissue.'
  from sel_quiz7 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q7_2 as (select id, quiz_id from q7_2 union all select q.id, q.quiz_id from training.questions q join sel_quiz7 z on z.id = q.quiz_id where q.sort_order = 2 limit 1
), c7_2 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q7_2 cross join (values ('Autolytic debridement',1),('Sharp debridement',2),('Mechanical debridement',3),('Biosurgical debridement',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u7_2 as (update training.questions q set correct_choice_id = c.id from c7_2 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q7_3 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'What is a significant disadvantage of autolytic debridement?', 'single_choice', 3,
    'Autolytic debridement can be slow and is unsuitable for infected wounds needing faster intervention.'
  from sel_quiz7 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q7_3 as (select id, quiz_id from q7_3 union all select q.id, q.quiz_id from training.questions q join sel_quiz7 z on z.id = q.quiz_id where q.sort_order = 3 limit 1
), c7_3 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q7_3 cross join (values ('It can be slow and is unsuitable for infected wounds',1),('It is invasive',2),('It requires anesthesia',3),('It requires highly skilled personnel',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u7_3 as (update training.questions q set correct_choice_id = c.id from c7_3 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q7_4 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'Which protocol aims to maintain a moist wound environment while balancing oxygenation and infection control?', 'single_choice', 4,
    'The MOIST protocol (Moisture, Oxygenation, Infection control, Support, Tissue management) is the whole-environment framework.'
  from sel_quiz7 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q7_4 as (select id, quiz_id from q7_4 union all select q.id, q.quiz_id from training.questions q join sel_quiz7 z on z.id = q.quiz_id where q.sort_order = 4 limit 1
), c7_4 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q7_4 cross join (values ('MOIST Protocol',1),('NPWT Protocol',2),('Alginate Protocol',3),('Exudate Protocol',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
), u7_4 as (update training.questions q set correct_choice_id = c.id from c7_4 c where q.id = c.question_id and c.sort_order = 1 returning q.id

), q7_5 as (
  insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
  select id, 'A wound shows swelling, tenderness, oozing, non-response to treatment, exudate changes, elevated temperature, and smell. Which infection criteria set describes this presentation?', 'single_choice', 5,
    'STONEES (Swelling, Tenderness, Oozing, Non-responsive, Exudate changes, Elevated temperature, Smell) identifies deep infection, distinct from NERDS for superficial infection.'
  from sel_quiz7 on conflict (quiz_id, sort_order) do update set prompt = excluded.prompt returning id, quiz_id
), s_q7_5 as (select id, quiz_id from q7_5 union all select q.id, q.quiz_id from training.questions q join sel_quiz7 z on z.id = q.quiz_id where q.sort_order = 5 limit 1
), c7_5 as (
  insert into training.question_choices (question_id, choice_text, sort_order)
  select id, v.t, v.o from s_q7_5 cross join (values ('STONEES (deep infection)',1),('NERDS (superficial infection)',2),('TIME framework',3),('Wagner Classification',4)) as v(t,o)
  on conflict (question_id, sort_order) do update set choice_text = excluded.choice_text returning id, question_id, sort_order
)
update training.questions q set correct_choice_id = c.id from c7_5 c where q.id = c.question_id and c.sort_order = 1;
