import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import sharedStyles from "../styles/browser-view-shared";
import styles from "../styles/browser-playlist-view";
import { TrackRemovedEventData } from "../const/events";
import "./browser-track-row";
import { delay, formatDuration } from "../utils/utility";
import { getPlaylistServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_playlist";
import { PlaylistTrack } from "mass-queue-types/packages/mass_queue/actions/get_playlist_tracks";
import { BrowserViewBase } from "./browser-view-base";

@customElement("mpc-browser-playlist-view")
export class MassBrowserPlaylistView extends BrowserViewBase {
  @query("#collection-info") private infoElement?: HTMLElement;
  private infoAnimation!: Animation;

  // Duration of playlist
  private playlistDuration = 0;

  // Metadata for playlist
  @state() private playlistMetadata?: getPlaylistServiceResponse;

  // Ask HA to return the tracks in the playlist
  public async getTracks() {
    if (!this.hass || !this.collectionData || !this.activePlayer) {
      return;
    }
    const tracks = await this.browserActions.actionGetPlaylistTracks(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    this.tracks = tracks.response.tracks;
    let dur = 0;
    this.tracks.forEach((track) => {
      dur += track.duration ?? 0;
    });
    this.playlistDuration = dur;
    this.setHiddenElements();
    await this.getPlaylistMetadata();
  }
  public async getPlaylistMetadata() {
    if (!this.hass || !this.collectionData || !this.activePlayer) {
      return;
    }
    const metadata = await this.browserActions.actionGetPlaylistData(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    this.playlistMetadata = metadata;
  }

  private animateHeaderInfo() {
    const kf = {
      fontSize: "0.8em",
    };
    this.infoAnimation = this.addScrollAnimation(
      kf,
      this.infoElement as HTMLElement,
    );
  }
  private animateHeader() {
    this.animateHeaderElement();
    this.animateHeaderImage();
    this.animateHeaderTitle();
    this.animateHeaderInfo();
    this.animateHeaderEnqueue();
  }

  private onTrackRemoved = (event_: TrackRemovedEventData) => {
    const data = event_.detail;
    const pos = data.position;
    const tracks = (this.tracks as PlaylistTrack[])
      .filter((track) => {
        return track.position != pos;
      })
      .map((track) => {
        if (track.position > pos) {
          track.position -= 1;
        }
        return track;
      });
    this.tracks = tracks;
  };

  protected renderHeader(): TemplateResult {
    return html`
      <div id="collection-image">
        ${this.renderImage()}
        <div id="enqueue">${this.renderEnqueue()}</div>
      </div>
      <div id="overview">${this.renderOverview()}</div>
    `;
  }
  protected renderOverview(): TemplateResult {
    const trackString = this.tracks?.length
      ? `${this.tracks.length.toString()} Tracks`
      : `Loading...`;
    const owner = this.playlistMetadata?.response.owner ?? `Unknown`;
    return html`
      ${this.renderTitle()}
      <div id="collection-info">
        <div id="tracks-length">${trackString}</div>
        <div id="playlist-duration">
          ${formatDuration(this.playlistDuration)}
        </div>
        <div id="playlist-owner">${owner}</div>
      </div>
    `;
  }

  protected async testAnimation(delayMs = 50) {
    await delay(delayMs);
    if (
      !this.animationsAdded &&
      (this.tracksElement?.scrollHeight ?? 0) >
        (this.tracksElement?.offsetHeight ?? 1) &&
      this.titleElement &&
      this.infoElement &&
      this.enqueueElement &&
      this.imageDivElement
    ) {
      this.animationsAdded = true;
      this.animateHeader();
    } else {
      if (delayMs > 1000) {
        return;
      }
      await this.testAnimation(delayMs * 2);
    }
  }

  static get styles(): CSSResultOrNative[] {
    return [styles, sharedStyles];
  }
}
