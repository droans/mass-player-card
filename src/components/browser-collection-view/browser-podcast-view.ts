import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { getPodcastServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_podcast";
import { getTranslation } from "../../utils/translations";
import { delay } from "../../utils/utility";
import styles from "./browser-podcast-view-styles";
import { BrowserViewBase } from "./browser-view-base";
import sharedStyles from "./browser-view-shared-styles";

@customElement("mpc-collection-podcast-view")
export class MassBrowserPodcastView extends BrowserViewBase {
  @query("#collection-info") private infoElement?: HTMLElement;

  // Metadata for podcast
  @state() private podcastMetadata?: getPodcastServiceResponse;

  // Ask HA to return the episodes in the podcast
  public getTracks() {
    if (!this.updatedHass || !this.collectionData || !this.activePlayer) {
      return;
    }
    void this.browserActions
      .actionGetPodcastEpisodes(
        this.collectionData.media_content_id,
        this.activePlayer.entity_id,
      )
      .then((resp) => {
        if (!this.podcastMetadata) {
          this.tracks = resp.response.episodes;
        }
        const tracks = resp.response.episodes.map((track) => {
          track.media_image =
            track.media_image.length > 0 ? track.media_image : img;
          return track;
        });
        this.tracks = tracks;
      });
    const img = this.collectionData.media_image;
    this.setHiddenElements();
    void this.getPodcastMetadata();
  }
  public async getPodcastMetadata() {
    if (!this.updatedHass || !this.collectionData || !this.activePlayer) {
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
    this.addScrollAnimation(kf, this.infoElement as HTMLElement);
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
    const episodeLabel = getTranslation(
      "browser.collections.track_count",
      this.uiHass,
    ) as string;
    const loadingLabel = getTranslation(
      "browser.loading",
      this.uiHass,
    ) as string;
    const trackString = this.tracks
      ? `${this.tracks.length.toString()} ${episodeLabel}`
      : loadingLabel;
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
      (this.virtElement?.scrollHeight ?? 0) >
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
