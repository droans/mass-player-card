import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { property, query, state } from "lit/decorators.js";
import { html, literal } from "lit/static-html.js";

import "./media-card";

import { CardEnqueueService, CardSelectedService } from "../const/actions";
import {
  activeMediaBrowserCardsContext,
  hassContext,
  mediaBrowserConfigContext,
} from "../const/context";
import { ExtendedHass, mediaCardData, MediaCardItem } from "../const/types";

import styles from "../styles/media-browser-cards";
import { MediaBrowserConfig } from "../config/media-browser";
import { jsonMatch } from "../utils/util";
import { EnqueueOptions } from "../const/enums";

export class MediaBrowserCards extends LitElement {
  @state() public code!: TemplateResult;

  @consume({ context: hassContext, subscribe: true })
  public hass!: ExtendedHass;

  private _loading = false;

  @query(".icons") private _iconsElement?: HTMLDivElement;

  private _browserConfig!: MediaBrowserConfig;

  public onEnqueueAction!: CardEnqueueService;
  public onSelectAction!: CardSelectedService;
  private _items!: MediaCardItem[];

  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  public set browserConfig(conf: MediaBrowserConfig | undefined) {
    if (!jsonMatch(this._browserConfig, conf) && conf) {
      this._browserConfig = conf;
      if (this.items) {
        this.generateCode();
      }
    }
  }
  public get browserConfig() {
    return this._browserConfig;
  }

  @consume({ context: activeMediaBrowserCardsContext, subscribe: true })
  public set items(items: MediaCardItem[] | undefined) {
    if (!items?.length) {
      return;
    }
    if (!jsonMatch(this._items, items)) {
      this._items = items;
      if (this.browserConfig) {
        this.generateCode();
      }
    }
  }
  public get items() {
    return this._items;
  }

  @property({ attribute: "loading", type: Boolean })
  public set loading(loading: boolean) {
    this._loading = loading;
    this.generateCode();
  }
  public get loading() {
    return this._loading;
  }

  private onItemSelected = (data: mediaCardData, target: HTMLElement) => {
    this.resetScroll();
    this.onSelectAction(data, target);
  };
  private onEnqueue = (data: mediaCardData, enqueue: EnqueueOptions) => {
    this.onEnqueueAction(data, enqueue);
  };
  public resetScroll() {
    this._iconsElement?.scrollTo({ top: 0 });
  }
  private generateCode() {
    if (this.loading) {
      this.code = html`
        <link
          href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css"
          rel="stylesheet"
        />
        <div class="shape loading-indicator extra"></div>
      `;
      return;
    }
    const result = this.items?.map((item) => {
      const queueable = [
        "service",
        "playlist",
        "album",
        "artist",
        "podcast",
      ].includes(item.data.type)
        ? literal`queueable`
        : literal``;
      const width = (1 / (this.browserConfig?.columns ?? 1)) * 100 - 2;
      return html`
        <mass-media-card
          style="max-width: ${width.toString()}%"
          .config=${item}
          .onSelectAction=${this.onItemSelected}
          .onEnqueueAction=${this.onEnqueue}
          ${queueable}
        >
        </mass-media-card>
      `;
    });
    this.code = html` <div class="icons wa-grid">${result}</div> `;
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
customElements.define("mass-browser-cards", MediaBrowserCards);
