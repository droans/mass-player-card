import { ContextProvider } from "@lit/context";
import { Config } from "../config/config";
import { ExtendedHass } from "../const/common";
import {
  actionsControllerContext,
  activePlayerControllerContext,
  activeSectionContext,
  browserControllerContext,
  hassExt,
  queueControllerContext
} from "../const/context";
import { MassCardConfigController } from "./config";
import { ActivePlayerController } from "./active-player";
import { Sections } from "../const/card";
import { ActionsController } from "./actions";
import { QueueController } from "./queue.js";
import { MediaBrowserController } from "./browser.js";
import { jsonMatch } from "../utils/util.js";

export class MassCardController {
  private _hass = new ContextProvider(document.body, { context: hassExt });
  private _host!: HTMLElement;

  private configController: MassCardConfigController;
  private activePlayerController!: ContextProvider<typeof activePlayerControllerContext>;
  private actionsController!: ContextProvider<typeof actionsControllerContext>;
  private queueController!: ContextProvider<typeof queueControllerContext>;
  private browserController!: ContextProvider<typeof browserControllerContext>;
  private _activeSection!: ContextProvider<typeof activeSectionContext>;

  constructor(host: HTMLElement) {
    this.host = host;
    this.configController = new MassCardConfigController(host);
    this._activeSection = new ContextProvider(this.host, { context: activeSectionContext});
  }
  public set host(host: HTMLElement) {
    this._host = host;
  }
  public get host() {
    return this._host;
  }
  private setupIfReady() {
    this._setupActiveController();      
    this._setupActionsController();
    this._setupQueueController();
    this._setupBrowserController();
  }
  private _setupActiveController() {
    if (this.hass && this.config && !this.activePlayerController) {
      const active_controller = new ActivePlayerController(this.hass, this.config, this.host);
      this.activePlayerController = new ContextProvider(this.host, { context: activePlayerControllerContext})
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
      this.actionsController = new ContextProvider(this.host, { context: actionsControllerContext});
      this.actionsController.setValue(new ActionsController(this.host, this.hass, this.ActivePlayer.activeEntityConfig));
    }
  }
  private _setupQueueController() {
    if (this.hass
      && this.activeEntity
      && this.config
      && !this.queueController
    ) {
      this.queueController = new ContextProvider(this.host, { context: queueControllerContext});
      this.queueController.setValue(new QueueController(this.hass, this.activeEntity, this.config));
    }
  }
  private _setupBrowserController() {
    if (
      this.hass 
      && this.config
      && this.activeEntityId
      && !this.browserController
    ) {
      this.browserController = new ContextProvider(this.host, { context: browserControllerContext});
      this.browserController.setValue(new MediaBrowserController(this.hass, this.config, this.activeEntityId));
    }
  }

  public set hass(hass: ExtendedHass) {
    this._hass.value = hass;
    this.setupIfReady();
    this.ActivePlayer.hass = hass;
    this.Actions.hass = hass;
    this.Queue.hass = hass;
  }
  public get hass() {
    return this._hass.value;
  }

  public set config(config: Config) {
    if (jsonMatch(this.configController.config, config)) {
      return;
    }
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
    this.Queue.setActiveEntityId(entity);
    this.Browser.activeEntityId = entity;
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
    if (section != this.activeSection) {
      this._activeSection.setValue(section)
      const ev = new CustomEvent('section-changed', {detail: section})
      this.host.dispatchEvent(ev);
    };
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

  public get Queue() {
    return this.queueController.value;
  }

  public get Browser() {
    return this.browserController.value;
  }
}
