import fs from 'fs';

const coursesPath = 'src/data/courses.json';
const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

// === Unit 2: Lesson 1 ===
data[0].units[1].lessons[0].blocks = [
  ...data[0].units[1].lessons[0].blocks.filter(b => b.type !== 'cloze' && b.type !== 'scenario' && b.type !== 'quiz'),
  {
    type: "scenario",
    label: "Wateja wanaangalia WhatsApp Status yako lakini hawanunui. Nini unapaswa kufanya badala ya kuweka tu picha mfululizo?",
    setup: "Mfululizo wa Status hivi sasa:",
    chat: [
      { speaker: "We", text: "Viatu vizuri sana", side: "right" },
      { speaker: "We", text: "Tsh 45,000 tu", side: "right" }
    ],
    options: [
      "Weka picha zaidi 10 za viatu haraka",
      "Weka picha ya mteja aliyevaa (ushahidi/elimu) kabla ya kupost bei",
      "Andika \"Nunua sasa au nitafunga\""
    ],
    correct_index: 1,
    feedback: "Safi sana! Kutoa elimu au kuonesha ushuhuda kunajenga imani kwanza kabla ya kumuuzia."
  },
  {
    type: "cloze",
    prompt: "Ili WhatsApp Status yako iwe na nguvu, sheria inasema...",
    sentence_with_blank: "Changanya post zinatoa thamani/elimu na zile zinazo {blank}.",
    options: [
      "Kuuza",
      "Kulalamika",
      "Kuficha bei"
    ],
    correct: "Kuuza",
    feedback: "Umepatia! Post za kutoa thamani zinawavuta wateja uweze kuwauzia."
  }
];

// === Unit 2: Lesson 2 ===
data[0].units[1].lessons[1].blocks = [
  ...data[0].units[1].lessons[1].blocks.filter(b => b.type !== 'cloze' && b.type !== 'scenario' && b.type !== 'quiz' && b.type !== 'match' && b.type !== 'fill_blank'),
  {
    type: "fill_blank",
    prompt: "Kamilisha mbinu ya kuvutia kwenye Instagram/Facebook Stories:",
    sentence: "Badala ya kupost bidhaa tu, uliza ___ ili wateja waweze ___. Hii inaongeza mauzo mara mbili.",
    blanks: 2,
    options: [
      "swali",
      "kujibu",
      "jina",
      "kukimbia"
    ],
    correct: ["swali", "kujibu"],
    feedback: "Hakika! Maswali na polls zinafanya wateja washiriki katika Story yako na sio tu kutazama wakiwa kimya."
  },
  {
    type: "match",
    prompt: "Oanisha aina ya Story na kazi yake kuu:",
    pairs: [
      {
        left: "Video ukitengeneza ofisini/dukani",
        right: "Kuonyesha Uhalisi"
      },
      {
        left: "Swali: 'Je, unapendelea rangi gani?'",
        right: "Utangamano na wateja"
      }
    ],
    feedback: "Sawa kabisa! Kuchanganya uhalisi na utangamano huongeza hamasa ya kununua."
  }
];

// === Unit 2: Lesson 3 ===
data[0].units[1].lessons[2].blocks = [
  ...data[0].units[1].lessons[2].blocks.filter(b => b.type !== 'cloze' && b.type !== 'scenario' && b.type !== 'quiz'),
  {
    type: "cloze",
    prompt: "Kitu muhimu zaidi kwenye maelezo (Caption) kuwafanya watu wasimame na kusoma ni...",
    sentence_with_blank: "Sehemu muhimu zaidi ya caption inayo wasimamisha wateja wasipite inaitwa {blank}.",
    options: [
      "Ndoano (Hook)",
      "Bei tu",
      "Hashtags nyingi"
    ],
    correct: "Ndoano (Hook)",
    feedback: "Sahihi! Ndoano, kama swali gumu au kauli ya kusisimua kwenye mistari miwili ya kwanza ndiyo hufanya ukurasa utizamwe zaidi."
  },
  {
    type: "scenario",
    label: "Ni Ndoano (Hook) ipi bora kwa andiko la kuuza saa za mkononi?",
    setup: "Mistari ya kwanza mteja akisoma:",
    chat: [],
    options: [
      "Tunauza saa za mkono Original.",
      "Ushawahi kukosa kazi kisa umechelewa kwenye Interview? Usikubali hii ikupate.",
      "Bei ni elfu 30, karibuni sana"
    ],
    correct_index: 1,
    feedback: "Kuzungumzia tatizo la mteja ni Ndoano (Hook) madhubuti inayoibua hisia."
  }
];


// === Unit 3: Lesson 1 (Jibu la 'Bei Gani?') ===
data[0].units[2].lessons[0].blocks = [
  ...data[0].units[2].lessons[0].blocks.filter(b => b.type !== 'exercise' && b.type !== 'scenario' && b.type !== 'quiz' && b.type !== 'fill_blank'),
  {
    type: "scenario",
    label: "Mteja kauliza WhatsApp: 'Bei Gani?' — Wengi hukosea kujibu hapa. Lipi ni jibu zuri lenye ushawishi?",
    setup: "Sogea na uuze kama mtaalamu:",
    chat: [
      { speaker: "Mteja", text: "Habari, hilo gauni bei gani?", side: "left" }
    ],
    options: [
      "Tsh 45,000",
      "Tsh 45,000 — ni nzuri sana kwa sherehe kwasababu haina joto, nikufungie rangi gani leo?",
      "Inategemea, unataka la mchina au mtumba?"
    ],
    correct_index: 1,
    feedback: "Shabash! Kutaja bei kisha kueleza thamani na kumaliza kwa swali ni siri ya kufunga mauzo."
  },
  {
    type: "fill_blank",
    prompt: "Kamilisha fomula ya kujibu \"Bei Gani\":",
    sentence: "Unapoulizwa bei taja ___, eleza ___ kisha maliza na ___ ili mteja asikae kimya.",
    blanks: 3,
    options: [
      "bei",
      "thamani",
      "swali",
      "kimya",
      "kukataa"
    ],
    correct: ["bei", "thamani", "swali"],
    feedback: "Umeipata! Hii ndiyo fomula inayowarudisha wateja wengi kutaka kununua."
  }
];

// === Unit 3: Lesson 2 ('Nitafikiri') ===
data[0].units[2].lessons[1].blocks = [
  ...data[0].units[2].lessons[1].blocks.filter(b => b.type !== 'exercise' && b.type !== 'scenario' && b.type !== 'quiz'),
  {
    type: "scenario",
    label: "Mteja anaposema 'Sawa, nitafikiri' anataka kutoweka. Jinsi nzuri ya kujibu ni ipi?",
    setup: "Mjadala kwenye DM/WhatsApp:",
    chat: [
      { speaker: "Mteja", text: "Asante kwa maelezo. Nitafikiri kisha nitakutafuta.", side: "left" }
    ],
    options: [
      "Sawa, karibu tena.",
      "Usijali. Ili nikusaidie vizuri zaidi, huwa unapendelea bei iwe chini au ubora ndio tatizo kulingana na faida nilizokupa?",
      "Uongo, huna hela wewe."
    ],
    correct_index: 1,
    feedback: "Bora kabisa! Ukichimba kwa kuuliza maswali unajua tatizo la msingi lililomfanya asite (mara nyingi ni pesa, muda au hajiamini nalo)."
  }
];

// === Unit 3: Lesson 3 (M-Pesa Haraka) ===
data[0].units[2].lessons[2].blocks = [
  ...data[0].units[2].lessons[2].blocks.filter(b => b.type !== 'exercise' && b.type !== 'scenario' && b.type !== 'quiz' && b.type !== 'fill_blank'),
  {
    type: "fill_blank",
    prompt: "Kamilisha Mbinu Haraka ya M-Pesa",
    sentence: "Kamwe usimwache mteja atafute pesa bila kumpa ___. Mpe ___ na umwambie atume muamala fasta.",
    blanks: 2,
    options: [
      "mwongozo (call to action)",
      "namba yako ya Malipo",
      "picha mpya",
      "nafasi aende akapumzike"
    ],
    correct: ["mwongozo (call to action)", "namba yako ya Malipo"],
    feedback: "Ndiyo! Onyesha njia iliyonyooka ya kufanya malipo na ukishamtumia namba mkumbushe 'Nitajulishe baada ya kuweka oda yako'."
  },
  {
    type: "scenario",
    label: "Ni lipi ni hitimisho bora kwa kufunga mauzo?",
    setup: "Mwisho kabisa mwa maelezo, utamwambia nini mteja kufunga ahadi?",
    chat: [
      { speaker: "Mteja", text: "Sawa nimeamua kuchukua rangi nyekundu.", side: "left" }
    ],
    options: [
      "Sawa asante.",
      "Tuma pesa M-Pesa namba 075X XXX XXX (Jina lako), na nitume picha ya risiti nikuanzie safari yako sahihi hivi.",
      "Tutaongea kesho ukiweka pesa."
    ],
    correct_index: 1,
    feedback: "Safi! 'Call to Action' wazi huondoa uvivu kwa wateja walio na uhakika."
  }
];

fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2));
console.log("English language removed and updated with Swahili exercises with interactive patterns.");
