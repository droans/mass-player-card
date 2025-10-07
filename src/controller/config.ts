import { ContextProvider } from "@lit/context";
import { Config, processConfig } from "../config/config";
import {
  entitiesConfigContext,
  mediaBrowserConfigContext,
  musicPlayerConfigContext,
  playerQueueConfigContext,
  playersConfigContext
} from "../const/context";

export class MassCardConfigController {
  private _config!: Config;
  private _entitiesConfig = new ContextProvider(document.body, { context: entitiesConfigContext});
  private _mediaBrowserConfig = new ContextProvider(document.body, { context: mediaBrowserConfigContext});
  private _playerQueueConfig = new ContextProvider(document.body, { context: playerQueueConfigContext});
  private _musicPlayerConfig = new ContextProvider(document.body, { context: musicPlayerConfigContext});
  private _playersConfig = new ContextProvider(document.body, { context: playersConfigContext});
  private _host: HTMLElement;
  
  constructor(host: HTMLElement) {
    this._host = host;
  }
  public set config(config: Config) {
    const conf = processConfig(config);
    this._config = conf;
    this._entitiesConfig.value = conf.entities;
    this._playerQueueConfig.value = conf.queue;
    this._musicPlayerConfig.value = conf.player;
    this._playersConfig.value = conf.players;
  }
  public get config() {
    return this._config;
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