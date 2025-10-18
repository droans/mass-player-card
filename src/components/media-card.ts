
import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult
} from "lit";
import { 
  html } from "lit/static-html.js";
import {
  property,
  query,
  state
} from "lit/decorators.js";
import '@awesome.me/webawesome/dist/components/card/card.js';

import './menu-button'

import {
  CardEnqueueService,
  CardSelectedService,
  EnqueueOptions,
} from "../const/actions";
import { ExtendedHass, WaAnimation } from "../const/common";
import {
  activeEntityConf,
  activeSectionContext,
  configContext,
  EntityConfig,
  hassExt,
  IconsContext,
  mediaBrowserConfigContext,
  useExpressiveContext
} from "../const/context";
import {
  getEnqueueButtons,
  getSearchMediaButtons,
  ListItems,
  MediaCardItem
} from "../const/media-browser";

import styles from '../styles/media-card';

import {
  asyncBackgroundImageFallback,
  backgroundImageFallback,
  getFallbackBackgroundImage,
} from "../utils/thumbnails";
import { testMixedContent } from "../utils/util";
import {
  DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  HIDDEN_BUTTON_VALUE,
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig
} from "../config/media-browser";
import { Sections } from "../const/card";
import { Icons } from "../const/icons.js";
import { Config } from "../config/config.js";

class MediaCard extends LitElement {
  @property({ type: Boolean }) queueable = false;
  @state() code!: TemplateResult;
  private _enqueue_buttons!: ListItems;
  private _search_buttons!: ListItems;
  private _artwork!: string;

  @query('#animation') _animation!: WaAnimation;
  private _firstLoaded = false;

  private _icons!: Icons;

  @consume({context: hassExt})
  public hass!: ExtendedHass;

  @consume({ context: useExpressiveContext })
  private useExpressive!: boolean;

  private _cardConfig!: Config;

  public onSelectAction!: CardSelectedService;
  public onEnqueueAction!: CardEnqueueService;

  private _sectionConfig!: MediaBrowserConfig;
  private _activeSection!: Sections;
  private _play = false;

  private _config!: MediaCardItem;
  private _entityConfig!: EntityConfig;
  private hide: MediaBrowserHiddenElementsConfig = DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG;
  @consume({ context: activeSectionContext, subscribe: true })
  public set activeSection(section: Sections) {
    this._play = section == Sections.MEDIA_BROWSER;
    this._activeSection = section;
    this.generateCode();
  }
  public get activeSection() {
    return this._activeSection;
  }
  public set config(config: MediaCardItem) {
    if (!config) {
      return;
    }
    const cur_conf = JSON.stringify(this._config);
    const new_conf = JSON.stringify(config)
    if (cur_conf == new_conf) {
      return;
    }
    this._config = config;
    this.updateHiddenElements();
    if (this.cardConfig) {
      void this.generateArtworkStyle();
    }
    this.generateCode();
  }
  public get config() {
    return this._config;
  }
  @consume({ context: configContext, subscribe: true})
  public set cardConfig(config: Config) {
    if (!config) {
      return;
    }
    const cur_conf = JSON.stringify(this._cardConfig);
    const new_conf = JSON.stringify(config)
    if (cur_conf == new_conf) {
      return;
    }
    this._cardConfig = config;
    if (this.config) {
      void this.generateArtworkStyle();
    }
  }
  public get cardConfig() {
    return this._cardConfig;
  }
  
  @consume( { context: mediaBrowserConfigContext, subscribe: true})
  public set sectionConfig(config: MediaBrowserConfig) {
    const cur_conf = JSON.stringify(this._sectionConfig);
    const new_conf = JSON.stringify(config)
    if (cur_conf == new_conf) {
      return;
    }
    this._sectionConfig = config;
    this.updateHiddenElements();
  }
  public get sectionConfig() {
    return this._sectionConfig;
  }
  @consume({ context: IconsContext, subscribe: true}) 
  public set Icons(icons: Icons) {
    const cur_ico = JSON.stringify(this._icons);
    const new_ico = JSON.stringify(icons);
    if (cur_ico == new_ico) {
      return;
    }
    this._icons = icons;
  }
  public get Icons() {
    return this._icons;
  }


  @consume( { context: activeEntityConf, subscribe: true})
  public set entityConfig(config: EntityConfig) {
    const cur_conf = JSON.stringify(this._entityConfig);
    const new_conf = JSON.stringify(config)
    if (cur_conf == new_conf) {
      return;
    }
    this._entityConfig = config;
    this.updateHiddenElements();
    this._search_buttons = getSearchMediaButtons(this.Icons)
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  private set artwork(artwork: string) {
    if (artwork == this._artwork) {
      return;
    }
    this._artwork = artwork;
    this.generateCode();
  }
  private get artwork() {
    return this._artwork;
  }
  private updateHiddenElements() {
    if (!this.config || !this.entityConfig || !this.sectionConfig) {
      return;
    }
    const entity = this.entityConfig.hide.media_browser;
    const card = this.sectionConfig.hide;
    this.hide = {
      back_button: entity.back_button || card.back_button,
      search: entity.search || card.search,
      titles: entity.titles || card.titles,
      enqueue_menu: entity.enqueue_menu|| card.enqueue_menu,
      add_to_queue_button: entity.add_to_queue_button|| card.add_to_queue_button,
      play_next_button: entity.play_next_button|| card.play_next_button,
      play_now_button: entity.play_now_button|| card.play_now_button,
      play_next_clear_queue_button: entity.play_next_clear_queue_button|| card.play_next_clear_queue_button,
      play_now_clear_queue_button: entity.play_now_clear_queue_button|| card.play_now_clear_queue_button,
      recents: entity.recents || card.recents,
    }
    this.updateEnqueueButtons();
    this.generateCode();
  }
  private updateEnqueueButtons() {
    const default_buttons = getEnqueueButtons(this.Icons);
    const button_mapping = HIDDEN_BUTTON_VALUE;
    const opts = default_buttons.filter(
      (item) => {
        //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const hide_val = button_mapping[item.option];
        //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return !this.hide[hide_val];
      }
    )
    this._enqueue_buttons = opts;
  }
  private onEnqueue = (ev: CustomEvent) => {
    ev.stopPropagation();
    /* eslint-disable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access
    */
    const target = ev.target as any;
    const value = target.value as EnqueueOptions;
    if (!value) {
      return;
    }
    target.value = "";
    /* eslint-enable
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access
    */
    this.onEnqueueAction(this._config.data, value);
  }
  private onSelect = () => {
    this.onSelectAction(this._config.data);
  }
  protected renderThumbnailFromBackground() {
    return html`
      ${this.config.background}
    `
  }
  private async generateArtworkStyle() {
    const img = this.config.thumbnail;
    this.artwork = await asyncBackgroundImageFallback(this.hass, img, this.config.fallback, this.cardConfig.download_local);
  }
  private artworkStyle() {
    const img = this.config.thumbnail;
    if (!testMixedContent(img)) {
      return getFallbackBackgroundImage(this.hass, this.config.fallback);
    }
    return backgroundImageFallback(this.hass, img, this.config.fallback);
  }
  protected renderThumbnailFromThumbnail() {
    const thumbnail = this.artwork || "";
    return html`
      <div
        id="thumbnail-div"
        slot="media"
        class="wa-grid"
        style="${thumbnail}; height: 100%; aspect-ratio: 1; width: 100%;"
      ></div>
    `
  }
  protected renderThumbnail() {
    if (this.config.background) {
      return this.renderThumbnailFromBackground();
    }
    return this.renderThumbnailFromThumbnail();
  }
  protected renderTitle() {
    if (this.hide.titles) {
      return html``
    }
    return html`
      <div
        id="title-div"
      >
        ${this.config.title}
      </div>
    `
  }
  protected renderEnqueueButton() {
    if (this.hide.enqueue_menu || !this.queueable) {
      return html``
    }
    return html`
      <mass-menu-button
        id="enqueue-button-div"
        .iconPath=${this.Icons.PLAY_CIRCLE}
        .items=${this._enqueue_buttons}
        .onSelectAction=${this.onEnqueue}
        fixedMenuPosition
      ></mass-menu-button>
    `
  }
  private generateCode() {
    if (
      !this._enqueue_buttons
      || !this.hass
      || !this.activeSection
      || !this.sectionConfig
      || !this.Icons
      || !this.entityConfig
    ) {
      return;
    }
    this.code = html`
      <wa-animation
        id="animation"
        name="pulse"
        easing="ease"
        iterations=1
        play=${this._play}
        playback-rate=1
      >
        <div id="container">
          <wa-card
            class="media-card ${this.useExpressive ? `media-card-expressive` : ``}"
            @click=${this.onSelect}
          >
            <div slot="media" id="media">
              ${this.renderThumbnail()}
            </div>
            ${this.renderTitle()}
          </wa-card>
          ${this.renderEnqueueButton()}
        </div>
      </wa-animation>
    `
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
customElements.define('mass-media-card', MediaCard);
