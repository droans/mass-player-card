import { consume } from "@lit/context";
import { html, type CSSResultGroup, LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import {
  PlayerJoinService,
  PlayerSelectedService,
  PlayerTransferService,
  PlayerUnjoinService,
} from "../const/actions";
import { VibrationPattern } from "../const/common";
import {
  activeEntityConfContext,
  EntityConfig,
  hassContext,
  IconsContext,
  playersConfigContext,
  useExpressiveContext,
} from "../const/context";

import {
  backgroundImageFallback,
  getFallbackBackgroundImage,
} from "../utils/thumbnails";
import { isActive, jsonMatch, testMixedContent } from "../utils/util";

import styles from "../styles/player-row";
import {
  DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
  PlayersConfig,
  PlayersHiddenElementsConfig,
} from "../config/players";
import { Icons } from "../const/icons";
import { ExtendedHass, ExtendedHassEntity } from "../const/types";
import { Thumbnail } from "../const/enums";

class PlayerRow extends LitElement {
  @property({ attribute: false }) joined = false;
  @property({ attribute: false }) player_entity!: ExtendedHassEntity;
  @property({ attribute: false }) selected = false;
  @consume({ context: IconsContext }) private Icons!: Icons;
  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;
  @property({ attribute: 'can-group', type: Boolean }) canGroup = false;

  @consume({ context: hassContext })
  public hass!: ExtendedHass;

  public allowJoin = true;
  public playerName!: string;
  public joinService!: PlayerJoinService;
  public selectedService!: PlayerSelectedService;
  public transferService!: PlayerTransferService;
  public unjoinService!: PlayerUnjoinService;

  private _config!: PlayersConfig;
  private _entityConfig!: EntityConfig;
  private hide: PlayersHiddenElementsConfig =
    DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG;

  @consume({ context: playersConfigContext, subscribe: true })
  public set config(config: PlayersConfig) {
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    this.updateHiddenElements();
  }
  public get config() {
    return this._config;
  }
  @consume({ context: activeEntityConfContext, subscribe: true })
  public set entityConfig(config: EntityConfig) {
    if (jsonMatch(this._entityConfig, config)) {
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
    };
  }
  private callOnPlayerSelectedService = () => {
    this.selectedService(this.player_entity.entity_id);
  }
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    return _changedProperties.size > 0;
  }
  private onJoinPressed = async (e: Event) => {
    navigator.vibrate(VibrationPattern.Players.ACTION_JOIN);
    e.stopPropagation();
    const service = this.joined ? this.unjoinService : this.joinService;
    await service([this.player_entity.entity_id]);
    this.joined = !this.joined;
  }
  private onTransferPressed = (e: Event) => {
    e.stopPropagation();
    navigator.vibrate(VibrationPattern.Players.ACTION_TRANSFER);
    this.transferService(this.player_entity.entity_id);
  }
  private artworkStyle() {
    const img: string =
      this.player_entity?.attributes?.entity_picture_local ?? "";
    if (!testMixedContent(img)) {
      return getFallbackBackgroundImage(this.hass, Thumbnail.HEADPHONES);
    }
    return backgroundImageFallback(this.hass, img, Thumbnail.HEADPHONES);
  }
  private renderThumbnail() {
    return html`
      <span class="thumbnail" slot="start" style="${this.artworkStyle()}">
      </span>
    `;
  }
  private _calculateTitleWidth() {
    let button_ct = 0;
    const hide = this.config.hide;
    if (
      !hide.join_button &&
      this.player_entity.attributes?.group_members &&
      this.allowJoin
    ) {
      button_ct += 1;
    }
    if (!hide.transfer_button) {
      button_ct += 1;
    }
    if (this.selected || hide.action_buttons) {
      return `100%;`;
    }
    const gap_ct = button_ct - 1;
    return `calc(100% - ( (32px * ${button_ct.toString()}) + (8px * ${gap_ct.toString()}) + 16px));`;
  }
  private renderTitle() {
    let title = this.playerName;
    if (!title.length) {
      title = this.player_entity.attributes?.friendly_name ?? "Media Player";
    }
    const active_style =
      isActive(this.hass, this.player_entity, this._entityConfig) &&
      this.player_entity.state == "playing"
        ? `audio-bars`
        : `audio-bars-inactive`;
    const active_expressive_style = this.useExpressive
      ? `audio-bars-expressive`
      : `audio-bars-normal`;
    return html`
      <span slot="headline">
        <div
          class="title-bars"
          style="max-width: ${this._calculateTitleWidth()}"
        >
          <div class="title">${title}</div>
          <div class="${active_style} ${active_expressive_style}">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </span>
      <span slot="supporting-text"> </span>
    `;
  }

  protected renderTransferButton() {
    if (this.hide.transfer_button) {
      return html``;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.onTransferPressed}
        role="tonal"
        size="small"
        elevation=1
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.Icons.SWAP}
          class="svg-action-button ${this.useExpressive
            ? `svg-action-button-expressive`
            : ``}"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  protected renderJoinButon() {
    if (this.hide.join_button || !this.canGroup) {
      return html``;
    }
    if (!this.player_entity.attributes?.group_members || !this.allowJoin) {
      return;
    }
    return html`
      <mass-player-card-button
        .onPressService=${this.onJoinPressed}
        role="tonal"
        size="small"
        elevation=1
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
      >
        <ha-svg-icon
          .path=${this.joined ? this.Icons.LINK_OFF : this.Icons.LINK}
          class="svg-action-button ${this.useExpressive
            ? `svg-action-button-expressive`
            : ``}"
        ></ha-svg-icon>
      </mass-player-card-button>
    `;
  }
  protected renderActionButtons() {
    if (!this.selected && !this.hide.action_buttons) {
      return html`
        <span
          slot="end"
          class="button-group"
          @click=${(ev: Event) => {
            ev.stopPropagation();
          }}
        >
          ${this.renderJoinButon()} ${this.renderTransferButton()}
        </span>
      `;
    }
    return html``;
  }
  render() {
    const active = this.selected ? `-active` : ``;
    const expressive = this.useExpressive ? `button-expressive` : ``;
    return html`
      <ha-md-list-item
        class="button${active} ${expressive}${active}"
        @click=${this.callOnPlayerSelectedService}
        type="button"
      >
        ${this.renderThumbnail()} ${this.renderTitle()}
        ${this.renderActionButtons()}
      </ha-md-list-item>
      <div class="divider"></div>
    `;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-player-player-row", PlayerRow);
