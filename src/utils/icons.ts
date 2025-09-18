import { DarkModeIcons, ExtendedHass, Icon, LightModeIcons } from "../const/common"

export function backgroundImageFallback(hass: ExtendedHass, image_url: string, fallback: Icon) {
  const _fallback: string = getIcon(hass, fallback);
  return `background-image: url(${image_url}), url(${_fallback})`
}

export function getFallbackImage(hass: ExtendedHass, fallback: Icon) {
  const _fallback: string = getIcon(hass, fallback);
  return `background-image: url(${_fallback})`
}

export function getIcon(hass: ExtendedHass, icon: Icon): string {
  if (!hass) {
    return LightModeIcons[icon];
  }
  /* eslint-disable-next-line @typescript-eslint/dot-notation */
  if (hass.themes['darkMode']) {
    return DarkModeIcons[icon];
  }
  return LightModeIcons[icon]
}