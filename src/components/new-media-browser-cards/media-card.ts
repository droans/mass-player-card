import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { html } from "lit/static-html.js";
import { customElement, property, query, state } from "lit/decorators.js";
import "@droans/webawesome/dist/components/card/card.js";

import "../menu-button/menu-button";

import { CardSelectedService } from "../../const/actions";
import {
  ExtendedHass,
  ListItems,
  mediaCardCollectionData,
  MediaCardItem,
} from "../../const/types";
import {
  activeEntityConfigContext,
  activeSectionContext,
  configContext,
  EntityConfig,
  hassContext,
  IconsContext,
  mediaBrowserConfigContext,
  mediaBrowserHiddenElementsConfigContext,
  useExpressiveContext,
} from "../../const/context";
import {
  getSearchMediaButtons,
  SHOW_ARTIST_SUBTITLE_SECTIONS,
} from "../../const/media-browser";

import styles from "./media-card-styles";

import { jsonMatch } from "../../utils/utility";
import {
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../../config/media-browser";
import { Sections, Thumbnail } from "../../const/enums";
import { Icons } from "../../const/icons";
import { Config } from "../../config/config";
import { WaAnimation } from "../../const/elements";
import { HTMLImageElementEvent } from "../../const/events";
import { getThumbnail } from "../../utils/thumbnails";

@customElement("mpc-browser-media-card")
export class MediaCard extends LitElement {
  @property({ type: Boolean }) queueable = false;
  @property({ type: Boolean, attribute: "skeleton" }) skeleton = false;
  @property({ type: String, attribute: "size" }) size!: "medium" | "large";
  @state() code!: TemplateResult;
  private _search_buttons!: ListItems;

  @query("#animation") _animation!: WaAnimation;
  private _firstLoaded = false;

  private _icons!: Icons;

  @consume({ context: hassContext })
  public hass?: ExtendedHass;

  @consume({ context: useExpressiveContext })
  private useExpressive!: boolean;

  private _cardConfig!: Config;

  public onSelectAction!: CardSelectedService;

  private _sectionConfig!: MediaBrowserConfig;
  private _activeSection!: Sections;
  private _play = false;

  private _config!: MediaCardItem;
  private _entityConfig!: EntityConfig;
  @consume({
    context: mediaBrowserHiddenElementsConfigContext,
    subscribe: true,
  })
  private hide!: MediaBrowserHiddenElementsConfig;
  @consume({ context: activeSectionContext, subscribe: true })
  public set activeSection(section: Sections | undefined) {
    if (!section) {
      return;
    }
    this._play = section == Sections.MEDIA_BROWSER;
    this._activeSection = section;
    this.generateCode();
  }
  public get activeSection() {
    return this._activeSection;
  }
  public set config(config: MediaCardItem | undefined) {
    if (!config) {
      return;
    }
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    this.updateHiddenElements();
    this.generateCode();
  }
  public get config() {
    return this._config;
  }
  @consume({ context: configContext, subscribe: true })
  public set cardConfig(config: Config | undefined) {
    if (!config) {
      return;
    }
    if (jsonMatch(this._cardConfig, config)) {
      return;
    }
    this._cardConfig = config;
  }
  public get cardConfig() {
    return this._cardConfig;
  }

  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  public set sectionConfig(config: MediaBrowserConfig | undefined) {
    if (jsonMatch(this._sectionConfig, config) || !config) {
      return;
    }
    this._sectionConfig = config;
    this.updateHiddenElements();
  }
  public get sectionConfig() {
    return this._sectionConfig;
  }
  @consume({ context: IconsContext, subscribe: true })
  public set Icons(icons: Icons | undefined) {
    if (jsonMatch(this._icons, icons) || !icons) {
      return;
    }
    this._icons = icons;
  }
  public get Icons() {
    return this._icons;
  }

  @consume({ context: activeEntityConfigContext, subscribe: true })
  public set entityConfig(config: EntityConfig | undefined) {
    if (jsonMatch(this._entityConfig, config) || !config) {
      return;
    }
    this._entityConfig = config;
    this.updateHiddenElements();
    if (this.hass && this.Icons) {
      this._search_buttons = getSearchMediaButtons(this.Icons, this.hass);
    }
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  private subtitlesEnabled(): boolean {
    const sectionAllowsSubtitles = SHOW_ARTIST_SUBTITLE_SECTIONS.includes(
      this.config?.data.type ?? ``,
    );
    const subtitlesEnabled =
      this.cardConfig?.media_browser.show_artist_subtitles;
    if (sectionAllowsSubtitles && subtitlesEnabled) {
      const _data = this.config?.data as mediaCardCollectionData | undefined;
      return (_data?.media_artist ?? "").length > 0;
    }
    return false;
  }

  private updateHiddenElements() {
    this.generateCode();
  }
  private onSelect = () => {
    if (this.skeleton) {
      return;
    }
    this.onSelectAction(this._config.data, this);
  };
  protected renderThumbnailFromBackground() {
    return html` ${this.config?.background} `;
  }
  private _renderImageFallback = (event_: Event) => {
    const fallback = getThumbnail(
      this.hass,
      this.config?.fallback ?? Thumbnail.DISC,
    );
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const ev = event_ as HTMLImageElementEvent;
    if (fallback == ev.target.src) {
      ev.target.removeEventListener("error", this._renderImageFallback);
    }
    ev.target.src = fallback as string;
    ev.target.removeEventListener("error", this._renderImageFallback);
  };
  protected renderThumbnailFromThumbnail() {
    const img = this.config?.thumbnail;
    return html`
      <img
        id="thumbnail-div ${this.size}"
        slot="media"
        class="wa-grid"
        src="${img}"
        @error=${this._renderImageFallback}
        loading="lazy"
      />
    `;
  }
  protected renderThumbnail() {
    if (this.config?.background) {
      return this.renderThumbnailFromBackground();
    }
    return this.renderThumbnailFromThumbnail();
  }
  protected renderTitle() {
    if (this.hide.titles) {
      return html``;
    }
    return html`
      <div id="title-div" class="${this.useExpressive ? `expressive` : ``}">
        ${this.config?.title} ${this.generateSubtitle()}
      </div>
    `;
  }
  private generateSubtitle(): TemplateResult {
    if (!this.subtitlesEnabled()) {
      return html``;
    }
    const _config = this.config?.data as mediaCardCollectionData;
    return html`
      <div id="subtitle-div" class="${this.useExpressive ? `expressive` : ``}">
        ${_config.media_artist}
      </div>
    `;
  }
  private generateSkeleton(): TemplateResult {
    return html`
      <wa-skeleton
        id="skeleton"
        effect="sheen"
        class="media-card${this.useExpressive ? ` expressive` : ``}"
      ></wa-skeleton>
    `;
  }
  private generateCard(): TemplateResult {
    return html`
      <wa-card
        class="media-card${this.useExpressive ? ` expressive` : ``}"
        @click=${this.onSelect}
      >
        <div slot="media" id="media">${this.renderThumbnail()}</div>
        ${this.renderTitle()}
      </wa-card>
    `;
  }
  private generateCode() {
    if (
      !this.hass ||
      !this.activeSection ||
      !this.sectionConfig ||
      !this.Icons ||
      !this.entityConfig
    ) {
      return;
    }
    this.code = html`
      <div id="container-outer">
        <wa-animation
          id="animation"
          name="pulse"
          easing="ease"
          iterations="1"
          play=${this._play}
          playback-rate="1"
        >
          <div id="container">
            ${this.skeleton ? this.generateSkeleton() : this.generateCard()}
          </div>
        </wa-animation>
      </div>
    `;
  }
  protected render() {
    return this.code;
  }
  protected firstUpdated(): void {
    this._firstLoaded = true;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  connectedCallback(): void {
    if (this._firstLoaded) {
      this._animation.play = true;
    }
    super.connectedCallback();
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
