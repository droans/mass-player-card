import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import sharedStyles from "../styles/browser-view-shared";
import styles from "../styles/browser-podcast-view";
import "./browser-track-row";
import { delay } from "../utils/utility";
import { BrowserViewBase } from "./browser-view-base";
import { getPodcastServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_podcast";

@customElement("mpc-browser-podcast-view")
export class MassBrowserPodcastView extends BrowserViewBase {
  @query("#collection-info") private infoElement?: HTMLElement;
  private infoAnimation!: Animation;

  // Metadata for podcast
  @state() private podcastMetadata?: getPodcastServiceResponse;

  // Ask HA to return the episodes in the podcast
  public async getTracks() {
    if (!this.hass || !this.collectionData || !this.activePlayer) {
      return;
    }
    const resp = await this.browserActions.actionGetPodcastEpisodes(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    if (!this.podcastMetadata) {
      this.tracks = resp.response.episodes;
    }
    const img = this.collectionData.media_image;
    const tracks = resp.response.episodes.map((track) => {
      track.media_image =
        track.media_image.length > 0 ? track.media_image : img;
      return track;
    });
    this.tracks = tracks;
    this.setHiddenElements();
    await this.getPodcastMetadata();
  }
  public async getPodcastMetadata() {
    if (!this.hass || !this.collectionData || !this.activePlayer) {
      return;
    }
    const metadata = await this.browserActions.actionGetPodcastData(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    this.podcastMetadata = metadata;
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
      ? `${this.tracks.length.toString()} Episodes`
      : `Loading...`;
    const desc = this.podcastMetadata?.response.metadata.description ?? ``;
    return html`
      ${this.renderTitle()}
      <div id="collection-info">
        <div id="tracks-length">${trackString}</div>
        <div id="collection-description">${desc}</div>
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
