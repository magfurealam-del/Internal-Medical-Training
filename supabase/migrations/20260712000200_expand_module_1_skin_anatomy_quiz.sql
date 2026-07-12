with selected_module as (
  select m.id, m.course_id
  from training.modules m join training.courses c on c.id = m.course_id
  where c.slug = 'clinical-team-essentials' and m.sort_order = 1 limit 1
), quiz as (
  insert into training.quizzes (course_id, module_id, title, description, pass_percentage, attempt_limit)
  select course_id, id, 'Module 1: Skin Anatomy and Physiology Check', 'Mechanism-based assessment of skin structure, function, vulnerability, depth, and documentation.', 80, 2
  from selected_module
  returning id
)
select 1;

delete from training.questions
where quiz_id in (select id from training.quizzes where title = 'Module 1: Skin Anatomy and Physiology Check');

with quiz as (select id from training.quizzes where title = 'Module 1: Skin Anatomy and Physiology Check' order by created_at desc limit 1)
insert into training.questions (quiz_id, prompt, question_type, sort_order, explanation)
select quiz.id, v.prompt, 'single_choice', v.sort_order, v.explanation
from quiz cross join (values
 ('Why is skin anatomy foundational to wound care?',1,'Anatomy identifies lost structures and functions, guiding mechanism-based assessment.'),
 ('Which pairing is most accurate?',2,'The dermis is connective-tissue support containing vessels, nerves, and appendages.'),
 ('Which epidermal cell produces keratin and forms most of the surface barrier?',3,'Keratinocytes are the dominant epidermal cells and produce keratin.'),
 ('Why can superficial epidermal injury sometimes repair more readily than deep dermal injury?',4,'Viable epidermal cells and appendage-associated sources may support renewal when the environment is adequate.'),
 ('What mechanism should be considered with fissures, dryness, and irritation?',5,'Surface-barrier disruption can increase water loss and external access.'),
 ('Which dermal components contribute to tensile strength and elastic recoil?',6,'Collagen resists tension and elastin supports recoil.'),
 ('A clean wound has weak, easily stretched surrounding tissue. What remains possible?',7,'Dermal matrix injury or reduced structural support may persist despite a clean surface.'),
 ('A patient repeatedly injures a foot with little pain. What should be investigated?',8,'Loss of protective sensation may allow unnoticed repetitive trauma.'),
 ('Why can loss of subcutaneous cushioning increase pressure injury risk?',9,'It can concentrate force over a smaller area and bring skin closer to deeper structures.'),
 ('Which situation most suggests shear?',10,'Sliding while skin remains relatively fixed creates stress between tissue layers.'),
 ('Which finding demonstrates loss of protective sensory function?',11,'Continuing to load an injured area without recognizing injury suggests sensory impairment.'),
 ('A foot is cooler and paler than the opposite side. What is appropriate?',12,'Consider altered perfusion and assess it; the finding alone is not a diagnosis.'),
 ('Why can older skin be injured by stress that younger skin tolerates?',13,'Age can reduce structural resilience, cushioning, vascular reserve, and repair margin.'),
 ('What is the most complete assessment after adhesive skin tear?',14,'Assess vulnerability, applied stress, handling, medication context, and the exact injury.'),
 ('Why should diabetic-foot assessment include sensation, perfusion, footwear, and loading?',15,'Diabetes can alter several systems simultaneously.'),
 ('What sequence supports anatomy-based wound assessment?',16,'Assess surface barrier, dermal support, subcutaneous cushioning, and deeper structures.'),
 ('Which documentation entry is most useful for audit?',17,'A complete entry links anatomy, findings, suspected mechanism, assessment, and monitoring.'),
 ('A shallow wound has a wet, white, painful periwound. What should be assessed?',18,'Moisture imbalance may be damaging the epidermal barrier.'),
 ('A plantar wound has callus, worn footwear, reduced sensation, and weak pulses. Best reasoning?',19,'Multiple mechanical, neurologic, footwear, and vascular mechanisms may coexist.'),
 ('Which statement best summarizes anatomy and wound care?',20,'Injured layers represent lost functions that create mechanisms and determine assessment priorities.')
) as v(prompt, sort_order, explanation);

with quiz as (select id from training.quizzes where title = 'Module 1: Skin Anatomy and Physiology Check' order by created_at desc limit 1), data as (
 select * from (values
 (1,1,'The layer and structures involved guide mechanism assessment','Anatomy only supports memorizing products','An open epidermis proves infection','Anatomy replaces assessment'),
 (2,2,'Dermis: connective-tissue support with vessels, nerves, and appendages','Epidermis: deep tensile layer with large vessels','Subcutaneous tissue: only a waterproof barrier','Epidermis: main adipose storage'),
 (3,1,'Keratinocyte','Melanocyte','Langerhans cell','Merkel cell'),
 (4,2,'Epidermal cells and appendage-associated sources may support renewal','The epidermis has no renewing cells','The dermis is never involved in healing','Superficial wounds never become chronic'),
 (5,2,'Increased water loss and impaired surface protection','Proven deep bone infection','Normal scar maturation','Improved barrier function'),
 (6,1,'Collagen and elastin','Melanin and keratin only','Platelets and erythrocytes only','Sweat and sebum only'),
 (7,2,'Dermal matrix injury or reduced structural support','Surface cleanliness proves normal dermis','No slough proves no chronicity','Wound length is the only relevant finding'),
 (8,2,'Loss of protective sensation','Increased protective sensation','Excessive epidermal renewal','Normal dermal elasticity'),
 (9,2,'Force is concentrated over a smaller area','Distance between skin and bone increases','External pressure is eliminated','Perfusion assessment is unnecessary'),
 (10,2,'Sliding while skin remains relatively fixed','Dry scale without movement','Normal sweating','A healed scar without exposure'),
 (11,2,'Continuing to load an injured area without recognizing it','Immediate withdrawal from pain','Normal sweating','Intact color and temperature'),
 (12,1,'Consider altered perfusion and assess it','It definitely proves infection','It is irrelevant if the wound is small','It proves epidermal infection'),
 (13,2,'Reduced resilience, cushioning, vascular reserve, and repair margin','Increased thickness and elasticity','No need for pressure prevention','Immunity to adhesive trauma'),
 (14,2,'Assess vulnerability, stress, handling, medication context, and injury','Record only fragile skin','Assume infection is the only cause','Change dressing without documentation'),
 (15,2,'Diabetes can alter sensation, perfusion, immunity, repair, and loading','Diabetes affects only epidermis','Footwear is unrelated to pressure','Painless wounds are always low risk'),
 (16,2,'Surface, dermal support, subcutaneous cushioning, deeper structures','Product, color, age, history','Pain only, length only, treatment','Odor only, product, diagnosis'),
 (17,3,'Complete anatomy, findings, mechanism, assessment, and monitoring','Large bad ulcer','Skin problem; dressing applied','Patient tolerated'),
 (18,1,'Moisture imbalance damaging the epidermal barrier','Normal subcutaneous cushioning','Improved epithelial maturation','Normal dry scar'),
 (19,2,'Multiple mechanical, neurologic, footwear, and vascular mechanisms','Callus alone','Strongest device immediately','Weak pulses are irrelevant'),
 (20,2,'Lost functions create mechanisms that determine assessment priorities','Anatomy does not influence reasoning','Size alone predicts healing','Coverage corrects every mechanism')
 ) as t(sort_order,correct_choice_sort_order,a,b,c,d)) select * from t
), inserted as (
 insert into training.question_choices (question_id, choice_text, sort_order)
 select q.id, choice.choice_text, choice.choice_sort_order
 from training.questions q join quiz on q.quiz_id = quiz.id join data on data.sort_order = q.sort_order
 cross join lateral (values (data.a,1),(data.b,2),(data.c,3),(data.d,4)) choice(choice_text,choice_sort_order)
 returning id, question_id, sort_order
)
update training.questions q set correct_choice_id = i.id
from inserted i join data on data.sort_order = q.sort_order
where q.id = i.question_id and i.sort_order = data.correct_choice_sort_order;
