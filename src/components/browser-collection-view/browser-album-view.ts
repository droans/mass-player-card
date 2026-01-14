import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import sharedStyles from "./browser-view-shared-styles";
import styles from "./browser-album-view-styles";
import { delay } from "../../utils/utility";
import { getAlbumServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_album";
import { BrowserViewBase } from "../browser-collection-view/browser-view-base";

@customElement("mpc-browser-album-view")
export class MassBrowserAlbumView extends BrowserViewBase {
  @query("#collection-info") private infoElement?: HTMLElement;
  @query("#collection-artists") private artistsElement?: HTMLElement;
  private infoAnimation!: Animation;
  private artistsAnimation!: Animation;

  // Metadata for album
  @state() private albumMetadata?: getAlbumServiceResponse;

  // Ask HA to return the tracks in the album
  public async getTracks() {
    if (!this.hass || !this.collectionData || !this.activePlayer) {
      return;
    }
    const tracks = await this.browserActions.actionGetAlbumTracks(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    this.tracks = tracks.response.tracks;
    this.setHiddenElements();
    await this.getMetadata();
  }
  public async getMetadata() {
    if (!this.hass || !this.collectionData || !this.activePlayer) {
      return;
    }
    const metadata = await this.browserActions.actionGetAlbumData(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    this.albumMetadata = metadata;
  }

  private animateHeaderInfo() {
    const kf = {
      fontSize: "0.7em",
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
    const metadata = this.albumMetadata?.response;
    const artists = metadata?.artists ?? [];
    const artistLs = artists.map((artist) => {
      return artist.name;
    });
    const artistString =
      artistLs.length > 0 ? artistLs.join(", ") : `Loading...`;
    return html`
      ${this.renderTitle()}
      <div id="collection-info">
        <div id="collection-artists">${artistString}</div>
        <div id="tracks-length">${trackString}</div>
        <div id="collection-year">
          ${this.albumMetadata?.response.year ?? ``}
        </div>
      </div>
    `;
  }

  protected async testAnimation(delayMs = 50) {
    await delay(delayMs);
    if (
      !this.animationsAdded &&
      (this.tracksElement?.scrollHeight ?? 0) >
        (this.tracksElement?.offsetHeight ?? 0) &&
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
