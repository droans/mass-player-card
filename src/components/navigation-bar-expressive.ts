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
import { query, state } from "lit/decorators.js";
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
  @query('#tab-music-player') playerTab?: HTMLAnchorElement;
  @query('#tab-queue') queueTab?: HTMLAnchorElement;
  @query('#tab-media-browser') browserTab?: HTMLAnchorElement;
  @query('#tab-players') playersTab?: HTMLAnchorElement;
  @query('#tab-indicator') tabIndicator!: HTMLDivElement;
  @query('#navigation') navbar!: HTMLDivElement;
  private animationLength = 250;

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
    const cur_section = this.active_section;
    this.animateTabChange(cur_section, section);
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
  private getSectionElement(section: Sections): HTMLAnchorElement | undefined {
    const elems = {
      'media-browser': this.browserTab,
      'music-player': this.playerTab,
      'queue': this.queueTab,
      'players': this.playersTab,
    }
    return elems[section];
  }
  private animateBounceLeft(to_element: HTMLAnchorElement): Keyframe {
    const to_left = to_element.offsetLeft;
    const to_width = to_element.offsetWidth;
    
    const bounce_move = to_width * 0.2;

    const bounce_left = Math.max(0, to_left - bounce_move);
    const bounce_width = bounce_left > 0 ? to_width : to_width - (to_left + bounce_move)
    return {
      left: `${bounce_left.toString()}px`,
      width: `${bounce_width.toString()}px`,
      offset: 0.8,
    }
  }
  private animateBounceRight(to_element: HTMLAnchorElement): Keyframe {
    const to_left = to_element.offsetLeft;
    const to_width = to_element.offsetWidth;
    
    const bounce_move = to_width * 0.1;
    const navbarWidth = this.navbar.offsetWidth;
    const to_elem_x_end = to_left + to_width;
    
    const bounce_left = to_left + bounce_move;
    const bounce_width = to_elem_x_end >= navbarWidth ? navbarWidth - bounce_left : to_width;
    return {
      left: `${bounce_left.toString()}px`,
      width: `${bounce_width.toString()}px`,
      offset: 0.8,
    }
  }
  private animateTabChange(from_section: Sections, to_section: Sections) {
    if (from_section == to_section) {
      return;
    }
    const from_elem = this.getSectionElement(from_section);
    const to_elem = this.getSectionElement(to_section);
    if (!from_elem || !to_elem) {
      return;
    }
    const from_width = from_elem.offsetWidth;
    const from_left = from_elem.offsetLeft;
    const to_width = to_elem.offsetWidth;
    const to_left = to_elem.offsetLeft;
    const bounce = from_left - to_left > 0 ? this.animateBounceLeft(to_elem) : this.animateBounceRight(to_elem)
    const _keyframes = [
      {
        left: `${from_left.toString()}px`,
        width: `${from_width.toString()}px`
      }, // from
      bounce,
      {
        left: `${to_left.toString()}px`,
        width: `${to_width.toString()}px`
      }, // to
    ]
    const keyframeEffect = new KeyframeEffect(
      this.tabIndicator,
      _keyframes,
      {
        // keyframe options
        duration: this.animationLength,
        // direction: "alternate",
        // easing: "ease-in-out",
        iterations: 1,
      },
    );
    const animation = new Animation(keyframeEffect, document.timeline);
    animation.play();
  }

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
  private renderIndicator(): TemplateResult {
    const elem = this.getSectionElement(this.active_section);
    const left = elem ? elem.offsetLeft : 0;
    const width = elem ? elem.offsetWidth : 113;
    return html`
      <div
        id="tab-indicator"
        style="left: ${left}px; width: ${width}px"
      ></div>
    `
  }
  private renderTab(section: Sections, icon: string): TemplateResult {
    const active = this.active_section == section;
    return html`
      <a
        id="tab-${section}"
        class="player-tabs"
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
    // return html`
    //   <a
    //     id="tab-${section}"
    //     class="${active ? `active active-expressive` : ``} player-tabs"
    //     @click=${() => {
    //       this.handleTabChanged(section);
    //     }}
    //   >
    //     <i class="icon-i">
    //       <ha-svg-icon
    //         .path=${icon}
    //         class="action-button-svg${active ? "" : "-inactive"}"
    //       ></ha-svg-icon>
    //     </i>
    //   </a>
    // `;
  }
  protected render(): TemplateResult {
    return html`
      <div>
        <nav id="navigation" class="tabbed tabbed-expressive">
          <link
            href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css"
            rel="stylesheet"
          />
          ${this.renderMusicPlayerTab()} ${this.renderQueueTab()}
          ${this.renderMediaBrowserTab()} ${this.renderPlayersTab()}
          ${this.renderIndicator()}
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
