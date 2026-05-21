import { ExtendedHass } from "../const/types";
import de from "../translations/de";
import en from "../translations/en";
import es from "../translations/es";
import fr from "../translations/fr";
import nl from "../translations/nl";
import pt from "../translations/pt";

const TRANSLATIONS = {
  de,
  en,
  es,
  fr,
  nl,
  pt,
};
const DEFAULT_LANGUAGE = "en";
const DEFAULT_TRANSLATIONS = TRANSLATIONS.en;

export function getTranslation(key: string, hass: ExtendedHass | undefined) {
  const lang = hass?.language ?? DEFAULT_LANGUAGE;
  /* eslint-disable
    @typescript-eslint/no-unsafe-assignment,
  */
  const translations: Record<string, string | string[]> =
    TRANSLATIONS[lang] ??
    (DEFAULT_TRANSLATIONS as Record<string, string | string[]>);
  const _default = DEFAULT_TRANSLATIONS[key] ?? key;
  return translations[key] ?? _default;
  /* eslint-enable
    @typescript-eslint/no-unsafe-assignment,
  */
}
