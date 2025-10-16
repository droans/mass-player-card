import {
  DarkModeThumbnails,
  ExtendedHass,
  Thumbnail,
  LightModeThumbnails,
  MediaTypes
} from "../const/common";
import { Icons } from "../const/icons.js";
import { getSearchMediaButtons } from "../const/media-browser.js";

export async function asyncBackgroundImageFallback(hass: ExtendedHass, image_url: string, fallback: Thumbnail, download_local = true) {
  const _fallback: string = getThumbnail(hass, fallback);
  if (image_url.startsWith('http://') && download_local) {
    image_url = await getLocalImage(hass, image_url);
  }
  return `background-image: url(${image_url}), url(${_fallback})`
}
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

export async function encodeImageIfLocal(hass: ExtendedHass, image_url: string): Promise<string> {
  if (image_url.startsWith('https')) {
    return image_url;
  }
  return await getLocalImage(hass, image_url);

}

async function getLocalImage(hass: ExtendedHass, url: string): Promise<string> {
  try {
    const result: string = await hass.callWS(
      {
        type: 'mass_queue/download_and_encode_image',
        url: url
      }
    )
    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error getting image', e)
    return '';
  } 
}