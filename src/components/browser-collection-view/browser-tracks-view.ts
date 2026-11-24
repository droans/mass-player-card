import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
import { mediaCardTracksData } from "../../const/types";
import { getTranslation } from "../../utils/translations";
import { delay } from "../../utils/utility";
import styles from "./browser-tracks-view-styles";
import { BrowserViewBase } from "./browser-view-base";
import sharedStyles from "./browser-view-shared-styles";

@customElement("mpc-collection-tracks-view")
export class MassBrowserTracksView extends BrowserViewBase {
  @query("#collection-info") private infoElement?: HTMLElement;
  @query("#collection-artists") private artistsElement?: HTMLElement;
  // Ask HA to return the tracks in the album

  public getTracks() {
    if (!this.browserActions || !this.collectionData || !this.activePlayer) {
      return;
    }
    const collectionData = this.collectionData as mediaCardTracksData;
    if (collectionData.dynamic) {
      void this.getDynamicPlaylistTracks();
      void this.getDynamicPlaylistMetadata();
    } else {
      void this.getSimilarTracks();
    }
    this.setHiddenElements();
    if (collectionData.dynamic) {
      this._enqueue_buttons = this._enqueue_buttons.filter((button) => {
        return button.option != "radio";
      });
    }
  }

  public async getSimilarTracks() {
    if (!this.collectionData || !this.activePlayer || !this.browserActions) {
      return;
    }
    const response = await this.browserActions.actionGetSimilarTracks(
      this.activePlayer.entity_id,
      this.collectionData.media_content_id,
    );
    this.tracks = response.response.tracks;
  }
  public async getDynamicPlaylistTracks() {
    if (!this.collectionData || !this.activePlayer || !this.browserActions) {
      return;
    }
    const response = await this.browserActions.actionGetDynamicPlaylistTracks(
      this.activePlayer.entity_id,
      this.collectionData.media_content_id,
    );
    this.tracks = response.response.tracks;
  }
  public async getDynamicPlaylistMetadata() {
    if (!this.browserActions || !this.collectionData || !this.activePlayer) {
      return;
    }
    const metadata = await this.browserActions.actionGetDynamicPlaylistData(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    this.dynamicPlaylistMetadata = metadata.response;
  }

  private animateHeaderInfo() {
    const kf = {
      fontSize: "0.7em",
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
  protected renderTitle(): TemplateResult {
    const mixLabel = getTranslation(
      "browser.collections.header.dynamic_playlist_suffix",
      this.hassUIServices,
    );
    return html`
      <mpc-marquee-text id="title">
        <div id="title-text">
          ${this.collectionData?.media_title} ${mixLabel}
        </div>
      </mpc-marquee-text>
    `;
  }
  protected renderOverview(): TemplateResult {
    const trackLabel = getTranslation(
      "browser.collections.track_count",
      this.hassUIServices,
    ) as string;
    const loadingLabel = getTranslation(
      "browser.loading",
      this.hassUIServices,
    ) as string;
    const trackString = this.tracks
      ? `${this.tracks.length.toString()} ${trackLabel}`
      : loadingLabel;
    const similarTracksLabel = getTranslation(
      "browser.collections.header.similar_tracks",
      this.hassUIServices,
    );
    return html`
      <div id="collection-info">
        <div id="collection-note">${similarTracksLabel}</div>
        ${this.renderTitle()}
        <div id="tracks-length">${trackString}</div>
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
