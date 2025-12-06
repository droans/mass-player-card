import BrowserActions from "../actions/browser-actions";
import PlayerActions from "../actions/player-actions";
import PlayersActions from "../actions/players-actions";
import QueueActions from "../actions/queue-actions";
import { EntityConfig } from "../config/config";
import { RepeatMode } from "../const/common";
import { ExtendedHass, ExtendedHassEntity } from "../const/types.js";

export class ActionsController {
  private _host: HTMLElement;
  private _hass: ExtendedHass;
  private _entityConf!: EntityConfig;
  private _activeEntity!: ExtendedHassEntity;
  private _volumeEntity!: ExtendedHassEntity;
  private _activeEntityId!: string;
  private _volumeEntityId!: string;

  private _browserActions!: BrowserActions;
  private _playerActions!: PlayerActions;
  private _playersActions!: PlayersActions;
  private _queueActions!: QueueActions;

  constructor(
    host: HTMLElement,
    hass: ExtendedHass,
    entityConfig: EntityConfig,
  ) {
    this._host = host;
    this._hass = hass;
    this.setEntityConfig(entityConfig);
    this._setupActions();
  }
  public setEntityConfig(config: EntityConfig) {
    this._entityConf = config;
    const entity_id = config.entity_id;
    const volume_entity_id = config.volume_entity_id;
    this._activeEntity = this._hass.states[entity_id];
    this._volumeEntity = this._hass.states[volume_entity_id];
    this._activeEntityId = entity_id;
    this._volumeEntityId = volume_entity_id;
  }
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    this._updateActions();
  }

  private _setupActions() {
    this._browserActions = new BrowserActions(this._hass);
    this._playerActions = new PlayerActions(this._hass);
    this._playersActions = new PlayersActions(this._hass);
    this._queueActions = new QueueActions(this._hass, this._activeEntityId);
  }
  private _updateActions() {
    if (this._hass) {
      this._browserActions.hass = this._hass;
      this._playerActions.hass = this._hass;
      this._playersActions.hass = this._hass;
      this._queueActions.hass = this._hass;
      if (this._activeEntityId) {
        this._activeEntity = this._hass.states[this._activeEntityId];
      }
      if (this._volumeEntityId) {
        this._volumeEntity = this._hass.states[this._volumeEntityId];
      }
    }
    this._queueActions.player_entity = this._activeEntityId;
  }
  /*
      Actions
  */
  /*
          Player
      */
  public async actionTogglePower() {
    await this.PlayerActions.actionTogglePlayer(this._activeEntity);
  }
  public async actionPlayPause() {
    await this.PlayerActions.actionPlayPause(this._activeEntity);
  }
  public async actionPlayNext() {
    await this.PlayerActions.actionNext(this._activeEntity);
  }
  public async actionPlayPrevious() {
    await this.PlayerActions.actionPrevious(this._activeEntity);
  }
  public async actionToggleShuffle() {
    await this.PlayerActions.actionShuffleToggle(this._activeEntity);
  }
  public async actionSetRepeat(repeatMpde: RepeatMode) {
    await this.PlayerActions.actionRepeatSet(this._activeEntity, repeatMpde);
  }
  public async actionSeek(pos: number) {
    await this.PlayerActions.actionSeek(this._activeEntity, pos);
  }

  /*
          Current Item
      */
  public async actionAddFavorite() {
    await this.PlayerActions.actionAddFavorite(this._activeEntity);
  }
  public async actionRemoveFavorite() {
    await this.PlayerActions.actionRemoveFavorite(this._activeEntity);
  }

  /*
          Volume
      */
  public async actionSetVolume(volume: number) {
    const used_vol = volume > 1 ? volume / 100 : volume;
    await this.PlayerActions.actionSetVolume(this._volumeEntity, used_vol);
  }
  public async actionToggleMute() {
    await this.PlayerActions.actionMuteToggle(this._volumeEntity);
  }

  public get browserActions() {
    return this._browserActions;
  }
  public get PlayerActions() {
    return this._playerActions;
  }
  public get playersActions() {
    return this._playersActions;
  }
  public get queueActions() {
    return this._queueActions;
  }
  public disconnected() {
    return;
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass;
  }
}
