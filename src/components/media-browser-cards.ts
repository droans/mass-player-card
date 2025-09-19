import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import './media-card'
import './media-enqueue-card'
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
        if (item.data?.media_content_id && item.data?.media_content_type) {
          return html`
            <mass-media-enqueue-card
              .config=${item}
              .onSelectAction=${this.onItemSelected}
              .onEnqueueAction=${this.onEnqueue}
              .hass=${this.hass}
            ></mass-media-card>
          `
        }
        return html`
          <mass-media-card
            .config=${item}
            .onSelectAction=${this.onItemSelected}
            .hass=${this.hass}
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
