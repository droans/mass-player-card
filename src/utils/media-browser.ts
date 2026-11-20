import { html, TemplateResult } from "lit";
import { Artist } from "mass-queue-types/packages/mass_queue/types/media-items";
import { customItem, MediaBrowserConfig } from "../config/media-browser";
import { MediaTypes, Thumbnail } from "../const/enums";
import { Icons } from "../const/icons";
import { MediaTypeThumbnails } from "../const/media-browser";
import {
  ExtendedHass,
  mediaCardAlbumData,
  mediaCardArtistData,
  MediaCardItem,
  mediaCardPlaylistData,
  mediaCardPodcastData,
  MediaImageType,
  MediaItemImage,
  MediaLibraryItem,
  newMediaBrowserItemsConfig,
  RecommendationSection,
} from "../const/types";
import { asyncImageURLWithFallback } from "./thumbnails";
import { getTranslation } from "./translations";

type viewCardFunction = (
  media_content_id: string,
  media_image: string,
  media_title: string,
  _mediaArtist?: string,
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
  downloadLocal: boolean,
  proxyAll: boolean,
): Promise<TemplateResult> {
  const imgs = await asyncImageURLWithFallback(
    hass,
    thumbnail,
    fallback,
    downloadLocal,
    proxyAll,
  );
  return html`
    <img
      class="thumbnail-section"
      src="${imgs.image_url}"
      loading="lazy"
      onerror="this.src = '${imgs.fallback_url}'"
    />
  `;
}
async function generateSectionBackground(
  hass: ExtendedHass,
  cards: MediaCardItem[],
  fallback: Thumbnail,
  downloadLocal: boolean,
  proxyAll: boolean,
): Promise<TemplateResult> {
  const rng = [...Array(4).keys()];
  const promiseThumbnails: Promise<TemplateResult>[] = [];

  rng.forEach((i) => {
    const idx = i % cards.length;
    promiseThumbnails.push(
      generateSectionBackgroundPart(
        hass,
        cards[idx]?.thumbnail ?? fallback,
        fallback,
        downloadLocal,
        proxyAll,
      ),
    );
  });
  const thumbnails = await Promise.all(promiseThumbnails);
  let thumbnailHtml = html``;
  thumbnails.forEach((thumbnail) => {
    thumbnailHtml = html` ${thumbnailHtml} ${thumbnail} `;
  });
  return html`
    <div
      class="thumbnail"
      style="display: grid; grid-template-columns: 1fr 1fr; padding-bottom: 0%; height: unset; width: unset; padding-left: unset; padding-right: unset;"
    >
      ${thumbnailHtml}
    </div>
  `;
}
export async function generateFavoriteCard(
  hass: ExtendedHass,
  mediaType: MediaTypes,
  cards: MediaCardItem[],
  downloadLocal: boolean,
  proxyAll: boolean,
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = MediaTypeThumbnails[mediaType];
  const translateKey = `browser.sections.${mediaType}`;
  const title = getTranslation(translateKey, hass);
  return {
    title: title as string,
    background: await generateSectionBackground(
      hass,
      cards,
      thumbnail,
      downloadLocal,
      proxyAll,
    ),
    thumbnail,
    fallback: thumbnail,
    data: {
      type: "section",
      subtype: "favorites",
      section: mediaType,
    },
  };
}
export async function generateRecentsCard(
  hass: ExtendedHass,
  mediaType: MediaTypes,
  cards: MediaCardItem[],
  downloadLocal: boolean,
  proxyAll: boolean,
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = MediaTypeThumbnails[mediaType];
  const translateKey = `browser.sections.${mediaType}`;
  const title = getTranslation(translateKey, hass);
  return {
    title: title as string,
    background: await generateSectionBackground(
      hass,
      cards,
      thumbnail,
      downloadLocal,
      proxyAll,
    ),
    thumbnail,
    fallback: thumbnail,
    data: {
      type: "section",
      subtype: "recents",
      section: mediaType,
    },
  };
}
export async function generateRecommendationsCard(
  hass: ExtendedHass,
  section: RecommendationSection,
  cards: MediaCardItem[],
  downloadLocal: boolean,
  proxyAll: boolean,
): Promise<MediaCardItem> {
  const thumbnail: Thumbnail = Thumbnail.CLEFT;
  return {
    title: section.name,
    background: await generateSectionBackground(
      hass,
      cards,
      thumbnail,
      downloadLocal,
      proxyAll,
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
  showTrackView: boolean,
): MediaCardItem[] {
  const items = section.items;
  return items.map((item) => {
    const function_ = funcs[item.media_type];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (function_ && showTrackView) {
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
  mediaType: MediaTypes,
  showTrackView: boolean,
): MediaCardItem[] {
  const thumbnail = MediaTypeThumbnails[mediaType];
  return config.map((item) => {
    const function_ = funcs[item.media_type];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (function_ && showTrackView) {
      const mediaArtists = item.artists ?? [];
      const artistNames = mediaArtists.map((artist) => {
        return artist.name;
      });
      const formattedArtists = artistNames.join(", ").slice(0, 40);
      return function_(item.uri, item.image ?? "", item.name, formattedArtists);
    }
    const artists = (item.artists ?? []).map((artist) => {
      return artist.name;
    });
    const joinedArtists = artists.join(", ").slice(0, 40);
    const mediaArtist =
      joinedArtists.length > 0 ? { media_artist: joinedArtists } : {};
    const r: MediaCardItem = {
      title: item.name,
      thumbnail: item.image ?? Thumbnail.CLEFT,
      fallback: thumbnail,
      data: {
        type: "service",
        media_content_id: item.uri,
        media_content_type: item.media_type,
        ...mediaArtist,
      },
    };
    return r;
  });
}
function generatePlaylistCard(
  mediaContentId: string,
  mediaImage: string,
  mediaTitle: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _mediaArtist = "",
): MediaCardItem {
  const data: mediaCardPlaylistData = {
    type: "playlist",
    media_content_id: mediaContentId,
    media_image: mediaImage,
    media_title: mediaTitle,
  };
  return {
    title: mediaTitle,
    thumbnail: mediaImage,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}
function generateAlbumCard(
  mediaContentId: string,
  mediaImage: string,
  mediaTitle: string,
  _mediaArtist = "",
): MediaCardItem {
  const data: mediaCardAlbumData = {
    type: "album",
    media_content_id: mediaContentId,
    media_image: mediaImage,
    media_title: mediaTitle,
    media_artist: _mediaArtist,
  };
  return {
    title: mediaTitle,
    thumbnail: mediaImage,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}
function generateArtistCard(
  mediaContentId: string,
  mediaImage: string,
  mediaTitle: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _mediaArtist = "",
): MediaCardItem {
  const data: mediaCardArtistData = {
    type: "artist",
    media_content_id: mediaContentId,
    media_image: mediaImage,
    media_title: mediaTitle,
  };
  return {
    title: mediaTitle,
    thumbnail: mediaImage,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}
function generatePodcastCard(
  mediaContentId: string,
  mediaImage: string,
  mediaTitle: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _mediaArtist = "",
): MediaCardItem {
  const data: mediaCardPodcastData = {
    type: "podcast",
    media_content_id: mediaContentId,
    media_image: mediaImage,
    media_title: mediaTitle,
  };
  return {
    title: mediaTitle,
    thumbnail: mediaImage,
    fallback: Thumbnail.PLAYLIST,
    data,
  };
}

export interface BrowserChip {
  icon: string;
  title: string;
  enabled: boolean;
  items: { favorites: MediaCardItem[]; recents: MediaCardItem[] };
  name: string;
}

export interface BrowserChips {
  album: BrowserChip;
  artist: BrowserChip;
  audiobook: BrowserChip;
  playlist: BrowserChip;
  podcast: BrowserChip;
  radio: BrowserChip;
  track: BrowserChip;
}

export function getBrowserChips(
  icons: Icons,
  hass: ExtendedHass,
  config: MediaBrowserConfig,
  cards: newMediaBrowserItemsConfig,
): BrowserChips {
  const favoriteCards = cards.favorites;
  const recentCards = cards.recents;
  const favoriteConfig = config.favorites;
  const recentsConfig = config.recents;

  /* eslint-disable @typescript-eslint/no-unnecessary-condition */
  const useAlbum =
    (favoriteConfig.albums.enabled || recentsConfig.albums.enabled) &&
    ((favoriteCards?.album?.length ?? 0) > 0 ||
      (recentCards?.album?.length ?? 0) > 0);

  const useArtist =
    (favoriteConfig.artists.enabled || recentsConfig.artists.enabled) &&
    ((favoriteCards?.artist?.length ?? 0) > 0 ||
      (recentCards?.artist?.length ?? 0) > 0);

  const useAudiobook =
    (favoriteConfig.audiobooks.enabled || recentsConfig.audiobooks.enabled) &&
    ((favoriteCards?.audiobook?.length ?? 0) > 0 ||
      (recentCards?.audiobook?.length ?? 0) > 0);

  const usePlaylist =
    (favoriteConfig.playlists.enabled || recentsConfig.playlists.enabled) &&
    ((favoriteCards?.playlist?.length ?? 0) > 0 ||
      (recentCards?.playlist?.length ?? 0) > 0);

  const usePodcast =
    (favoriteConfig.podcasts.enabled || recentsConfig.podcasts.enabled) &&
    ((favoriteCards?.podcast?.length ?? 0) > 0 ||
      (recentCards?.podcast?.length ?? 0) > 0);

  const useRadio =
    (favoriteConfig.radios.enabled || recentsConfig.radios.enabled) &&
    ((favoriteCards?.radio?.length ?? 0) > 0 ||
      (recentCards?.radio?.length ?? 0) > 0);

  const useTrack =
    (favoriteConfig.tracks.enabled || recentsConfig.tracks.enabled) &&
    ((favoriteCards?.track?.length ?? 0) > 0 ||
      (recentCards?.track?.length ?? 0) > 0);

  return {
    album: {
      title: getTranslation("browser.sections.album", hass) as string,
      icon: icons.ALBUM,
      enabled: useAlbum,
      items: {
        favorites: favoriteCards.album ?? [],
        recents: recentCards.album ?? [],
      },
      name: "album",
    },
    artist: {
      title: getTranslation("browser.sections.artist", hass) as string,
      icon: icons.ARTIST,
      enabled: useArtist,
      items: {
        favorites: favoriteCards.artist ?? [],
        recents: recentCards.artist ?? [],
      },
      name: "artist",
    },
    audiobook: {
      title: getTranslation("browser.sections.audiobook", hass) as string,
      icon: icons.BOOK,
      enabled: useAudiobook,
      items: {
        favorites: favoriteCards.audiobook ?? [],
        recents: recentCards.audiobook ?? [],
      },
      name: "audiobook",
    },
    playlist: {
      title: getTranslation("browser.sections.playlist", hass) as string,
      icon: icons.PLAYLIST,
      enabled: usePlaylist,
      items: {
        favorites: favoriteCards.playlist ?? [],
        recents: recentCards.playlist ?? [],
      },
      name: "playlist",
    },
    podcast: {
      title: getTranslation("browser.sections.podcast", hass) as string,
      icon: icons.PODCAST,
      enabled: usePodcast,
      items: {
        favorites: favoriteCards.podcast ?? [],
        recents: recentCards.podcast ?? [],
      },
      name: "podcast",
    },
    radio: {
      title: getTranslation("browser.sections.radio", hass) as string,
      icon: icons.RADIO,
      enabled: useRadio,
      items: {
        favorites: favoriteCards.radio ?? [],
        recents: recentCards.radio ?? [],
      },
      name: "radio",
    },
    track: {
      title: getTranslation("browser.sections.track", hass) as string,
      icon: icons.MUSIC,
      enabled: useTrack,
      items: {
        favorites: favoriteCards.track ?? [],
        recents: recentCards.track ?? [],
      },
      name: "track",
    },
  };
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */
}

export function getImageFromMetadata(
  images: MediaItemImage[] | null,
  preferredImageType: MediaImageType = "thumb",
): string | null {
  if (!images?.length) {
    return null;
  }
  const matchingImage = images.find((image) => {
    return image.type == preferredImageType;
  });
  if (matchingImage) {
    return matchingImage.path;
  }
  return images[0].path;
}

export function generateCardFromArtist(
  artistData: Artist,
): MediaCardItem | undefined {
  const metadata = artistData.metadata;
  const image = getImageFromMetadata(
    metadata.images as unknown as MediaItemImage[],
  );
  if (!artistData.uri) {
    return;
  }
  return {
    title: artistData.name,
    thumbnail: image ?? Thumbnail.PERSON,
    fallback: Thumbnail.PERSON,
    data: {
      type: "artist",
      media_content_id: artistData.uri,
      media_image: image ?? Thumbnail.PERSON,
      media_title: artistData.name,
      media_artist: artistData.name,
    },
  };
}
