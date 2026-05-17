import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf-8'));

// Delete audio from all courses first to clean up
for (const course of courses) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      for (const block of lesson.blocks) {
        if (block.audio && block.audio.startsWith('http')) {
          delete block.audio;
        }
      }
    }
  }
}

const lessonAudioUrls = {
  "101": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/Lesson_101.wav",
  "102": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson_102.wav",
  "103": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson_103.wav",
  "201": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson_201.wav",
  "202": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson_202.wav",
  "203": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson_203.wav",
  "301": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson_301.wav",
  "302": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson302.wav",
  "303": "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/lesson303.wav"
};

// Only assign to Course 1
const course = courses[0]; // First course
for (const unit of course.units) {
  for (const lesson of unit.lessons) {
    const lessonId = lesson.lesson_id.toString();
    const audioUrl = lessonAudioUrls[lessonId];
    
    let isFirstStory = true;

    for (const block of lesson.blocks) {
      if ((block.type === 'story') && isFirstStory && audioUrl) {
        block.audio = audioUrl;
        isFirstStory = false;
      }
    }
  }
}

fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
