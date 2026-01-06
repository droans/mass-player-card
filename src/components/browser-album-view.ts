import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import sharedStyles from '../styles/browser-view-shared';
import styles from '../styles/browser-album-view';
import { delay } from "../utils/util.js";
import { getAlbumServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_album";
import { BrowserViewBase } from "./browser-view-base.js";

@customElement('mpc-browser-album-view')
export class MassBrowserAlbumView extends BrowserViewBase {
  // See setter
  // private _collectionData!: mediaCardAlbumData;

  @query('#collection-info') private infoElement!: HTMLElement
  @query('#collection-artists') private artistsElement!: HTMLElement
  private infoAnimation!: Animation;
  private artistsAnimation!: Animation;

  // Metadata for album
  @state() private albumMetadata!: getAlbumServiceResponse;

  // Ask HA to return the tracks in the album
  public async getTracks() {
    if (
      !this.hass 
      || !this.collectionData
      || !this.activePlayer
    ) {
      return;
    }
    const tracks = await this.browserActions.actionGetAlbumTracks(this.collectionData.media_content_id, this.activePlayer.entity_id);
    this.tracks = tracks.response.tracks;
    this.setHiddenElements()
    await this.getMetadata();
  }
  public async getMetadata() {
    if (
      !this.hass 
      || !this.collectionData
      || !this.activePlayer
    ) {
      return;
    }
    const metadata = await this.browserActions.actionGetAlbumData(this.collectionData.media_content_id, this.activePlayer.entity_id);
    this.albumMetadata = metadata;
  }

  private animateHeaderInfo() {
    const kf = {
      fontSize: '0.7em'
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
    const metadata = this?.albumMetadata?.response;
    const artists = metadata?.artists ?? [];
    const artistLs = artists.map(
      (artist) => {
        return artist.name
      }
    );
    const artistStr = artistLs.length ? artistLs.join(', ') : `Loading...`
    return html`
      ${this.renderTitle()}
      <div id="collection-info">
        <div id="collection-artists">
          ${artistStr}
        </div>
        <div id="tracks-length">  
          ${trackStr}
        </div>
        <div id="collection-year">
          ${this?.albumMetadata?.response?.year ?? ``}
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