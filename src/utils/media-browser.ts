import { html, TemplateResult } from "lit";
import { ExtendedHass, Thumbnail, MediaTypes } from "../const/common";
import { asyncBackgroundImageFallback, getThumbnail } from "./thumbnails";
import {
  MediaCardItem,
  MediaLibraryItem,
  MediaTypeThumbnails,
  RecommendationSection,
} from "../const/media-browser";
import { customItem } from "../config/media-browser";
import { getTranslation } from "./translations.js";

async function generateSectionBackgroundPart(
  hass: ExtendedHass,
  thumbnail: string,
  fallback: Thumbnail = Thumbnail.DISC,
) {
  const thumb = getThumbnail(hass, (thumbnail as Thumbnail)) ?? thumbnail;
  const image = await asyncBackgroundImageFallback(hass, thumb, fallback);
  return html` <div class="thumbnail-section" style="${image}"></div> `;
}
async function generateSectionBackground(
  hass: ExtendedHass,
  cards: MediaCardItem[],
  fallback: Thumbnail,
) {
  const rng = [...Array(4).keys()];
  const _thumbs: Promise<TemplateResult>[] = [];

  rng.forEach((i) => {
    const idx = i % cards.length;
    _thumbs.push(
      generateSectionBackgroundPart(
        hass,
        cards[idx]?.thumbnail ?? fallback,
        fallback,
      ),
    );
  });
  const thumbnails = await Promise.all(_thumbs);
  let thumbnail_html = html``;
  thumbnails.forEach((thumbnail) => {
    thumbnail_html = html` ${thumbnail_html} ${thumbnail} `;
  });
  return html`
    <div
      class="thumbnail"
      style="display: grid; grid-template-columns: 1fr 1fr; padding-bottom: 0%; height: unset; width: unset; padding-left: unset; padding-right: unset;"
    >
      ${thumbnail_html}
    </div>
  `;
}
export async function generateFavoriteCard(
  hass: ExtendedHass,
  media_type: MediaTypes,
  cards: MediaCardItem[],
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  const translate_key = `browser.sections.${media_type}`;
  const title = getTranslation(translate_key, hass);
  return {
    title: title as string,
    background: await generateSectionBackground(hass, cards, thumbnail),
    thumbnail: thumbnail,
    fallback: thumbnail,
    data: {
      type: "section",
      subtype: "favorites",
      section: media_type,
    },
  };
}
export async function generateRecentsCard(
  hass: ExtendedHass,
  media_type: MediaTypes,
  cards: MediaCardItem[],
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  const translate_key = `browser.sections.${media_type}`;
  const title = getTranslation(translate_key, hass);
  return {
    title: title as string,
    background: await generateSectionBackground(hass, cards, thumbnail),
    thumbnail: thumbnail,
    fallback: thumbnail,
    data: {
      type: "section",
      subtype: "recents",
      section: media_type,
    },
  };
}
export async function generateRecommendationsCard(
  hass: ExtendedHass,
  section: RecommendationSection,
  cards: MediaCardItem[],
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = Thumbnail.CLEFT;
  return {
    title: section.name,
    background: await generateSectionBackground(hass, cards, thumbnail),
    thumbnail: thumbnail,
    fallback: thumbnail,
    data: {
      type: "section",
      subtype: "recommendations",
      section: section.name,
    },
  };
}
export function generateRecommendationSectionCards(
  section: RecommendationSection,
) {
  const items = section.items;
  return items.map((item) => {
    const r: MediaCardItem = {
      title: item.name,
      thumbnail: item.image,
      fallback: Thumbnail.CLEFT,
      data: {
        type: "service",
        media_content_id: item.uri ?? item.item_id,
        media_content_type: item.media_type,
      },
    };
    return r;
  });
}
export function generateCustomSectionCards(config: customItem[]) {
  return config.map((item) => {
    const r: MediaCardItem = {
      title: item.name,
      thumbnail: item.image,
      fallback: Thumbnail.CLEFT,
      data: {
        type: "service",
        media_content_id: item.media_content_id,
        media_content_type: item.media_content_type,
        service: item.service,
      },
    };
    return r;
  });
}
export function generateFavoritesSectionCards(
  config: MediaLibraryItem[],
  media_type: MediaTypes,
) {
  const thumbnail = MediaTypeThumbnails[media_type];
  return config.map((item) => {
    const r: MediaCardItem = {
      title: item.name,
      thumbnail: item.image as string,
      fallback: thumbnail,
      data: {
        type: "service",
        media_content_id: item.uri,
        media_content_type: item.media_type,
      },
    };
    return r;
  });
}
