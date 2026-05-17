import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf-8'));

// Goal: Lesson 303: Mpesa Template.
// Remove the image block (type: 'image') that uses the wrong image.

for (const course of courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      if (lesson.lesson_id === 303) {
        // Remove blocks where type is 'image'
        lesson.blocks = lesson.blocks.filter(b => b.type !== 'image');
      }
    }
  }
}

fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
