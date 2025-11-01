import { ExtendedHass } from '../const/common.js';
import en from '../translations/en'
import nl from '../translations/nl'
import pt from '../translations/pt'

const TRANSLATIONS = {
  en: en,
  nl: nl,
  pt: pt
}
const DEFAULT_LANGUAGE = 'en'
const DEFAULT_TRANSLATIONS = TRANSLATIONS.en;

export function getTranslation(key: string, hass: ExtendedHass) {
  const lang = hass?.language ?? DEFAULT_LANGUAGE;
  /* eslint-disable
    @typescript-eslint/no-unsafe-assignment,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-unsafe-return,
  */
  const translations: Record<string, any> = TRANSLATIONS[lang] ?? DEFAULT_TRANSLATIONS as Record<string, any>;
  const _default = DEFAULT_TRANSLATIONS[key] ?? key;
  return translations[key] ?? _default;
  /* eslint-enable
    @typescript-eslint/no-unsafe-assignment,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-unsafe-return,
  */
}

