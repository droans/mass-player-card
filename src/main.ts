import { LitElement, html, type TemplateResult, type CSSResultGroup, PropertyValues } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { customElement, state } from 'lit/decorators.js';

import {
  mdiAlbum,
  mdiMusic,
  mdiPlaylistMusic,
  mdiSpeakerMultiple
} from '@mdi/js';

import { type HomeAssistant } from 'custom-card-helpers';

import styles from './styles/main';
import { version } from '../package.json';
import './sections/media-browser';
import './sections/music-player';
import './sections/player-queue';
import './sections/players';
import { HassEntity } from 'home-assistant-js-websocket';
import { Config, DEFAULT_CARD, DEFAULT_CONFIG, Sections } from './const/card';

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
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  @state() private config!: Config;
  @state() private error?: TemplateResult;
  @state() private active_player_entity!: string;
  @state() private active_section: Sections = DEFAULT_CARD;
  @state() private first_hass_update = false;
  @state() private entities!: HassEntity[];
  private _hass!: HomeAssistant;

  constructor() {
    super();
    if (this.config && !this.active_player_entity) {
      this.active_player_entity = this.config.entities[0];
    }
    if (!this.active_player_entity) {
      this.setDefaultActivePlayer();
    }
  }
  public set hass(hass: HomeAssistant) {
    if (!hass) {
      return;
    }
    const ents = this.config.entities;
    let should_update = false;
    if (!this._hass) {
      this._hass = hass;
      this.setDefaultActivePlayer();
      this.first_hass_update = true;
    }
    const new_ents: HassEntity[] = [];
    ents.forEach(
      (entity) => {
        const old_state = JSON.stringify(this._hass.states[entity]);
        const new_state = JSON.stringify(hass.states[entity]);
        new_ents.push(hass.states[entity]);
        if (old_state !== new_state) {
          should_update = true;
        }
      }
    )
    if (should_update) {
      this._hass = hass;
      this.entities = new_ents;
      this.first_hass_update = true;
    }
  }
  public get hass() {
    return this._hass;
  }
  static getConfigElement() {
    return document.createElement(`${cardId}-editor${DEV ? '-dev' : ''}`);
  }

  static getStubConfig() {
    return {
      ...DEFAULT_CONFIG,
      entities: [],
     };
  }
  public setConfig(config?: Config) {
    if (!config) {
      throw this.createError('Invalid configuration')
    }
    if (!config.entities) {
      throw this.createError('You need to define entities.');
    };
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    }
    if (!this.active_player_entity) {
      this.setDefaultActivePlayer();
    }
  }
  private setDefaultActivePlayer() {
    if (!this.config) {
      return;
    }
    const players = this.config.entities;
    if (!this.hass) {
      this.active_player_entity = players[0];
    } else {
      const states = this.hass.states;
      const active_players = players.filter(
        (entity) => ["playing", "paused"].includes(states[entity].state) && states[entity].attributes.app_id == 'music_assistant' 
      )
      if (active_players.length) {
        this.active_player_entity = active_players[0];
      } else {
        this.active_player_entity = players[0];
      }
    }
  }
  private setActivePlayer = (player_entity: string) => {
    this.active_player_entity = player_entity;
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (_changedProperties.has('active_player_entity')
       || _changedProperties.has('active_section')
    ) {
      return true;
    }
    if (_changedProperties.has('hass')) {
      const oldHass = _changedProperties.get('hass')! as HomeAssistant;
      if (!oldHass) {
        return true;
      }
      const oldStates = oldHass.states;
      const newStates = this.hass.states;
      let result = false;
      this.config.entities.forEach( (element) => {
          if (oldStates[element] !== newStates[element]) {
            result = true;
          }
        }
      )
      return result;
    }
    return super.shouldUpdate(_changedProperties);
  }
  private browserItemSelected = () => {
    this.active_section = Sections.MUSIC_PLAYER;
  }
  private playerSelected = (entity_id: string) => {
    this.setActivePlayer(entity_id);
    this.active_section = Sections.MUSIC_PLAYER;
  }
  private _handleTabChanged(ev: CustomEvent) {
    const newTab: Sections = ev.detail.name;
    this.active_section = newTab;
  }
  protected renderPlayers() {
    if (this.active_section === Sections.PLAYERS) {
      return cache(html`
        <sl-tab-panel name="${Sections.PLAYERS}">
          <mass-player-players-card
            .selectedPlayerService=${this.playerSelected}
            .activePlayerEntity=${this.active_player_entity}
            .config=${this.config}
            .hass=${this.hass}
          ></mass-player-players-card>
        </sl-tab-panel>
      `);
    }
    return html``
  }
  protected renderMusicPlayer() {
    if (this.active_section === Sections.MUSIC_PLAYER) {
      return cache(html`
        <sl-tab-panel name="${Sections.MUSIC_PLAYER}">
          <mass-music-player-card
            .config=${this.config.player}
            .activeMediaPlayer=${this.hass.states[this.active_player_entity]}
            .hass=${this.hass}
          ></mass-music-player-card>
        </sl-tab-panel>
      `);
    }
    return html``
  }
  protected renderPlayerQueue() {
    if (this.active_section === Sections.QUEUE) {
      return cache(html`
        <sl-tab-panel name="${Sections.QUEUE}">
          <mass-player-queue-card
            .hass=${this.hass}
            .active_player_entity=${this.active_player_entity}
            .config=${this.config.queue}
          ></mass-player-queue-card>
        </sl-tab-panel>
      `)
    }
    return html``
  }
  protected renderMediaBrowser() {
    if (this.active_section === Sections.MEDIA_BROWSER) {
      return cache(html`
        <sl-tab-panel name="${Sections.MEDIA_BROWSER}">
          <mass-browser-card
            .config=${this.config.media_browser}
            .hass=${this.hass}
            .player_entity=${this.active_player_entity}
            .onMediaSelectedAction=${this.browserItemSelected}
          >
        </sl-tab-panel>
      `) 
    }
    return html``
  }
  protected renderMusicPlayerTab() {
    const active = this.active_section == Sections.MUSIC_PLAYER;
    if (this.config.player.enabled){
      return html`
        <sl-tab 
          slot="nav"
          .active=${active}
          panel="${Sections.MUSIC_PLAYER}"
        >
          <ha-icon-button 
            class="action-button${active ? "-active" : ""}"
            .path=${mdiMusic}
          >
          </ha-icon-button>
        </sl-tab>
      `
    }
    return html``
  }
  protected renderQueueTab() {
    const active = this.active_section == Sections.QUEUE;
    if (this.config.queue.enabled){
      return html`
        <sl-tab 
          slot="nav"
          .active=${active}
          panel="${Sections.QUEUE}"
        >
          <ha-icon-button
            class="action-button${active ? "-active" : ""}"
            .path=${mdiPlaylistMusic}
          >
          </ha-icon-button>
        </sl-tab>
      `
    }
    return html``
  }
  protected renderMediaBrowserTab() {
    const active = this.active_section == Sections.MEDIA_BROWSER;
    return html`
      <sl-tab 
        slot="nav"
        .active=${active}
        panel="${Sections.MEDIA_BROWSER}"
      >
        <ha-icon-button 
          class="action-button${active ? "-active" : ""}"
          .path=${mdiAlbum}
        >
        </ha-icon-button>
      </sl-tab>
    `
  }
  protected renderPlayersTab() {
    const active = this.active_section == Sections.PLAYERS;
    return html`
      <sl-tab 
        slot="nav"
        .active=${active}
        panel="${Sections.PLAYERS}"
      >
        <ha-icon-button 
          class="action-button${active ? "-active" : ""}"
          .path=${mdiSpeakerMultiple}
        >
        </ha-icon-button>
      </sl-tab>
    `
  }
  /* eslint-disable @typescript-eslint/unbound-method */
  protected renderTabs() {
    return html`
      <sl-tab-group
        @sl-tab-show=${this._handleTabChanged}
      >
        ${this.renderMusicPlayerTab()}
        ${this.renderQueueTab()}
        ${this.renderMediaBrowserTab()}
        ${this.renderPlayersTab()}
      </sl-tab-group>
    `
  }
  /* eslint-enable @typescript-eslint/unbound-method */
  protected renderSections() {
    return html`
      ${this.renderMusicPlayer()}
      ${this.renderPlayerQueue()}
      ${this.renderMediaBrowser()}
      ${this.renderPlayers()}
    `
  }
  protected render() {
    return html`
      <ha-card>
      ${this.renderSections()}
      ${this.renderTabs()}
      </ha-card>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }

  public getCardSize() {
    return 3;
  }

  private createError(errorString: string): Error {
    const error = new Error(errorString);
    /* eslint-disable-next-line
      @typescript-eslint/no-explicit-any,
    */
    const errorCard = document.createElement('hui-error-card') as any;
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });
    this.error = html`${errorCard}`;
    return error;
  }

}