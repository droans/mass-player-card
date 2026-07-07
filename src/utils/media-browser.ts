import { html, TemplateResult } from "lit";
import { Thumbnail, MediaTypes } from "../const/enums";
import { asyncImageURLWithFallback } from "./thumbnails";
import { MediaTypeThumbnails } from "../const/media-browser";
import { customItem } from "../config/media-browser";
import { getTranslation } from "./translations";
import {
  ExtendedHass,
  mediaCardAlbumData,
  mediaCardArtistData,
  MediaCardItem,
  mediaCardPlaylistData,
  mediaCardPodcastData,
  MediaLibraryItem,
  RecommendationSection,
} from "../const/types";
import { DirectiveResult } from "lit/async-directive.js";
import { cache } from "lit/directives/cache.js";

type viewCardFunction = (
  media_content_id: string,
  media_image: string,
  media_title: string,
) => MediaCardItem;

type viewCardFunctionMap = Record<string, viewCardFunction>;

const funcs: viewCardFunctionMap = {
  playlist: generatePlaylistCard,
  album: generateAlbumCard,
  artist: generateArtistCard,
  podcast: generatePodcastCard,
};
async function generateSectionBackgroundPart(
  hass: ExtendedHass,
  thumbnail: string,
  fallback: Thumbnail | string = Thumbnail.DISC,
  download_local: boolean,
  proxy_all: boolean,
): Promise<DirectiveResult> {
  const imgs = await asyncImageURLWithFallback(
    hass,
    thumbnail,
    fallback,
    download_local,
    proxy_all,
  );
  return cache(html`
    <img
      class="thumbnail-section"
      src="${imgs.image_url}"
      onerror="this.src = '${imgs.fallback_url}'"
    />
  `);
}
async function generateSectionBackground(
  hass: ExtendedHass,
  cards: MediaCardItem[],
  fallback: Thumbnail,
  download_local: boolean,
  proxy_all: boolean,
): Promise<TemplateResult> {
  const rng = [...Array(4).keys()];
  const promiseThumbnails: Promise<DirectiveResult>[] = [];

  rng.forEach((i) => {
    const idx = i % cards.length;
    promiseThumbnails.push(
      generateSectionBackgroundPart(
        hass,
        cards[idx]?.thumbnail ?? fallback,
        fallback,
        download_local,
        proxy_all,
      ),
    );
  });
  const thumbnails = await Promise.all(promiseThumbnails);
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
  download_local: boolean,
  proxy_all: boolean,
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  const translate_key = `browser.sections.${media_type}`;
  const title = getTranslation(translate_key, hass);
  return {
    title: title as string,
    background: await generateSectionBackground(
      hass,
      cards,
      thumbnail,
      download_local,
      proxy_all,
    ),
    thumbnail,
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
  download_local: boolean,
  proxy_all: boolean,
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = MediaTypeThumbnails[media_type];
  const translate_key = `browser.sections.${media_type}`;
  const title = getTranslation(translate_key, hass);
  return {
    title: title as string,
    background: await generateSectionBackground(
      hass,
      cards,
      thumbnail,
      download_local,
      proxy_all,
    ),
    thumbnail,
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
  download_local: boolean,
  proxy_all: boolean,
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = Thumbnail.CLEFT;
  return {
    title: section.name,
    background: await generateSectionBackground(
      hass,
      cards,
      thumbnail,
      download_local,
      proxy_all,
    ),
    thumbnail,
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
  show_track_view: boolean,
): MediaCardItem[] {
  const items = section.items;
  return items.map((item) => {
    const function_ = funcs[item.media_type];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (function_ && show_track_view) {
      return function_(item.uri, item.image, item.name);
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
export function generateCustomSectionCards(
  config: customItem[],
): MediaCardItem[] {
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
  show_track_view: boolean,
): MediaCardItem[] {
  const thumbnail = MediaTypeThumbnails[media_type];
  return config.map((item) => {
    const function_ = funcs[item.media_type];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (function_ && show_track_view) {
      return function_(item.uri, item.image ?? "", item.name);
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
    type: "playlist",
    media_content_id,
    media_image,
    media_title,
  };
  return {
    title: media_title,
    thumbnail: media_image,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}
function generateAlbumCard(
  media_content_id: string,
  media_image: string,
  media_title: string,
): MediaCardItem {
  const data: mediaCardAlbumData = {
    type: "album",
    media_content_id,
    media_image,
    media_title,
  };
  return {
    title: media_title,
    thumbnail: media_image,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}
function generateArtistCard(
  media_content_id: string,
  media_image: string,
  media_title: string,
): MediaCardItem {
  const data: mediaCardArtistData = {
    type: "artist",
    media_content_id,
    media_image,
    media_title,
  };
  return {
    title: media_title,
    thumbnail: media_image,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}
function generatePodcastCard(
  media_content_id: string,
  media_image: string,
  media_title: string,
): MediaCardItem {
  const data: mediaCardPodcastData = {
    type: "podcast",
    media_content_id,
    media_image,
    media_title,
  };
  return {
    title: media_title,
    thumbnail: media_image,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}
