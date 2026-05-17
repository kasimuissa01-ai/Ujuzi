import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf-8'));

for (const course of courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      if (lesson.blocks) {
        // Check if there is already an 'exercise' type block
        const hasExercise = lesson.blocks.some(b => b.type === 'exercise');
        if (!hasExercise) {
          lesson.blocks.push({
            "type": "exercise",
            "prompt": "Andika muhtasari mfupi wa kile ulichojifunza katika somo hili na jinsi utakavyokitumia kwenye biashara yako leo.",
            "placeholder": "Andika hapa...",
            "example": "Leo nimejifunza kuhusu [somo]. Nitaanza kutumia mbinu hii kwa..."
          });
        }
      }
    }
  }
}

fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
console.log("Exercises added to all lessons.");
