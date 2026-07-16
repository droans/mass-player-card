import { MediaTypes } from "mass-queue-types/packages/music_assistant/types";
import { DarkModeThumbnails, LightModeThumbnails } from "../const/common";
import { Thumbnail } from "../const/enums";
import { Icons } from "../const/icons";
import { getSearchMediaButtons } from "../const/media-browser";
import { ExtendedHass } from "../const/types";
import { CheckURLResult, getUrlAccessibility } from "./url";

export interface ImageURLWithFallback {
  image_url: string;
  fallback_url: string;
}

export async function asyncImageURLWithFallback(
  hass: ExtendedHass,
  imageURL: string,
  fallback: string,
  downloadLocal = true,
  proxyAll = false,
): Promise<ImageURLWithFallback> {
  fallback = Object.values(Thumbnail).includes(fallback as Thumbnail)
    ? (getThumbnail(hass, fallback as Thumbnail) ?? "")
    : await encodeImageIfLocal(hass, fallback, proxyAll);
  if ((downloadLocal || proxyAll) && !imageURL.startsWith("/api/")) {
    imageURL = await encodeImageIfLocal(hass, imageURL, proxyAll);
  }
  return {
    image_url: imageURL,
    fallback_url: fallback,
  };
}

export function getThumbnail(
  hass: ExtendedHass | undefined,
  thumbnail: Thumbnail,
): string | undefined {
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
  imageURL: string,
  proxyAll: boolean,
): Promise<string> {
  if (!proxyAll) {
    const accessible = getUrlAccessibility(imageURL);
    if (accessible == CheckURLResult.NOT_URL) {
      return "";
    }
    if (accessible == CheckURLResult.ACCESSIBLE) {
      return imageURL;
    }
  }
  return await getLocalImage(hass, imageURL);
}

async function getLocalImage(hass: ExtendedHass, url: string): Promise<string> {
  if (typeof url != "string") {
    return "";
  }
  try {
    const result: string = await hass.callWS({
      type: "mass_queue/download_and_encode_image",
      url,
    });
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error getting image: ${url}`, error);
    return "";
  }
}

export function getTrackFallbackImg(
  hass: ExtendedHass,
  currentURL: string,
  defaultImgURL: string,
  fallbackImg?: string,
  thumbnail: Thumbnail = Thumbnail.CLEFT,
): string {
  const thumb = getThumbnail(hass, thumbnail) as string;
  const fallback = fallbackImg?.length ? fallbackImg : thumb;
  const defaultImg = defaultImgURL.length > 0 ? defaultImgURL : fallback;
  if (currentURL == "" || currentURL == document.location.href) {
    return defaultImg;
  }
  if (currentURL == defaultImg) {
    return fallback;
  }
  if (currentURL == fallbackImg) {
    return thumb;
  }
  return defaultImg;
}
