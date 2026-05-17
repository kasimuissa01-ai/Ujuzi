import fs from 'fs';

const coursesPath = 'src/data/courses.json';
const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

// Unit 2
const unit2 = data[0].units[1];

// Lesson 1: Nguvu ya WhatsApp Status
unit2.lessons[0].blocks.push(
  {
    type: "match",
    prompt: "Gawanya aina za Status unapojaribu kuuza:",
    pairs: [
      { left: "Picha ya bidhaa", right: "Kuuza Moja kwa Moja" },
      { left: "Ushuhuda wa Mteja aliyeitumia", right: "Kujenga Imani (Elimu/Ushahidi)" }
    ],
    feedback: "Sawa kabisa! Usisahau fomula ni 2 za kutoa thamani/ushahidi, inafuata 1 ya kuuza."
  },
  {
    type: "quiz",
    question: "Kosa gani wauzaji wengi hufanya kwenye WhatsApp Status?",
    options: [
      "Kuweka Status zaidi ya 10 ambazo zote ni bidhaa mbili tatu tofauti tu kila siku na kuwapa wateja uchovu wa kutazama",
      "Kuweka mzaha japo kidogo kabla ya kupost bidhaa",
      "Kujibu reply za Status haraka"
    ],
    correct_index: 0,
    feedback: "Hakika! Status ndefu yenye bidhaa tupu inachosha macho, na wateja wana'mute'. Changanya na ushahidi, faida za bidhaa, na hata maisha yako asilia."
  }
);

// Lesson 2: Instagram na Facebook Stories Zinazovutia
unit2.lessons[1].blocks.push(
  {
    type: "cloze",
    prompt: "Ili watu wachangie kwenye Story yako fanya hivi...",
    sentence_with_blank: "Tumia {blank} ili kuwawezesha wateja kutoa maoni kwa wepesi bila kuandika ujumbe.",
    options: [
      "Polls na Stickers",
      "Maelezo marefu sana",
      "Namba yako ya simu tu"
    ],
    correct: "Polls na Stickers",
    feedback: "Safi! Watu wanapenda vitu visivyo wa-umiza kichwa (k.m., 'Nyekundu au Nyeusi?'). Hii inaongeza utangamano."
  },
  {
    type: "quiz",
    question: "Tofauti kubwa kati ya Feed (Post za kawaida) na Story ni ipi kimikakati?",
    options: [
      "Feed ni kwa ajili ya kufunga mauzo, Story ni picha za utani",
      "Feed inajenga duka/alama (branding) inayobaki, Story ni nzuri zaidi kwa matangazo ya papo hapo na ukaribu (Behind the scenes)",
      "Hazina tofauti yoyote."
    ],
    correct_index: 1,
    feedback: "Uko vizuri! Story zinaleta hisia zenye ukaribu zaidi kwa mteja anayeishia kukujenga."
  }
);


// Lesson 3: Caption Inayosimamisha Thumb
unit2.lessons[2].blocks.push(
  {
    type: "fill_blank",
    prompt: "Fomula ya kumfanya asome mpaka mwisho:",
    sentence: "Anza na Ndoano (Hook) inayovutia kwenye mistari ___ ya kwanza kwa sababu Instragram itaficha maelezo kwenye neno ___.",
    blanks: 2,
    options: [
      "miwili",
      "Soma zaidi (Read more)",
      "yote",
      "Comment"
    ],
    correct: ["miwili", "Soma zaidi (Read more)"],
    feedback: "Vizuri sana! Ikiwa mistari yako miwili ya mwanzo inaboa, hakuna atakaye gusa kusoma zaidi."
  },
  {
    type: "match",
    prompt: "Tofautisha aina za Hooks (Ndoano):",
    pairs: [
      { left: "\"Tumeleta mzigo mpya, 10,000 tu\"", right: "Ndoano hafifu (inayopotewa haraka)" },
      { left: "\"Kitu kimoja kimenistua sana kuhusu saa hii tunayouza leo...\"", right: "Ndoano inayotengeneza Shauku (Curiosity)" }
    ],
    feedback: "Umeipata! Shauku (Curiosity) inamlazimisha msomaji kubonyeza 'Read more' ili arejeshe ufahamu."
  }
);

fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2));
console.log('Unit 2 updated with more Mimo-style interactive exercises!');
