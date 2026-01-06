import { html, TemplateResult } from "lit";
import { Thumbnail, MediaTypes } from "../const/enums";
import { getThumbnail } from "./thumbnails";
import {
  MediaTypeThumbnails,
} from "../const/media-browser";
import { customItem } from "../config/media-browser";
import { getTranslation } from "./translations";
import {
  ExtendedHass,
  mediaCardAlbumData,
  mediaCardArtistData,
  MediaCardItem,
  mediaCardPlaylistData,
  MediaLibraryItem,
  RecommendationSection
} from "../const/types";

type viewCardFunc = (
  media_content_id: string,
  media_image: string,
  media_title: string,
) => MediaCardItem;

type viewCardFuncMap = Record<string, viewCardFunc>;

const funcs: viewCardFuncMap = {
  playlist: generatePlaylistCard,
  album: generateAlbumCard,
  artist: generateArtistCard,
}
function generateSectionBackgroundPart(
  hass: ExtendedHass,
  thumbnail: string,
  fallback: Thumbnail | string = Thumbnail.DISC,
) {
  const thumb = getThumbnail(hass, (thumbnail as Thumbnail)) ?? thumbnail;
  const _fallback = getThumbnail(hass, (fallback as Thumbnail)) ?? fallback;
  return html`
    <img
      class="thumbnail-section"
      src="${thumb}"
      onerror="this.src = '${_fallback}'"
    >
  `
}
function generateSectionBackground(
  hass: ExtendedHass,
  cards: MediaCardItem[],
  fallback: Thumbnail,
) {
  const rng = [...Array(4).keys()];
  const thumbnails: TemplateResult[] = [];

  rng.forEach((i) => {
    const idx = i % cards.length;
    thumbnails.push(
      generateSectionBackgroundPart(
        hass,
        cards[idx]?.thumbnail ?? fallback,
        fallback,
      ),
    );
  });
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
export function generateFavoriteCard(
  hass: ExtendedHass,
  media_type: MediaTypes,
  cards: MediaCardItem[],
): MediaCardItem {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  const translate_key = `browser.sections.${media_type}`;
  const title = getTranslation(translate_key, hass);
  return {
    title: title as string,
    background: generateSectionBackground(hass, cards, thumbnail),
    thumbnail: thumbnail,
    fallback: thumbnail,
    data: {
      type: "section",
      subtype: "favorites",
      section: media_type,
    },
  };
}
export function generateRecentsCard(
  hass: ExtendedHass,
  media_type: MediaTypes,
  cards: MediaCardItem[],
): MediaCardItem {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  const translate_key = `browser.sections.${media_type}`;
  const title = getTranslation(translate_key, hass);
  return {
    title: title as string,
    background: generateSectionBackground(hass, cards, thumbnail),
    thumbnail: thumbnail,
    fallback: thumbnail,
    data: {
      type: "section",
      subtype: "recents",
      section: media_type,
    },
  };
}
export function generateRecommendationsCard(
  hass: ExtendedHass,
  section: RecommendationSection,
  cards: MediaCardItem[],
): MediaCardItem {
  const thumbnail: Thumbnail = Thumbnail.CLEFT;
  return {
    title: section.name,
    background: generateSectionBackground(hass, cards, thumbnail),
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
): MediaCardItem[] {
  const items = section.items;
  return items.map((item) => {
    const func = funcs[item.media_type];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (func) {
      return func(item.uri, item.image, item.name)
    }
    const r: MediaCardItem = {
      title: item.name,
      thumbnail: item.image,
      fallback: Thumbnail.CLEFT,
      data: {
        type: "service",
        media_content_id: item.uri,
        media_content_type: item.media_type,
      },
    };
    return r;
  });
}
export function generateCustomSectionCards(config: customItem[]): MediaCardItem[] {
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
): MediaCardItem[] {
  const thumbnail = MediaTypeThumbnails[media_type];
  return config.map((item) => {
    const func = funcs[item.media_type];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (func) {
      return func(item.uri, item.image ?? '', item.name)
    }
    const r: MediaCardItem = {
      title: item.name,
      thumbnail: item.image ?? Thumbnail.CLEFT,
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
function generatePlaylistCard(
  media_content_id: string,
  media_image: string,
  media_title: string,
): MediaCardItem {
  const data: mediaCardPlaylistData = {
    type: 'playlist',
    media_content_id: media_content_id,
    media_image: media_image,
    media_title: media_title
  }
  return {
    title: media_title,
    thumbnail: media_image,
    fallback: Thumbnail.PLAYLIST,
    data: data
  }
}
function generateAlbumCard(
  media_content_id: string,
  media_image: string,
  media_title: string,
): MediaCardItem {
  const data: mediaCardAlbumData = {
    type: 'album',
    media_content_id: media_content_id,
    media_image: media_image,
    media_title: media_title
  }
  return {
    title: media_title,
    thumbnail: media_image,
    fallback: Thumbnail.PLAYLIST,
    data: data
  }
}
function generateArtistCard(
  media_content_id: string,
  media_image: string,
  media_title: string,
): MediaCardItem {
  const data: mediaCardArtistData = {
    type: 'artist',
    media_content_id: media_content_id,
    media_image: media_image,
    media_title: media_title
  }
  return {
    title: media_title,
    thumbnail: media_image,
    fallback: Thumbnail.PLAYLIST,
    data: data
  }
}