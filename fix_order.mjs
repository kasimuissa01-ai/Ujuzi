import fs from 'fs';

const coursesPath = 'src/data/courses.json';
const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

const infoTypes = ['story', 'text', 'tip', 'image'];

for (const course of data) {
    for (const unit of course.units) {
        for (const lesson of unit.lessons) {
            if (lesson.blocks.length > 0) {
                const infos = [];
                const exercises = [];
                
                lesson.blocks.forEach(b => {
                    if (infoTypes.includes(b.type)) {
                        infos.push(b);
                    } else {
                        exercises.push(b);
                    }
                });
                
                lesson.blocks = [...infos, ...exercises];
            }
        }
    }
}

fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2));
console.log("Lessons reordered successfully: Information first, Exercises last.");
