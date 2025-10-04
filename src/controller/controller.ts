import { ContextProvider } from "@lit/context";
import { Config } from "../config/config";
import { ExtendedHass } from "../const/common";
import {
  actionsControllerContext,
  activePlayerControllerContext,
  activeSectionContext,
  hassExt
} from "../const/context";
import { MassCardConfigController } from "./config";
import { ActivePlayerController } from "./active-player";
import { Sections } from "../const/card";
import { ActionsController } from "./actions";

export class MassCardController {
  private _hass = new ContextProvider(document.body, { context: hassExt });
  private _host: HTMLElement;

  private configController: MassCardConfigController;
  private activePlayerController!: ContextProvider<typeof activePlayerControllerContext>;
  private actionsController!: ContextProvider<typeof actionsControllerContext>;
  
  private _activeSection = new ContextProvider(document.body, { context: activeSectionContext});

  constructor(host: HTMLElement) {
    this._host = host;
    this.configController = new MassCardConfigController(host);
  }
  private setupIfReady() {
    this._setupActiveController();      
    this._setupActionsController();
  }
  private _setupActiveController() {
    if (this.hass && this.config && !this.activePlayerController) {
      const active_controller = new ActivePlayerController(this.hass, this.config, this._host);
      this.activePlayerController = new ContextProvider(this._host, { context: activePlayerControllerContext})
      this.activePlayerController.setValue(active_controller)
    }
  }
  private _setupActionsController() {
    const is_ready = !!(
      this.activePlayerController
        && this.config
        && this.hass
    )
    if (!this.actionsController && is_ready){
      this.actionsController = new ContextProvider(this._host, { context: actionsControllerContext});
      this.actionsController.setValue(new ActionsController(this._host, this.hass, this.ActivePlayer.activeEntityConfig));
    }
  }

  public set hass(hass: ExtendedHass) {
    this._hass.value = hass;
    this.setupIfReady();
    this.ActivePlayer.hass = hass;
    this.Actions.hass = hass;
  }
  public get hass() {
    return this._hass.value;
  }

  public set config(config: Config) {
    this.configController.config = config;
    this.setupIfReady();
  }
  public get config() {
    return this.configController.config;
  }
  public get Config() {
    return this.configController;
  }
  public set activeEntityId(entity: string) {
    this.ActivePlayer.setActivePlayer(entity);
    this.Actions.setEntityConfig(this.ActivePlayer.activeEntityConfig);
  }
  public get activeEntityId() {
    return this.ActivePlayer.activeEntityID;
  }
  public get activeEntity() {
    return this.ActivePlayer.activeMediaPlayer;
  }
  public get volumeEntity() {
    return this.ActivePlayer.volumeMediaPlayer;
  }
  public set activeSection(section: Sections) {
    this._activeSection.setValue(section);
  }
  public get activeSection() {
    return this._activeSection.value;
  }
  public get ActivePlayer() {
    return this.activePlayerController.value;
  }
  public get Actions() {
    return this.actionsController.value;
  }
}
