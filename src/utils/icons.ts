import { HomeAssistant } from "custom-card-helpers"
import { DarkModeIcons, Icon, LightModeIcons } from "../const/common"

export function backgroundImageFallback(hass: HomeAssistant, image_url: string, fallback: Icon) {
  const _fallback: string = getIcon(hass, fallback);
  return `background-image: url(${image_url}), url(${_fallback})`
}

export function getFallbackImage(hass: HomeAssistant, fallback: Icon) {
  const _fallback: string = getIcon(hass, fallback);
  return `background-image: url(${_fallback})`
}

export function getIcon(hass: HomeAssistant, icon: Icon): string {
  if (!hass) {
    return LightModeIcons[icon];
  }
  /* eslint-disable-next-line @typescript-eslint/dot-notation */
  if (hass.themes['darkMode']) {
    return DarkModeIcons[icon];
  }
  return LightModeIcons[icon]
}