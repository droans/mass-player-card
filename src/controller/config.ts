import { ContextProvider } from "@lit/context";
import { Config, processConfig } from "../config/config";
import {
  configContext,
  entitiesConfigContext,
  mediaBrowserConfigContext,
  musicPlayerConfigContext,
  playerQueueConfigContext,
  playersConfigContext
} from "../const/context";

export class MassCardConfigController {
  private _config = new ContextProvider(document.body, { context: configContext});
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
    this._config.value = conf;
    this._entitiesConfig.value = conf.entities;
    this._playerQueueConfig.value = conf.queue;
    this._musicPlayerConfig.value = conf.player;
    this._playersConfig.value = conf.players;
  }
  public get config() {
    return this._config.value;
  }

  public get Entities() {
    return this._config.value.entities;
  }
  public get MediaBrowser() {
    return this._config.value.media_browser;
  }
  public get PlayerQueue() {
    return this._config.value.queue;
  }
  public get MusicPlayer() {
    return this._config.value.player;
  }
  public get Players() {
    return this._config.value.players;
  }
}