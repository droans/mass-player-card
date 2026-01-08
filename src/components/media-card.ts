import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { html } from "lit/static-html.js";
import { property, query, state } from "lit/decorators.js";
import "@droans/webawesome/dist/components/card/card.js";

import "./menu-button";

import { CardEnqueueService, CardSelectedService } from "../const/actions";
import { ExtendedHass, ListItems, MediaCardItem } from "../const/types";
import {
  activeEntityConfContext,
  activeSectionContext,
  configContext,
  EntityConfig,
  hassContext,
  IconsContext,
  mediaBrowserConfigContext,
  useExpressiveContext,
} from "../const/context";
import {
  getEnqueueButtons,
  getSearchMediaButtons,
} from "../const/media-browser";

import styles from "../styles/media-card";

import { jsonMatch } from "../utils/utility";
import {
  DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  HIDDEN_BUTTON_VALUE,
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../config/media-browser";
import { EnqueueOptions, Sections, Thumbnail } from "../const/enums";
import { Icons } from "../const/icons";
import { Config } from "../config/config";
import { WaAnimation } from "../const/elements";
import { HTMLImageElementEvent, MenuButtonEventData } from "../const/events";
import { getThumbnail } from "../utils/thumbnails";

class MediaCard extends LitElement {
  @property({ type: Boolean }) queueable = false;
  @state() code!: TemplateResult;
  private _enqueue_buttons?: ListItems;
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
  public onEnqueueAction!: CardEnqueueService;

  private _sectionConfig!: MediaBrowserConfig;
  private _activeSection!: Sections;
  private _play = false;

  private _config!: MediaCardItem;
  private _entityConfig!: EntityConfig;
  private hide: MediaBrowserHiddenElementsConfig =
    DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG;
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

  @consume({ context: activeEntityConfContext, subscribe: true })
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
      enqueue_menu: entity.enqueue_menu || card.enqueue_menu,
      add_to_queue_button:
        entity.add_to_queue_button || card.add_to_queue_button,
      play_next_button: entity.play_next_button || card.play_next_button,
      play_now_button: entity.play_now_button || card.play_now_button,
      play_next_clear_queue_button:
        entity.play_next_clear_queue_button ||
        card.play_next_clear_queue_button,
      play_now_clear_queue_button:
        entity.play_now_clear_queue_button || card.play_now_clear_queue_button,
      recents: entity.recents || card.recents,
    };
    this.updateEnqueueButtons();
    this.generateCode();
  }
  private updateEnqueueButtons() {
    if (!this.hass || !this.Icons) {
      return;
    }
    const default_buttons = getEnqueueButtons(this.Icons, this.hass);
    const button_mapping = HIDDEN_BUTTON_VALUE;
    const opts = default_buttons.filter((item) => {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hide_val = button_mapping[item.option];
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return !this.hide[hide_val];
    });
    this._enqueue_buttons = opts;
  }
  private onEnqueue = (ev: MenuButtonEventData) => {
    ev.stopPropagation();
    const target = ev.detail;
    const value = target.option as EnqueueOptions;
    this.onEnqueueAction(this._config.data, value);
  };
  private onSelect = () => {
    this.onSelectAction(this._config.data, this);
  };
  protected renderThumbnailFromBackground() {
    return html` ${this.config?.background} `;
  }
  private _renderImageFallback = (ev: HTMLImageElementEvent) => {
    const fallback = getThumbnail(
      this.hass,
      this.config?.fallback ?? Thumbnail.DISC,
    );
    ev.target.src = fallback as string;
  };
  protected renderThumbnailFromThumbnail() {
    const img = this.config?.thumbnail;
    return html`
      <img
        id="thumbnail-div"
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
    return html` <div id="title-div">${this.config?.title}</div> `;
  }
  protected renderEnqueueButton() {
    if (this.hide.enqueue_menu || !this.queueable || !this.Icons) {
      return html``;
    }
    const cols = this.cardConfig?.media_browser.columns;
    return html`
      <mass-menu-button
        id="enqueue-button-div"
        .iconPath=${this.Icons.PLAY_CIRCLE}
        .items=${this._enqueue_buttons}
        style="--columns: ${cols};"
        @menu-item-selected=${this.onEnqueue}
        fixedMenuPosition
      ></mass-menu-button>
    `;
  }
  private generateCode() {
    if (
      !this._enqueue_buttons ||
      !this.hass ||
      !this.activeSection ||
      !this.sectionConfig ||
      !this.Icons ||
      !this.entityConfig
    ) {
      return;
    }
    this.code = html`
      <wa-animation
        id="animation"
        name="pulse"
        easing="ease"
        iterations="1"
        play=${this._play}
        playback-rate="1"
      >
        <div id="container">
          <wa-card
            class="media-card ${this.useExpressive
              ? `media-card-expressive`
              : ``}"
            @click=${this.onSelect}
          >
            <div slot="media" id="media">${this.renderThumbnail()}</div>
            ${this.renderTitle()}
          </wa-card>
          ${this.renderEnqueueButton()}
        </div>
      </wa-animation>
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
customElements.define("mass-media-card", MediaCard);
