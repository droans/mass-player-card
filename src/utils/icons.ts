import {
  DarkModeIcons,
  ExtendedHass,
  Icon,
  LightModeIcons,
  MediaTypes
} from "../const/common";
import { SEARCH_MEDIA_TYPE_BUTTONS } from "../const/media-browser";

export function backgroundImageFallback(hass: ExtendedHass, image_url: string, fallback: Icon) {
  const _fallback: string = getIcon(hass, fallback);
  return `background-image: url(${image_url}), url(${_fallback})`
}

export function getFallbackBackgroundImage(hass: ExtendedHass, fallback: Icon) {
  const _fallback: string = getIcon(hass, fallback);
  return `background-image: url(${_fallback})`
}

export function getIcon(hass: ExtendedHass, icon: Icon): string {
  if (!hass) {
    return LightModeIcons[icon];
  }
  if (hass.themes.darkMode) {
    return DarkModeIcons[icon];
  }
  return LightModeIcons[icon]
}
export function getMediaTypeSvg(media_type: MediaTypes) {
  const data = SEARCH_MEDIA_TYPE_BUTTONS;
  const result = data.find(
    (item) => {
      return (item.option as MediaTypes) == media_type;
    }
  );
  return result?.icon ?? Icon.CLEFT;
}