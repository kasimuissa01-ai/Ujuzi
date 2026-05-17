const fs = require('fs');

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf8'));

courses.forEach(c => {
  if (c.course_id === 'saikolojia_ya_wateja_003') {
    c.units.forEach(u => {
      u.lessons.forEach(l => {
        l.blocks.forEach(b => {
          if (b.type === 'quiz_single' || b.type === 'scenario_test') {
            b.type = 'quiz';
            b.correct_index = b.correctAnswerIndex;
            b.question = b.question || b.scenario;
            b.feedback = b.feedback || "Sahihi!";
            // Reset options to array of strings if it is an array of objects
            if (b.options && typeof b.options[0] === 'object') {
               b.options = b.options.map(opt => opt.text || opt.label);
            }
          }
          if (b.type === 'visual_choice') {
             // StepRenderer supports image_ab. Needs option_a, option_b, correct ('A' or 'B'), label
             b.type = 'image_ab';
             b.label = b.question;
             b.option_a = { src: b.options[0].image, label: b.options[0].label };
             b.option_b = { src: b.options[1].image, label: b.options[1].label };
             b.correct = b.options[0].isCorrect ? 'A' : 'B';
             b.feedback_correct = "Nzuri sana!";
             b.feedback_wrong = "Sio sahihi.";
          }
        });
      });
    });
  }
});

fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
