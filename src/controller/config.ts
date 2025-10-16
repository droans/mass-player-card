import { ContextProvider } from "@lit/context";
import { Config, processConfig } from "../config/config";
import {
  entitiesConfigContext,
  IconsContext,
  mediaBrowserConfigContext,
  musicPlayerConfigContext,
  playerQueueConfigContext,
  playersConfigContext
} from "../const/context";
import {
  getIcons,
  Icons
} from "../const/icons.js";

export class MassCardConfigController {
  private _config!: Config;
  private _entitiesConfig = new ContextProvider(document.body, { context: entitiesConfigContext});
  private _mediaBrowserConfig = new ContextProvider(document.body, { context: mediaBrowserConfigContext});
  private _playerQueueConfig = new ContextProvider(document.body, { context: playerQueueConfigContext});
  private _musicPlayerConfig = new ContextProvider(document.body, { context: musicPlayerConfigContext});
  private _playersConfig = new ContextProvider(document.body, { context: playersConfigContext});
  private _icons = new ContextProvider(document.body, { context: IconsContext});
  private _host: HTMLElement;
  
  constructor(host: HTMLElement) {
    this._host = host;
  }
  public set config(config: Config) {
    const cur_item = JSON.stringify(this._config);
    const new_item = JSON.stringify(config);
    if (cur_item == new_item) {
      return;
    }
    const conf = processConfig(config);
    this._config = conf;
    this._entitiesConfig.value = conf.entities;
    this._playerQueueConfig.value = conf.queue;
    this._musicPlayerConfig.value = conf.player;
    this._playersConfig.value = conf.players;
    this._mediaBrowserConfig.value = conf.media_browser;
    this.Icons = getIcons(config.expressive);
  }
  public get config() {
    return this._config;
  }
  private set Icons(icons: Icons) {
    this._icons.setValue(icons);
  }
  public get Icons() {
    return this._icons.value;
  }

  public get Entities() {
    return this.config.entities;
  }
  public get MediaBrowser() {
    return this.config.media_browser;
  }
  public get PlayerQueue() {
    return this.config.queue;
  }
  public get MusicPlayer() {
    return this.config.player;
  }
  public get Players() {
    return this.config.players;
  }
}