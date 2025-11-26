import {
  DarkModeThumbnails,
  ExtendedHass,
  Thumbnail,
  LightModeThumbnails,
  MediaTypes,
} from "../const/common";
import { Icons } from "../const/icons.js";
import { getSearchMediaButtons } from "../const/media-browser.js";

export interface ImageURLWithFallback {
  image_url: string;
  fallback_url: string;
}

export async function asyncImageURLWithFallback(
  hass: ExtendedHass,
  image_url: string,
  fallback: string,
  download_local = true
): Promise<ImageURLWithFallback> {
  if (Object.values(Thumbnail).includes(fallback as Thumbnail)) {
    fallback = getThumbnail(hass, fallback as Thumbnail);
  }
  if (download_local) {
    image_url = await encodeImageIfLocal(hass, image_url);
  };
  return {
    image_url: image_url,
    fallback_url: fallback
  }
}

export async function asyncBackgroundImageFallback(
  hass: ExtendedHass,
  image_url: string,
  fallback: Thumbnail,
  download_local = true
) {
  const image = await asyncImageURLWithFallback(
    hass,
    image_url,
    fallback,
    download_local
  )
  return `background-image: url(${image.image_url}), url(${image.fallback_url})`;
}

export function backgroundImageFallback(
  hass: ExtendedHass,
  image_url: string,
  fallback: Thumbnail,
) {
  const _fallback: string = getThumbnail(hass, fallback);
  return `background-image: url(${image_url}), url(${_fallback})`;
}

export function getFallbackBackgroundImage(
  hass: ExtendedHass,
  fallback: Thumbnail,
) {
  const _fallback: string = getThumbnail(hass, fallback);
  return `background-image: url(${_fallback})`;
}

export function getThumbnail(hass: ExtendedHass, thumbnail: Thumbnail): string {
  if (!hass) {
    return LightModeThumbnails[thumbnail];
  }
  if (hass.themes.darkMode) {
    return DarkModeThumbnails[thumbnail];
  }
  return LightModeThumbnails[thumbnail];
}
export function getMediaTypeSvg(
  media_type: MediaTypes,
  icons: Icons,
  hass: ExtendedHass,
) {
  const data = getSearchMediaButtons(icons, hass);
  const result = data.find((item) => {
    return (item.option as MediaTypes) == media_type;
  });
  return result?.icon ?? Thumbnail.CLEFT;
}

export async function encodeImageIfLocal(
  hass: ExtendedHass,
  image_url: string,
): Promise<string> {
  if (image_url.startsWith("https") || image_url.startsWith('/api') || image_url.startsWith('data:')) {
    return image_url;
  }
  return await getLocalImage(hass, image_url);
}

async function getLocalImage(hass: ExtendedHass, url: string): Promise<string> {
  if (typeof url != "string") {
    return "";
  }
  try {
    const result: string = await hass.callWS({
      type: "mass_queue/download_and_encode_image",
      url: url,
    });
    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Error getting image: ${url}`, e);
    return "";
  }
}
