import builtinContent from './builtinCards.json';
import { validateContent } from '../domain/content';
import { registerCardTranslations } from '../i18n/core';

function loadBuiltinCards() {
  const result = validateContent(builtinContent);
  if (!result.ok) throw new Error(`Invalid built-in card content: ${result.error}`);
  return result.cards;
}

/** Built-in cards, normalized through the same validator as imported content. */
export const cards = loadBuiltinCards();
registerCardTranslations(cards);
