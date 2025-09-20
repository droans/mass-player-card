import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import styles from '../styles/media-enqueue-card';
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

class MediaEnqueueCard extends LitElement {
  private _config!: MediaCardItem;
  public hass!: ExtendedHass;
  public onEnqueueAction!: CardEnqueueService;
  public onSelectAction!: CardSelectedService;
  @state() code!: TemplateResult;
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
  private artworkStyle() {
    const img = this.config.icon;
    if (!testMixedContent(img)) {
      return getFallbackImage(this.hass, this.config.fallback);
    }
    return backgroundImageFallback(this.hass, img, this.config.fallback);
  }
  protected renderThumbnail() {
    const thumbnail = this.artworkStyle() || "";
    return html`
      <div
        id="thumbnail-div"
        style="${thumbnail}; padding-bottom: 2em;"
      ></div>
    `
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
  protected renderEnqueueOptions() {
    return this._enqueue_buttons.map(
      (item) => {
        return html`
          <ha-list-item
            class="enqueue-list-item"
            .value="${item.option}"
            .graphic=${item.icon}
          >
            <ha-svg-icon
              class="enqueue-item-svg"
              slot="graphic"
              .path=${item.icon}
            ></ha-svg-icon>
            ${item.title}
          </ha-list-item>
        `
      }
    )
  }
  protected renderEnqueueButton() {
    return html`
      <ha-control-select-menu
        id="enqueue-menu-control"
        fixedMenuPosition
        naturalMenuWidth
        @selected=${this.onEnqueue}
      >
        <ha-svg-icon
          slot="icon"
          id="enqueue-svg"
          .path=${mdiPlayCircle}
        ></ha-svg-icon>
        ${this.renderEnqueueOptions()}
      </ha-control-select-menu>
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
          <div id="enqueue-button-div">
            ${this.renderEnqueueButton()}
          </div>
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
customElements.define('mass-media-enqueue-card', MediaEnqueueCard);
