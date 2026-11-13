// TRANSLATE - turns English app text into Urdu (when Urdu is selected).
//
// HOW IT WORKS (beginner version):
//   1. All Urdu words live in ONE file:  src/shared/i18n/ur.json
//      It is a plain list:   "English text": "اردو متن"
//   2. Every <Text> in the app is our own Text component (components/AppText.js).
//      It looks the English text up in ur.json and shows the Urdu when Urdu is selected.
//      If a text is not in the file, the English is shown (nothing breaks).
//   3. Texts that contain a changing part use {curly} names:
//        "Delete {name}?": "{name} کو حذف کریں؟"
//      so "Delete Zara?" becomes "Zara کو حذف کریں؟" automatically.
//
// TO ADD A NEW TEXT: write it in English in your screen, then add one line to ur.json.
// (Texts that belong to ONE module go in that module's own file instead, e.g.
//  src/modules/english/i18n/ur.json - the module registers it with addTranslations below.)
//
// For things that are not <Text> (pop-up alerts, input placeholders) call
//   translate('Cancel')                    -> 'منسوخ کریں' in Urdu mode
//   translate('Hello {name}', { name })    -> fills the {name} part

import baseUr from './ur.json';

// The shared list + the lists of the modules (added by addTranslations).
const ur = { ...baseUr };

let currentLanguage = 'en';

// LanguageContext calls this whenever the language changes.
export function setCurrentLanguage(language) {
  currentLanguage = language;
}

export function getCurrentLanguage() {
  return currentLanguage;
}

// Turn the {name} keys of the list into patterns.
const patterns = [];
function buildPatterns() {
  patterns.length = 0;
  Object.keys(ur).forEach((key) => {
    if (!/\{\w+\}/.test(key)) return;
    const pieces = key.split(/\{(\w+)\}/); // text, name, text, name, ... text
    const names = [];
    let source = '^';
    pieces.forEach((piece, i) => {
      if (i % 2 === 0) source += piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      else {
        names.push(piece);
        source += '([\\s\\S]+?)';
      }
    });
    patterns.push({ regex: new RegExp(source + '$'), names, template: ur[key] });
  });
}
buildPatterns(); // once, when the app starts

// A module calls this to add its own Urdu words:  addTranslations(ur)
export function addTranslations(moreUrdu) {
  Object.assign(ur, moreUrdu);
  buildPatterns();
}

// "Hello {name}" + { name: 'Zara' } -> "Hello Zara"
function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, name) => (values[name] !== undefined ? String(values[name]) : match));
}

export function translate(text, params) {
  if (params) {
    const template = currentLanguage === 'ur' && ur[text] ? ur[text] : text;
    return fill(template, params);
  }
  if (currentLanguage !== 'ur' || typeof text !== 'string') return text;

  if (ur[text]) return ur[text];

  // Same text with spaces around it: translate the middle, keep the spaces.
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (ur[trimmed]) return text.replace(trimmed, () => ur[trimmed]);

  // Text with a changing part, e.g. "Delete Zara?"
  for (let i = 0; i < patterns.length; i++) {
    const match = trimmed.match(patterns[i].regex);
    if (match) {
      const values = {};
      patterns[i].names.forEach((name, n) => {
        // the changing part can itself be a known word, e.g. "3 days ago" / "Today"
        values[name] = translate(match[n + 1]);
      });
      return fill(patterns[i].template, values);
    }
  }
  return text;
}

// true when the text contains Urdu / Arabic letters
export function hasUrdu(text) {
  return typeof text === 'string' && /[\u0600-\u06FF]/.test(text);
}
