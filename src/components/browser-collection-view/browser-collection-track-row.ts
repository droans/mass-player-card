import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./browser-collection-track-row-styles";
import { consume } from "@lit/context";
import {
  activeEntityIDContext,
  hassContext,
  IconsContext,
  mediaBrowserConfigContext,
  useExpressiveContext,
  useVibrantContext,
} from "../../const/context";
import { ExtendedHass, ListItemData, ListItems } from "../../const/types";
import { getThumbnail } from "../../utils/thumbnails";
import { EnqueueOptions, Thumbnail } from "../../const/enums";
import BrowserActions from "../../actions/browser-actions";
import { Track } from "mass-queue-types/packages/mass_queue/utils";
import { Icons } from "../../const/icons";
import { HTMLImageElementEvent, MenuButtonEventData } from "../../const/events";
import { getTranslation } from "../../utils/translations";
import { PlaylistTrack } from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks";
import { EnqueueConfigMap } from "../../const/media-browser";
import { MediaBrowserConfig } from "../../config/media-browser";

@customElement("mpc-track-row")
export class MassPlaylistTrackRow extends LitElement {
  @property({ attribute: false }) track!: Track | PlaylistTrack;
  @property({ attribute: "divider", type: Boolean }) divider = false;
  @property({ attribute: "playlist", type: Boolean }) playlist = false;

  @property({ attribute: false }) collectionURI!: string;
  _enqueueButtons?: ListItems;

  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  private browserConfig!: MediaBrowserConfig;

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive?: boolean;
  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant?: boolean;
  private _Icons?: Icons;

  @consume({ context: hassContext, subscribe: true })
  private hass?: ExtendedHass;

  @consume({ context: activeEntityIDContext, subscribe: true })
  private activeEntityId?: string;

  private _browserActions?: BrowserActions;

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
      <span slot="headline" class="track-title">
        ${this.track.media_title}
      </span>
    `;
  }
  protected renderArtist(): TemplateResult {
    return html`
      <span slot="supporting-text" class="track-artist">
        ${this.track.media_artist}
      </span>
    `;
  }
  protected renderMenuButton(): TemplateResult {
    return html`
      <span slot="end" class="menu-button">
        <mass-menu-button
          id="menu-button"
          .iconPath=${this.Icons?.OVERFLOW}
          @menu-item-selected=${this.onMenuItemSelected}
          fixedMenuPosition
          naturalMenuWidth
          .items=${this.enqueueButtons}
        >
        </mass-menu-button>
      </span>
    `;
  }

  private _renderThumbnailFallback = (event_: HTMLImageElementEvent) => {
    event_.target.src = getThumbnail(this.hass, Thumbnail.CLEFT) as string;
  };
  protected renderThumbnail(): TemplateResult {
    // const fallback = getThumbnail(this.hass, Thumbnail.CLEFT);
    const loc_img = this.track.local_image_encoded?.length
      ? this.track.local_image_encoded
      : undefined;
    const media_img =
      this.track.media_image.length > 0 ? this.track.media_image : undefined;
    const img = loc_img ?? media_img ?? "";
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
        ${this.renderThumbnail()} ${this.renderTitle()} ${this.renderArtist()}
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
