import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

/**
 * Generates an expanded lesson based on the JSON outline.
 * Tries Gemini first, falls back to Groq if it fails.
 */
export async function generateLessonContent(context: { title: string, summary: string, example: string, exercise: string }): Promise<string> {
  const prompt = `
Create a beginner-friendly Swahili lesson for Tanzanian entrepreneurs using this knowledge block.

Knowledge Block:
Kichwa: ${context.title}
Muhtasari: ${context.summary}
Mfano: ${context.example}
Zoezi: ${context.exercise}

Requirements:
- simple Swahili
- practical examples
- mobile-friendly paragraphs
- explain difficult terms
- include quiz
- include exercise
  `;

  return executeAI(prompt, context);
}

/**
 * AI Tutor chat handler
 */
export async function chatWithTutor(history: { role: string, content: string }[], newMessage: string, lessonContext: string, fullLessonContent: string = ""): Promise<string> {
  const prompt = `
    Wewe ni Mama Maarifa, Mkufunzi Mkuu (Expert AI Tutor) kwenye programu ya "Ujuzi". Lugha yako ni Kiswahili fasaha na kilicho rafiki sana.
    Mwanafunzi anasoma mada hii (kama rejea): "${lessonContext}".
    
    Maudhui ya somo lake la sasa (kama yapo, tumia kama rejea akichangia kuhusu somo):
    """
    ${fullLessonContent.substring(0, 1500)}
    """

    Maelekezo yako muhimu:
    1. ELEWA SWALI KWANZA: Kama mwanafunzi anasalimia (mfano: "Hello", "Mambo", "Habari"), mjibu kwa ukaribu na kirafiki bila kumlazimishia maelezo marefu ya kozi. Unaweza kusema kwa ufupi tu k.m "Nzuri! Karibu, nikusaidie vipi leo?".
    2. KAMA SWALI HALIHUSIANI NA KOZI: Lijibu hilo swali kwa usahihi kwa uwezo wako wote kama mwalimu mwelewa. Sio lazima uliunganishe na kozi kama halina uhusiano wowote.
    3. KAMA SWALI LINAHUSIANA NA KOZI AU BIASHARA: Jibu kwa ufasaha wa hali ya juu na undani. Unganisha moja kwa moja na maudhui ya kozi kama inafaa.
    4. Tumia data halisi na uhalisia wa kibiashara sokoni panapohitajika (hasa soko la Tanzania na Afrika Mashariki, e.g., ushawishi wa TikTok, Instagram, WhatsApp).
    5. Zungumza asilia, usionekane kama roboti inayosoma skripti.
    
    Mazungumzo yaliyopita:
    ${history.map(h => `${h.role === 'user' ? 'Mwanafunzi' : 'Mwalimu'}: ${h.content}`).join('\n')}
    
    Swali Jipya la Mwanafunzi: ${newMessage}
    
    Jibu la Mwalimu:
  `;

  return executeAI(prompt, undefined, true);
}

async function executeAI(prompt: string, fallbackContext?: any, isChat: boolean = false): Promise<string> {
  // Try Groq first for faster response if Key is available
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (groqApiKey && groqApiKey !== 'YOUR_GROQ_API_KEY_HERE') {
    try {
      return await generateWithGroq(prompt);
    } catch (groqError) {
      console.warn('Groq failed, attempting Gemini...', groqError);
    }
  }

  try {
    // Fallback to Gemini if Groq skipped or failed
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    if (response.text) return response.text;
    throw new Error('Empty response from Gemini');
  } catch (error) {
    console.warn('Gemini failed:', error);
    
    // Hardcoded fallback if all AI APIs fail
    if (isChat) {
       return 'Kulingana na mada hii ya saikolojia ya wateja, nakushauri utumie mbinu ya kuelewa hisia zao badala ya kuuza tu bidhaa moja kwa moja, kama mfano wetu wa kwanza unavyoelekeza. Kila mteja anatafuta utatuzi wa tatizo lake.\n\n*(Kumbuka: Kuna changamoto kidogo ya mtandao kufikia severs zetu zote kwa sasa, lakini endelea kupitia mifano iliyopo kwenye somo, inasaidia sana!)*';
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

async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key is missing. Tafadhali weka VITE_GROQ_API_KEY kwenye .env file.');
  }
  
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Groq API error: ${res.status} ${errorDetails}`);
  }
  
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Samahani, nimeshindwa kuandaa jibu kwa sasa.';
}
