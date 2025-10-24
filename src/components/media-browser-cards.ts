import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
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
import { activeMediaBrowserCardsContext, hassExt, mediaBrowserConfigContext } from "../const/context";
import {
  MediaCardData,
  MediaCardItem
} from "../const/media-browser";

import styles from '../styles/media-browser-cards';
import { MediaBrowserConfig } from "../config/media-browser.js";
import { jsonMatch } from "../utils/util.js";

class MediaBrowserCards extends LitElement {
  @state() public code!: TemplateResult;

  @consume({context: hassExt, subscribe: true})
  public hass!: ExtendedHass;

  private _browserConfig!: MediaBrowserConfig;

  public onEnqueueAction!: CardEnqueueService;
  public onSelectAction!: CardSelectedService;
  private _items!: MediaCardItem[];

  @consume({ context: mediaBrowserConfigContext, subscribe: true})
  public set browserConfig(conf: MediaBrowserConfig) {
    if (!jsonMatch(this._browserConfig, conf)) {
      this._browserConfig = conf
      if (this.items) {
        this.generateCode();
      }
    }
  }
  public get browserConfig() {
    return this._browserConfig;
  }

  @consume({ context: activeMediaBrowserCardsContext, subscribe: true})
  public set items(items: MediaCardItem[]) {
    if (!items?.length) {
      return;
    }
    if (!jsonMatch(this._items, items)){
      this._items = items;
      if (this.browserConfig) {
        this.generateCode();
      }
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
        return html`
          <mass-media-card
            style="max-width: ${width.toString()}%"
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
        <div class="icons wa-grid">
          ${result}
        </div>
    `
  }

  protected render() {
    return this.code;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-browser-cards', MediaBrowserCards);
