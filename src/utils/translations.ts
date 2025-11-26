import { ExtendedHass } from "../const/common.js";
import en from "../translations/en";
import nl from "../translations/nl";
import pt from "../translations/pt";
import fr from "../translations/fr";

const TRANSLATIONS = {
  en: en,
  nl: nl,
  pt: pt,
  fr: fr,
};
const DEFAULT_LANGUAGE = "en";
const DEFAULT_TRANSLATIONS = TRANSLATIONS.en;

export function getTranslation(key: string, hass: ExtendedHass) {
  const lang = hass?.language ?? DEFAULT_LANGUAGE;
  /* eslint-disable
    @typescript-eslint/no-unsafe-assignment,
  */
  const translations: Record<string, string | string[]> =
    TRANSLATIONS[lang] ?? (DEFAULT_TRANSLATIONS as Record<string, string | string[]>);
  const _default = DEFAULT_TRANSLATIONS[key] ?? key;
  return translations[key] ?? _default;
  /* eslint-enable
    @typescript-eslint/no-unsafe-assignment,
  */
}
