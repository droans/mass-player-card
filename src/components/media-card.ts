import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { CardSelectedService } from "../const/actions";
import { MediaCardItem } from "../const/media-browser";
import { backgroundImageFallback } from "../utils/icons";
import styles from '../styles/media-card';

class MediaCard extends LitElement {
  private _config!: MediaCardItem;
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
  protected renderThumbnailFromIcon() {
    const thumbnail = backgroundImageFallback(this.config.icon, this.config.fallback);
    return html`
      <div 
        class="thumbnail" 
        style=${thumbnail}
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