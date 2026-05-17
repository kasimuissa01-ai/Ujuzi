import fs from 'fs';

const courses = JSON.parse(fs.readFileSync('src/data/courses.json', 'utf-8'));

// The user uploaded 2 images that got assigned to lesson 101:
// IMG_20260513_134555.png and IMG_20260513_134444.jpg
// The user says WhatsApp status image and M-Pesa templates are mixed up/missing.
// We will assign IMG_20260513_134555.png to WhatsApp status (Lesson 201)
// We will assign IMG_20260513_134444.jpg to M-Pesa template (Lesson 303)

const base = 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/';

const img1 = base + 'IMG_20260513_134555.png'; // Assume Whatsapp status
const img2 = base + 'IMG_20260513_134444.jpg'; // Assume Mpesa template
const instaMock1 = base + 'a-mobile-phone-screenshot-mockup-of-an-instagram-p.png';
const instaMock2 = base + 'a-mobile-phone-screenshot-mockup-showing-a-bright-%20(1).png';
const instaFlat = base + 'a-flat-illustration-of-a-smartphone-showing-an-ins.png';

for (const course of courses) {
  if (course.course_id === 1) { // Apply to Course 1 only to be safe
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
      
        // Lesson 101: Bio (A/B)
        if (lesson.lesson_id === 101) {
          const ab = lesson.blocks.find(b => b.type === 'image_ab');
          if (ab) {
            ab.option_a.src = instaMock1;
            ab.option_b.src = instaMock2;
          }
        }

        // Lesson 201: WhatsApp Status
        if (lesson.lesson_id === 201) {
          const imgs = lesson.blocks.filter(b => b.type === 'image');
          if (imgs.length >= 1) imgs[0].src = img1; // Override first image with the real whatsapp status
          if (imgs.length >= 2) imgs[1].src = base + 'flat-illustration-showing-three-whatsapp-status-ca.png';
        }

        // Lesson 303: Mpesa Template
        if (lesson.lesson_id === 303) {
          const img = lesson.blocks.find(b => b.type === 'image' && b.src && b.src.includes('mpesa_template'));
          if (img) img.src = img2;
        }

      }
    }
  }
}

fs.writeFileSync('src/data/courses.json', JSON.stringify(courses, null, 2));
