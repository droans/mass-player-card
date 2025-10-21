import { consume, provide } from '@lit/context';
import { HassEntity } from 'home-assistant-js-websocket';
import {
  LitElement,
  type TemplateResult,
  type CSSResultGroup,
  PropertyValues
} from 'lit';
import {
  html
} from "lit/static-html.js";
import {
  customElement,
  state
} from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';

import './sections/media-browser';
import './sections/music-player';
import './sections/player-queue';
import './sections/players';

import './components/navigation-bar-expressive';
import './components/navigation-bar';

import {
  Config,
  createConfigForm,
  createStubConfig,
} from './config/config';

import { Sections } from './const/card';
import {
  activeSectionContext,
  configContext,
  controllerContext,
  ExtendedHass,
} from './const/context';

import { version } from '../package.json';

import styles from './styles/main';
import head_styles from './styles/head';

import { getDefaultSection, jsonMatch } from './utils/util';
import { MassCardController } from './controller/controller';

const DEV = false;

const cardId = 'mass-player-card';
const cardName = 'Music Assistant Player Card';
const cardDescription = 'Music Assistant Player Card for Home Assistant';
const cardUrl = 'https://github.com/droans/mass-player-card';

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
  `%c ${cardName}${DEV ? ' DEV' : ''} \n%c Version v${version}`,
  'color: teal; font-weight: bold; background: lightgray',
  'color: darkblue; font-weight: bold; background: white',
);
/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-call
*/
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  /* eslint-enable */
  type: `${cardId}${DEV ? '-dev' : ''}`,
  name: `${cardName}${DEV ? ' DEV' : ''}`,
  preview: false,
  description: cardDescription,
  documentationURL: cardUrl,
});

@customElement(`${cardId}${DEV ? '-dev' : ''}`)
export class MusicAssistantPlayerCard extends LitElement {
  @state() private entities!: HassEntity[];
  @state() private error?: TemplateResult;
  @state() private _activeSection!: Sections;

  @provide({ context: controllerContext})
  private _controller = new MassCardController(this);
  @provide({ context: configContext })
  private _config!: Config;
  public set hass(hass: ExtendedHass) {
    if (!hass) {
      return;
    }
    const ents = this.config.entities;
    let should_update = false;
    this._controller.hass = hass;
    const new_ents: HassEntity[] = [];
    ents.forEach(
      (entity) => {
        const old_state = this.hass.states[entity.entity_id];
        const new_state = hass.states[entity.entity_id];
        new_ents.push(hass.states[entity.entity_id]);
        if (!jsonMatch(old_state, new_state)) {
          should_update = true;
        }
      }
    )
    if (should_update) {
      this._controller.hass = hass;
      this.entities = new_ents;
    }
  }
  public get hass() {
    return this._controller.hass;
  }
  public set config(config: Config) {
    this._config = config;
    this._controller.config = config;
  }
  public get config() {
    return this._controller.config;
  }

  @consume({ context: activeSectionContext, subscribe: true}) 
  @state()
  public set active_section(section: Sections) {
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
      throw this.createError('Invalid configuration')
    }
    if (!config.entities) {
      throw this.createError('You need to define entities.');
    };
    this._controller.config = config;
    this.config = this._controller.config;
    if (!this.active_section) {
      this.setDefaultActiveSection();
    }
    this.requestUpdate();
  }
  private setDefaultActiveSection() {
    if (this.active_section) {
      return;
    }
    this._controller.activeSection = getDefaultSection(this.config);
  }
  private setActivePlayer = (player_entity: string) => {
    if (!player_entity.length) {
      return;
    }
    this._controller.activeEntityId = player_entity;
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (_changedProperties.has('activeEntityConfig')
       || _changedProperties.has('active_section')
    ) {
      return true;
    }
    if (_changedProperties.has('hass')) {
      const oldHass = _changedProperties.get('hass') as ExtendedHass;
      if (!oldHass) {
        return true;
      }
      const oldStates = oldHass.states;
      const newStates = this.hass.states;
      let result = false;
      this.config.entities.forEach( (element) => {
          if (oldStates[element.entity_id] !== newStates[element.entity_id]) {
            result = true;
          }
        }
      )
      return result;
    }
    return super.shouldUpdate(_changedProperties);
  }
  private browserItemSelected = () => {
    if (this.config.player.enabled){
      this.active_section = Sections.MUSIC_PLAYER;
      this._controller.activeSection = Sections.MUSIC_PLAYER;
    }
  }
  private playerSelected = (entity_id: string) => {
    this.setActivePlayer(entity_id);
    if (this.config.player.enabled){
      this.active_section = Sections.MUSIC_PLAYER;
    }
  }
  private onSectionChangedEvent = (ev: Event) => {
    this.active_section = (ev as CustomEvent).detail as Sections;
  }

  protected renderPlayers() {
    if (this.config.players.enabled) {
      return cache(html`
        <wa-tab-panel
          name="${Sections.PLAYERS}"
          class="section${this.active_section==Sections.PLAYERS ? "" : "-hidden"}"
        >
            <mass-player-players-card
              .selectedPlayerService=${this.playerSelected}
              .config=${this.config}
            ></mass-player-players-card>
        </wa-tab-panel>
      `);
    }
    return html``
  }
  protected renderMusicPlayer() {
    if (this.config.player.enabled) {
      return cache(html`
        <wa-tab-panel
          name="${Sections.MUSIC_PLAYER}"
          class="section${this.active_section==Sections.MUSIC_PLAYER ? "" : "-hidden"}"
        >
            <mass-music-player-card
              .selectedPlayerService=${this.playerSelected}
            ></mass-music-player-card>
        </wa-tab-panel>
      `);
    }
    return html``
  }
  protected renderPlayerQueue() {
    if (this.config.queue.enabled) {
      return cache(html`
        <wa-tab-panel
          name="${Sections.QUEUE}"
          class="section${this.active_section==Sections.QUEUE ? "" : "-hidden"}"
        >
            <mass-player-queue-card
              .config=${this.config.queue}
            ></mass-player-queue-card>
        </wa-tab-panel>
      `)
    }
    return html``
  }
  protected renderMediaBrowser() {
    if (this.config.media_browser.enabled) {
      return cache(html`
        <wa-tab-panel
          name="${Sections.MEDIA_BROWSER}"
          class="section${this.active_section==Sections.MEDIA_BROWSER ? "" : "-hidden"}"
        >
            <mass-media-browser
              .config=${this.config.media_browser}
              .onMediaSelectedAction=${this.browserItemSelected}
            >
          </wa-animation>
        </wa-tab-panel>
      `)
    }
    return html``
  }
  protected renderTabs() {
    return html`
      <div id="navbar${this.config.expressive && this.active_section == Sections.MUSIC_PLAYER ? `-expressive` : ``}">
        ${this.config.expressive ? html`<mass-nav-bar-expressive></mass-nav-bar-expressive>` : html`<mass-nav-bar></mass-nav-bar>` }
      </div>
    `
  }
  protected renderSections() {
    return html`
      ${this.renderMusicPlayer()}
      ${this.renderPlayerQueue()}
      ${this.renderMediaBrowser()}
      ${this.renderPlayers()}
    `
  }
  
  protected render() {
    return this.error ?? html`
      <ha-card id="${this.config.expressive ? `expressive` : ``}">
        ${this.renderSections()}
        ${this.renderTabs()}
      </ha-card>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot?.querySelectorAll('wa-animation').forEach( 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        e.play = true;
      }
    );
      if (this._controller) {
        this._controller.Queue.resetQueueFailures(); 
        void this._controller.Queue.subscribeUpdates(); 
      }
  }
  protected firstUpdated(): void {
    if (this.config.expressive) {
      //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const stylesheet = head_styles.styleSheet!;
      document.adoptedStyleSheets.push(stylesheet);
      this.addEventListener('section-changed', this.onSectionChangedEvent);
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
    const errorCard = document.createElement('hui-error-card') as any;
    /* eslint-disable-next-line
      @typescript-eslint/no-unsafe-call,
      @typescript-eslint/no-unsafe-member-access
    */
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });
    this.error = html`${errorCard}`;
    return error;
  }

}
