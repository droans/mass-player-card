import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import styles from "../styles/navigation-bar";
import {
  activeSectionContext,
  controllerContext,
  IconsContext,
} from "../const/context";
import { consume } from "@lit/context";
import { state } from "lit/decorators.js";
import { Sections } from "../const/enums";
import { Config } from "../config/config";
import { MassCardController } from "../controller/controller";
import { MediaBrowser } from "../sections/media-browser";
import { Icons } from "../const/icons";

class MassNavBar extends LitElement {
  private _controller!: MassCardController;
  private _config!: Config;
  private _activeSection!: Sections;
  @consume({ context: IconsContext }) private Icons!: Icons;

  @consume({ context: activeSectionContext, subscribe: true })
  @state()
  public set active_section(section: Sections) {
    if (!this.controller) {
      return;
    }
    this._activeSection = section;
  }
  public get active_section() {
    return this._activeSection;
  }
  private setActiveSection(section: Sections) {
    this.controller.activeSection = section;
  }

  @consume({ context: controllerContext, subscribe: true })
  private set controller(controller: MassCardController) {
    this._controller = controller;
    this.active_section = controller.activeSection;
    this.config = controller.config;
  }
  private get controller() {
    return this._controller;
  }
  private set config(config: Config) {
    this._config = config;
  }
  private get config() {
    return this._config;
  }

  private handleTabChanged = (section: Sections) => {
    this.setActiveSection(section);
    if (section == Sections.MEDIA_BROWSER) {
      this.returnMediaBrowserToHome();
    }
  };
  protected returnMediaBrowserToHome = () => {
    const host = this.controller.host;
    const el: MediaBrowser | null | undefined =
      host.shadowRoot?.querySelector("mass-media-browser");
    if (!el) {
      return;
    }
    el.resetActiveSections();
  };

  protected renderMusicPlayerTab(): TemplateResult {
    const section = Sections.MUSIC_PLAYER;
    const icon = this.Icons.MUSIC;
    if (this.config.player.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  protected renderQueueTab(): TemplateResult {
    const section = Sections.QUEUE;
    const icon = this.Icons.PLAYLIST;
    if (this.config.queue.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  protected renderMediaBrowserTab(): TemplateResult {
    const section = Sections.MEDIA_BROWSER;
    const icon = this.Icons.ALBUM;
    if (this.config.media_browser.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  protected renderPlayersTab(): TemplateResult {
    const section = Sections.PLAYERS;
    const icon = this.Icons.SPEAKER_MULTIPLE;
    if (this.config.players.enabled) {
      return this.renderTab(section, icon);
    }
    return html``;
  }
  private renderTab(section: Sections, icon: string): TemplateResult {
    const active = this.active_section == section;
    return html`
      <a
        class="${active ? `active active-expressive` : ``} player-tabs"
        @click=${() => {
          this.handleTabChanged(section);
        }}
      >
        <i class="icon-i">
          <ha-svg-icon
            .path=${icon}
            class="action-button-svg${active ? "" : "-inactive"}"
          ></ha-svg-icon>
        </i>
      </a>
    `;
  }
  protected render(): TemplateResult {
    return html`
      <div>
        <nav class="tabbed tabbed-expressive">
          <link
            href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css"
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

customElements.define("mass-nav-bar-expressive", MassNavBar);
