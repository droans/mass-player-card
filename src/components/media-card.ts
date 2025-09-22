import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import './menu-button'
import styles from '../styles/media-card';
import { ENQUEUE_BUTTONS, MediaCardItem } from "../const/media-browser";
import { ExtendedHass } from "../const/common";
import {
  CardEnqueueService,
  CardSelectedService,
  EnqueueOptions,
} from "../const/actions";
import { testMixedContent } from "../utils/util";
import { 
  backgroundImageFallback, 
  getFallbackImage,
} from "../utils/icons";
import { mdiPlayCircle } from "@mdi/js";

class MediaCard extends LitElement {
  private _config!: MediaCardItem;
  public hass!: ExtendedHass;
  public onEnqueueAction!: CardEnqueueService;
  public onSelectAction!: CardSelectedService;
  @state() code!: TemplateResult;
  @property({ type: Boolean }) queueable = false;
  private _enqueue_buttons = ENQUEUE_BUTTONS;
  
  public set config(config: MediaCardItem) {
    if (!config) {
      return;
    }
    this._config = config;
    this.generateCode();
  }
  public get config() {
    return this._config;
  }
  private onEnqueue = (ev: CustomEvent) => {
    console.log(`Received onEnqueue`);
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
    return html`
      <div
        id="title-div"
      >
        ${this.config.title}
      </div>
    `
  }
  protected renderEnqueueButton() {
    console.log(`${this.config.title} queueable: ${this.queueable}`);
    if (this.queueable) {
      return html`
        <mass-menu-button
          id="enqueue-button-div"
          .iconPath=${mdiPlayCircle}
          .items=${this._enqueue_buttons}
          .onSelectAction=${this.onEnqueue}
          
        ></mass-menu-button>
      `
    };
    return html``
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
