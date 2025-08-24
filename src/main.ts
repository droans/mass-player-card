import { LitElement, html, type TemplateResult, type CSSResultGroup, PropertyValues } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { customElement, property, state } from 'lit/decorators.js';

import {
  mdiMusic,
  mdiPlaylistMusic,
  mdiSpeakerMultiple
} from '@mdi/js';

import { type HomeAssistant } from 'custom-card-helpers';

import { Config, QueueSection } from './types'
import styles from './styles/main';
import { DEFAULT_CONFIG, Sections, DEFAULT_CARD } from './const'
import { version } from '../package.json';
import './sections/player-queue';
import './sections/players';

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
  @property({attribute: false}) public hass!: HomeAssistant;
  @state() private config!: Config;
  @state() private error?: TemplateResult;
  @state() private queue_store?: QueueSection;
  @state() private active_player_entity?: string;
  @state() private active_section: string = DEFAULT_CARD;
  @state() private first_update = false;
  // private _hass!: HomeAssistant;
  
  // public hass!: HomeAssistant;

  
  
  // private services!: QueueActions;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */

  constructor() {
    super();
    if (this.config) {
      this.active_player_entity = this.config.entities[0];
    }
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
    this.active_player_entity = this.config.entities[0];
  }
  public setActivePlayer(player_entity: string) {
    this.active_player_entity = player_entity;

  }
  protected willUpdate(_changedProperties: PropertyValues): void {
    
    if (_changedProperties.has('hass') || _changedProperties.has('config')) {
      if (this.hass && this.config) {
        
      }
    }
  }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (_changedProperties.has('active_player')
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
      var result = false;
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
  private _handleTabChanged(ev: CustomEvent) {
    const newTab = ev.detail.name;
    console.log(`New tab: ${newTab}`);
    console.log(ev);
    this.active_section = newTab;
  }
  protected renderPlayers() {
    if (this.active_section === Sections.PLAYERS) {
      return cache(html`
        <sl-tab-panel name="players">
          <mass-player-players-card
            .selectedPlayerService=${this.setActivePlayer}
            .activePlayerEntity=${this.active_player_entity}
            .config=${this.config}
            .hass=${this.hass}
          ></mass-player-queue-card>
        </sl-tab-panel>
      `);
    }
    return html``
  }
  protected renderPlayerQueue() {
    if (this.active_section === Sections.QUEUE) {
      return cache(html`
        <sl-tab-panel name="queue">
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
  protected renderMediaPlayerTab() {
    if (this.config.player.enabled){
      return html`
        <sl-tab 
          slot="nav"
          .active=${this.active_section==Sections.MEDIA_PLAYER}
          panel="player"
        >
          <ha-icon-button 
            class="action-button"
            .path=${mdiMusic}
          </ha-icon-button>
        </sl-tab>
      `
    }
    return html``
  }
  protected renderQueueTab() {
    if (this.config.queue.enabled){
      return html`
        <sl-tab 
          slot="nav"
          .active=${this.active_section==Sections.QUEUE}
          panel="queue"
        >
          <ha-icon-button 
            class="action-button"
            .path=${mdiPlaylistMusic}
          </ha-icon-button>
        </sl-tab>
      `
    }
    return html``
  }
  protected renderPlayersTab() {
    return html`
      <sl-tab 
        slot="nav"
        .active=${this.active_section==Sections.PLAYERS}
        panel="players"
      >
        <ha-icon-button 
          class="action-button"
          .path=${mdiSpeakerMultiple}
        </ha-icon-button>
      </sl-tab>
    `
  }
  protected renderTabs() {
    return html`
      <sl-tab-group @sl-tab-show=${this._handleTabChanged}>
        ${this.renderMediaPlayerTab()}
        ${this.renderQueueTab()}
        ${this.renderPlayersTab()}
      </sl-tab-group>
    `
  }
  protected renderSections() {
    return html`
      ${this.renderPlayerQueue()}
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