import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { html, literal } from "lit/static-html.js";

import "./media-card";

import { CardEnqueueService, CardSelectedService } from "../../const/actions";
import {
  activeMediaBrowserCardsContext,
  activeMediaBrowserSectionContext,
  hassContext,
  mediaBrowserConfigContext,
} from "../../const/context";
import { ExtendedHass, mediaCardData, MediaCardItem } from "../../const/types";

import styles from "./media-browser-cards-styles";
import { MediaBrowserConfig } from "../../config/media-browser";
import { jsonMatch } from "../../utils/utility";
import { EnqueueOptions } from "../../const/enums";
import { MediaBrowserSection } from "../../const/media-browser";

@customElement("mpc-browser-cards")
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

  @consume({ context: activeMediaBrowserSectionContext, subscribe: true })
  public activeMediaBrowserSection!: MediaBrowserSection;

  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  public set browserConfig(config: MediaBrowserConfig | undefined) {
    if (!jsonMatch(this._browserConfig, config) && config) {
      this._browserConfig = config;
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
    if (!items) {
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
  public renderEmptyCards(): TemplateResult {
    if (
      ["search", "search-collection"].includes(this.activeMediaBrowserSection)
    ) {
      // TODO: Render empty search
      return html``;
    }
    const width = (1 / (this.browserConfig?.columns ?? 1)) * 100 - 2;
    return html`
      <mpc-browser-media-card
        style="max-width: ${width.toString()}%"
        skeleton
      ></mpc-browser-media-card>
      <mpc-browser-media-card
        style="max-width: ${width.toString()}%"
        skeleton
      ></mpc-browser-media-card>
      <mpc-browser-media-card
        style="max-width: ${width.toString()}%"
        skeleton
      ></mpc-browser-media-card>
      <mpc-browser-media-card
        style="max-width: ${width.toString()}%"
        skeleton
      ></mpc-browser-media-card>
    `;
  }
  private generateCode() {
    if (this.loading) {
      this.code = html`
        <link
          href="https://cdn.jsdelivr.net/npm/beercss@4.0.20/dist/cdn/beer.min.css"
          rel="stylesheet"
        />
        <div class="shape loading-indicator extra"></div>
      `;
      return;
    }
    if (!this.items?.length) {
      this.code = html`
        <div class="icons wa-grid">${this.renderEmptyCards()}</div>
      `;
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        <mpc-browser-media-card
          style="max-width: ${width.toString()}%"
          .config=${item}
          .onSelectAction=${this.onItemSelected}
          .onEnqueueAction=${this.onEnqueue}
          ${queueable}
        >
        </mpc-browser-media-card>
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
