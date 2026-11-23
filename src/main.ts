import { consume, provide } from "@lit/context";
import {
  type CSSResultGroup,
  LitElement,
  PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, state } from "lit/decorators.js";
import { cache } from "lit/directives/cache.js";
import { html } from "lit/static-html.js";

import "./sections/music-player";
import "./sections/new-media-browser";
import "./sections/player-queue";
import "./sections/players";

// import "./components/navigation-bar/navigation-bar";
import "./components/navigation-bar/navigation-bar-expressive";

import { Config, createConfigForm, createStubConfig } from "./config/config";

import {
  activeSectionContext,
  configContext,
  controllerContext,
} from "./const/context";
import { Sections } from "./const/enums";

import { version } from "../package.json";

import headStyles from "./styles/head";
import styles from "./styles/main";

import localForage from "localforage";
import { PlayerSyncEvent, UserNotFoundEvent } from "./const/events";
import { ExtendedHass, ExtendedHassEntity } from "./const/types";
import { MassCardController } from "./controller/controller";
import {
  delay,
  getDefaultSection,
  jsonMatch,
  playersHaveUpdated,
} from "./utils/utility";

const DEV = false;

const cardId = "mass-player-card";
const cardName = "Music Assistant Player Card";
const cardDescription = "Music Assistant Player Card for Home Assistant";
const cardUrl = "https://github.com/droans/mass-player-card";

declare global {
  interface Window {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    loadCardHelpers?: () => Promise<any>;
  }
}

/* eslint-disable-next-line
  no-console,
*/
console.info(
  /* eslint-disable @typescript-eslint/no-unnecessary-condition */
  `%c ${cardName}${DEV ? " DEV" : ""} \n%c Version v${version}`,
  "color: teal; font-weight: bold; background: lightgray",
  "color: darkblue; font-weight: bold; background: white",
);
/* eslint-disable
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-call
*/
(window as any).customCards = (window as any).customCards ?? [];
(window as any).customCards.push({
  type: `${cardId}${DEV ? "-dev" : ""}`,
  name: `${cardName}${DEV ? " DEV" : ""}`,
  preview: false,
  description: cardDescription,
  documentationURL: cardUrl,
});

localForage.config({
  name: "mass-player-card",
  version: 1,
  storeName: "expressive-schemes",
  description: "Cached Expressive schemes for MA media items.",
});

@customElement(`${cardId}${DEV ? "-dev" : ""}`)
/* eslint-enable */
export class MusicAssistantPlayerCard extends LitElement {
  @state() private entities!: ExtendedHassEntity[];
  @state() private error?: TemplateResult;
  @state() private _activeSection?: Sections;

  @provide({ context: controllerContext })
  private _controller = new MassCardController(this);
  @provide({ context: configContext })
  private _config!: Config;
  private syncPlayerAcrossDashboard = false;
  private listenElem!: HTMLElement;
  public set hass(hass: ExtendedHass | undefined) {
    if (!hass) {
      return;
    }
    const ents = this.config.entities;
    const shouldUpdate = playersHaveUpdated(hass, this.hass, ents);
    this._controller.hass = hass;
    if (shouldUpdate) {
      const entities = ents.map((ent) => {
        return hass.states[ent.entity_id];
      });
      this.entities = entities.filter((ent) => {
        return ent != undefined;
      });
    }
  }
  public get hass() {
    return this._controller.hass;
  }
  public set config(config: Config) {
    this._config = config;
    this._controller.config = config;
    if (config.sync_player_across_dashboard) {
      this.syncPlayerAcrossDashboard = true;
    }
  }
  public get config() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._controller.config!;
  }

  private onPlayerSync = (event_: Event) => {
    const syncEvent = event_ as PlayerSyncEvent;
    const player = syncEvent.detail.player;
    this.setActivePlayer(player, true);
  };
  private syncPlayerSelection = () => {
    const detail = {
      player: this._controller.ActivePlayer?.activeEntityID ?? "",
    };
    const event = new CustomEvent("mpc-player-sync", { detail });
    globalThis.dispatchEvent(event);
  };
  private async prepareSyncPlayerAcrossDashboard() {
    await delay(5000);
    window.addEventListener("mpc-player-sync", this.onPlayerSync);
    this.syncPlayerAcrossDashboard = true;
  }

  @consume({ context: activeSectionContext, subscribe: true })
  @state()
  public set active_section(section: Sections | undefined) {
    this._activeSection = section;
  }
  public get active_section() {
    return this._activeSection ?? this._controller.activeSection;
  }
  public setActiveSection(section: Sections) {
    this._controller.activeSection = section;
  }
  static getConfigForm() {
    return createConfigForm();
  }

  static getStubConfig(hass: ExtendedHass, entities: string[]) {
    return createStubConfig(hass, entities);
  }
  public setConfig(config?: Config) {
    if (!config) {
      throw this.createError("Invalid configuration");
    }
    /* eslint-disable @typescript-eslint/no-unnecessary-condition */
    if (!config.entities) {
      throw this.createError("You need to define entities.");
    }
    if (jsonMatch(this.config, config)) {
      return;
    }
    this._controller.config = config;
    this.config = this._controller.config;
    if (!this.active_section) {
      this.setDefaultActiveSection();
      /* eslint-enable @typescript-eslint/no-unnecessary-condition */
    }
    this.requestUpdate();
  }
  private setDefaultActiveSection() {
    if (this.active_section) {
      return;
    }
    this._controller.activeSection = getDefaultSection(this.config);
  }
  private setActivePlayer = (playerEntity: string, playerWasSynced = false) => {
    if (playerEntity.length === 0) {
      return;
    }
    this._controller.activeEntityId = playerEntity;
    if (!playerWasSynced && this.syncPlayerAcrossDashboard) {
      this.syncPlayerSelection();
    }
  };

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (
      _changedProperties.has("activeEntityConfig") ||
      _changedProperties.has("active_section")
    ) {
      return true;
    }
    if (_changedProperties.has("hass")) {
      const oldHass = _changedProperties.get("hass") as
        ExtendedHass | undefined;
      if (!oldHass) {
        return true;
      }
      const oldStates = oldHass.states;
      if (!this.hass) {
        return false;
      }
      const newStates = this.hass.states;
      let result = false;
      this.config.entities.forEach((element) => {
        if (oldStates[element.entity_id] !== newStates[element.entity_id]) {
          result = true;
        }
      });
      return result;
    }
    return super.shouldUpdate(_changedProperties);
  }
  private browserItemSelected = () => {
    if (this.config.player.enabled) {
      this.active_section = Sections.MUSIC_PLAYER;
      this._controller.activeSection = Sections.MUSIC_PLAYER;
    }
  };
  private playerSelected = (entityId: string) => {
    this.setActivePlayer(entityId);
    if (this.config.player.enabled) {
      this.active_section = Sections.MUSIC_PLAYER;
      this._controller.activeSection = Sections.MUSIC_PLAYER;
    }
  };
  private onSectionChangedEvent = (event_: Event) => {
    this.active_section = (event_ as CustomEvent).detail as Sections;
  };

  private userNotFoundEvent = (event_: Event) => {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const ev_ = event_ as UserNotFoundEvent;
    const hassUser = ev_.detail.hass_user;
    const userConfig = ev_.detail.user_config;
    const message = `Could not find a matching user.
    \n Details:
    \n Home Assistant User ID: ${hassUser}
    \n
    \n Config:
    \n ${JSON.stringify(userConfig)}
    `;
    this.createError(message);
  };

  protected renderPlayers() {
    return cache(
      this.config.players.enabled && this.active_section == Sections.PLAYERS
        ? html`
            <wa-tab-panel name="${Sections.PLAYERS}" class="section">
              <mpc-players-card
                .selectedPlayerService=${this.playerSelected}
                .config=${this.config}
              ></mpc-players-card>
            </wa-tab-panel>
          `
        : html``,
    );
  }
  protected renderMusicPlayer() {
    const visible =
      this.config.player.enabled &&
      this.active_section == Sections.MUSIC_PLAYER;
    return html`
      <wa-tab-panel
        name="${Sections.MUSIC_PLAYER}"
        class="section"
        style="${visible ? `` : `display: none;`}"
      >
        <mpc-music-player-card
          .selectedPlayerService=${this.playerSelected}
          ?artwork-only=${!visible}
        ></mpc-music-player-card>
      </wa-tab-panel>
    `;
  }
  protected renderPlayerQueue() {
    return cache(
      this.config.queue.enabled && this.active_section == Sections.QUEUE
        ? html`
            <wa-tab-panel name="${Sections.QUEUE}" class="section">
              <mpc-queue-card .config=${this.config.queue}></mpc-queue-card>
            </wa-tab-panel>
          `
        : html``,
    );
  }
  protected renderMediaBrowser() {
    return cache(
      this.config.media_browser.enabled &&
        this.active_section == Sections.MEDIA_BROWSER
        ? html`
            <wa-tab-panel name="${Sections.MEDIA_BROWSER}" class="section">
              <mpc-media-browser
                .config=${this.config.media_browser}
                .onMediaSelectedAction=${this.browserItemSelected}
              ></mpc-media-browser>
            </wa-tab-panel>
          `
        : html``,
    );
  }
  protected renderTabs() {
    return html`
      <div id="navbar">
        <mpc-navbar-expressive></mpc-navbar-expressive>
      </div>
    `;
  }
  protected renderSections() {
    return html`
      ${this.renderMusicPlayer()} ${this.renderPlayerQueue()}
      ${this.renderMediaBrowser()} ${this.renderPlayers()}
    `;
  }

  protected render() {
    const style = this.config.panel
      ? `--mass-player-card-height: calc(${window.innerHeight.toString()}px - 4rem - var(--header-height));`
      : ``;
    return (
      this.error ??
      html`
        <ha-card style="${style}">
          ${this.renderSections()} ${this.renderTabs()}
        </ha-card>
      `
    );
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
  protected firstUpdated(): void {
    const stylesheet = headStyles.styleSheet as CSSStyleSheet;
    document.adoptedStyleSheets.push(stylesheet);
    if (this.syncPlayerAcrossDashboard) {
      void this.prepareSyncPlayerAcrossDashboard();
    }
  }
  connectedCallback() {
    super.connectedCallback();
    if (this._controller.Queue) {
      this._controller.Queue.resetQueueFailures();
      void this._controller.Queue.subscribeUpdates();
      if (this.hasUpdated) {
        this._controller.connected();
      }
    }
    /* eslint-disable
      listeners/no-missing-remove-event-listener
    */
    this.addEventListener("section-changed", this.onSectionChangedEvent);
    this.addEventListener("user-not-found", this.userNotFoundEvent);
    /* eslint-enable
      listeners/no-missing-remove-event-listener
    */
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("section-changed", this.onSectionChangedEvent);
    this.removeEventListener("user-not-found", this.userNotFoundEvent);
    this._controller.disconnected();
    if (this.syncPlayerAcrossDashboard) {
      window.removeEventListener("mpc-player-sync", this.onPlayerSync);
    }
  }
  public getCardSize() {
    return 3;
  }

  private createError(errorString: string): Error {
    const error = new Error(errorString);
    /* eslint-disable-next-line
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment
    */
    const errorCard = document.createElement("hui-error-card") as any;
    /* eslint-disable-next-line
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access
    */
    errorCard.setConfig({
      type: "error",
      error,
      origConfig: this.config,
    });
    this.error = html`${errorCard}`;
    return error;
  }
}
