import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { CardSelectedService } from "../const/actions";
import { MediaCardItem } from "../const/media-browser";
import { backgroundImageFallback, getFallbackImage } from "../utils/icons";
import styles from '../styles/media-card';
import { testMixedContent } from "../utils/util";
import { ExtendedHass } from "../const/common";

class MediaCard extends LitElement {
  private _config!: MediaCardItem;
  public hass!: ExtendedHass;
  public onSelectAction!: CardSelectedService;
  @state() code!: TemplateResult;

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
  private generateCode() {
    this.code = html`
      <ha-control-button @click=${this.onItemSelected}>
        ${this.renderThumbnail()}
        ${this.renderTitle()}
      </ha-control-button>
    `
  }
  private onItemSelected = () => {
    this.onSelectAction(this.config.data);
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
        class="thumbnail" 
        style="${thumbnail};padding-bottom: 2em;"
      >
      </div>
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
      <div class="title">
        ${this.config.title}
      </div>
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