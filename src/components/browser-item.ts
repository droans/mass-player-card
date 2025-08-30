import { CSSResultGroup, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { BrowserItemSelectedService, MediaBrowserItem } from "../types";
import styles from '../styles/browser-row';
import { backgroundImageFallback, Icons } from "../utils/icons";

class MediaBrowserCard extends LitElement {
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
  protected render() {
    return html`
      <ha-control-button 
        style="width: 50%; height: 50% margin: 1px;"
        @click=${this.onItemSelected}
      >
        <div 
          class="thumbnail"
          style="${backgroundImageFallback(this._media_item.image, Icons.DISC)}"
        >
        </div>
        <div
          class="title"
        >
          ${this._media_item.name}
        </div>
      </ha-control-button>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-browser-item', MediaBrowserCard);