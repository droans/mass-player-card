import { consume } from "@lit/context";
import { CSSResultOrNative, html, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { getArtistServiceResponse } from "mass-queue-types/packages/mass_queue/actions/get_artist";
import { CardSelectedService } from "../../const/actions";
import { browserControllerContext } from "../../const/context";
import { mediaCardData, MediaCardItem } from "../../const/types";
import { MediaBrowserController } from "../../controller/browser";
import { getTranslation } from "../../utils/translations";
import { delay } from "../../utils/utility";
import styles from "./browser-artist-view-styles";
import { BrowserViewBase } from "./browser-view-base";
import sharedStyles from "./browser-view-shared-styles";

@customElement("mpc-collection-artist-view")
export class MassBrowserArtistView extends BrowserViewBase {
  // Header is animated on scroll - query elements for animation
  @query("#collection-info") private infoElement?: HTMLElement;
  @query("#collection-artists") private artistsElement!: HTMLElement;

  @query("#tracks-container.artist")
  protected virtDiv?: HTMLElement;
  @query("#tracks-container.artist")
  protected virtElement?: HTMLElement;

  @property({ attribute: false })
  onCollectionSelectAction!: CardSelectedService;
  public onCollectionDrillAction!: (
    mediaType: string,
    mediaId: string,
    mediaTitle: string,
  ) => void;

  @state() protected similarArtistCards: MediaCardItem[] = [];
  @state() protected artistAlbums: MediaCardItem[] = [];

  protected _browserController?: MediaBrowserController;

  // Metadata for artist
  @state() private artistMetadata?: getArtistServiceResponse;

  @consume({ context: browserControllerContext, subscribe: true })
  public set browserController(controller: MediaBrowserController | undefined) {
    this._browserController = controller;
    this.getArtistAlbums();
    this.getSimilarArtists();
  }
  public get browserController() {
    return this._browserController;
  }

  public getSimilarArtists() {
    if (!this.browserController || !this.collectionData) {
      return;
    }
    void this.browserController
      .getSimilarArtistsCards(this.collectionData.media_content_id)
      .then((cards) => {
        this.similarArtistCards = cards;
      });
  }
  public getArtistAlbums() {
    if (!this.browserController || !this.collectionData) {
      return;
    }
    void this.browserController
      .getArtistAlbumsCards(this.collectionData.media_content_id)
      .then((cards) => {
        this.artistAlbums = cards;
      });
  }

  // Ask HA to return the tracks in the artist
  public getTracks() {
    if (!this.browserActions || !this.collectionData || !this.activePlayer) {
      return;
    }
    void this.browserActions
      .actionGetArtistTopTracks(
        this.collectionData.media_content_id,
        this.activePlayer.entity_id,
      )
      .then((tracks) => {
        this.tracks = tracks.response.tracks;
      });
    this.setHiddenElements();
    void this.getMetadata();
    this.getArtistAlbums();
    this.getSimilarArtists();
  }
  public async getMetadata() {
    if (!this.browserActions || !this.collectionData || !this.activePlayer) {
      return;
    }
    const metadata = await this.browserActions.actionGetArtistData(
      this.collectionData.media_content_id,
      this.activePlayer.entity_id,
    );
    this.artistMetadata = metadata;
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
  private onItemSelected = (data: mediaCardData, target: HTMLElement) => {
    this.onCollectionSelectAction(data, target);
  };
  private onDrill = () => {
    this.onCollectionDrillAction("artist", this.id, this.title);
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
    return html`
      ${this.renderTitle()}
      <div id="collection-info">
        <div id="tracks-length">${trackString}</div>
      </div>
    `;
  }
  protected renderArtistAlbums(): TemplateResult {
    if (this.artistAlbums.length === 0) {
      return html``;
    }
    const translation = getTranslation(
      "browser.collections.label.artist_albums",
      this.hassUIServices,
    );
    return html`
      <mpc-browser-cards
        title="${translation}"
        id="similar-artists-cards"
        direction="horizontal"
        .onEnqueueAction=${this.onEnqueue}
        .onSelectAction=${this.onItemSelected}
        .onDrillAction=${this.onDrill}
        .cards=${this.artistAlbums}
        section-type="favorite"
      ></mpc-browser-cards>
    `;
  }
  protected renderSimilarArtists(): TemplateResult {
    if (this.similarArtistCards.length === 0) {
      return html``;
    }
    const translation = getTranslation(
      "browser.collections.label.similar_artists",
      this.hassUIServices,
    );
    return html`
      <mpc-browser-cards
        title="${translation}"
        id="similar-artists-cards"
        direction="horizontal"
        .onEnqueueAction=${this.onEnqueue}
        .onSelectAction=${this.onItemSelected}
        .onDrillAction=${this.onDrill}
        .cards=${this.similarArtistCards}
        section-type="favorite"
      ></mpc-browser-cards>
    `;
  }

  protected render(): TemplateResult {
    const vibrantClass = this.useVibrant ? `vibrant` : ``;
    const tracksLabel = getTranslation(
      "browser.collections.label.artist_tracks",
      this.hassUIServices,
    );
    return html`
      <div id="container" class="${vibrantClass}">
        <div id="header">${this.renderHeader()}</div>
        <div id="tracks-container" class="artist">
          <div id="tracks" class="artist no-scroll">
            <div class="label">${tracksLabel}</div>
            ${this.renderTracks()}
          </div>
          <div id="artist-albums">${this.renderArtistAlbums()}</div>
          <div id="similar-artists">${this.renderSimilarArtists()}</div>
        </div>
      </div>
    `;
  }

  protected async testAnimation(delayMs = 50) {
    await delay(delayMs);
    if (
      !this.animationsAdded &&
      (this.virtDiv?.scrollHeight ?? 0) >
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
