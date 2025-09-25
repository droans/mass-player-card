import { html, TemplateResult } from "lit"
import { ExtendedHass, Icon, MediaTypes } from "../const/common"
import { backgroundImageFallback } from "./icons"
import { MediaCardItem, MediaLibraryItem, MediaTypeIcons } from "../const/media-browser"
import { testMixedContent } from "./util"
import { customItem } from "../config/media-browser"

function generateSectionBackgroundPart(hass: ExtendedHass, icon: string, fallback: Icon = Icon.DISC) {
  const image = backgroundImageFallback(hass, icon, fallback)
  return html`
    <div class="thumbnail-section" style="${image};"></div>
  `
}
function generateSectionBackground(hass: ExtendedHass, cards: MediaCardItem[], fallback: Icon) {
  const rng = [...Array(4).keys()];
  const icons: TemplateResult[] = []
  const filteredCards = cards.filter(
    (item) =>{
      if (item.icon) {
        return testMixedContent(item.icon || "")
      }
      return false;
    }
  )
  rng.forEach(
    (i) => {
      const idx = i % filteredCards.length;
      icons.push(generateSectionBackgroundPart(hass, filteredCards[idx]?.icon ?? fallback, fallback));
    }
  )
  let icons_html = html``;
  icons.forEach(
    (icon) => {
      icons_html = html`
        ${icons_html}
        ${icon}
      `
    }
  );
  return html`
    <div class="thumbnail" style="display: grid; grid-template-areas: 'bg-1 bg-2' 'bg-3 bg-4'; padding-bottom: 0%; height: unset; width: unset; padding-left: unset; padding-right: unset;">
      ${icons_html}
    </div>
  `
}
export function generateFavoriteCard(hass: ExtendedHass, media_type: MediaTypes, cards: MediaCardItem[]): MediaCardItem {
  const icon: Icon = MediaTypeIcons[media_type];
  return {
    title: media_type,
    background: generateSectionBackground(hass, cards, icon),
    icon: icon,
    fallback: icon,
    data: {
      type: 'section',
      subtype: 'favorite',
      section: media_type
    }
  }
}
export function generateCustomSectionCards(config: customItem[]) {
  return config.map(
    (item) => {
      const r: MediaCardItem = {
        title: item.name,
        icon: item.image,
        fallback: Icon.CLEFT,
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
  const icon = MediaTypeIcons[media_type];
  return config.map(
    (item) => {
      const r: MediaCardItem = {
        title: item.name,
        icon: item.image,
        fallback: icon,
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