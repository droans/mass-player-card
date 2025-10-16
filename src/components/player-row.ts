import { consume } from '@lit/context';
import {
  html,
  type CSSResultGroup,
  LitElement,
  PropertyValues
} from 'lit';
import { property } from 'lit/decorators.js'

import {
  PlayerJoinService,
  PlayerSelectedService,
  PlayerTransferService,
  PlayerUnjoinService
} from '../const/actions';
import {
  ExtendedHass,
  ExtendedHassEntity,
  Thumbnail
} from '../const/common';
import {
  activeEntityConf,
  EntityConfig,
  hassExt,
  IconsContext,
  playersConfigContext, 
  useExpressiveContext} from '../const/context';

import {
  backgroundImageFallback,
  getFallbackBackgroundImage
} from '../utils/thumbnails';
import { testMixedContent } from '../utils/util';

import styles from '../styles/player-row';
import { DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG, PlayersConfig, PlayersHiddenElementsConfig } from '../config/players';
import { Icons } from '../const/icons.js';

class PlayerRow extends LitElement {
  @property({ type: Boolean }) joined = false;
  @property({ type: Boolean }) player_entity!: ExtendedHassEntity;
  @property({ type: Boolean }) selected = false;
  @consume({ context: IconsContext}) private Icons!: Icons;
  @consume({ context: useExpressiveContext })
  private useExpressive!: boolean;

  @consume({context: hassExt})
  public hass!: ExtendedHass;

  public allowJoin = true;
  public playerName!: string;
  public joinService!: PlayerJoinService;
  public selectedService!: PlayerSelectedService;
  public transferService!: PlayerTransferService;
  public unjoinService!: PlayerUnjoinService;

  private _config!: PlayersConfig;
  private _entityConfig!: EntityConfig;
  private hide: PlayersHiddenElementsConfig = DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG;

  @consume({ context: playersConfigContext, subscribe: true})
  public set config(config: PlayersConfig) {
    const cur_item = JSON.stringify(this._config);
    const new_item = JSON.stringify(config);
    if (cur_item == new_item) {
      return;
    }
    this._config = config;
    this.updateHiddenElements();
  }
  public get config() {
    return this._config;
  }
  @consume({ context: activeEntityConf, subscribe: true})
  public set entityConfig(config: EntityConfig) {
    const cur_item = JSON.stringify(this._entityConfig);
    const new_item = JSON.stringify(config);
    if (cur_item == new_item) {
      return;
    }
    this._entityConfig = config;
    this.updateHiddenElements();
  }
  public get entityConfig() {
    return this._entityConfig;
  }
  private updateHiddenElements() {
    if (!this.config || !this.entityConfig) {
      return;
    }
    const entity = this.entityConfig.hide.players;
    const card = this.config.hide;
    this.hide = {
      action_buttons: entity.action_buttons || card.action_buttons,
      join_button: entity.join_button || card.join_button,
      transfer_button: entity.transfer_button || card.transfer_button,
    }
  }
  private callOnPlayerSelectedService() {
    this.selectedService(this.player_entity.entity_id);
  }
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has('selected')) {
      return true;
    }
    return true;
  }
  private onJoinPressed(e: Event) {
    e.stopPropagation()
    if (this.joined) {
      this.unjoinService(this.player_entity.entity_id);
      return;
    }
    this.joinService(this.player_entity.entity_id);
    this.joined = !this.joined;
  }
  private onTransferPressed(e: Event) {
    e.stopPropagation()
    this.transferService(this.player_entity.entity_id);
  }
  private artworkStyle() {
    const img: string = this.player_entity?.attributes?.entity_picture_local ?? "";
    if (!testMixedContent(img)) {
      return getFallbackBackgroundImage(this.hass, Thumbnail.HEADPHONES);
    }
    return backgroundImageFallback(this.hass, img, Thumbnail.HEADPHONES);
  }
  private renderThumbnail() {
    return html`
      <span
        class="thumbnail"
        slot="start"
        style="${this.artworkStyle()}"
      >
      </span>
    `
  }
  private _calculateTitleWidth() {
    let button_ct = 0;
    const hide = this.config.hide;
    if (!hide.join_button && this.player_entity.attributes?.group_members && this.allowJoin) {
      button_ct += 1;
    }
    if (!hide.transfer_button) {
      button_ct += 1;
    }
    if (this.selected || hide.action_buttons) {
      return `100%;`;
    }
    const gap_ct = button_ct - 1;
    return `calc(100% - ( (32px * ${button_ct.toString()}) + (8px * ${gap_ct.toString()}) + 16px));`
  }
  private renderTitle() {
    let title = this.playerName;
    if (!title.length) {
      title = this.player_entity.attributes?.friendly_name ?? "Media Player"
    };
    return html`
      <span
        slot="headline"
        class="title"
        style="width: ${this._calculateTitleWidth()}"
      >
        ${title}
      </span>
      <span slot="supporting-text">
      </span>
    `
  }

  /* eslint-disable @typescript-eslint/unbound-method */
  protected renderTransferButton() {
    if (this.hide.transfer_button) {
      return html``
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
        @click=${this.onTransferPressed}
      >
        <ha-svg-icon
          .path=${this.Icons.SWAP}
          class="svg-action-button ${this.useExpressive ? `svg-action-button-expressive` : ``}"
        ></ha-svg-icon>
    `
  }
  protected renderJoinButon() {
    if (this.hide.join_button) {
      return html``
    }
    if (!this.player_entity.attributes?.group_members || !this.allowJoin) {
      return;
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
        @click=${this.onJoinPressed}
      >
        <ha-svg-icon
          .path=${this.joined ? this.Icons.LINK_OFF : this.Icons.LINK}
          class="svg-action-button ${this.useExpressive ? `svg-action-button-expressive` : ``}"
        ></ha-svg-icon>
    `
  }
  protected renderActionButtons() {
    if (!this.selected && !this.hide.action_buttons) {
      return html`
        <span
          slot="end"
          class="button-group"
          @click=${ (ev: Event) => {ev.stopPropagation()}}
        >
          ${this.renderJoinButon()}
          ${this.renderTransferButton()}
        </span>
      `;
    }
    return html``;
  }
  render() {
    const active = this.selected ? `-active` : ``;
    const expressive = this.useExpressive ? `button-expressive`: ``;
    return html`
      <ha-md-list-item
        class="button${active} ${expressive}${active}"
		    @click=${this.callOnPlayerSelectedService}
        type="button"
      >
        ${this.renderThumbnail()}
        ${this.renderTitle()}
        ${this.renderActionButtons()}
      </ha-md-list-item>
      <div class="divider"></div>
    `
  }
  /* eslint-enable @typescript-eslint/unbound-method */
    static get styles(): CSSResultGroup {
      return styles;
    }
}

customElements.define('mass-player-player-row', PlayerRow);