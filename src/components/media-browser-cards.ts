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
import { hassExt, mediaBrowserConfigContext } from "../const/context";
import {
  MediaCardData,
  MediaCardItem
} from "../const/media-browser";

import styles from '../styles/media-browser-cards';
import { MediaBrowserConfig } from "../config/media-browser.js";
import { cache } from "lit/directives/cache.js";

class MediaBrowserCards extends LitElement {
  @state() private code!: TemplateResult;

  @consume({context: hassExt})
  public hass!: ExtendedHass;

  @consume({ context: mediaBrowserConfigContext})
  private browserConfig!: MediaBrowserConfig;

  public onEnqueueAction!: CardEnqueueService;
  public onSelectAction!: CardSelectedService;

  private _items!: MediaCardItem[];

  public set items(items: MediaCardItem[]) {
    if (!items?.length) {
      return;
    }
    const cur_items = JSON.stringify(this._items);
    const new_items = JSON.stringify(items);
    if (cur_items != new_items){
      this._items = items;
      this.generateCode();
    }
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
        const width = ((1 / this.browserConfig.columns) * 100) - 2
        return cache(html`
          <mass-media-card
            style="max-width: ${width.toString()}%"
            .config=${item}
            .onSelectAction=${this.onItemSelected}
            .onEnqueueAction=${this.onEnqueue}
            ${queueable}
          >
          </mass-media-card>
        `)
      }
    )
    this.code = html`
        <div class="icons wa-grid">
          ${result}
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
customElements.define('mass-browser-cards', MediaBrowserCards);
