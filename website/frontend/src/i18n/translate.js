// TRANSLATE - English / اردو for the website, the same rules as the mobile app (src/shared/i18n/translate.js).
//
//   translate('Log In')                          -> 'لاگ ان' in Urdu, unchanged in English
//   translate('Delete {name}?', { name: 'Zara' }) -> fills in the {name}
//   translate('Delete Zara?')                    -> also works: matched against the {name} patterns
//
// ur.json is the mobile app's shared + English-module Urdu, merged. Add new website words to it.

import ur from './ur.json';

let currentLanguage = 'en';

export function setCurrentLanguage(language) {
  currentLanguage = language === 'ur' ? 'ur' : 'en';
}

export function getCurrentLanguage() {
  return currentLanguage;
}

const patterns = Object.keys(ur)
  .filter((key) => /\{\w+\}/.test(key))
  .map((key) => {
    const pieces = key.split(/\{(\w+)\}/);
    const names = [];
    let source = '^';
    pieces.forEach((piece, i) => {
      if (i % 2 === 0) source += piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      else {
        names.push(piece);
        source += '([\\s\\S]+?)';
      }
    });
    return { regex: new RegExp(source + '$'), names, template: ur[key] };
  });

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
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (ur[trimmed]) return text.replace(trimmed, () => ur[trimmed]);
  for (const pattern of patterns) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const values = {};
      pattern.names.forEach((name, n) => {
        values[name] = translate(match[n + 1]);
      });
      return fill(pattern.template, values);
    }
  }
  return text;
}
