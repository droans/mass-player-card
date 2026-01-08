import { ContextProvider } from "@lit/context";
import { Config, processConfig } from "../config/config";
import {
  entitiesConfigContext,
  IconsContext,
  mediaBrowserConfigContext,
  musicPlayerConfigContext,
  playerQueueConfigContext,
  playersConfigContext,
} from "../const/context";
import { getIcons, Icons } from "../const/icons";
import { jsonMatch } from "../utils/utility";

export class MassCardConfigController {
  private _config!: Config;
  private _entitiesConfig!: ContextProvider<typeof entitiesConfigContext>;
  private _mediaBrowserConfig!: ContextProvider<
    typeof mediaBrowserConfigContext
  >;
  private _playerQueueConfig!: ContextProvider<typeof playerQueueConfigContext>;
  private _musicPlayerConfig!: ContextProvider<typeof musicPlayerConfigContext>;
  private _playersConfig!: ContextProvider<typeof playersConfigContext>;
  private _icons!: ContextProvider<typeof IconsContext>;
  private _host: HTMLElement;

  constructor(host: HTMLElement) {
    this._host = host;
    this._entitiesConfig = new ContextProvider(host, {
      context: entitiesConfigContext,
    });
    this._mediaBrowserConfig = new ContextProvider(host, {
      context: mediaBrowserConfigContext,
    });
    this._playerQueueConfig = new ContextProvider(host, {
      context: playerQueueConfigContext,
    });
    this._musicPlayerConfig = new ContextProvider(host, {
      context: musicPlayerConfigContext,
    });
    this._playersConfig = new ContextProvider(host, {
      context: playersConfigContext,
    });
    this._icons = new ContextProvider(host, { context: IconsContext });
  }
  public set config(config: Config) {
    if (jsonMatch(this._config, config)) {
      return;
    }
    const config_ = processConfig(config);
    this._config = config_;
    this._entitiesConfig.value = config_.entities;
    this._playerQueueConfig.value = config_.queue;
    this._musicPlayerConfig.value = config_.player;
    this._playersConfig.value = config_.players;
    this._mediaBrowserConfig.value = config_.media_browser;
    this.Icons = getIcons(config_.expressive);
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
