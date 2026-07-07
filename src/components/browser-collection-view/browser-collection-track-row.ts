import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import styles from "./browser-collection-track-row-styles";
import { consume } from "@lit/context";
import {
  activeEntityIDContext,
  configContext,
  hassContext,
  IconsContext,
  mediaBrowserConfigContext,
  useExpressiveContext,
  useVibrantContext,
} from "../../const/context";
import { ExtendedHass, ListItemData, ListItems } from "../../const/types";
import {
  asyncImageURLWithFallback,
  getThumbnail,
} from "../../utils/thumbnails";
import { EnqueueOptions, Thumbnail } from "../../const/enums";
import BrowserActions from "../../actions/browser-actions";
import { Track } from "mass-queue-types/packages/mass_queue/utils";
import { Icons } from "../../const/icons";
import { MenuButtonEventData } from "../../const/events";
import { getTranslation } from "../../utils/translations";
import { PlaylistTrack } from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks";
import { EnqueueConfigMap } from "../../const/media-browser";
import { MediaBrowserConfig } from "../../config/media-browser";
import { getTrackFallbackImg } from "../../utils/url";
import { Config } from "../../config/config";

@customElement("mpc-collection-track-row")
export class MassPlaylistTrackRow extends LitElement {
  @property({ attribute: false }) _track!: Track | PlaylistTrack;
  @property({ attribute: "divider", type: Boolean }) divider = false;
  @property({ attribute: "playlist", type: Boolean }) playlist = false;
  @state() private defaultImageURL?: string;
  private fallbackImageURL?: string;
  @query(".thumbnail") thumbnailElement!: HTMLImageElement;
  private imagesExhausted = false;

  @property({ attribute: false }) collectionURI!: string;
  _enqueueButtons?: ListItems;

  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  private browserConfig!: MediaBrowserConfig;
  @consume({ context: configContext, subscribe: true })
  private cardConfig!: Config;

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive?: boolean;
  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant?: boolean;
  private _Icons?: Icons;

  @consume({ context: hassContext, subscribe: true })
  private _hass?: ExtendedHass;

  @consume({ context: activeEntityIDContext, subscribe: true })
  private activeEntityId?: string;

  private _browserActions?: BrowserActions;

  public set hass(hass: ExtendedHass | undefined) {
    this._hass = hass;
    void this.getTrackImage();
  }
  public get hass() {
    return this._hass;
  }

  @property({ attribute: false })
  public set track(track: Track | PlaylistTrack) {
    this._track = track;
    void this.getTrackImage();
  }
  public get track() {
    return this._track;
  }

  private get browserActions() {
    this._browserActions ??= new BrowserActions(this.hass as ExtendedHass);
    return this._browserActions;
  }
  @consume({ context: IconsContext, subscribe: true })
  public set Icons(icons: Icons | undefined) {
    this._Icons = icons;
    this.setEnqueueButtons();
  }
  public get Icons() {
    return this._Icons;
  }

  @property({ attribute: false })
  private set enqueueButtons(buttons: ListItems | undefined) {
    this._enqueueButtons = buttons;
    this.setEnqueueButtons();
  }
  private get enqueueButtons() {
    return this._enqueueButtons;
  }

  private setEnqueueButtons() {
    if (!this._enqueueButtons || !this.Icons?.CLOSE || !this.playlist) {
      return;
    }
    const buttons = this._enqueueButtons;
    let shouldUpdate = true;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (buttons) {
      shouldUpdate =
        buttons.findIndex((item) => {
          return item.option == "remove";
        }) == -1;
    }
    if (shouldUpdate) {
      const removePlaylistButton: ListItemData = {
        option: "remove",
        icon: this.Icons.CLOSE,
        title: getTranslation(
          "browser.playlists.remove_track",
          this.hass,
        ) as string,
      };
      this._enqueueButtons = [...this._enqueueButtons, removePlaylistButton];
    }
  }

  private async getTrackImage() {
    if (!this.hass) {
      return;
    }
    const locImg = this.track.local_image_encoded?.length
      ? this.track.local_image_encoded
      : undefined;
    const mediaImg =
      this.track.media_image.length > 0 ? this.track.media_image : undefined;
    const imgs = await asyncImageURLWithFallback(
      this.hass,
      locImg ?? ``,
      mediaImg ?? Thumbnail.CLEFT,
      this.cardConfig.download_local,
    );
    this.defaultImageURL = imgs.image_url;
    this.fallbackImageURL = imgs.fallback_url;
  }
  private enqueueTrack = (enqueue: EnqueueOptions) => {
    const ent = this.activeEntityId as string;
    void this.browserActions.actionEnqueueMedia(
      ent,
      this.track.media_content_id,
      "music",
      enqueue,
    );
  };

  private onPlaylistItemSelected = (event_: Event) => {
    event_.stopPropagation();
    void this.playTrackEnqueuePlaylist();
  };
  private async playTrackEnqueuePlaylist() {
    const ent = this.activeEntityId as string;
    const actions = this.browserActions;
    const uri = this.track.media_content_id;
    const enqueue = EnqueueConfigMap[this.browserConfig.default_enqueue_option];
    await actions.actionEnqueueMedia(
      ent,
      uri,
      "music",
      enqueue == EnqueueOptions.RADIO ? EnqueueOptions.PLAY_NOW : enqueue,
    );
    await actions.actionEnqueueMedia(
      ent,
      this.collectionURI,
      "playlist",
      EnqueueOptions.PLAY_NEXT,
    );
  }
  private removeTrackFromPlaylist() {
    const playlistId = this.collectionURI.split("//")[1].split("/")[1];
    const position = (this.track as PlaylistTrack).position;
    void this.browserActions.actionRemovePlaylistTrack(
      playlistId,
      position,
      this.activeEntityId as string,
    );
    const data = {
      detail: {
        playlist: this.collectionURI,
        position,
      },
    };
    const event_ = new CustomEvent("playlist-track-removed", data);
    this.dispatchEvent(event_);
  }
  private onMenuItemSelected = (event_: MenuButtonEventData) => {
    event_.stopPropagation();
    const option = event_.detail.option;
    if (option == "remove") {
      this.removeTrackFromPlaylist();
    } else {
      this.enqueueTrack(option as EnqueueOptions);
    }
  };

  protected renderTitle(): TemplateResult {
    return html`
      <div
        class="title track ${this.useExpressive ? `expressive` : ``}"
      >
        ${this.track.media_title}
      </span>
    `;
  }
  protected renderArtist(): TemplateResult {
    return html`
      <div
        class="title artist ${this.useExpressive ? `expressive` : ``}"
      >
        ${this.track.media_artist}
      </span>
    `;
  }
  protected renderMenuButton(): TemplateResult {
    return html`
      <span
        slot="end"
        class="menu-button"
        @click=${(event: Event) => {
          event.stopPropagation();
        }}
      >
          <mpc-menu-button
            id="menu-button"
            .iconPath=${this.Icons?.OVERFLOW}
            @menu-item-selected=${this.onMenuItemSelected}
            fixedMenuPosition
            naturalMenuWidth
            scheme="plain"
            outlined
            elevation="0"
            .items=${this.enqueueButtons}
          >
          </mpc-menu-button>
        </div>
      </span>
    `;
  }

  private _renderThumbnailFallback = () => {
    const currentSource = this.thumbnailElement.src;
    const thumb = getTrackFallbackImg(
      this.hass as ExtendedHass,
      currentSource,
      this.defaultImageURL ?? ``,
      this.fallbackImageURL,
      Thumbnail.CLEFT,
    );
    this.thumbnailElement.src = thumb;
    if (thumb == currentSource) {
      this.imagesExhausted = true;
      return;
    }
    if (this.imagesExhausted) {
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      this.thumbnailElement.onerror = null;
    }
  };
  protected renderThumbnail(): TemplateResult {
    /* eslint-disable prettier/prettier */
    const img = this.defaultImageURL?.length
      ? this.defaultImageURL
      : (this.fallbackImageURL?.length
        ? this.fallbackImageURL
        : getThumbnail(this.hass, Thumbnail.CLEFT));
    /* eslint-enable prettier/prettier */
    return html`
      <img
        class="thumbnail"
        slot="start"
        src="${img}"
        @error=${this._renderThumbnailFallback}
        loading="lazy"
      />
    `;
  }
  protected render(): TemplateResult {
    const expressiveClass = this.useExpressive ? `expressive` : ``;
    const vibrantClass = this.useVibrant ? `vibrant` : ``;
    return html`
      <ha-md-list-item
        class="button ${expressiveClass} ${vibrantClass}"
        @click=${this.onPlaylistItemSelected}
        type="button"
      >
        ${this.renderThumbnail()}
        <span slot="headline" id="headline">
          ${this.renderTitle()} ${this.renderArtist()}
        </span>
        ${this.renderMenuButton()}
      </ha-md-list-item>
      ${this.divider ? html`<div class="divider"></div>` : ``}
    `;
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}
