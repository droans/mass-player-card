import { ContextProvider } from "@lit/context";
import { Config } from "../config/config";
import { ExtendedHass } from "../const/common";
import {
  activePlayerControllerContext,
  activeSectionContext,
  hassExt
} from "../const/context";
import { MassCardConfigController } from "./config";
import { ActivePlayerController } from "./active-player";
import { Sections } from "../const/card";

export class MassCardController {
  private _hass = new ContextProvider(document.body, { context: hassExt });
  private configController: MassCardConfigController;
  private activePlayerController!: ContextProvider<{ __context__: ActivePlayerController; }, HTMLElement>;
  private _host: HTMLElement;
  private _activeSection = new ContextProvider(document.body, { context: activeSectionContext});
  constructor(host: HTMLElement) {
    this._host = host;
    this.configController = new MassCardConfigController(host);
  }
  private setupIfReady() {
    if (this.hass && this.config && !this.activePlayerController) {
      const active_controller = new ActivePlayerController(this.hass, this.config, this._host);
      this.activePlayerController = new ContextProvider(this._host, { context: activePlayerControllerContext})
      this.activePlayerController.setValue(active_controller)
    }
  }

  public set hass(hass: ExtendedHass) {
    this._hass.value = hass;
    this.setupIfReady();
    this.ActivePlayer.hass = hass;
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
  public set activeEntity(entity: string) {
    this.ActivePlayer.setActivePlayer(entity);
  }
  public get ActivePlayer() {
    return this.activePlayerController.value;
  }
  public set activeSection(section: Sections) {
    this._activeSection.setValue(section);
  }
  public get activeSection() {
    return this._activeSection.value;
  }
}
