import fs from 'fs';

const coursesPath = 'src/data/courses.json';
const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

const instaBioExercise = {
  type: 'insta_bio',
  prompt: 'Tengeneza Bio inayouza kwa kujaza nafasi zilizo wazi:',
  blanks: 3,
  options: ["Kiume", "Kike", "Kariakoo", "Mlimani City", "Watoto"],
  correct: ["Kiume", "Kike", "Kariakoo"],
  feedback: 'Umefanya vizuri! Hii ni Bio kamilifu (Unauza nini + Upo wapi).'
};

const lesson101 = data[0].units[0].lessons[0];
// Remove the old drag_drop exercise
lesson101.blocks = lesson101.blocks.filter(b => b.type !== 'drag_drop' && b.type !== 'insta_bio');
// Add the new one at the end
lesson101.blocks.push(instaBioExercise);

fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2));
console.log("Insta Bio exercise added successfully.");
