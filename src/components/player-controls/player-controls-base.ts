import { consume } from "@lit/context";
import { LitElement, PropertyValues } from "lit";
import { state } from "lit/decorators.js";
import {
  actionsControllerContext,
  activePlayerDataContext,
  controllerContext,
  IconsContext,
  musicPlayerConfigContext,
  musicPlayerHiddenElementsConfigContext,
} from "../../const/context";
import { ActionsController } from "../../controller/actions";
import { PlayerData } from "../../const/types";
import { Icons } from "../../const/icons";
import { getIteratedRepeatMode } from "../../utils/music-player";
import { RepeatMode } from "../../const/enums";
import { jsonMatch } from "../../utils/utility";
import {
  PlayerConfig,
  PlayerControlsHiddenElementsConfig,
  PlayerLayoutConfig,
} from "../../config/player";
import { MassCardController } from "../../controller/controller";
import { ForceUpdatePlayerDataEventData } from "../../const/events";

export class MassPlayerControlsBase extends LitElement {
  protected layoutConfig!: PlayerLayoutConfig;
  protected _config!: PlayerConfig;
  @consume({ context: musicPlayerConfigContext, subscribe: true })
  @state()
  private set config(config: PlayerConfig) {
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    this.layoutConfig = config.layout;
  }
  public get config() {
    return this._config;
  }
  @consume({ context: actionsControllerContext })
  private actions!: ActionsController;

  @consume({ context: musicPlayerHiddenElementsConfigContext, subscribe: true })
  protected hiddenElements!: PlayerControlsHiddenElementsConfig;

  @consume({ context: controllerContext, subscribe: true })
  public controller!: MassCardController;

  @state()
  protected _playerData!: PlayerData;

  @consume({ context: IconsContext }) protected Icons!: Icons;

  @state() protected playing = false;
  @state() protected repeat = RepeatMode.OFF;
  @state() protected shuffle = false;
  @state() protected favorite = false;

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
      key,
      value,
    };
    const event_ = new CustomEvent("force-update-player", { detail: data });
    this.controller.host.dispatchEvent(event_);
  }
  /* 
    eslint-enable 
      @typescript-eslint/no-explicit-any,
      @typescript-eslint/no-unsafe-assignment
  */
  private requestPlayerDataUpdate() {
    const event_ = new Event("request-player-data-update");
    this.controller.host.dispatchEvent(event_);
  }
  protected onPrevious = async (event_: Event) => {
    event_.stopPropagation();
    await this.actions.actionPlayPrevious();
    this.requestPlayerDataUpdate();
  };
  protected onNext = async (event_: Event) => {
    event_.stopPropagation();
    await this.actions.actionPlayNext();
    this.requestPlayerDataUpdate();
  };
  protected onPlayPause = async (event_: Event) => {
    event_.stopPropagation();
    this.playing = !this.playing;
    this.forceUpdatePlayerData("playing", this.playing);
    await this.actions.actionPlayPause();
  };
  protected onShuffle = async (event_: Event) => {
    event_.stopPropagation();
    this.shuffle = !this.shuffle;
    this.requestUpdate("shuffle", this.shuffle);
    await this.actions.actionToggleShuffle();
  };
  protected onRepeat = async (event_: Event) => {
    event_.stopPropagation();
    const current_repeat = this.repeat;
    const repeat = getIteratedRepeatMode(current_repeat);
    this.repeat = repeat;
    this.requestUpdate("repeat", this.repeat);
    await this.actions.actionSetRepeat(repeat);
  };
  protected onPower = async (event_: Event) => {
    event_.stopPropagation();
    await this.actions.actionTogglePower();
  };
  protected onFavorite = async (event_: Event) => {
    event_.stopPropagation();
    this.favorite = !this.favorite;
    this.requestUpdate("favorite", this.favorite);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (this.playerData.favorite) {
      await this.actions.actionRemoveFavorite();
    } else {
      await this.actions.actionAddFavorite();
    }
  };
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
}
