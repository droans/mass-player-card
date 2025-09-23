import { LitElement, html, type TemplateResult, type CSSResultGroup, PropertyValues } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { customElement, state } from 'lit/decorators.js';

import {
  mdiAlbum,
  mdiMusic,
  mdiPlaylistMusic,
  mdiSpeakerMultiple
} from '@mdi/js';


import styles from './styles/main';
import { version } from '../package.json';
import './sections/media-browser';
import './sections/music-player';
import './sections/player-queue';
import './sections/players';
import { HassEntity } from 'home-assistant-js-websocket';
import { Sections } from './const/card';
import { MediaBrowser } from './sections/media-browser';
import { 
  Config,
  createConfigForm, 
  createStubConfig, 
  EntityConfig,
  processConfig,
} from './config/config';
import { getDefaultSection } from './utils/util';
import { provide } from '@lit/context';
import {
  activeEntityConf,
  activeEntityID, 
  activeMediaPlayer, 
  activePlayerName, 
  ExtendedHass, 
  ExtendedHassEntity, 
  hassExt, 
  volumeMediaPlayer,
} from './const/context';

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
  @state() private config!: Config;
  @state() private error?: TemplateResult;

  @provide( { context: activeEntityConf}) @state() private activeEntityConfig!: EntityConfig;
  @provide( { context: activeEntityID}) activeEntityId!: string;
  @provide( { context: activePlayerName}) activePlayerName!: string;
  @provide( { context: activeMediaPlayer}) activeMediaPlayer!: ExtendedHassEntity;
  @provide( { context: volumeMediaPlayer}) volumeMediaPlayer!: ExtendedHassEntity;
  
  @state() private active_section!: Sections;
  @state() private entities!: HassEntity[];
  @provide({context: hassExt}) private _hass!: ExtendedHass;

  constructor() {
    super();
    if (this.config && !this.activeEntityConfig) {
      this.activeEntityConfig = this.config.entities[0];
    }
    if (!this.activeEntityConfig) {
      this.setDefaultActivePlayer();
    }
  }
  public set hass(hass: ExtendedHass) {
    if (!hass) {
      return;
    }
    const ents = this.config.entities;
    let should_update = false;
    if (!this._hass) {
      this._hass = hass;
      this.setDefaultActivePlayer();
    }
    const new_ents: HassEntity[] = [];
    ents.forEach(
      (entity) => {
        const old_state = JSON.stringify(this._hass.states[entity.entity_id]);
        const new_state = JSON.stringify(hass.states[entity.entity_id]);
        new_ents.push(hass.states[entity.entity_id]);
        if (old_state !== new_state) {
          should_update = true;
        }
      }
    )
    if (should_update) {
      this._hass = hass;
      this.entities = new_ents;
      this.setActivePlayer(this.activeEntityId);
    }
  }
  public get hass() {
    return this._hass;
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
    this.config = processConfig(config);
    if (!this.activeEntityConfig) {
      this.setDefaultActivePlayer();
    }
    if (!this.active_section) {
      this.setDefaultActiveSection();
    }
    this.requestUpdate();
  }
  private setDefaultActivePlayer() {
    if (!this.config) {
      return;
    }
    const players = this.config.entities;
    if (!this.hass) {
      this.activeEntityConfig = players[0];
    } else {
      const states = this.hass.states;
      const active_players = players.filter(
        (entity) => ["playing", "paused"].includes(states[entity.entity_id].state) && states[entity.entity_id].attributes.app_id == 'music_assistant' 
      )
      if (active_players.length) {
        this.activeEntityConfig = active_players[0];
      } else {  
        this.activeEntityConfig = players[0];
      }
      this.activePlayerName = this.activeEntityConfig.name;
      this.activeMediaPlayer = states[this.activeEntityConfig.entity_id];
      this.volumeMediaPlayer = states[this.activeEntityConfig.volume_entity_id];
    }
    const conf = this.activeEntityConfig;
    this.activeEntityId = conf.entity_id;
  }
  private setDefaultActiveSection() {
    if (this.active_section) {
      return;
    }
    this.active_section = getDefaultSection(this.config);
  }
  private setActivePlayer = (player_entity: string) => {
    const player = this.config.entities.find(
      (entity) => entity.entity_id == player_entity
    )
    this.activeEntityConfig = player ?? this.activeEntityConfig;
    this.activeEntityId = this.activeEntityConfig.entity_id;
    this.activePlayerName = this.activeEntityConfig.name;
    this.activeMediaPlayer = this.hass.states[this.activeEntityConfig.entity_id];
    this.volumeMediaPlayer = this.hass.states[this.activeEntityConfig.volume_entity_id];
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (_changedProperties.has('activeEntityConfig')
       || _changedProperties.has('active_section')
    ) {
      return true;
    }
    if (_changedProperties.has('hass')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const oldHass = _changedProperties.get('hass')! as ExtendedHass;
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
    }
  }
  private playerSelected = (entity_id: string) => {
    this.setActivePlayer(entity_id);
    if (this.config.player.enabled){
      this.active_section = Sections.MUSIC_PLAYER;
    }
  }
  private _handleTabChanged(ev: CustomEvent) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const newTab: Sections = ev.detail.name;
    this.active_section = newTab;
  }
  private returnMediaBrowserToHome = () => {
    const el: MediaBrowser | null | undefined = this.shadowRoot?.querySelector('mass-media-browser');
    if (!el) {
      return;
    }
    el.activeSection = 'main';
  }
  protected renderPlayers() {
    if (this.config.players.enabled) {
      return cache(html`
        <sl-tab-panel 
          name="${Sections.PLAYERS}" 
          class="section${this.active_section==Sections.PLAYERS ? "" : "-hidden"}"
        >
          <mass-player-players-card
            .selectedPlayerService=${this.playerSelected}
            .config=${this.config}
          ></mass-player-players-card>
        </sl-tab-panel>
      `);
    }
    return html``
  }
  protected renderMusicPlayer() {
    if (this.config.player.enabled) {
      return cache(html`
        <sl-tab-panel 
          name="${Sections.MUSIC_PLAYER}" 
          class="section${this.active_section==Sections.MUSIC_PLAYER ? "" : "-hidden"}"
        >
          <mass-music-player-card
            .config=${this.config.player}
            .maxVolume=${this.activeEntityConfig.max_volume}
          ></mass-music-player-card>
        </sl-tab-panel>
      `);
    }
    return html``
  }
  protected renderPlayerQueue() {
    if (this.config.queue.enabled) {
      return cache(html`
        <sl-tab-panel 
          name="${Sections.QUEUE}" 
          class="section${this.active_section==Sections.QUEUE ? "" : "-hidden"}"
        >
          <mass-player-queue-card
            .config=${this.config.queue}
          ></mass-player-queue-card>
        </sl-tab-panel>
      `)
    }
    return html``
  }
  protected renderMediaBrowser() {
    if (this.config.media_browser.enabled) {
      return cache(html`
        <sl-tab-panel 
          name="${Sections.MEDIA_BROWSER}" 
          class="section${this.active_section==Sections.MEDIA_BROWSER ? "" : "-hidden"}"
        >
          <mass-media-browser
            .config=${this.config.media_browser}
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
          <ha-button
            appearance="plain"
            variant="brand"
            size="medium"
            class="action-button${active ? "-active" : ""}"
          >
            <ha-svg-icon
              .path=${mdiMusic}
              class="action-button-svg${active ? "" : "-inactive"}"
            ></ha-svg-icon>
          </ha-button>
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
          <ha-button
            appearance="plain"
            variant="brand"
            size="medium"
            class="action-button${active ? "-active" : ""}"
          >
            <ha-svg-icon
              .path=${mdiPlaylistMusic}
              style="height: 24px; width: 24px;"
              class="action-button-svg${active ? "" : "-inactive"}"
            ></ha-svg-icon>
          </ha-button>
      `
    }
    return html``
  }
  protected renderMediaBrowserTab() {
    const active = this.active_section == Sections.MEDIA_BROWSER;
    if (this.config.media_browser.enabled){
      return html`
        <sl-tab 
          slot="nav"
          .active=${active}
          panel="${Sections.MEDIA_BROWSER}"
          @click=${this.returnMediaBrowserToHome}
        >
            <ha-button
              appearance="plain"
              variant="brand"
              size="medium"
              class="action-button${active ? "-active" : ""}"
            >
              <ha-svg-icon
                .path=${mdiAlbum}
                style="height: 24px; width: 24px;"
                class="action-button-svg${active ? "" : "-inactive"}"
              ></ha-svg-icon>
            </ha-button>
        </sl-tab>
      `
    }
    return html``
  }
  protected renderPlayersTab() {
    const active = this.active_section == Sections.PLAYERS;
    if (this.config.players.enabled){
      return html`
        <sl-tab 
          slot="nav"
          .active=${active}
          panel="${Sections.PLAYERS}"
        >
            <ha-button
              appearance="plain"
              variant="brand"
              size="medium"
              class="action-button${active ? "-active" : ""}"
            >
              <ha-svg-icon
                .path=${mdiSpeakerMultiple}
                style="height: 24px; width: 24px;"
                class="action-button-svg${active ? "" : "-inactive"}"
              ></ha-svg-icon>
            </ha-button>
        </sl-tab>
      `
    }
    return html``
  }
  /* eslint-disable @typescript-eslint/unbound-method */
  protected renderTabs() {
    return cache(html`
      <sl-tab-group
        @sl-tab-show=${this._handleTabChanged}
      >
        ${this.renderMusicPlayerTab()}
        ${this.renderQueueTab()}
        ${this.renderMediaBrowserTab()}
        ${this.renderPlayersTab()}
      </sl-tab-group>
    `)
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
    return this.error ?? html`
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