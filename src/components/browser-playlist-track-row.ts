import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from '../styles/browser-playlist-track-row';
import { playlistTrack } from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks.js";
import { consume } from "@lit/context";
import { activeEntityIDContext, hassContext, useExpressiveContext, useVibrantContext } from "../const/context.js";
import { ExtendedHass } from "../const/types.js";
import { getThumbnail } from "../utils/thumbnails.js";
import { EnqueueOptions, Thumbnail } from "../const/enums.js";
import BrowserActions from "../actions/browser-actions.js";

@customElement('mpc-playlist-track-row')
export class MassPlaylistTrackRow extends LitElement {
  @property({ attribute: false }) track!: playlistTrack;
  @property({ attribute: 'divider', type: Boolean }) divider = false;

  @property({ attribute: false }) playlistURI!: string;

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;
  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant!: boolean;

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

  private onPlaylistItemSelected = () => {
    void this.playTrackEnqueuePlaylist();
  }
  private async playTrackEnqueuePlaylist() {
    const actions = this.browserActions;
    const uri = this.track.media_content_id;
    await actions.actionPlayMedia(this.activeEntityId, uri, 'music')
    await actions.actionEnqueueMedia(this.activeEntityId, this.playlistURI, 'playlist', EnqueueOptions.PLAY_NEXT);
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
    return html``
  }
  protected renderThumbnail(): TemplateResult {
    const fallback = getThumbnail(this.hass, Thumbnail.CLEFT);
    const img = this.track.local_image_encoded ?? this.track.media_image ?? fallback;
    return html`
      <img
        class="thumbnail"
        slot="start"
        src="${img}"
        onerror="this.src = '${fallback}'"
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
      ${this.renderThumbnail()} ${this.renderTitle()} ${this.renderArtist()}
      </ha-md-list-item>
      ${this.divider ? html`<div class="divider"></div>` : ``}
    `
  }

  static get styles(): CSSResultGroup {
    return styles
  }
}