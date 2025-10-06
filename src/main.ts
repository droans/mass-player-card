import { consume } from '@lit/context';
import {
  mdiAlbum,
  mdiMusic,
  mdiPlaylistMusic,
  mdiSpeakerMultiple
} from '@mdi/js';
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

import {
  Config,
  createConfigForm,
  createStubConfig,
} from './config/config';

import { Sections } from './const/card';
import {
  activeSectionContext,
  ExtendedHass,
} from './const/context';

import { version } from '../package.json';

import { MediaBrowser } from './sections/media-browser';

import styles from './styles/main';

import { getDefaultSection } from './utils/util';
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

  private _controller = new MassCardController(this);
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
        const old_state = JSON.stringify(this.hass.states[entity.entity_id]);
        const new_state = JSON.stringify(hass.states[entity.entity_id]);
        new_ents.push(hass.states[entity.entity_id]);
        if (old_state !== new_state) {
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
  public get config() {
    return this._controller.config;
  }

  @consume({ context: activeSectionContext, subscribe: true}) 
  @state() 
  private set active_section(section: Sections) {
    this._controller.activeSection = section;
  }
  public get active_section() {
    return this._controller.activeSection;
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
  private newHandleTabChanged(section: Sections) {
    this.active_section = section;
    if (section == Sections.MEDIA_BROWSER) {
      this.returnMediaBrowserToHome();
    }
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
        <wa-tab-panel
          name="${Sections.PLAYERS}"
          class="section${this.active_section==Sections.PLAYERS ? "" : "-hidden"}"
        >
          <wa-animation 
            name="fadeInUp"
            easing="ease-in"
            iterations=1
            play=${this.active_section==Sections.PLAYERS}
            playback-rate=4
          >
            <mass-player-players-card
              .selectedPlayerService=${this.playerSelected}
              .config=${this.config}
            ></mass-player-players-card>
          </wa-animation>
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
          <wa-animation 
            name="fadeInUp"
            easing="ease-in"
            iterations=1
            play=${this.active_section==Sections.MUSIC_PLAYER}
            playback-rate=4
          >
            <mass-music-player-card
              .selectedPlayerService=${this.playerSelected}
            ></mass-music-player-card>
          </wa-animation>
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
          <wa-animation 
            name="fadeInUp"
            easing="ease-in"
            iterations=1
            play=${this.active_section==Sections.MEDIA_BROWSER}
            playback-rate=4
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
  protected renderMusicPlayerTab() {
    const active = this.active_section == Sections.MUSIC_PLAYER;
    if (this.config.player.enabled){
      return html`
        <a 
          class="${active ? `active` : ``} player-tabs"
          @click=${() => {this.newHandleTabChanged(Sections.MUSIC_PLAYER)}}
        >
          <i class="icon-i">
            <ha-svg-icon
              .path=${mdiMusic}
              class="action-button-svg${active ? "" : "-inactive"}"
            ></ha-svg-icon>
          </i>
          <span></span> 
        </a>
      `
    }
    return html``
  }
  protected renderQueueTab() {
    const active = this.active_section == Sections.QUEUE;
    if (this.config.queue.enabled){
      return html`
        <a 
          class="${active ? `active` : ``} player-tabs"
          @click=${() => {this.newHandleTabChanged(Sections.QUEUE)}}
        >
          <i class="icon-i">
            <ha-svg-icon
              .path=${mdiPlaylistMusic}
              class="action-button-svg${active ? "" : "-inactive"}"
            ></ha-svg-icon>
          </i>
          <span></span> 
        </a>
      `
    }
    return html``
  }
  protected renderMediaBrowserTab() {
    const active = this.active_section == Sections.MEDIA_BROWSER;
    if (this.config.media_browser.enabled){
      return html`
        <a 
          class="${active ? `active` : ``} player-tabs"
          @click=${() => {this.newHandleTabChanged(Sections.MEDIA_BROWSER)}}
        >
          <i class="icon-i">
            <ha-svg-icon
              .path=${mdiAlbum}
              class="action-button-svg${active ? "" : "-inactive"}"
            ></ha-svg-icon>
          </i>
          <span></span> 
        </a>
      `
    }
    return html``
  }
  protected renderPlayersTab() {
    const active = this.active_section == Sections.PLAYERS;
    if (this.config.players.enabled){
      return html`
        <a 
          class="${active ? `active` : ``} player-tabs"
          @click=${() => {this.newHandleTabChanged(Sections.PLAYERS)}}
        >
          <i class="icon-i">
            <ha-svg-icon
              .path=${mdiSpeakerMultiple}
              class="action-button-svg${active ? "" : "-inactive"}"
            ></ha-svg-icon>
          </i>
          <span></span> 
        </a>
      `
    }
    return html``
  }
  protected renderTabs() {
    return html`
      <div>
        <nav class="tabbed">
          <link href="https://cdn.jsdelivr.net/npm/beercss@3.12.11/dist/cdn/beer.min.css" rel="stylesheet">
          ${this.renderMusicPlayerTab()}
          ${this.renderQueueTab()}
          ${this.renderMediaBrowserTab()}
          ${this.renderPlayersTab()}
        </nav>
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
      <ha-card>
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
