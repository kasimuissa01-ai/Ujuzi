import fs from 'fs';

const coursesPath = 'src/data/courses.json';
const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

const unit3 = data[0].units[2];

unit3.lessons[0].blocks = unit3.lessons[0].blocks.filter(b => b.prompt !== "Ikiwa mteja ameuliza bei na ukamjibu, kisha akakaa kimya (seen), kosa kubwa hapo linaweza kuwa lipi?" && b.prompt !== "Siri kuu ya kujibu 'Bei Gani?'" && b.prompt !== "Oanisha njia za kujibu wateja na matokeo yake:");

unit3.lessons[0].blocks.push(
  {
    type: "quiz",
    question: "Ikiwa mteja ameuliza bei na ukamjibu, kisha akakaa kimya (seen), kosa kubwa hapo linaweza kuwa lipi?",
    options: [
      "Kutaja bei bila kufafanua thamani au kuuliza swali mwishoni",
      "Kutaja bei kubwa sana ambayo hawezi kumudu",
      "Kutumia namba nyingi kwenye ujumbe moja"
    ],
    correct_index: 0,
    feedback: "Sahihi! Ukijibu namba peke yake (mfano '45,000'), mazungumzo yanafungwa. Maliza na swali ili aendelee kuongea."
  },
  {
    type: "cloze",
    prompt: "Siri kuu ya kujibu 'Bei Gani?'",
    sentence_with_blank: "Baada ya kuweka bei, lazima uunganishe thamani ya bidhaa na kumaliza kwa {blank} ili kuendeleza mazungumzo.",
    options: [
      "swali",
      "ahsante",
      "kumuaga"
    ],
    correct: "swali",
    feedback: "Inapendeza! Swali linarudisha jukumu kwa mteja la kujibu (k.m. 'Tukufungie rangi ipi?')."
  },
  {
    type: "match",
    prompt: "Oanisha njia za kujibu wateja na matokeo yake:",
    pairs: [
      { left: "Kujibu 'Tsh 45,000' tu", right: "Mteja anakaa kimya (Seen)" },
      { left: "Kujibu bei + Thamani + Swali", right: "Mteja anaendeleza mazungumzo" }
    ],
    feedback: "Hakika! Kutengeneza mazungumzo kunakuweka hatua moja karibu kufunga mauzo."
  }
);


unit3.lessons[1].blocks = unit3.lessons[1].blocks.filter(b => b.question !== "Mteja anapokwambia 'Nitaifikiria kisha nitarudi', hii inamaanisha nini hasa kwa asilimia kubwa?" && b.prompt !== "Nini wateja wanahitaji kabla ya kufanya maamuzi?" && b.prompt !== "Kamilisha kauli ya kumrudisha mteja mchezoni:");

unit3.lessons[1].blocks.push(
  {
    type: "quiz",
    question: "Mteja anapokwambia 'Nitaifikiria kisha nitarudi', hii inamaanisha nini hasa kwa asilimia kubwa?",
    options: [
      "Anakwenda benki kutoa pesa",
      "Sijashawishika vizuri au nina tatizo (kama bei/muda) ambalo sijasema wazi",
      "Atafikiria na atarudi kesho kununua hakika"
    ],
    correct_index: 1,
    feedback: "Ndiyo! Usikubali 'Nitafikiri' kama jibu la mwisho, chimba kujua ni nini hasa kinamzuia ili umsaidie vizuri."
  },
  {
    type: "cloze",
    prompt: "Nini wateja wanahitaji kabla ya kufanya maamuzi?",
    sentence_with_blank: "Kuuliza maswali zaidi baada ya 'Nitafikiri' inakusaidia kugundua {blank} kinachomkwamisha mteja.",
    options: [
      "kikwazo (pingamizi)",
      "kujifurahisha",
      "kutoweka"
    ],
    correct: "kikwazo (pingamizi)",
    feedback: "Vizuri! Huenda ni ukosefu wa bajeti kwa sasa, au labda hajui kama bidhaa itamfaa vizuri. Kujua kikwazo kunaongeza nafasi yako ya kutatua hilo tatizo na kuuza."
  },
  {
    type: "fill_blank",
    prompt: "Kamilisha kauli ya kumrudisha mteja mchezoni:",
    sentence: "Mteja akisema 'Nitafikiri', mjibu 'Sawa, ili niweze kukusaidia vizuri zaidi, huwa unapendelea ___ au ___ ndio tatizo kulingana na faida nilizokupa?'",
    blanks: 2,
    options: [
      "bei iwe chini",
      "ubora",
      "kimya",
      "kwenda"
    ],
    correct: ["bei iwe chini", "ubora"],
    feedback: "Chap sana! Hasa katika maduka madogo, kumruhusu aseme ukweli inamhakikishia akujibu kuliko kupotea kimya."
  }
);


unit3.lessons[2].blocks = unit3.lessons[2].blocks.filter(b => b.question !== "Kwa nini ni hatari kumwacha mteja peke yake mpaka aamue yeye kutafuta pesa na kutuma?" && b.prompt !== "Malizia kauli kuu unayoitoa sekunde ya mwisho:" && b.prompt !== "Oanisha kauli inayoachia mteja hiyari na inayoleta M-Pesa mapema:");

unit3.lessons[2].blocks.push(
  {
    type: "quiz",
    question: "Kwa nini ni hatari kumwacha mteja peke yake mpaka aamue yeye kutafuta pesa na kutuma?",
    options: [
      "Sio hatari, atatuma tu maana kanuia",
      "Nia inaweza kupotea, akiingia mitandaoni atapata kuvutiwa na vitu vingine au kusahaulia kule",
      "Sababu mitandao ipo na kasi ndogo"
    ],
    correct_index: 1,
    feedback: "Haswa! Mnunuzi mtandaoni anahitaji msukumo na njia iliyo wazi wakati huo huo wa hisia kali anapohitaji mzigo."
  },
  {
    type: "cloze",
    prompt: "Malizia kauli kuu unayoitoa sekunde ya mwisho:",
    sentence_with_blank: "Ili ufunge haraka, mwambie mteja kwa ujasiri, 'Tuma malipo kupitia {blank} namba 07...' kisha mfafanulie hatua inayo fuata.",
    options: [
      "M-Pesa / TigoPesa",
      "muda utakao kuwa nao",
      "subira mpaka kesho"
    ],
    correct: "M-Pesa / TigoPesa",
    feedback: "Vizuri! Hii inatoa Mwongozo Maalumu (Call to Action). Unamtengenezea mazingira ya kuwa akituma malipo usafiri unaanza mara moja."
  },
  {
    type: "match",
    prompt: "Oanisha kauli inayoachia mteja hiyari na inayoleta M-Pesa mapema:",
    pairs: [
      { left: "\"Tutaongea kesho ukiwa tayari\"", right: "Inapoteza hisia ya kununua haraka" },
      { left: "\"Kamilisha M-Pesa hii [namba], mzigo uanze safari sasa hivi\"", right: "Mwongozo kamili (Call to Action)" }
    ],
    feedback: "Hakuna mjadala hapo! Ujasiri katika kufunga mauzo unaonyesha wewe ni mtaalamu."
  }
);

fs.writeFileSync(coursesPath, JSON.stringify(data, null, 2));
console.log('Unit 3 updated with new Mimo-style interactive exercises!');
