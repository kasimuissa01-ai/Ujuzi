import fs from 'fs';

const coursesPath = 'src/data/courses.json';
const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

// Modifying Unit 1, Lesson 3
data[0].units[0].lessons[2].blocks = data[0].units[0].lessons[2].blocks.map(b => {
    if (b.type === 'cloze' && b.prompt && b.prompt.includes('To make a product saleable')) {
        return {
            type: "cloze",
            prompt: "Ili kuwavuta wateja kununua, maelezo yako ya bidhaa yanapaswa kueleza nini zaidi?",
            sentence_with_blank: "Maelezo ya bidhaa inayouza sana kwanza kabisa huelezea {blank}.",
            options: [
                "Faida kwa mteja",
                "Tarehe ya kutengenezwa",
                "Jina la duka"
            ],
            correct: "Faida kwa mteja",
            feedback: "Umejibu vizuri sana! Wateja hununua jinsi bidhaa inavyotatua shida yao au inavyowabana, na si tu sifa za bidhaa yenyewe."
        };
    }
    return b;
});

fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2));
console.log("English cloze block in Unit 1 Lesson 3 translated.");
