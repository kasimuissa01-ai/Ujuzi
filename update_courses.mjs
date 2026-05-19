import fs from 'fs';

const existingPath = './src/data/courses.json';
const existingData = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));

const newData = [
  {
    "course_id": "biashara_mtandaoni_001",
    "course_title": "Biashara Mtandaoni kwa SMEs Tanzania",
    "category": "Digital Skills",
    "language": "Swahili",
    "level": "beginner",
    "xp_total": 1500,
    "estimated_minutes": 150,
    "units": [
      {
        "unit_id": 1,
        "unit_title": "Jenga Msingi Imara",
        "unit_icon": "🏗️",
        "description": "Jifunze misingi muhimu ya kuanzisha na kuendesha biashara yako mtandaoni kwa mafanikio.",
        "lessons": [
          {
            "lesson_id": 101,
            "title": "Biashara Yako Mtandaoni Ni Nini?",
            "xp": 50,
            "duration_min": 5,
            "mission": "Eleza biashara yako mtandaoni kwa sentensi moja.",
            "blocks": [
              {
                "type": "story",
                "character": "Neema, Mjasiriamali wa Nguo",
                "content": "Neema alikuwa anauza nguo dukani kwake Kariakoo. Aliamua kuweka picha za nguo zake WhatsApp na Instagram. Ghafla, wateja walianza kumuuliza bei na jinsi ya kununua. Hiyo ndio ilikuwa mwanzo wa biashara yake mtandaoni!"
              },
              {
                "type": "text",
                "content": "**Biashara mtandaoni** ni kuuza bidhaa au huduma zako kwa kutumia intaneti. Hii inaweza kuwa kupitia mitandao ya kijamii, tovuti, au hata WhatsApp."
              },
              {
                "type": "tip",
                "content": "Sio lazima uwe na tovuti kubwa kuanza. Unaweza kuanza na ukurasa wa Instagram au WhatsApp Business!"
              },
              {
                "type": "cloze",
                "prompt": "Biashara mtandaoni inahusisha kuuza bidhaa au huduma kwa kutumia ________.",
                "sentence_with_blank": "Biashara mtandaoni inahusisha kuuza bidhaa au huduma kwa kutumia {blank}.",
                "options": [
                  "Duka la kawaida",
                  "Intaneti",
                  "Simu ya mkononi tu"
                ],
                "correct": "Intaneti",
                "feedback": "Sahihi! Intaneti ndio uwanja mkuu wa biashara mtandaoni."
              },
              {
                "type": "quiz",
                "question": "Ni ipi SIYO njia ya kufanya biashara mtandaoni?",
                "options": [
                  "Kuuza kupitia Instagram",
                  "Kuuza bidhaa sokoni kila siku",
                  "Kutumia WhatsApp Business"
                ],
                "correct_index": 1,
                "feedback": "Kuuza bidhaa sokoni kila siku ni biashara ya kawaida, sio mtandaoni."
              }
            ]
          },
          {
            "lesson_id": 102,
            "title": "Kwanini Biashara Yako Inahitaji Kuwa Mtandaoni?",
            "xp": 50,
            "duration_min": 5,
            "mission": "Taja faida mbili za kuwa na biashara mtandaoni.",
            "blocks": [
              {
                "type": "text",
                "content": "Ulimwengu unabadilika, na wateja wako wengi wapo mtandaoni. Kuwa na biashara mtandaoni kunakupa fursa ya kufikia wateja wengi zaidi na kuongeza mauzo."
              },
              {
                "type": "image_ab",
                "label": "Ni picha ipi inaonyesha faida ya biashara mtandaoni?",
                "option_a": {
                  "src": "https://example.com/image_duka_ndogo.png",
                  "label": "Duka dogo la mtaani"
                },
                "option_b": {
                  "src": "https://example.com/image_mtandaoni_wateja_wengi.png",
                  "label": "Wateja wengi kutoka sehemu mbalimbali"
                },
                "correct": "B",
                "feedback_correct": "Kabisa! Biashara mtandaoni inakufungulia milango ya kufikia wateja wengi zaidi bila mipaka ya kijiografia.",
                "feedback_wrong": "Fikiria tena. Duka la mtaani linafika wateja wachache kuliko biashara mtandaoni."
              },
              {
                "type": "tip",
                "content": "Biashara mtandaoni haina mipaka ya saa wala eneo. Mteja anaweza kununua bidhaa zako hata usiku wa manane!"
              },
              {
                "type": "match",
                "prompt": "Oanisha faida na maelezo yake:",
                "pairs": [
                  {
                    "left": "Fikia Wateja Wengi",
                    "right": "Uza bidhaa zako nchi nzima au hata nje ya nchi."
                  },
                  {
                    "left": "Gharama Nafuu",
                    "right": "Punguza kodi ya pango na gharama za wafanyakazi wengi."
                  }
                ],
                "feedback": "Vizuri sana! Hizi ndizo faida kuu za biashara mtandaoni."
              },
              {
                "type": "quiz",
                "question": "Ni ipi kati ya hizi SIYO faida ya biashara mtandaoni?",
                "options": [
                  "Kufikia wateja wengi zaidi",
                  "Kupunguza gharama za uendeshaji",
                  "Kuhitaji duka kubwa la kifahari"
                ],
                "correct_index": 2,
                "feedback": "Biashara mtandaoni haihitaji duka kubwa la kifahari, inakusaidia kupunguza gharama."
              }
            ]
          }
        ]
      },
      {
        "unit_id": 2,
        "unit_title": "Kuvutia Wateja Kwenye Mtandao",
        "unit_icon": " magnet",
        "description": "Jifunze mbinu za kuvutia wateja wapya na kuwafanya wanunue bidhaa zako mtandaoni.",
        "lessons": [
          {
            "lesson_id": 201,
            "title": "Bio Yako Ni Sumaku ya Wateja",
            "xp": 70,
            "duration_min": 5,
            "mission": "Boresha Bio yako ya Instagram/WhatsApp ili ivutie wateja wapya.",
            "blocks": [
              {
                "type": "story",
                "character": "Juma, Mjasiriamali wa Vyakula",
                "content": "Juma alikuwa anauza pilau mtandaoni. Bio yake ilikuwa 'Juma's Pilau'. Baada ya kujifunza, aliibadilisha kuwa 'Pilau Tamu za Kiswahili Dar es Salaam 🍛 Agiza WhatsApp 07XX-XXX-XXX'. Mauzo yake yaliongezeka mara mbili!"
              },
              {
                "type": "text",
                "content": "**Bio** yako kwenye mitandao ya kijamii ni kama kibao cha tangazo cha duka lako. Inapaswa kuwa wazi, fupi, na kuvutia. Mteja akiona Bio yako, ajue unauza nini, uko wapi, na jinsi ya kukupata."
              },
              {
                "type": "tip",
                "content": "Tumia emoji zinazohusiana na biashara yako. Zinafanya Bio yako ionekane hai na rahisi kusoma."
              },
              {
                "type": "insta_bio",
                "prompt": "Jaza Bio hii ili ivutie wateja kwa biashara ya kuuza keki:",
                "blanks": 3,
                "options": [
                  "Keki Tamu za Harusi na Sherehe",
                  "Tunapatikana Mbezi Beach",
                  "Agiza WhatsApp 07XX-XXX-XXX",
                  "Mimi ni mpishi",
                  "Keki tu"
                ],
                "correct": [
                  "Keki Tamu za Harusi na Sherehe",
                  "Tunapatikana Mbezi Beach",
                  "Agiza WhatsApp 07XX-XXX-XXX"
                ],
                "feedback": "Hongera! Bio hii inatoa taarifa zote muhimu kwa mteja anayetaka keki."
              },
              {
                "type": "quiz",
                "question": "Ni taarifa gani muhimu inapaswa kuwepo kwenye Bio yako?",
                "options": [
                  "Jina la rafiki yako",
                  "Unauza nini, uko wapi, na namba ya simu",
                  "Historia ndefu ya biashara yako"
                ],
                "correct_index": 1,
                "feedback": "Sahihi! Wateja wanahitaji kujua unauza nini, uko wapi, na jinsi ya kukuwasiliana."
              }
            ]
          },
          {
            "lesson_id": 202,
            "title": "Picha na Video Zinazouza",
            "xp": 70,
            "duration_min": 5,
            "mission": "Piga picha 3 za bidhaa zako zinazovutia na uziweke mtandaoni.",
            "blocks": [
              {
                "type": "text",
                "content": "Picha na video ni 'macho' ya biashara yako mtandaoni. Picha nzuri huvutia wateja, picha mbaya huwafukuza. Hakikisha bidhaa zako zinaonekana vizuri na kuvutia."
              },
              {
                "type": "image_ab",
                "label": "Ni picha ipi itavutia wateja zaidi kununua keki?",
                "option_a": {
                  "src": "https://example.com/keki_mbaya.png",
                  "label": "Keki iliyopigwa picha gizani na simu ya zamani."
                },
                "option_b": {
                  "src": "https://example.com/keki_nzuri.png",
                  "label": "Keki iliyopigwa picha mwangani na mapambo mazuri."
                },
                "correct": "B",
                "feedback_correct": "Picha B inaonyesha keki kwa uzuri wake wote! Wateja hununua kwa macho kwanza.",
                "feedback_wrong": "Picha A haionyeshi ubora wa keki. Hakikisha picha zako zinavutia."
              },
              {
                "type": "tip",
                "content": "Tumia mwanga wa asili (jua) kupiga picha. Epuka flash ya simu, inaweza kuharibu picha."
              },
              {
                "type": "drag_drop",
                "prompt": "Panga hatua za kupiga picha nzuri ya bidhaa:",
                "items": [
                  {
                    "id": "1",
                    "text": "Andaa bidhaa vizuri"
                  },
                  {
                    "id": "2",
                    "text": "Tafuta sehemu yenye mwanga mzuri"
                  },
                  {
                    "id": "3",
                    "text": "Piga picha kutoka pembe tofauti"
                  },
                  {
                    "id": "4",
                    "text": "Hariri picha kidogo (contrast, brightness)"
                  }
                ],
                "correct_order": [
                  "1",
                  "2",
                  "3",
                  "4"
                ],
                "feedback": "Hatua sahihi! Kufuata hatua hizi kutakupa picha bora."
              },
              {
                "type": "quiz",
                "question": "Kwanini video fupi ni muhimu kwa biashara mtandaoni?",
                "options": [
                  "Hazitumii data nyingi",
                  "Zinaonyesha bidhaa ikitumika na kujenga uhusiano",
                  "Ni rahisi kutengeneza"
                ],
                "correct_index": 1,
                "feedback": "Video zinaonyesha uhai wa bidhaa na husaidia wateja kuelewa zaidi."
              }
            ]
          }
        ]
      },
      {
        "unit_id": 3,
        "unit_title": "Kufunga Mauzo na Kudumisha Wateja",
        "unit_icon": "🤝",
        "description": "Jifunze jinsi ya kubadili wateja wanaovutiwa kuwa wanunuzi na kuwafanya warudi tena.",
        "lessons": [
          {
            "lesson_id": 301,
            "title": "Jinsi ya Kujibu Ujumbe wa Mteja",
            "xp": 80,
            "duration_min": 5,
            "mission": "Andika majibu mawili tofauti kwa mteja anayeuliza bei ya bidhaa yako.",
            "blocks": [
              {
                "type": "story",
                "character": "Aisha, Muuzaji wa Vitenge",
                "content": "Aisha alikuwa anapoteza wateja wengi WhatsApp kwa sababu alikuwa anajibu 'Bei ni 20,000'. Baada ya kujifunza kujibu kwa ukarimu na kutoa maelezo zaidi, wateja wake walianza kununua zaidi na hata kurejea!"
              },
              {
                "type": "text",
                "content": "Kujibu ujumbe wa mteja haraka na kwa ukarimu ni muhimu sana. Usijibu tu bei, toa maelezo zaidi, muulize maswali, na msaidie kufanya uamuzi."
              },
              {
                "type": "tip",
                "content": "Jibu maswali yote ya mteja kwa uvumilivu. Hata kama ameuliza swali lilelile mara nyingi, kumbuka yeye ndiye mfalme!"
              },
              {
                "type": "scenario",
                "label": "Chagua jibu bora kwa mteja anayeuliza 'Bei ya keki ni ngapi?'",
                "setup": "Mteja: 'Habari, bei ya keki ni ngapi?'",
                "chat": [
                  {
                    "side": "right",
                    "speaker": "Mteja",
                    "text": "Habari, bei ya keki ni ngapi?"
                  }
                ],
                "options": [
                  "Bei ni 30,000.",
                  "Habari! Keki zetu zinaanzia 30,000 kutegemea na ukubwa na muundo. Ungependa keki ya aina gani au kwa tukio gani?"
                ],
                "correct_index": 1,
                "feedback": "Jibu la pili linajenga mazungumzo na kumsaidia mteja kupata kile anachotaka. Safi!"
              },
              {
                "type": "quiz",
                "question": "Kwanini ni muhimu kujibu ujumbe wa mteja haraka?",
                "options": [
                  "Ili asikimbilie kwa mshindani wako",
                  "Ili umalize kazi haraka",
                  "Ili aone una simu nzuri"
                ],
                "correct_index": 0,
                "feedback": "Wateja wa mtandaoni wanapenda huduma ya haraka. Usipojibu, anaenda kwingine."
              }
            ]
          },
          {
            "lesson_id": 302,
            "title": "Kufunga Mauzo na Kufanya Mteja Arudi",
            "xp": 80,
            "duration_min": 5,
            "mission": "Taja njia mbili za kumfanya mteja arudi kununua kwako.",
            "blocks": [
              {
                "type": "text",
                "content": "Baada ya mteja kuonyesha nia, unahitaji kumsaidia kufanya uamuzi wa kununua. Na baada ya kununua, unataka arudi tena!"
              },
              {
                "type": "tip",
                "content": "Toa ofa ndogo au punguzo kwa wateja wako waaminifu. Watasikia wanathaminiwa na watarudi!"
              },
              {
                "type": "cloze",
                "prompt": "Baada ya mteja kununua, ni muhimu kumwomba ________.",
                "sentence_with_blank": "Baada ya mteja kununua, ni muhimu kumwomba {blank}.",
                "options": [
                  "Pesa zaidi",
                  "Maoni (feedback)",
                  "Asikusumbue tena"
                ],
                "correct": "Maoni (feedback)",
                "feedback": "Maoni ya mteja yanakusaidia kuboresha huduma na bidhaa zako."
              },
              {
                "type": "match",
                "prompt": "Oanisha mbinu za kufunga mauzo na maelezo yake:",
                "pairs": [
                  {
                    "left": "Toa ofa maalum",
                    "right": "Mteja anahisi anapata kitu cha ziada."
                  },
                  {
                    "left": "Jibu maswali yote",
                    "right": "Ondoa mashaka yote ya mteja."
                  }
                ],
                "feedback": "Hizi ni mbinu muhimu za kufunga mauzo kwa ufanisi."
              },
              {
                "type": "quiz",
                "question": "Ni ipi njia bora ya kumfanya mteja arudi kununua kwako?",
                "options": [
                  "Kumpuuza baada ya mauzo ya kwanza",
                  "Kumpa huduma bora na kumfuatilia kwa ofa mpya",
                  "Kumuongezea bei kila anaporudi"
                ],
                "correct_index": 1,
                "feedback": "Huduma bora na ofa maalum huwafanya wateja kuwa waaminifu na kurejea."
              }
            ]
          }
        ]
      }
    ]
  }
];

const courseExists = existingData.find(c => c.course_id === newData[0].course_id);
if (!courseExists) {
  existingData.push(newData[0]);
  fs.writeFileSync(existingPath, JSON.stringify(existingData, null, 2));
  console.log("Course added successfully.");
} else {
  console.log("Course already exists.");
}
