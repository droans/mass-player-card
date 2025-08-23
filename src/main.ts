import { LitElement, html, type TemplateResult, type CSSResultGroup, PropertyValues } from 'lit';
import { cache } from 'lit/directives/cache.js';
import { customElement, property, state } from 'lit/decorators.js';
import { type HomeAssistant } from 'custom-card-helpers';

import { Config, QueueSection } from './types'
import styles from './styles/main';
import { DEFAULT_CONFIG, Sections, DEFAULT_CARD } from './const'
import { version } from '../package.json';
import './sections/player-queue';

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
  @state() private current_section: Sections = DEFAULT_CARD;
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
        
        // this.services = new HassService(this.hass, this.config);
      }
    }
  }
  // protected updated(_changedProperties: PropertyValues) {
  //   super.updated(_changedProperties);
  //   if (!this.queue.length && this.hass) {
  //     this.getQueue();
  //   }
  //   if (_changedProperties.has('hass')) {
  //     const oldHass = _changedProperties.get('hass') as HomeAssistant;
  //     if (!oldHass) {
  //       this.getQueue();
  //     } else {
  //       const newHass = this.hass
  //       const oldEnt = oldHass.states[this.config.entity];
  //       const newEnt = newHass.states[this.config.entity];
  //       const oldContentId = oldEnt.attributes.media_content_id;
  //       const newContentId = newEnt.attributes.media_content_id;
  //       if (newContentId != oldContentId) {
  //         this.getQueue();
  //       }
  //     }
  //   }
  // }

  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (_changedProperties.has('active_player')
       || _changedProperties.has('current_section')
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
  protected renderPlayerQueue() {
    if (this.current_section === Sections.QUEUE) {
      return cache(html`
        <mass-player-queue-card
          .hass=${this.hass}
          .active_player_entity=${this.active_player_entity}
          .config=${this.config.queue}
        ></mass-player-queue-card>
      `)
    }
    return html``
  }
  protected render() {
    return html`
      <ha-card>
      ${this.renderPlayerQueue()}
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