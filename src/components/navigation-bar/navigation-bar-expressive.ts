import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import styles from "./navigation-bar-styles";
import {
  activeSectionContext,
  controllerContext,
  hassContext,
  IconsContext,
} from "../../const/context";
import { consume } from "@lit/context";
import { customElement, query, state } from "lit/decorators.js";
import { Sections } from "../../const/enums";
import { Config } from "../../config/config";
import { MassCardController } from "../../controller/controller";
import { MediaBrowser } from "../../sections/new-media-browser";
import { Icons } from "../../const/icons";
import { WaAnimation } from "../../const/elements";
import { QueueCard } from "../../sections/player-queue";
import { getTranslation } from "../../utils/translations";
import { ExtendedHass } from "../../const/types";

const TRANSLATION_KEYS: Record<Sections, string> = {
  "music-player": "tab.player.label",
  queue: "tab.queue.label",
  "media-browser": "tab.browser.label",
  players: "tab.players.label",
};

@customElement("mpc-navbar-expressive")
export class MassNavBar extends LitElement {
  private _controller?: MassCardController;
  private _config?: Config;
  private _activeSection?: Sections;
  @consume({ context: IconsContext }) private Icons!: Icons;
  @query("#tab-music-player") playerTab?: HTMLAnchorElement;
  @query("#tab-queue") queueTab?: HTMLAnchorElement;
  @query("#tab-media-browser") browserTab?: HTMLAnchorElement;
  @query("#tab-players") playersTab?: HTMLAnchorElement;
  @query("#tab-indicator") tabIndicator?: HTMLDivElement;
  @query("#animation") animationElement?: WaAnimation;
  @query("#navigation") navbar?: HTMLDivElement;
  @query(".icon-active") activeIconElem?: HTMLElement;
  private animationDuration = 300;
  private bounceAwayDuration = 60;
  private bounceInDuration = 30;
  private animating = false;
  private tabIndicatorLeftPx = "0px";
  private tabIndicatorWidthPx = "0px";
  private previousSection?: Sections;
  private sections: Sections[] = [];

  @consume({ context: hassContext, subscribe: true }) hass!: ExtendedHass;

  @consume({ context: activeSectionContext, subscribe: true })
  @state()
  public set activeSection(section: Sections | undefined) {
    if (!this.controller) {
      return;
    }
    if (section != this.activeSection && section) {
      this.handleTabChanged(section);
    }
    if (this._activeSection) {
      this.previousSection = this.activeSection;
    }
    this._activeSection = section;
  }
  public get activeSection() {
    return this._activeSection;
  }
  private setActiveSection(section: Sections) {
    if (this.controller) this.controller.activeSection = section;
  }

  @consume({ context: controllerContext, subscribe: true })
  private set controller(controller: MassCardController | undefined) {
    if (!controller) {
      return;
    }
    this._controller = controller;
    this.activeSection = controller.activeSection;
    this.config = controller.config;
  }
  private get controller() {
    return this._controller;
  }
  private set config(config: Config | undefined) {
    this._config = config;
    if (config) {
      const sections: Sections[] = [];
      if (config.player.enabled) sections.push(Sections.MUSIC_PLAYER);
      if (config.queue.enabled) sections.push(Sections.QUEUE);
      if (config.media_browser.enabled) sections.push(Sections.MEDIA_BROWSER);
      if (config.players.enabled) sections.push(Sections.PLAYERS);
      this.sections = sections;
    }
  }
  private get config() {
    return this._config;
  }

  private handleTabChanged = (section: Sections) => {
    this.setActiveSection(section);
    if (section == Sections.MEDIA_BROWSER) {
      this.returnMediaBrowserToHome();
    }
    if (section == Sections.QUEUE) {
      this.returnQueueToActive();
    }
  };
  protected returnQueueToActive = () => {
    const host = this.controller?.host;
    const element: QueueCard | null | undefined =
      host?.shadowRoot?.querySelector("mpc-queue-card");
    if (!element) {
      return;
    }
    element.scrollToActive();
  };
  protected returnMediaBrowserToHome = () => {
    const host = this.controller?.host;
    const element: MediaBrowser | null | undefined =
      host?.shadowRoot?.querySelector("mpc-media-browser");
    if (!element) {
      return;
    }
    element.resetActiveSections();
  };
  private getSectionElement(section: Sections): HTMLAnchorElement | undefined {
    const elements = {
      "media-browser": this.browserTab,
      "music-player": this.playerTab,
      queue: this.queueTab,
      players: this.playersTab,
    };
    return elements[section];
  }
  private getActiveSectionIndex(): number {
    const activeSection = this.activeSection;
    const idx = this.sections.findIndex((item) => {
      return item == activeSection;
    });
    if (!idx && idx != 0) {
      return 0;
    }
    return idx;
  }
  private getPriorSectionIndex(): number {
    if (!this.previousSection) {
      return this.getActiveSectionIndex();
    }
    const idx = this.sections.findIndex((item) => {
      return item == this.previousSection;
    });
    if (!idx && idx != 0) {
      return 0;
    }
    return idx;
  }

  protected renderMusicPlayerTab(): TemplateResult {
    const section = Sections.MUSIC_PLAYER;
    const icon = this.Icons.MUSIC;
    if (this.config?.player.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  protected renderQueueTab(): TemplateResult {
    const section = Sections.QUEUE;
    const icon = this.Icons.PLAYLIST;
    if (this.config?.queue.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  protected renderMediaBrowserTab(): TemplateResult {
    const section = Sections.MEDIA_BROWSER;
    const icon = this.Icons.ALBUM;
    if (this.config?.media_browser.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  protected renderPlayersTab(): TemplateResult {
    const section = Sections.PLAYERS;
    const icon = this.Icons.SPEAKER_MULTIPLE;
    if (this.config?.players.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  private renderTab(section: Sections, icon: string): TemplateResult {
    const active = this.activeSection == section;
    const label = active
      ? getTranslation(TRANSLATION_KEYS[section], this.hass)
      : ``;
    return html`
      <a
        id="tab-${section}"
        class="player-tabs ${active ? `active` : ``}"
        @click=${() => {
          this.handleTabChanged(section);
        }}
      >
        <div class="icon-div">
          <i class="icon-i ${active ? `active` : ``}">
            <ha-svg-icon
              .path=${icon}
              class="action-button-svg ${active ? "" : "inactive"}"
            ></ha-svg-icon>
          </i>
        </div>
        <div class="label-div">${label}</div>
      </a>
    `;
  }
  protected render(): TemplateResult {
    return html`
      <div>
        <nav id="navigation" class="tabbed expressive">
          <link
            href="https://cdn.jsdelivr.net/npm/beercss@4.0.20/dist/cdn/beer.min.css"
            rel="stylesheet"
          />
          ${this.renderMusicPlayerTab()} ${this.renderQueueTab()}
          ${this.renderMediaBrowserTab()} ${this.renderPlayersTab()}
        </nav>
      </div>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return _changedProperties.size > 0;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
