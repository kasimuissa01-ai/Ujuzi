import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf-8'));

for (const course of courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      if (lesson.blocks) {
        for (const block of lesson.blocks) {
          if (block.audio) {
            console.log(`Removing audio: ${block.audio} from lesson ${lesson.lesson_id}`);
            delete block.audio;
          }
        }
      }
    }
  }
}

fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
console.log("Audio removed successfully.");
