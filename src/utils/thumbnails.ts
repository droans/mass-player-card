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
  image_url: string,
  fallback: string,
  download_local = true,
): Promise<ImageURLWithFallback> {
  if (Object.values(Thumbnail).includes(fallback as Thumbnail)) {
    fallback = getThumbnail(hass, fallback as Thumbnail) ?? "";
  }
  if (download_local) {
    image_url = await encodeImageIfLocal(hass, image_url);
  }
  return {
    image_url,
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
  image_url: string,
): Promise<string> {
  const accessible = getUrlAccessibility(image_url);
  if (accessible == CheckURLResult.NOT_URL) {
    return "";
  }
  if (accessible == CheckURLResult.ACCESSIBLE) {
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
      url,
    });
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error getting image: ${url}`, error);
    return "";
  }
}
