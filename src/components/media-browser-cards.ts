import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  TemplateResult
} from "lit";
import { state } from "lit/decorators.js";
import {
  html,
  literal
} from "lit/static-html.js";

import './media-card'

import {
  CardEnqueueService,
  CardSelectedService,
  EnqueueOptions
} from "../const/actions";
import { ExtendedHass } from "../const/common";
import { hassExt } from "../const/context";
import {
  MediaCardData,
  MediaCardItem
} from "../const/media-browser";

import styles from '../styles/media-browser-cards';

class MediaBrowserCards extends LitElement {
  @state() private code!: TemplateResult;

  @consume({context: hassExt})
  public hass!: ExtendedHass;

  public onEnqueueAction!: CardEnqueueService;
  public onSelectAction!: CardSelectedService;

  private _items!: MediaCardItem[];

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const queueable = (item.data?.media_content_id?.length > 0 && item.data?.media_content_type?.length > 0) ? literal`queueable` : literal``;
        return html`
          <mass-media-card
            .config=${item}
            .onSelectAction=${this.onItemSelected}
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
