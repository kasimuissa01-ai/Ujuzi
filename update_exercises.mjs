import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf-8'));

const exerciseData = {
    101: {
        "type": "cloze",
        "prompt": "To gain trust, my profile picture should be ________.",
        "sentence_with_blank": "To gain trust, my profile picture should be {blank}.",
        "options": ["Clear and Professional", "A random meme", "Dark and blurry"],
        "correct": "Clear and Professional",
        "feedback": "Safi sana! Picha safi inajenga imani mara moja."
    },
    102: {
        "type": "match",
        "prompt": "Match the Social Tool to its Benefit:",
        "pairs": [
            {"left": "Instagram", "right": "Visual Catalog"},
            {"left": "WhatsApp", "right": "Closing Sales"},
            {"left": "TikTok", "right": "New Discovery"}
        ],
        "feedback": "Vizuri! Hivyo ndivyo unavyoweza kutumia kila zana kwa faida yake kuu."
    },
    103: {
        "type": "cloze",
        "prompt": "To make a product saleable, my description should include ________.",
        "sentence_with_blank": "To make a product saleable, my description should include {blank}.",
        "options": ["Benefit and Call-to-Action", "Just the price", "Random emojis"],
        "correct": "Benefit and Call-to-Action",
        "feedback": "Kama ni kweli! Mteja anahitaji kujua anapata nini na afanye nini sasa."
    },
    201: {
        "type": "cloze",
        "prompt": "For effective WhatsApp Status, the ratio of educational post to product post is ________.",
        "sentence_with_blank": "For effective WhatsApp Status, the ratio of educational post to product post is {blank}.",
        "options": ["2:1", "1:2", "5:5"],
        "correct": "2:1",
        "feedback": "Sahihi! Watu wanafuata wanaowafundisha."
    },
    202: {
        "type": "match",
        "prompt": "Match the Story Element to its position:",
        "pairs": [
            {"left": "Question", "right": "Top"},
            {"left": "Product/Answer", "right": "Bottom"}
        ],
        "feedback": "Sahihi! Muundo wa swali juu na bidhaa chini unashirikisha na kuuza."
    },
    203: {
        "type": "cloze",
        "prompt": "The most important part of a caption to stop the scroll is the ________.",
        "sentence_with_blank": "The most important part of a caption to stop the scroll is the {blank}.",
        "options": ["Hook", "Hashtags", "Price"],
        "correct": "Hook",
        "feedback": "Ndiyo! Sekunde 2 za kwanza ndizo zinazoamua kama mteja ataendelea kusoma."
    }
};

for (const course of courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      if (exerciseData[lesson.lesson_id]) {
        // Remove old 'exercise' block
        lesson.blocks = lesson.blocks.filter(b => b.type !== 'exercise');
        // Add new exercise block
        lesson.blocks.push(exerciseData[lesson.lesson_id]);
      }
    }
  }
}
fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
console.log("Exercises updated successfully.");
