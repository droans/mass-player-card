import { html, TemplateResult } from "lit"
import { ExtendedHass, Thumbnail, MediaTypes } from "../const/common"
import { backgroundImageFallback } from "./thumbnails"
import { MediaCardItem, MediaLibraryItem, MediaTypeThumbnails } from "../const/media-browser"
import { testMixedContent } from "./util"
import { customItem } from "../config/media-browser"

function generateSectionBackgroundPart(hass: ExtendedHass, thumbnail: string, fallback: Thumbnail = Thumbnail.DISC) {
  const image = backgroundImageFallback(hass, thumbnail, fallback)
  return html`
    <div class="thumbnail-section" style="${image}"></div>
  `
}
function generateSectionBackground(hass: ExtendedHass, cards: MediaCardItem[], fallback: Thumbnail) {
  const rng = [...Array(4).keys()];
  const thumbnails: TemplateResult[] = []
  const filteredCards = cards.filter(
    (item) =>{
      if (item.thumbnail) {
        return testMixedContent(item.thumbnail || "")
      }
      return false;
    }
  )
  rng.forEach(
    (i) => {
      const idx = i % filteredCards.length;
      thumbnails.push(generateSectionBackgroundPart(hass, filteredCards[idx]?.thumbnail ?? fallback, fallback));
    }
  )
  let thumbnail_html = html``;
  thumbnails.forEach(
    (thumbnail) => {
      thumbnail_html = html`
        ${thumbnail_html}
        ${thumbnail}
      `
    }
  );
  return html`
    <div class="thumbnail" style="display: grid; grid-template-columns: 1fr 1fr; padding-bottom: 0%; height: unset; width: unset; padding-left: unset; padding-right: unset;">
      ${thumbnail_html}
    </div>
  `
}
export function generateFavoriteCard(hass: ExtendedHass, media_type: MediaTypes, cards: MediaCardItem[]): MediaCardItem {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  return {
    title: media_type,
    background: generateSectionBackground(hass, cards, thumbnail),
    thumbnail: thumbnail,
    fallback: thumbnail,
    data: {
      type: 'section',
      subtype: 'favorite',
      section: media_type
    }
  }
}
export function generateRecentsCard(hass: ExtendedHass, media_type: MediaTypes, cards: MediaCardItem[]): MediaCardItem {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  return {
    title: media_type,
    background: generateSectionBackground(hass, cards, thumbnail),
    thumbnail: thumbnail,
    fallback: thumbnail,
    data: {
      type: 'section',
      subtype: 'recents',
      section: `recents-${media_type}`
    }
  }
}
export function generateCustomSectionCards(config: customItem[]) {
  return config.map(
    (item) => {
      const r: MediaCardItem = {
        title: item.name,
        thumbnail: item.image,
        fallback: Thumbnail.CLEFT,
        data: {
          type: 'service',
          media_content_id: item.media_content_id,
          media_content_type: item.media_content_type,
          service: item.service
        }
      };
      return r;
    }
  )
}
export function generateFavoritesSectionCards(config: MediaLibraryItem[], media_type: MediaTypes) {
  const thumbnail = MediaTypeThumbnails[media_type];
  return config.map(
    (item) => {
      const r: MediaCardItem = {
        title: item.name,
        thumbnail: item.image,
        fallback: thumbnail,
        data: {
          type: 'service',
          media_content_id: item.uri,
          media_content_type: item.media_type,
        }
      };
      return r;
    }
  )
}