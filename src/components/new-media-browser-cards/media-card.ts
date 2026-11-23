import "@droans/webawesome/dist/components/card/card.js";
import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { html } from "lit/static-html.js";

import "../menu-button/menu-button";

import { CardEnqueueService, CardSelectedService } from "../../const/actions";
import {
  activeEntityConfigContext,
  EntityConfig,
  hassUIServicesContext,
  IconsContext,
  mediaBrowserConfigContext,
  mediaBrowserHiddenElementsConfigContext,
} from "../../const/context";
import {
  getEnqueueButtons,
  getSearchMediaButtons,
  SHOW_ARTIST_SUBTITLE_SECTIONS,
} from "../../const/media-browser";
import {
  ListItemData,
  ListItems,
  mediaCardCollectionData,
  MediaCardItem,
  UIServicesHass,
} from "../../const/types";

import styles from "./media-card-styles";

import {
  HIDDEN_BUTTON_VALUE,
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../../config/media-browser";
import { HaDropdownMenuElement } from "../../const/elements";
import { EnqueueOptions, Thumbnail } from "../../const/enums";
import { HaDropdownEventData, HTMLImageElementEvent } from "../../const/events";
import { Icons } from "../../const/icons";
import { getThumbnail } from "../../utils/thumbnails";
import { jsonMatch } from "../../utils/utility";

@customElement("mpc-browser-media-card")
export class MediaCard extends LitElement {
  @property({ attribute: "direction", type: String })
  direction: "horizontal" | "vertical" = "horizontal";
  @property({ type: Boolean }) queueable = false;
  @property({ type: Boolean, attribute: "skeleton" }) skeleton = false;
  @property({ type: String, attribute: "size" }) size!: "medium" | "large";
  @property({ attribute: false }) onEnqueueAction!: CardEnqueueService;

  @state() code!: TemplateResult;
  @state() renderDropdown = false;

  @consume({ context: hassUIServicesContext, subscribe: true })
  public hassUI?: UIServicesHass;
  @consume({
    context: mediaBrowserHiddenElementsConfigContext,
    subscribe: true,
  })
  private hide!: MediaBrowserHiddenElementsConfig;

  @query("#enqueue-dropdown") dropdownElement?: HaDropdownMenuElement;

  public onSelectAction!: CardSelectedService;

  private _search_buttons!: ListItems;
  private _firstLoaded = false;
  private _icons!: Icons;
  private _sectionConfig!: MediaBrowserConfig;
  private _play = false;
  private _config!: MediaCardItem;
  private _entityConfig!: EntityConfig;
  private timeout?: number;
  private holdDelayMs = 500;
  private _enqueueButtons?: ListItems;

  public set config(config: MediaCardItem | undefined) {
    if (!config) {
      return;
    }
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    this.generateCode();
  }
  public get config() {
    return this._config;
  }

  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  public set sectionConfig(config: MediaBrowserConfig | undefined) {
    if (jsonMatch(this._sectionConfig, config) || !config) {
      return;
    }
    this._sectionConfig = config;
    this.updateHiddenElements();
    this.generateCode();
  }
  public get sectionConfig() {
    return this._sectionConfig;
  }
  @consume({ context: IconsContext, subscribe: true })
  public set Icons(icons: Icons | undefined) {
    if (jsonMatch(this._icons, icons) || !icons) {
      return;
    }
    this._icons = icons;
  }
  public get Icons() {
    return this._icons;
  }

  @consume({ context: activeEntityConfigContext, subscribe: true })
  public set entityConfig(config: EntityConfig | undefined) {
    if (jsonMatch(this._entityConfig, config) || !config) {
      return;
    }
    this._entityConfig = config;
    this.updateHiddenElements();
    if (this.hassUI && this.Icons) {
      this._search_buttons = getSearchMediaButtons(this.Icons, this.hassUI);
    }
    this.generateCode();
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  private subtitlesEnabled(): boolean {
    const sectionAllowsSubtitles = SHOW_ARTIST_SUBTITLE_SECTIONS.includes(
      this.config?.data.type ?? ``,
    );
    const subtitlesEnabled = this.sectionConfig?.show_artist_subtitles;
    if (sectionAllowsSubtitles && subtitlesEnabled) {
      const _data = this.config?.data as mediaCardCollectionData | undefined;
      return (_data?.media_artist ?? "").length > 0;
    }
    return false;
  }

  private updateHiddenElements() {
    this.updateEnqueueButtons();
  }
  private updateEnqueueButtons() {
    if (!this.hassUI || !this.Icons) {
      return;
    }
    const defaultButtons = getEnqueueButtons(this.Icons, this.hassUI);
    const buttonMapping = HIDDEN_BUTTON_VALUE;
    const options = defaultButtons.filter((item) => {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hideValue = buttonMapping[item.option];
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return !this.hide[hideValue];
    });
    this._enqueueButtons = options;
  }
  private onEnqueueSelect = (event_: HaDropdownEventData) => {
    event_.stopPropagation();
    if (this.skeleton) {
      return;
    }
    const target = event_.detail;
    const value = target.item.value as unknown as EnqueueOptions;
    this.onEnqueueAction(this._config.data, value);
  };
  private onHold = () => {
    if (this.dropdownElement) {
      this.dropdownElement.open = true;
      return;
    }
    this.renderDropdown = true;
    this.generateCode();
  };
  private onPointerOut = () => {
    this.removePointerEvents();
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  };
  private onPointerDown = (event_: PointerEvent) => {
    event_.stopImmediatePropagation();
    if (event_.button != 0) {
      return;
    }
    this.addPointerEvents();
    this.timeout = window.setTimeout(() => {
      if (!this.timeout) {
        return;
      }
      this.timeout = undefined;
      this.removePointerEvents();
      this.onHold();
    }, this.holdDelayMs);
  };
  private onPointerUp = (event_: PointerEvent) => {
    event_.stopImmediatePropagation();
    if (event_.button != 0) {
      return;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.onSelect(event_);
      this.timeout = undefined;
    }
  };
  private onSelect = (event_: PointerEvent) => {
    if (event_.button != 0) {
      return;
    }
    if (this.skeleton) {
      return;
    }
    this.onSelectAction(this._config.data, this);
  };
  private removePointerEvents() {
    this.removeEventListener("pointerup", this.onPointerUp);
    this.removeEventListener("pointerout", this.onPointerOut);
  }
  private addPointerEvents() {
    /* eslint-disable listeners/no-missing-remove-event-listener */
    this.addEventListener("pointerup", this.onPointerUp);
    this.addEventListener("pointerout", this.onPointerOut);
    /* eslint-enable listeners/no-missing-remove-event-listener */
  }
  protected renderEnqueueButton(button: ListItemData): TemplateResult {
    return html`
      <ha-dropdown-item class="enqueue" value=${button.option}>
        <ha-svg-icon
          class="icon"
          slot="icon"
          .path=${button.icon}
        ></ha-svg-icon>
        <div class="label">${button.title}</div>
      </ha-dropdown-item>
    `;
  }
  protected renderEnqueueMenu(): TemplateResult {
    if (!this._enqueueButtons?.length || !this.renderDropdown) {
      return html``;
    }
    const dropdownHtml = this._enqueueButtons.map((button) => {
      return this.renderEnqueueButton(button);
    });
    return html`
      <ha-dropdown
        id="enqueue-dropdown"
        @wa-select=${this.onEnqueueSelect}
        placement="bottom"
        open
      >
        <button class="hidden" slot="trigger"></button>
        ${dropdownHtml}
      </ha-dropdown>
    `;
  }
  private _renderImageFallback = (event_: Event) => {
    const fallback = getThumbnail(
      this.hassUI,
      this.config?.fallback ?? Thumbnail.DISC,
    );
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const ev = event_ as HTMLImageElementEvent;
    if (fallback == ev.target.src) {
      ev.target.removeEventListener("error", this._renderImageFallback);
    }
    ev.target.src = fallback as string;
    ev.target.removeEventListener("error", this._renderImageFallback);
  };
  protected renderThumbnail() {
    const img = this.config?.thumbnail;
    return html`
      <img
        id="thumbnail-img"
        slot="media"
        class="wa-grid ${this.size}"
        src="${img}"
        @error=${this._renderImageFallback}
        loading="lazy"
      />
    `;
  }
  protected renderTitle() {
    if (this.hide.titles) {
      return html``;
    }
    return html`
      <div id="title-div">${this.config?.title} ${this.generateSubtitle()}</div>
    `;
  }
  private generateSubtitle(): TemplateResult {
    if (!this.subtitlesEnabled()) {
      return html``;
    }
    const _config = this.config?.data as mediaCardCollectionData;
    return html` <div id="subtitle-div">${_config.media_artist}</div> `;
  }
  private generateSkeleton(): TemplateResult {
    return html`
      <wa-skeleton
        id="skeleton"
        effect="sheen"
        class="media-card"
      ></wa-skeleton>
    `;
  }
  private generateCard(): TemplateResult {
    return html`
      <wa-card
        class="media-card"
        @pointerdown=${this.onPointerDown}
        slot="trigger"
      >
        <div slot="media" id="media">${this.renderThumbnail()}</div>
        ${this.renderTitle()}
      </wa-card>
      ${this.renderEnqueueMenu()}
    `;
  }
  private generateCode() {
    if (
      !this.hassUI ||
      !this.sectionConfig ||
      !this.Icons ||
      !this.entityConfig
    ) {
      return;
    }
    this.code = html`
      <div id="container-outer">
        <div id="container">
          ${this.skeleton ? this.generateSkeleton() : this.generateCard()}
        </div>
      </div>
    `;
  }
  protected render() {
    return this.code;
  }
  protected firstUpdated(): void {
    this._firstLoaded = true;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
