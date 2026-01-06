import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import sharedStyles from '../styles/browser-view-shared';
import styles from '../styles/browser-artist-view';
import BrowserActions from "../actions/browser-actions.js";
import { delay } from "../utils/util.js";
import { getArtistServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_artist";
import { BrowserViewBase } from "./browser-view-base.js";

@customElement('mpc-browser-artist-view')
export class MassBrowserArtistView extends BrowserViewBase {
  // See setter
  // private _collectionData!: mediaCardArtistData;

  // Header is animated on scroll - query elements for animation
  @query('#collection-info') private infoElement!: HTMLElement
  @query('#collection-artists') private artistsElement!: HTMLElement
  private infoAnimation!: Animation;
  private artistsAnimation!: Animation;

  // Metadata for artist
  @state() private artistMetadata!: getArtistServiceResponse;


  // Ask HA to return the tracks in the artist
  public async getTracks() {
    if (
      !this.hass 
      || !this.collectionData
      || !this.activePlayer
    ) {
      return;
    }
    const tracks = await this.browserActions.actionGetArtistTracks(this.collectionData.media_content_id, this.activePlayer.entity_id);
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
    const metadata = await this.browserActions.actionGetArtistData(this.collectionData.media_content_id, this.activePlayer.entity_id);
    this.artistMetadata = metadata;
  }

  public get browserActions() {
    if (!this._browserActions) {
      this._browserActions = new BrowserActions(this.hass);
    }
    return this._browserActions;
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
    return html`
      ${this.renderTitle()}
      <div id="collection-info">
        <div id="tracks-length">  
          ${trackStr}
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