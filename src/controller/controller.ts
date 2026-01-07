import { ContextProvider } from "@lit/context";
import { Config } from "../config/config";
import { ExtendedHass } from "../const/types";
import {
  actionsControllerContext,
  activePlayerControllerContext,
  activeSectionContext,
  browserControllerContext,
  hassContext,
  queueControllerContext,
} from "../const/context";
import { MassCardConfigController } from "./config";
import { ActivePlayerController } from "./active-player";
import { Sections } from "../const/enums";
import { ActionsController } from "./actions";
import { QueueController } from "./queue";
import { MediaBrowserController } from "./browser";
import { jsonMatch } from "../utils/util";
import { getTranslation } from "../utils/translations";

export class MassCardController {
  private _hass = new ContextProvider(document.body, { context: hassContext });
  private _host!: HTMLElement;

  private configController: MassCardConfigController;
  private activePlayerController?: ContextProvider<
    typeof activePlayerControllerContext
  >;
  private actionsController?: ContextProvider<typeof actionsControllerContext>;
  private queueController?: ContextProvider<typeof queueControllerContext>;
  private browserController?: ContextProvider<typeof browserControllerContext>;
  private _activeSection: ContextProvider<typeof activeSectionContext>;
  private _connected = true;
  private _reconnected = false;

  constructor(host: HTMLElement) {
    this.host = host;
    this.configController = new MassCardConfigController(host);
    this._activeSection = new ContextProvider(this.host, {
      context: activeSectionContext,
    });
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
      const active_controller = new ActivePlayerController(
        this.hass,
        this.config,
        this.host,
      );
      this.activePlayerController = new ContextProvider(this.host, {
        context: activePlayerControllerContext,
      });
      this.activePlayerController.setValue(active_controller);
    }
  }
  private _setupActionsController() {
    const is_ready = !!(
      this.activePlayerController &&
      this.config &&
      this.hass &&
      this.ActivePlayer
    );
    if (!this.actionsController && is_ready) {
      this.actionsController = new ContextProvider(this.host, {
        context: actionsControllerContext,
      });
      this.actionsController.setValue(
        new ActionsController(
          this.host,
          this.hass as ExtendedHass,
          this.ActivePlayer.activeEntityConfig,
        ),
      );
    }
  }
  private _setupQueueController() {
    if (
      this.hass &&
      this.activeEntity &&
      this.config &&
      !this.queueController
    ) {
      this.queueController = new ContextProvider(this.host, {
        context: queueControllerContext,
      });
      this.queueController.setValue(
        new QueueController(
          this.hass,
          this.activeEntity,
          this.config,
          this.host,
        ),
      );
    }
  }
  private _setupBrowserController() {
    if (
      this.hass &&
      this.config &&
      this.activeEntityId &&
      !this.browserController
    ) {
      this.browserController = new ContextProvider(this.host, {
        context: browserControllerContext,
      });
      this.browserController.setValue(
        new MediaBrowserController(
          this.hass,
          this.config,
          this.activeEntityId,
          this.host,
        ),
      );
    }
  }

  public set hass(hass: ExtendedHass | undefined) {
    if (!hass) {
      return;
    }
    this._hass.value = hass;
    this.setupIfReady();
    if (this.ActivePlayer) {
      this.ActivePlayer.hass = hass;
    }
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    this.Actions!.hass = hass;
    this.Queue!.hass = hass;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    if (this._reconnected) {
      this._reconnected = false;
      this.hassReconnected();
    }
  }
  public get hass() {
    return this._hass.value;
  }

  public set config(config: Config | undefined) {
    if (jsonMatch(this.configController.config, config) || !config) {
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
    if (this.ActivePlayer) {
      this.ActivePlayer.setActivePlayer(entity);
      if (this.Actions) {
        this.Actions.setEntityConfig(this.ActivePlayer.activeEntityConfig);
      }
    }
    if (this.Queue) {
      this.Queue.setActiveEntityId(entity);
    }
    if (this.Browser) {
      this.Browser.activeEntityId = entity;
    }
  }
  public get activeEntityId(): string {
    return this.ActivePlayer?.activeEntityID ?? "";
  }
  public get activeEntity() {
    return this.ActivePlayer?.activeMediaPlayer;
  }
  public get volumeEntity() {
    return this.ActivePlayer?.volumeMediaPlayer;
  }
  public set activeSection(section: Sections | undefined) {
    if (!section) {
      return;
    }
    if (section != this.activeSection) {
      this._activeSection.setValue(section);
      const ev = new CustomEvent("section-changed", { detail: section });
      this.host.dispatchEvent(ev);
    }
  }
  public get activeSection() {
    return this._activeSection.value;
  }
  public get ActivePlayer() {
    if (!this.activePlayerController) {
      return;
    }
    return this.activePlayerController.value;
  }
  public get Actions() {
    return this.actionsController?.value;
  }

  public get Queue() {
    return this.queueController?.value;
  }

  public get Browser() {
    return this.browserController?.value;
  }
  public disconnected() {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    this.ActivePlayer!.disconnected();
    this.Actions!.disconnected();
    this.Queue!.disconnected();
    this.Browser!.disconnected();
    this._connected = false;
  }
  public connected() {
    this._connected = true;
    this._reconnected = true;
  }
  private hassReconnected() {
    const hass = this.hass as ExtendedHass;
    this.ActivePlayer!.reconnected(hass);
    this.Actions!.reconnected(hass);
    this.Queue!.reconnected(hass);
    this.Browser!.reconnected(hass);
    /* eslint-emable @typescript-eslint/no-non-null-assertion */
  }
  public translate(key: string) {
    return getTranslation(key, this.hass);
  }
}
