import { consume } from "@lit/context";
import { LitElement } from "lit";
import { state } from "lit/decorators.js";
import { actionsControllerContext, activePlayerDataContext, IconsContext } from "../const/context";
import { ActionsController } from "../controller/actions";
import { PlayerData } from "../const/music-player";
import { Icons } from "../const/icons";
import { getIteratedRepeatMode } from "../utils/music-player";
import { RepeatMode } from "../const/common";

export class MassPlayerControlsBase extends LitElement {
  @consume({ context: actionsControllerContext})
  private actions!: ActionsController

  @state()
  protected _playerData!: PlayerData;

  @consume({ context: IconsContext}) protected Icons!: Icons;
  
  protected playing = false;
  protected repeat = RepeatMode.OFF;
  protected shuffle = false;
  protected favorite = false;

  @consume({ context: activePlayerDataContext, subscribe: true })
  public set playerData(playerData: PlayerData) {
    const cur_item = JSON.stringify(this._playerData);
    const new_item = JSON.stringify(playerData);
    if (cur_item == new_item) {
      return;
    }
    this._playerData = playerData;
    this.playing = playerData.playing;
    this.repeat = playerData.repeat;
    this.shuffle = playerData.shuffle;
    this.favorite = playerData.favorite;
  }
  public get playerData() {
    return this._playerData;
  }
  
  protected onPrevious = async () => {
    await this.actions.actionPlayPrevious();
  }
  protected onNext = async () => {
    await this.actions.actionPlayNext();
  }
  protected onPlayPause = async () => {
    await this.actions.actionPlayPause();
  }
  protected onShuffle = async () => {
    this.shuffle = !this.shuffle;
    this.requestUpdate();
    await this.actions.actionToggleShuffle();
  }
  protected onRepeat = async () => {
    const cur_repeat = this.playerData.repeat;
    const repeat = getIteratedRepeatMode(cur_repeat);
    this.repeat = repeat;
    this.requestUpdate();
    await this.actions.actionSetRepeat(repeat);
  }
  protected onPower = async () => {
    await this.actions.actionTogglePower();
  }
  protected onFavorite = async () => {
    this.favorite = !this.favorite;
    this.requestUpdate();
    if (this.playerData.favorite) {
      await this.actions.actionRemoveFavorite();
    } else {
      await this.actions.actionAddFavorite();
    }
  }
}