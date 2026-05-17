import fs from 'fs';

const coursesPath = 'src/data/courses.json';
const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

const dragDropExercise = {
  type: 'drag_drop',
  prompt: 'Panga habari hizi ili kuunda Bio kamili ya Instagram:',
  design_context: 'instagram_bio',
  items: [
    { id: '1', text: 'Karibu katika duka letu 🛍️' },
    { id: '2', text: 'Tunauza Viatu vya Kiume na Kike 👟👠' },
    { id: '3', text: 'Tupo Kariakoo, Mtaa wa Congo 📍' },
    { id: '4', text: 'Piga simu au WhatsApp: 0755-000-000 📲' }
  ],
  correct_order: ['2', '3', '4', '1'],
  feedback: 'Zingatia formula: Unauza nini ➡️ Upo wapi ➡️ Utapatikanaje.'
};

const lesson101 = data[0].units[0].lessons[0];
// We don't want to duplicate if it already exists, let's filter it out first just in case
lesson101.blocks = lesson101.blocks.filter(b => b.type !== 'drag_drop');
lesson101.blocks.push(dragDropExercise);

fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2));
console.log("Drag & Drop exercise added.");
