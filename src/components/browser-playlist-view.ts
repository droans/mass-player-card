import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import sharedStyles from '../styles/browser-view-shared';
import styles from '../styles/browser-playlist-view';
import BrowserActions from "../actions/browser-actions.js";
import { TrackRemovedEventData } from "../const/events.js";
import './browser-track-row';
import { delay, formatDuration } from "../utils/util.js";
import { getPlaylistServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_playlist.js";
import { PlaylistTrack } from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks.js";
import { BrowserViewBase } from "./browser-view-base.js";

@customElement('mpc-browser-playlist-view')
export class MassBrowserPlaylistView extends BrowserViewBase {
  // See setter
  @query('#collection-info') private infoElement!: HTMLElement
  private infoAnimation!: Animation;

  // Duration of playlist
  private playlistDuration = 0;

  // Metadata for playlist
  @state() private playlistMetadata!: getPlaylistServiceResponse

  // Ask HA to return the tracks in the playlist
  public async getTracks() {
    if (
      !this.hass 
      || !this.collectionData
      || !this.activePlayer
    ) {
      return;
    }
    const tracks = await this.browserActions.actionGetPlaylistTracks(this.collectionData.media_content_id, this.activePlayer.entity_id);
    this.tracks = tracks.response.tracks;
    let dur = 0;
    this.tracks.forEach(
      (track) => {
        dur += track.duration ?? 0;
      }
    )
    this.playlistDuration = dur;
    this.setHiddenElements()
    await this.getPlaylistMetadata();
  }
  public async getPlaylistMetadata() {
    if (
      !this.hass 
      || !this.collectionData
      || !this.activePlayer
    ) {
      return;
    }
    const metadata = await this.browserActions.actionGetPlaylistData(this.collectionData.media_content_id, this.activePlayer.entity_id);
    this.playlistMetadata = metadata;
  }

  public get browserActions() {
    if (!this._browserActions) {
      this._browserActions = new BrowserActions(this.hass);
    }
    return this._browserActions;
  }
  

  private animateHeaderInfo() {
    const kf = {
      fontSize: '0.8em'
    }
    this.infoAnimation = this.addScrollAnimation(kf, this.infoElement)
  }
  private animateHeader() {
    this.animateHeaderElement();
    this.animateHeaderImage();
    this.animateHeaderTitle();
    this.animateHeaderInfo();
    this.animateHeaderEnqueue();
  }

  private onTrackRemoved = (ev: TrackRemovedEventData) => {
    const data = ev.detail;
    const pos = data.position;
    const tracks = (this.tracks as PlaylistTrack[]).filter(
      (track) => {
        return track.position != pos;
      }
    ).map(
      (track) => {
        if (track.position > pos) {
          track.position -= 1;
        }
        return track
      }
    )
    this.tracks = tracks;
  }


  protected renderHeader(): TemplateResult {
    return html`
      <div id="collection-image">
        ${this.renderImage()}
        <div id="enqueue">
          ${this.renderEnqueue()}
        </div>
      </div>
      <div id="overview">
        ${this.renderOverview()}
      </div>
    `
  }
  protected renderOverview(): TemplateResult {
    const trackStr = this.tracks?.length ? `${this.tracks.length.toString()} Tracks` : `Loading...`
    const owner = this?.playlistMetadata?.response?.owner ?? `Unknown`;
    return html`
      <div id="title">
        <ha-marquee-text>
          ${this.collectionData.media_title}
        </ha-marquee-text>
      </div>
      <div id="collection-info">
        <div id="tracks-length">
          ${trackStr}
        </div>
        <div id="playlist-duration">
          ${formatDuration(this.playlistDuration)}
        </div>
        <div id="playlist-owner">
          ${owner}
        </div>
      </div>
    `
  }

  protected async testAnimation(delayMs=50) {
    await delay(delayMs);
    if (!this.animationsAdded
      && this?.tracksElement?.scrollHeight > this?.tracksElement?.offsetHeight
      && this.titleElement
      && this.infoElement
      && this.enqueueElement
      && this.imageElement
    ) {
      this.animationsAdded = true;
      this.animateHeader()
    } else {
      if (delayMs > 1000 ) {
        return;
      }
      await this.testAnimation(delayMs * 2);
    }
  }

  static get styles(): CSSResultOrNative[] {
    return [styles, sharedStyles];
  }
}