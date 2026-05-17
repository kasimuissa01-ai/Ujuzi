/**
 * AI logic refactored to use server-side endpoints for security.
 */

/**
 * Generates an expanded lesson based on the JSON outline.
 */
export async function generateLessonContent(
  context: { title: string, summary: string, example: string, exercise: string }
): Promise<string> {
  if (context.title.includes("Utambulisho")) {
    return JSON.stringify({
      "hook": "Kwa nini baadhi ya watu hununua bidhaa ghali… wakati kuna bidhaa za bei nafuu zinazofanya kazi ileile? Tofauti mara nyingi sio bidhaa. Ni utambulisho.",
      "realWorldProblem": {
        "context": "TikTok imebadilisha biashara nyingi Tanzania. Leo, watu hawauzi bidhaa tu. Wanauza: lifestyle, confidence, status, perception.",
        "example": "Identity ndiyo bidhaa halisi. Watu wengi hawasemi: 'Nataka viatu.' Kwa ndani zaidi wanasema: 'Nataka kuonekana smart. Nataka kuonekana modern. Nataka kuonekana successful.' Hapo ndipo identity marketing inaanza."
      },
      "visualComparison": {
        "weakBrandTitle": "Seller Mwingine Tu",
        "weakBrandPoints": ["Kurasa inauza viatu pekee", "Hakuna emotional connection"],
        "strongBrandTitle": "Identity Brand",
        "strongBrandPoints": ["Picha safi na branding nzuri", "Captions zenye confidence", "Packaging nzuri", "Ghafla bidhaa inaonekana 'premium'"]
      },
      "coreInsight": "Biashara zinazoshinda sokoni haziuzi bidhaa tu. Zinawafanya watu wajione sehemu ya kitu fulani. Identity hujenga emotional connection, na emotional connection hujenga loyalty.",
      "localExample": "Fikiria biashara ya soda. Pepsi hawauzi soda pekee. Wanauza: energy, youth culture, music, confidence. Ndiyo maana brand inaweza kuwa na nguvu kuliko bidhaa yenyewe.",
      "smartQuiz": {
        "question": "Biashara yako inawafanya watu wajioneje?",
        "optionA": "Kama mtu aliyenunua bidhaa tu",
        "optionB": "Kama mtu ambaye ni smart, professional, au modern",
        "explanation": "Watu hununua jinsi wanavyotaka kuonekana badala ya bidhaa tu."
      },
      "miniActionTask": "Fungua TikTok page yako, Instagram bio, au WhatsApp Business profile. Jiulize: 'Ukitoa bidhaa zote… identity gani bado inaonekana hapa?'",
      "reflectionBlock": "Watu wengi hununua hisia kabla ya kununua bidhaa. Brands kubwa zinaelewa hilo vizuri sana."
    });
  }

  const prompt = `
Generate a highly engaging, modern, and psychologically insightful lesson in Swahili based on this knowledge block.

Knowledge Block:
Kichwa: ${context.title}
Muhtasari: ${context.summary}
Mfano: ${context.example}
Zoezi: ${context.exercise}

CONTENT DESIGN RULES:
1. Tone: Modern, human, emotionally intelligent, concise, cinematic, psychologically insightful, mobile-first, premium, calm and confident.
2. Anti-patterns (DO NOT USE): Do NOT sound like school notes, a teacher speaking to students, motivational speeches, or generic AI. Avoid phrases like "Karibu wanafunzi...", "Leo tutajifunza...", or "Maana yake ni...".
3. Structure:
   - Hook: Start with curiosity or tension.
   - Real Local Example: Use modern African examples like TikTok businesses, WhatsApp sellers, M-Pesa.
   - Visual Comparison Block: Compare a weak vs strong approach.
   - Core Insight: The psychological or business truth behind it.
   - Local Example: Explain concept using African business behavior.
   - Mini Action Task: A very quick thing the user can do right now.
   - Smart Quiz: An applied thinking question (not a school quiz).
   - Reflection Block: A thought-provoking question to end on.

OUTPUT FORMAT:
You MUST output ONLY a valid RAW JSON object (no markdown wrapping, no \`\`\`json, just the JSON string).
Schema:
{
  "hook": "Kwa nini baadhi ya brands...",
  "realWorldProblem": {
    "context": "...",
    "example": "..."
  },
  "visualComparison": {
    "weakBrandTitle": "Brand Dhaifu",
    "weakBrandPoints": ["...", "..."],
    "strongBrandTitle": "Brand Imara",
    "strongBrandPoints": ["...", "..."]
  },
  "coreInsight": "...",
  "localExample": "...",
  "miniActionTask": "...",
  "smartQuiz": {
    "question": "...",
    "optionA": "...",
    "optionB": "...",
    "explanation": "..."
  },
  "reflectionBlock": "..."
}
  `;

  return executeAI(prompt, context, false, true);
}

/**
 * AI Tutor chat handler
 */
export async function chatWithTutor(history: { role: string, content: string }[], newMessage: string, lessonContext: string, fullLessonContent: string = ""): Promise<string> {
  const prompt = `
    Wewe ni Mama Maarifa, mwongoza njia (guide) mwenye hekima na ufahamu wa kisaikolojia katika ulimwengu wa biashara dijitali kwenye programu ya "Ujuzi". Lugha yako ni Kiswahili safi, cha kisasa, na cha kijanja kidogo.
    Sauti yako ni: modern, human, emotionally intelligent, concise, calm, and confident. Hujifanyi kama "mwalimu wa darasani" wala hutumii misemo ya kishule (k.m "Karibu mwanafunzi", "Leo tutajifunza"). Jibu kama mentor anayejua soko la sasa.

    Mwanafunzi anasoma mada hii: "${lessonContext}".
    
    Maudhui ya somo lake (kama yapo, tumia kama rejea akichangia kuhusu somo):
    """
    ${fullLessonContent.substring(0, 1500)}
    """

    Miongozo Yako (MUHIMU):
    1. ELEWA SWALI KWANZA: Kama mwanafunzi anasalimia, jibu cool na fupi: "Salama, vipi maendeleo? Nikusogeze vipi leo?".
    2. Jibu kwa ufupi, kwa mistari inayosomeka kirahisi kwenye simu. Usitoe maelezo marefu (long paragraphs) unless imeombwa.
    3. Tumia saikolojia na uhalisia wa mitaa ya mtandaoni (k.m WhatsApp sellers, TikTok, M-Pesa, ujasiriamali wa Kitanzania).
    4. Epuka vibe la "Motivation Speaker" - kuwa mtaalamu, mpole, mwelewa, na anayetoa deep insights badala ya kelele za kuhamasisha.
    
    Mazungumzo yaliyopita:
    ${history.map(h => `${h.role === 'user' ? 'Mtumiaji' : 'Mama Maarifa'}: ${h.content}`).join('\n')}
    
    Ujumbe Mpya wa Mtumiaji: ${newMessage}
    
    Jibu la Mama Maarifa:
  `;

  return executeAI(prompt, undefined, true);
}

async function executeAI(prompt: string, fallbackContext?: any, isChat: boolean = false, jsonMode: boolean = false): Promise<string> {
  try {
    // Try Server-side AI Endpoint
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, jsonMode })
    });

    if (!res.ok) {
       // Fallback to Groq server-side if Gemini fails
       const groqRes = await fetch('/api/ai/groq', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ prompt, jsonMode })
       });
       if (!groqRes.ok) throw new Error('Both AI endpoints failed');
       const groqData = await groqRes.json();
       return groqData.text;
    }

    const data = await res.json();
    return data.text;
  } catch (error) {
    console.warn('AI API failed:', error);
    
    // Hardcoded fallback if all AI APIs fail
    if (isChat) {
       return 'Kulingana na mada hii ya saikolojia ya wateja, nakushauri utumie mbinu ya kuelewa hisia zao badala ya kuuza tu bidhaa moja kwa moja, kama mfano letu wa kwanza unavyoelekeza. Kila mteja anatafuta utatuzi wa tatizo lake.\n\n*(Kumbuka: Kuna changamoto kidogo ya mtandao kufikia severs zetu zote kwa sasa, lakini endelea kupitia mifano iliyopo kwenye somo, inasaidia sana!)*';
    }
    
    return `
## ${fallbackContext?.title || "Somo Lako"}

${fallbackContext?.summary || ""}

### Kuelewa kwa Kina
Katika biashara, mambo mengi hubadilika, lakini jinsi binadamu wanavyofikiri mara nyingi hubaki vilevile. Somo hili linakufundisha mbinu rahisi ya kuelewa saikolojia hii.

**Mfano Uliorahisishwa:**
> ${fallbackContext?.example || "Thamani inazidi bei. Elezea kwanini unasaidia be simple."}

Tofauti ya kibiashara inaonekana wazi pale unapotumia mbinu hizi kwa usahihi badala ya kufanya kile ambacho kila mtu anafanya.

---

### Zoezi Lako La Leo
Tumia muda mchache kufanya hili zoezi kabla ya kuendelea:

*${fallbackContext?.exercise || "Fikiria ufumbuzi mmoja unaoweza kufanya leo kwenye biashara yako."}*

**Kumbuka:** Ujasiriamali unahitaji hatua, sio kusoma tu!
    `;
  }
}
