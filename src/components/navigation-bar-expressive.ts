import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import styles  from '../styles/navigation-bar'
import {
  activeSectionContext,
  controllerContext,
  IconsContext
} from "../const/context.js";
import { consume } from "@lit/context";
import { state } from "lit/decorators.js";
import { Sections } from "../const/card.js";
import { Config } from "../config/config.js";
import { MassCardController } from "../controller/controller.js";
import { MediaBrowser } from "../sections/media-browser.js";
import { Icons } from "../const/icons.js";

class MassNavBar extends LitElement {
  private _controller!: MassCardController;
  private _config!: Config;
  @consume({ context: IconsContext}) private Icons!: Icons;

  @consume({ context: activeSectionContext, subscribe: true}) 
  @state() 
  private set active_section(section: Sections) {
    if (!this.controller) {
      return;
    }
    this.controller.activeSection = section;
  }
  public get active_section() {
    return this.controller?.activeSection;
  }

  @consume({ context: controllerContext, subscribe: true})
  private set controller(controller: MassCardController) {
    this._controller = controller;
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
    this.active_section = section;
    if (section == Sections.MEDIA_BROWSER) {
      this.returnMediaBrowserToHome();
    }
  }
  protected returnMediaBrowserToHome = () => {
    const host = this.controller.host;
    const el: MediaBrowser | null | undefined = host.shadowRoot?.querySelector('mass-media-browser');
    if (!el) {
      return;
    }
    el.activeSection = 'favorites';    
    el.activeSubSection = 'main';
    el.setActiveCards();
  }

  protected renderMusicPlayerTab(): TemplateResult {
    const section = Sections.MUSIC_PLAYER;
    const icon = this.Icons.MUSIC;
    if (this.config.player.enabled){
      return this.renderTab(section, icon)
    }
    return html``
  }
  protected renderQueueTab(): TemplateResult {
    const section = Sections.QUEUE;
    const icon = this.Icons.PLAYLIST;
    if (this.config.queue.enabled){
      return this.renderTab(section, icon)
    }
    return html``
  }
  protected renderMediaBrowserTab(): TemplateResult {
    const section = Sections.MEDIA_BROWSER;
    const icon = this.Icons.ALBUM;
    if (this.config.media_browser.enabled){
      return this.renderTab(section, icon)
    }
    return html``
  }
  protected renderPlayersTab(): TemplateResult {
    const section = Sections.PLAYERS;
    const icon = this.Icons.SPEAKER_MULTIPLE;
    if (this.config.players.enabled){
      return this.renderTab(section, icon)
    }
    return html``
  }
  private renderTab(section: Sections, icon: string): TemplateResult {
    const active = this.active_section == section;
    return html`
      <a 
        class="${active ? `active active-expressive` : ``} player-tabs"
        @click=${() => {this.handleTabChanged(section)}}
      >
        <i class="icon-i">
          <ha-svg-icon
            .path=${icon}
            class="action-button-svg${active ? "" : "-inactive"}"
          ></ha-svg-icon>
        </i>
      </a>
    `
    
  }
  protected render(): TemplateResult {
    return html`
      <div>
        <nav class="tabbed tabbed-expressive">
          <link href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css" rel="stylesheet">
          ${this.renderMusicPlayerTab()}
          ${this.renderQueueTab()}
          ${this.renderMediaBrowserTab()}
          ${this.renderPlayersTab()}
        </nav>
      </div>
    `
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return super.shouldUpdate(_changedProperties);
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-nav-bar-expressive', MassNavBar);