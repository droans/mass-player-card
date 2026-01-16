import { ContextProvider } from "@lit/context";
import {
  Config,
  EntityConfig,
  HiddenElementsConfig,
  processConfig,
} from "../config/config";
import {
  entitiesConfigContext,
  hiddenElementsConfigContext,
  IconsContext,
  mediaBrowserConfigContext,
  mediaBrowserHiddenElementsConfigContext,
  musicPlayerConfigContext,
  musicPlayerHiddenElementsConfigContext,
  playerQueueConfigContext,
  playerQueueHiddenElementsConfigContext,
  playersConfigContext,
  playersHiddenElementsConfigContext,
} from "../const/context";
import { getIcons, Icons } from "../const/icons";
import { jsonMatch } from "../utils/utility";
import {
  DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
  PlayerHiddenElementsConfig,
} from "../config/player";
import {
  DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
  PlayerQueueHiddenElementsConfig,
} from "../config/player-queue";
import {
  DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
  MediaBrowserHiddenElementsConfig,
} from "../config/media-browser";
import {
  DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
  PlayersHiddenElementsConfig,
} from "../config/players";
import { getHiddenElements } from "../utils/config";

export class MassCardConfigController {
  private _config?: Config;
  private _activeEntityConfig?: EntityConfig;
  private _entitiesConfig: ContextProvider<typeof entitiesConfigContext>;
  private _mediaBrowserConfig: ContextProvider<
    typeof mediaBrowserConfigContext
  >;
  private _playerQueueConfig: ContextProvider<typeof playerQueueConfigContext>;
  private _musicPlayerConfig: ContextProvider<typeof musicPlayerConfigContext>;
  private _playersConfig: ContextProvider<typeof playersConfigContext>;
  private _icons: ContextProvider<typeof IconsContext>;

  private _musicPlayerHiddenElementsConfig: ContextProvider<
    typeof musicPlayerHiddenElementsConfigContext
  >;
  private _playerQueueHiddenElementsConfig: ContextProvider<
    typeof playerQueueHiddenElementsConfigContext
  >;
  private _mediaBrowserHiddenElementsConfig: ContextProvider<
    typeof mediaBrowserHiddenElementsConfigContext
  >;
  private _playersHiddenElementsConfig: ContextProvider<
    typeof playersHiddenElementsConfigContext
  >;
  private _hiddenElementsConfig: ContextProvider<
    typeof hiddenElementsConfigContext
  >;
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

    this._musicPlayerHiddenElementsConfig = new ContextProvider(host, {
      context: musicPlayerHiddenElementsConfigContext,
    });
    this._playerQueueHiddenElementsConfig = new ContextProvider(host, {
      context: playerQueueHiddenElementsConfigContext,
    });
    this._mediaBrowserHiddenElementsConfig = new ContextProvider(host, {
      context: mediaBrowserHiddenElementsConfigContext,
    });
    this._playersHiddenElementsConfig = new ContextProvider(host, {
      context: playersHiddenElementsConfigContext,
    });
    this._hiddenElementsConfig = new ContextProvider(host, {
      context: hiddenElementsConfigContext,
    });
  }
  private _getHiddenElements = getHiddenElements;
  private _defaultPlayerHide = DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG;
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
    this.updateHiddenElements();
  }
  public get config() {
    return this._config as Config;
  }

  public set activeEntityConfig(config: EntityConfig) {
    this._activeEntityConfig = config;
    this.updateHiddenElements();
  }
  public get activeEntityConfig() {
    return this._activeEntityConfig as EntityConfig;
  }

  private set MusicPlayerHiddenElements(elements: PlayerHiddenElementsConfig) {
    this._musicPlayerHiddenElementsConfig.setValue(elements);
  }
  public get MusicPlayerHiddenElements() {
    return this._musicPlayerHiddenElementsConfig.value;
  }

  private set PlayerQueueHiddenElements(
    elements: PlayerQueueHiddenElementsConfig,
  ) {
    this._playerQueueHiddenElementsConfig.setValue(elements);
  }
  public get PlayerQueueHiddenElements() {
    return this._playerQueueHiddenElementsConfig.value;
  }
  private set MediaBrowserHiddenElements(
    elements: MediaBrowserHiddenElementsConfig,
  ) {
    this._mediaBrowserHiddenElementsConfig.setValue(elements);
  }
  public get MediaBrowserHiddenElements() {
    return this._mediaBrowserHiddenElementsConfig.value;
  }
  private set PlayersHiddenElements(elements: PlayersHiddenElementsConfig) {
    this._playersHiddenElementsConfig.setValue(elements);
  }
  public get PlayersHiddenElements() {
    return this._playersHiddenElementsConfig.value;
  }
  private set HiddenElements(elements: HiddenElementsConfig) {
    this._hiddenElementsConfig.setValue(elements);
  }
  public get HiddenElements() {
    return this._hiddenElementsConfig.value;
  }

  private updateHiddenElements() {
    /* eslint-disable @typescript-eslint/no-unnecessary-condition */
    if (!this.config && !this.activeEntityConfig) {
      return;
    }
    const ent_ = this.activeEntityConfig?.hide;
    const c = this.config;
    const config: HiddenElementsConfig = {
      player: c?.player.hide ?? ent_?.player,
      queue: c?.queue.hide ?? ent_?.queue,
      media_browser: c?.media_browser.hide ?? ent_?.media_browser,
      players: c?.players.hide ?? ent_?.players,
    };

    // const config = this.config ?? this.activeEntityConfig?.hide;
    const ent = this.activeEntityConfig?.hide ?? config;
    /* eslint-enable @typescript-eslint/no-unnecessary-condition */

    this.MusicPlayerHiddenElements = getHiddenElements(
      DEFAULT_PLAYER_HIDDEN_ELEMENTS_CONFIG,
      config.player,
      ent.player,
    ) as PlayerHiddenElementsConfig;

    this.PlayerQueueHiddenElements = getHiddenElements(
      DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG,
      config.queue,
      ent.queue,
    ) as PlayerQueueHiddenElementsConfig;

    this.MediaBrowserHiddenElements = getHiddenElements(
      DEFAULT_MEDIA_BROWSER_HIDDEN_ELEMENTS_CONFIG,
      config.media_browser,
      ent.media_browser,
    ) as MediaBrowserHiddenElementsConfig;

    this.PlayersHiddenElements = getHiddenElements(
      DEFAULT_PLAYERS_HIDDEN_ELEMENTS_CONFIG,
      config.players,
      ent.players,
    ) as PlayersHiddenElementsConfig;
    this.HiddenElements = {
      player: this.MusicPlayerHiddenElements,
      queue: this.PlayerQueueHiddenElements,
      media_browser: this.MediaBrowserHiddenElements,
      players: this.PlayersHiddenElements,
    };
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
