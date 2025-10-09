import {
  DarkModeThumbnails,
  ExtendedHass,
  Thumbnail,
  LightModeThumbnails,
  MediaTypes
} from "../const/common";
import { Icons } from "../const/icons.js";
import { getSearchMediaButtons } from "../const/media-browser.js";

export function backgroundImageFallback(hass: ExtendedHass, image_url: string, fallback: Thumbnail) {
  const _fallback: string = getThumbnail(hass, fallback);
  return `background-image: url(${image_url}), url(${_fallback})`
}

export function getFallbackBackgroundImage(hass: ExtendedHass, fallback: Thumbnail) {
  const _fallback: string = getThumbnail(hass, fallback);
  return `background-image: url(${_fallback})`
}

export function getThumbnail(hass: ExtendedHass, thumbnail: Thumbnail): string {
  if (!hass) {
    return LightModeThumbnails[thumbnail];
  }
  if (hass.themes.darkMode) {
    return DarkModeThumbnails[thumbnail];
  }
  return LightModeThumbnails[thumbnail]
}
export function getMediaTypeSvg(media_type: MediaTypes, icons: Icons) {
  const data = getSearchMediaButtons(icons);
  const result = data.find(
    (item) => {
      return (item.option as MediaTypes) == media_type;
    }
  );
  return result?.icon ?? Thumbnail.CLEFT;
}