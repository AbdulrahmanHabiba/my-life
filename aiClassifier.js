const GEMINI_FREE_API_KEY = ""; // ضع مفتاح Gemini المجاني هنا اختياري

export async function classifyUserInput(text) {
  const cleanText = text.trim();

  if (GEMINI_FREE_API_KEY && typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_FREE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `صنف هذه المهمة لقسم واحد فقط: (HSE, German, English, Quran, Adhkar, General). أرجع اسم القسم فقط. النص: "${cleanText}"` }] }]
          })
        }
      );
      const data = await response.json();
      const aiCategory = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (['HSE', 'German', 'English', 'Quran', 'Adhkar', 'General'].includes(aiCategory)) {
        return aiCategory;
      }
    } catch (e) {}
  }

  // تصنيف محلي أوفلاين سريع
  if (/سيفتي|سلامة|سقالات|hse|loto|تصريح|مخاطر/i.test(cleanText)) return 'HSE';
  if (/ألماني|الماني|german|كلمات ألماني/i.test(cleanText)) return 'German';
  if (/انجليزي|إنجليزي|english|محادثة/i.test(cleanText)) return 'English';
  if (/قرآن|قران|سورة|صفحة|ورد/i.test(cleanText)) return 'Quran';
  if (/أذكار|اذكار|تسبيح|سبحة/i.test(cleanText)) return 'Adhkar';

  return 'General';
}
