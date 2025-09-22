import { CSSResultGroup, LitElement, TemplateResult } from "lit";
import { html, literal } from "lit/static-html.js";
import './media-card'
import { MediaCardData, MediaCardItem } from "../const/media-browser";
import { CardEnqueueService, CardSelectedService, EnqueueOptions } from "../const/actions";
import { state } from "lit/decorators.js";
import styles from '../styles/media-browser-cards';
import { ExtendedHass } from "../const/common";

class MediaBrowserCards extends LitElement {
  public onSelectAction!: CardSelectedService;
  public onEnqueueAction!: CardEnqueueService;
  public hass!: ExtendedHass;
  private _items!: MediaCardItem[];
  @state() private code!: TemplateResult;

  public set items(items: MediaCardItem[]) {
    if (!items?.length) {
      return;
    }
    this._items = items;
    this.generateCode();
  }
  public get items() {
    return this._items;
  }
  private onItemSelected = (data: MediaCardData) => {
    this.onSelectAction(data);
  }
  private onEnqueue = (data: MediaCardData, enqueue: EnqueueOptions) => {
    this.onEnqueueAction(data, enqueue);
  }
  private generateCode() {
    const result = this.items.map(
      (item) => {
        const queueable = (item.data?.media_content_id?.length > 0 && item.data?.media_content_type?.length > 0) ? literal`queueable` : literal``;
        return html`
          <mass-media-card
            .config=${item}
            .onSelectAction=${this.onItemSelected}
            .hass=${this.hass}
            .onEnqueueAction=${this.onEnqueue}
            ${queueable}
          >
          </mass-media-card>
        `
      }
    )
    this.code = html`
      <ha-card>
        <div class="icons">
          ${result}
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
customElements.define('mass-browser-cards', MediaBrowserCards);
