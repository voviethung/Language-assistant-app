/**
 * Phrasebook — scenario-based predefined translations
 * Covers common travel / factory / conference phrases.
 * Add more entries per use case.
 */

type Entry = {
  text: string;
  source: string;
  target: string;
  translation: string;
};

const entries: Entry[] = [
  // EN → VI
  {text: 'Where is the bathroom?', source: 'en', target: 'vi', translation: 'Nhà vệ sinh ở đâu?'},
  {text: 'How much does this cost?', source: 'en', target: 'vi', translation: 'Cái này giá bao nhiêu?'},
  {text: 'Please speak slowly.', source: 'en', target: 'vi', translation: 'Làm ơn nói chậm thôi.'},
  {text: 'I need help.', source: 'en', target: 'vi', translation: 'Tôi cần giúp đỡ.'},
  {text: 'Call an ambulance.', source: 'en', target: 'vi', translation: 'Gọi xe cấp cứu đi.'},
  {text: 'Stop the machine.', source: 'en', target: 'vi', translation: 'Dừng máy lại.'},
  {text: 'This is an emergency.', source: 'en', target: 'vi', translation: 'Đây là tình huống khẩn cấp.'},
  {text: 'Where is the exit?', source: 'en', target: 'vi', translation: 'Lối ra ở đâu?'},

  // VI → EN
  {text: 'Nhà vệ sinh ở đâu?', source: 'vi', target: 'en', translation: 'Where is the bathroom?'},
  {text: 'Tôi cần giúp đỡ.', source: 'vi', target: 'en', translation: 'I need help.'},
  {text: 'Dừng máy lại.', source: 'vi', target: 'en', translation: 'Stop the machine.'},

  // EN → ZH
  {text: 'Where is the bathroom?', source: 'en', target: 'zh', translation: '洗手间在哪里？'},
  {text: 'I need help.', source: 'en', target: 'zh', translation: '我需要帮助。'},
  {text: 'Call an ambulance.', source: 'en', target: 'zh', translation: '请叫救护车。'},

  // EN → JA
  {text: 'Where is the bathroom?', source: 'en', target: 'ja', translation: 'お手洗いはどこですか？'},
  {text: 'I need help.', source: 'en', target: 'ja', translation: '助けてください。'},

  // EN → KO
  {text: 'Where is the bathroom?', source: 'en', target: 'ko', translation: '화장실이 어디에 있나요?'},
  {text: 'I need help.', source: 'en', target: 'ko', translation: '도움이 필요합니다.'},
];

// Normalized lookup map
const map = new Map<string, string>();
for (const e of entries) {
  map.set(_key(e.text, e.source, e.target), e.translation);
}

function _key(text: string, source: string, target: string) {
  return `${source}:${target}:${text.trim().toLowerCase()}`;
}

export const phrasebook = {
  find(text: string, source: string, target: string): string | null {
    return map.get(_key(text, source, target)) ?? null;
  },

  all(): Entry[] {
    return entries;
  },
};
