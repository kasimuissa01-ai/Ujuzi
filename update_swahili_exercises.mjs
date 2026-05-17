import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf-8'));

const exerciseData = {
    101: [
        {
            "type": "cloze",
            "prompt": "Ili wateja wakuamini, picha yako ya wasifu inapaswa kuwa...",
            "sentence_with_blank": "Ili wateja wakuamini, picha yako ya wasifu inapaswa kuwa {blank}.",
            "options": ["Safi na ya kiprofeshonal", "Picha isiyo wazi", "Meme ya kuchekesha"],
            "correct": "Safi na ya kiprofeshonal",
            "feedback": "Safi sana! Picha safi inajenga imani mara moja."
        },
        {
            "type": "match",
            "prompt": "Oanisha zana na manufaa yake:",
            "pairs": [
                {"left": "Instagram", "right": "Katalogi ya Picha"},
                {"left": "WhatsApp", "right": "Kufunga Mauzo"}
            ],
            "feedback": "Vizuri! Kila zana ina kazi yake maalum."
        },
        {
            "type": "cloze",
            "prompt": "Maelezo yako ya biashara (Bio) yanapaswa kuwa...",
            "sentence_with_blank": "Maelezo yako ya biashara (Bio) yanapaswa kuwa {blank}.",
            "options": ["Mafupi na yanayoeleweka", "Marefu sana", "Hayana maelezo"],
            "correct": "Mafupi na yanayoeleweka",
            "feedback": "Hiyo ni kweli! Wateja hawapendi kusoma mambo marefu."
        }
    ],
    102: [
        {
            "type": "cloze",
            "prompt": "Ili kuwavutia wateja zaidi, unapaswa kutumia caption inayotoa...",
            "sentence_with_blank": "Ili kuwavutia wateja zaidi, unapaswa kutumia caption inayotoa {blank}.",
            "options": ["Faida na wito wa kuchukua hatua", "Bei tu", "Emoji nyingi"],
            "correct": "Faida na wito wa kuchukua hatua",
            "feedback": "Kweli kabisa! Mteja anahitaji kujua anapata nini."
        }
    ]
    // ... add more for other lessons
};

for (const course of courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      if (exerciseData[lesson.lesson_id]) {
        // Remove old blocks
        lesson.blocks = lesson.blocks.filter(b => b.type !== 'exercise' && b.type !== 'cloze' && b.type !== 'match');
        // Add new exercise blocks
        lesson.blocks.push(...exerciseData[lesson.lesson_id]);
      }
    }
  }
}
fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
console.log("Swahili exercises updated successfully.");
