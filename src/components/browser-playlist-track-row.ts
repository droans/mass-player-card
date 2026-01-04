import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from '../styles/browser-playlist-track-row';
import { consume } from "@lit/context";
import { activeEntityIDContext, hassContext, IconsContext, useExpressiveContext, useVibrantContext } from "../const/context.js";
import { ExtendedHass, ListItemData, ListItems } from "../const/types.js";
import { getThumbnail } from "../utils/thumbnails.js";
import { EnqueueOptions, Thumbnail } from "../const/enums.js";
import BrowserActions from "../actions/browser-actions.js";
import { Track } from "mass-queue-types/packages/mass_queue/utils.js";
import { Icons } from "../const/icons.js";
import { MenuButtonEventData } from "../const/events.js";
import { getTranslation } from "../utils/translations.js";

@customElement('mpc-playlist-track-row')
export class MassPlaylistTrackRow extends LitElement {
  @property({ attribute: false }) track!: Track;
  @property({ attribute: 'divider', type: Boolean }) divider = false;

  @property({ attribute: false }) playlistURI!: string;
  _enqueueButtons!: ListItems;

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;
  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant!: boolean;
  private _Icons!: Icons;

  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass

  @consume({ context: activeEntityIDContext, subscribe: true })
  private activeEntityId!: string;

  private _browserActions!: BrowserActions;

  private get browserActions() {
    if (!this._browserActions) {
      this._browserActions = new BrowserActions(this.hass);
    }
    return this._browserActions
  }
  @consume({ context: IconsContext, subscribe: true })
  public set Icons(icons: Icons) {
    this._Icons = icons;
    this.setEnqueueButtons();
  }
  public get Icons() {
    return this._Icons;
  }

  @property({ attribute: false })   
  private set enqueueButtons(buttons: ListItems) {
    this._enqueueButtons = buttons;
    this.setEnqueueButtons();
  }
  private get enqueueButtons() {
    return this._enqueueButtons;
  }

  private setEnqueueButtons() {
    if (
      !this._enqueueButtons
      || !this?.Icons?.CLOSE
    ) {
      return;
    }
    const buttons = this._enqueueButtons;
    let shouldUpdate = true;
    if (buttons) {
      shouldUpdate = (buttons.findIndex(
        (item) => {
          return item.option == 'remove'
        }
      ) == -1)
    }
    if (shouldUpdate) {
      const removePlaylistButton: ListItemData = {
        option: 'remove',
        icon: this.Icons.CLOSE,
        title: getTranslation("browser.playlists.remove_track", this.hass) as string
      }
      this._enqueueButtons = [
        ...this._enqueueButtons,
        removePlaylistButton
      ]
    }
  }
  private enqueueTrack = (enqueue: EnqueueOptions) => {
    void this.browserActions.actionEnqueueMedia(
      this.activeEntityId,
      this.track.media_content_id,
      'music',
      enqueue,
    );
  };

  private onPlaylistItemSelected = (ev: Event) => {
    ev.stopPropagation();
    void this.playTrackEnqueuePlaylist();
  }
  private async playTrackEnqueuePlaylist() {
    const actions = this.browserActions;
    const uri = this.track.media_content_id;
    await actions.actionPlayMedia(this.activeEntityId, uri, 'music')
    await actions.actionEnqueueMedia(this.activeEntityId, this.playlistURI, 'playlist', EnqueueOptions.PLAY_NEXT);
  }
  private removeTrackFromPlaylist() {
    // pass
  } 
  private onMenuItemSelected = (ev: MenuButtonEventData) => {
    ev.stopPropagation();
    const option = ev.detail.option;
    if (option == 'remove') {
      this.removeTrackFromPlaylist();
    } else {
      this.enqueueTrack(option as EnqueueOptions)
    }
  }


  protected renderTitle(): TemplateResult {
    return html`
      <span
        slot="headline"
        class="track-title"
      >
        ${this.track.media_title}
      </span>
    `;
  }
  protected renderArtist(): TemplateResult {
    return html`
      <span
        slot="supporting-text"
        class="track-artist"
      >
        ${this.track.media_artist}
      </span>
    `
  }
  protected renderMenuButton(): TemplateResult {
    return html`
      <span slot="end" class="menu-button">
        <mass-menu-button
          id="menu-button"
          .iconPath=${this.Icons.OVERFLOW}
          @menu-item-selected=${this.onMenuItemSelected}
          fixedMenuPosition
          naturalMenuWidth
          .items=${this.enqueueButtons}
        >
        </mass-menu-button>
      </span>
    `
  }

  private _renderThumbnailFallback = (ev: Event) => {
    (ev?.target as HTMLImageElement).src = getThumbnail(this.hass, Thumbnail.CLEFT);
  }
  protected renderThumbnail(): TemplateResult {
    // const fallback = getThumbnail(this.hass, Thumbnail.CLEFT);
    const img = this.track.local_image_encoded ?? this.track.media_image ?? '';
    return html`
      <img
        class="thumbnail"
        slot="start"
        src="${img}"
        onerror=${this._renderThumbnailFallback}
        loading="lazy"
      >
    `
  }
  protected render(): TemplateResult {
    const expressiveClass = this.useExpressive ? `expressive`: ``;
    const vibrantClass = this.useVibrant ? `vibrant`: ``;
    return html`
      <ha-md-list-item
        class="button ${expressiveClass} ${vibrantClass}"
        @click=${this.onPlaylistItemSelected}
        type="button"
      >
      ${this.renderThumbnail()} ${this.renderTitle()} ${this.renderArtist()} ${this.renderMenuButton()}
      </ha-md-list-item>
      ${this.divider ? html`<div class="divider"></div>` : ``}
    `
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0; 
  }

  static get styles(): CSSResultGroup {
    return styles
  }
}