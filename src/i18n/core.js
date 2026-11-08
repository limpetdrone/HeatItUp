import { feedbackMessages } from './feedbackMessages';
import { featureMessages } from './featureMessages';
import { messages } from './messages';
import { cardMessages } from './cardMessages';
export const languages = ['en', 'hu', 'de'];
export const languageOptions = ['auto', ...languages];
export function resolveLanguage(preference, locales) {
  if (languages.includes(preference)) return preference;
  return locales.map(locale => String(locale).toLowerCase().split(/[-_]/)[0]).find(code => languages.includes(code)) || 'en';
}
const rows = [...messages, ...featureMessages, ...feedbackMessages, ...cardMessages];
const exact = new Map(rows.map(([hu, en, de]) => [hu, {
  hu,
  en,
  de
}]));
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = rows.filter(([hu]) => hu.includes('{')).map(([hu, en, de]) => ({
  regex: new RegExp('^' + hu.split(/\{\d+\}/).map(escape).join('(.+?)') + '$'),
  text: {
    hu,
    en,
    de
  }
}));
export function translate(value, language) {
  if (typeof value !== 'string' || !value.trim()) return value;
  const key = value.trim();
  let translated = exact.get(key)?.[language];
  if (!translated) for (const pattern of patterns) {
    const match = key.match(pattern.regex);
    if (match) {
      translated = pattern.text[language].replace(/\{(\d+)\}/g, (_, i) => translate(match[Number(i) + 1], language));
      break;
    }
  }
  if (!translated) return value;
  return value.slice(0, value.indexOf(key)) + translated + value.slice(value.indexOf(key) + key.length);
}

export function registerCardTranslations(cards) {for(const card of cards)if(card.translations)exact.set(card.text,{...card.translations});}
