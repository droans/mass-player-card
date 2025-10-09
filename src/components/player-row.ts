import { consume } from '@lit/context';
import {
  mdiLink,
  mdiLinkOff,
  mdiSwapHorizontal
} from '@mdi/js';
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
import { activeEntityConf, EntityConfig, hassExt, playersConfigContext } from '../const/context';

import {
  backgroundImageFallback,
  getFallbackBackgroundImage
} from '../utils/thumbnails';
import { testMixedContent } from '../utils/util';

import styles from '../styles/player-row';
import { DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG, PlayersConfig, PlayersHiddenElementsConfig } from '../config/players';

class PlayerRow extends LitElement {
  @property({ type: Boolean }) joined = false;
  @property({ type: Boolean }) player_entity!: ExtendedHassEntity;
  @property({ type: Boolean }) selected = false;

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
    this._config = config;
    this.updateHiddenElements();
  }
  public get config() {
    return this._config;
  }
  @consume({ context: activeEntityConf, subscribe: true})
  public set entityConfig(config: EntityConfig) {
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
  private renderTitle() {
    let title = this.playerName;
    if (!title.length) {
      title = this.player_entity.attributes?.friendly_name ?? "Media Player"
    };
    return html`
      <span
        slot="headline"
        class="title"
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
        class="action-button"
        @click=${this.onTransferPressed}
      >
        <ha-svg-icon
          .path=${mdiSwapHorizontal}
          class="svg-action-button"
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
        class="action-button"
        @click=${this.onJoinPressed}
      >
        <ha-svg-icon
          .path=${this.joined ? mdiLinkOff : mdiLink}
          class="svg-action-button"
        ></ha-svg-icon>
    `
  }
  protected renderActionButtons() {
    if (!this.selected && !this.hide.action_buttons) {
      return html`
        <span
          slot="end"
          class="button-group"
        >
          ${this.renderJoinButon()}
          ${this.renderTransferButton()}
        </span>
      `;
    }
    return html``;
  }
  render() {
    return html`
      <ha-md-list-item
        class="button${this.selected ? '-active' : ''}"
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