import { CSSResultGroup, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { BrowserItemSelectedService, MediaBrowserItem } from "../types";
import styles from '../styles/browser-row';

class MediaBrowserRow extends LitElement {
  private _media_item!: MediaBrowserItem
  public onSelectAction!: BrowserItemSelectedService;

  @property({ attribute: false })
  public set mediaItem(mediaItem: MediaBrowserItem) {
    if (mediaItem) {
      this._media_item = mediaItem;
    }
  }

  private onItemSelected = () => {
    this.onSelectAction(this._media_item.uri, this._media_item.media_type);
  }
  protected renderThumbnail() {
    return html`
      <span 
        class="thumbnail" 
        slot="start" 
        style="background-image: url(${this._media_item.image})"
      >
      </span>
    `
  }
  protected renderTitle() {
    return html`
      <span
        slot="headline"
        class="title"
      >
        ${this._media_item.name}
      </span>
      <span slot="supporting-text">
      </span>
    `
  }
  protected render() {
    return html`
      <ha-md-list-item
        class="button"
        @click=${this.onItemSelected}
        type="button"
      >
        ${this.renderThumbnail()}
        ${this.renderTitle()}
      </ha-md-list-item>
      <div class="divider"</div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-track-row', MediaBrowserRow);