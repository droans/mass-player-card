import { consume } from "@lit/context";
import { LitElement, PropertyValues } from "lit";
import { state } from "lit/decorators.js";
import { actionsControllerContext, activeEntityConf, activePlayerDataContext, controllerContext, EntityConfig, IconsContext, musicPlayerConfigContext } from "../const/context";
import { ActionsController } from "../controller/actions";
import { ForceUpdatePlayerDataEventData, PlayerData } from "../const/music-player";
import { Icons } from "../const/icons";
import { getIteratedRepeatMode } from "../utils/music-player";
import { RepeatMode } from "../const/common";
import { jsonMatch } from "../utils/util.js";
import { PlayerConfig, PlayerControlsHiddenElementsConfig } from "../config/player.js";
import { MassCardController } from "../controller/controller.js";

export class MassPlayerControlsBase extends LitElement {
  @consume({ context: actionsControllerContext})
  private actions!: ActionsController
  private _entityHiddenElements!: PlayerControlsHiddenElementsConfig;
  private _configHiddenElements!: PlayerControlsHiddenElementsConfig;
  @state() private _hiddenElements!: PlayerControlsHiddenElementsConfig;

  @consume({context: controllerContext, subscribe: true})
  public controller!: MassCardController;

  @consume({ context: musicPlayerConfigContext, subscribe: true})
  private set _base_player_config(config: PlayerConfig) {
    const c = config.hide;
    this._configHiddenElements = {
      power: c.power,
      repeat: c.repeat,
      shuffle: c.shuffle,
      favorite: c.favorite
    }
    this.setHiddenElements();
  }

  @consume({ context: activeEntityConf, subscribe: true})
  private set activeEntityConfig(config: EntityConfig) {
    const c = config.hide.player;
    this._entityHiddenElements = {
      power: c.power,
      repeat: c.repeat,
      shuffle: c.shuffle,
      favorite: c.favorite
    }
    this.setHiddenElements();
  }
  
  private setHiddenElements() {
    const e = this?._entityHiddenElements;
    const c= this?._configHiddenElements;
    const result: PlayerControlsHiddenElementsConfig = {
      power: e?.power || c?.power || false,
      repeat: e?.repeat || c?.repeat || false,
      shuffle: e?.shuffle || c?.shuffle || false,
      favorite: e?.favorite || c?.favorite || false,
    }
    if (jsonMatch(result, this._hiddenElements)) {
      return;
    }
    this._hiddenElements = result;
  }

  protected get hiddenElements() {
    return this._hiddenElements;
  }

  @state()
  protected _playerData!: PlayerData;

  @consume({ context: IconsContext}) protected Icons!: Icons;
  
  protected playing = false;
  protected repeat = RepeatMode.OFF;
  protected shuffle = false;
  protected favorite = false;

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set playerData(playerData: PlayerData) {
    this._playerData = playerData;
    this.playing = playerData.playing;
    this.repeat = playerData.repeat;
    this.shuffle = playerData.shuffle;
    this.favorite = playerData.favorite;
  }
  public get playerData() {
    return this._playerData;
  }
  /* 
    eslint-disable 
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment
  */
  private forceUpdatePlayerData(key: string, value: any) {
    const data: ForceUpdatePlayerDataEventData = {
      key: key,
      value: value
    }
    const ev = new CustomEvent('force-update-player', {detail: data})
    this.controller.host.dispatchEvent(ev);
  }
  /* 
    eslint-enable 
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment
  */
  private requestPlayerDataUpdate() {
    const ev = new Event('request-player-data-update');
    this.controller.host.dispatchEvent(ev);    
  }
  protected onPrevious = async (e: Event) => {
    e.stopPropagation();
    await this.actions.actionPlayPrevious();
    this.requestPlayerDataUpdate();
  }
  protected onNext = async (e: Event) => {
    e.stopPropagation();
    await this.actions.actionPlayNext();
    this.requestPlayerDataUpdate();
  }
  protected onPlayPause = async (e: Event) => {
    e.stopPropagation();
    this.playing = !this.playing;
    this.forceUpdatePlayerData('playing', this.playing);
    await this.actions.actionPlayPause();
  }
  protected onShuffle = async (e: Event) => {
    e.stopPropagation();
    this.shuffle = !this.shuffle;
    this.requestUpdate('shuffle', this.shuffle);
    await this.actions.actionToggleShuffle();
  }
  protected onRepeat = async (e: Event) => {
    e.stopPropagation();
    const cur_repeat = this.playerData.repeat;
    const repeat = getIteratedRepeatMode(cur_repeat);
    this.repeat = repeat;
    this.requestUpdate('repeat', this.repeat);
    await this.actions.actionSetRepeat(repeat);
  }
  protected onPower = async (e: Event) => {
    e.stopPropagation();
    await this.actions.actionTogglePower();
  }
  protected onFavorite = async (e: Event) => {
    e.stopPropagation();
    this.favorite = !this.favorite;
    this.requestUpdate('favorite', this.favorite);
    if (this.playerData.favorite) {
      await this.actions.actionRemoveFavorite();
    } else {
      await this.actions.actionAddFavorite();
    }
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
}