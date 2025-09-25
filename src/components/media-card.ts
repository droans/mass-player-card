
import { consume } from "@lit/context";
import { mdiPlayCircle } from "@mdi/js";
import {
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult
} from "lit";
import {
  property,
  state
} from "lit/decorators.js";

import './menu-button'

import {
  CardEnqueueService,
  CardSelectedService,
  EnqueueOptions,
} from "../const/actions";
import { ExtendedHass } from "../const/common";
import {
  activeEntityConf,
  EntityConfig,
  hassExt,
  mediaBrowserConfigContext
} from "../const/context";
import {
  ENQUEUE_BUTTONS,
  MediaCardItem
} from "../const/media-browser";

import styles from '../styles/media-card';

import {
  backgroundImageFallback,
  getFallbackImage,
} from "../utils/icons";
import { testMixedContent } from "../utils/util";
import {
  DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  HIDDEN_BUTTON_VALUE,
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig
} from "../config/media-browser";

class MediaCard extends LitElement {
  @property({ type: Boolean }) queueable = false;
  @state() code!: TemplateResult;
  @state() private _enqueue_buttons = ENQUEUE_BUTTONS;

  @consume({context: hassExt})
  public hass!: ExtendedHass;

  public onSelectAction!: CardSelectedService;
  public onEnqueueAction!: CardEnqueueService;

  private _cardConfig!: MediaBrowserConfig;

  private _config!: MediaCardItem;
  private _entityConfig!: EntityConfig;
  private hide: MediaBrowserHiddenElementsConfig = DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG;

  public set config(config: MediaCardItem) {
    if (!config) {
      return;
    }
    this._config = config;
    this.updateHiddenElements();
    this.generateCode();
  }
  public get config() {
    return this._config;
  }
  
  @consume( { context: mediaBrowserConfigContext, subscribe: true})
  public set cardConfig(config: MediaBrowserConfig) {
    this._cardConfig = config;
    this.updateHiddenElements();
  }
  public get cardConfig() {
    return this._cardConfig;
  }

  @consume( { context: activeEntityConf, subscribe: true})
  public set entityConfig(config: EntityConfig) {
    this._entityConfig = config;
    this.updateHiddenElements();
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  private updateHiddenElements() {
    if (!this.config || !this.entityConfig || !this.cardConfig) {
      return;
    }
    const entity = this.entityConfig.hide.media_browser;
    const card = this.cardConfig.hide;
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
    }
    this.updateEnqueueButtons();
    this.generateCode();
  }
  private updateEnqueueButtons() {
    const default_buttons = ENQUEUE_BUTTONS;
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
  private artworkStyle() {
    const img = this.config.icon;
    if (!testMixedContent(img)) {
      return getFallbackImage(this.hass, this.config.fallback);
    }
    return backgroundImageFallback(this.hass, img, this.config.fallback);
  }
  protected renderThumbnailFromIcon() {
    const thumbnail = this.artworkStyle() || "";
    return html`
      <div
        id="thumbnail-div"
        style="${thumbnail}; padding-bottom: 2em;"
      ></div>
    `
  }
  protected renderThumbnail() {
    if (this.config.background) {
      return this.renderThumbnailFromBackground();
    }
    return this.renderThumbnailFromIcon();
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
        .iconPath=${mdiPlayCircle}
        .items=${this._enqueue_buttons}
        .onSelectAction=${this.onEnqueue}
      ></mass-menu-button>
    `
  }
  private generateCode() {
    this.code = html`
      <ha-card
      >
        <div id="container">
          <div id="card-button-div">
            <ha-control-button
              @click=${this.onSelect}
            >
              ${this.renderThumbnail()}
              ${this.renderTitle()}
            </ha-control-button>
          </div>
            ${this.renderEnqueueButton()}
        </div>
      </ha-card>
    `
  }
  protected render() {
    return this.code;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-media-card', MediaCard);
