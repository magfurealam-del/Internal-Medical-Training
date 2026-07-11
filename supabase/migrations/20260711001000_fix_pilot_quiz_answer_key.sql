update training.questions q
set correct_choice_id = qc.id
from training.question_choices qc
where q.quiz_id = 'e9311299-b71a-4c42-9281-7366e15bf312'
  and qc.question_id = q.id
  and qc.sort_order = 1;
