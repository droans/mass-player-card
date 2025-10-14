import { ContextProvider } from "@lit/context";
import { ExtendedHass, ExtendedHassEntity, Thumbnail } from "../const/common";
import {
  activeEntityConf,
  activeEntityID,
  activeMediaPlayer,
  activePlayerName,
  expressiveThemeContext,
  useExpressiveContext,
  volumeMediaPlayer
} from "../const/context";
import { Config, EntityConfig } from "../config/config";
import { PlayerData } from "../const/music-player";
import { MUSIC_ASSISTANT_APP_NAME, QueueItem } from "../const/player-queue";
import { applyTheme, themeFromImage, Theme } from "@material/material-color-utilities";
import { getThumbnail } from "../utils/thumbnails.js";
import { playerHasUpdated } from "../utils/util.js";
export class ActivePlayerController {
  private _activeEntityConfig: ContextProvider<typeof activeEntityConf>;
  private _activeEntityID: ContextProvider<typeof activeEntityID>;
  private _activeMediaPlayer: ContextProvider<typeof activeMediaPlayer>;
  private _activePlayerName: ContextProvider<typeof activePlayerName>;
  private _volumeMediaPlayer: ContextProvider<typeof volumeMediaPlayer>;
  private _expressiveTheme = new ContextProvider(document.body, { context: expressiveThemeContext});
  private _useExpressive = new ContextProvider(document.body, { context: useExpressiveContext });
  private _initialExpressiveLoad = false;
  
  private _hass!: ExtendedHass;
  private _config!: Config;
  private _host: HTMLElement;

  constructor(hass: ExtendedHass, config: Config, host: HTMLElement) {
    this._hass = hass;
    this.config = config;
    this._host = host;
    this._activeEntityConfig = new ContextProvider(host, {context: activeEntityConf})
    this._activeEntityID = new ContextProvider(host, {context: activeEntityID})
    this._activeMediaPlayer = new ContextProvider(host, {context: activeMediaPlayer})
    this._activePlayerName = new ContextProvider(host, {context: activePlayerName})
    this._volumeMediaPlayer = new ContextProvider(host, {context: volumeMediaPlayer})
    this.setDefaultActivePlayer();
  }
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    this.setActivePlayer(this.activeEntityID);
  }  
  public get hass() {
    return this._hass;
  }

  public set config(config: Config) {
    this._config = config;
    this.useExpressive = config.expressive;
  }
  public get config() {
    return this._config;
  }

  public set useExpressive(expressive: boolean) {
    this._useExpressive.setValue(expressive);
  }
  public get useExpressive() {
    return this._useExpressive.value;
  }

  private set activeEntityConfig(conf: EntityConfig) {
    this._activeEntityConfig.setValue(conf);
    const states = this.hass.states;
    this.activePlayerName = this.activeEntityConfig.name;
    this.volumeMediaPlayer = states[this.activeEntityConfig.volume_entity_id];
    this.activeMediaPlayer = states[this.activeEntityConfig.entity_id];
    this.activeEntityID = this.activeEntityConfig.entity_id;

  }
  public get activeEntityConfig() {
    return this._activeEntityConfig.value;
  }

  public set activeEntityID(entity_id: string) {
    this._activeEntityID.setValue(entity_id);
  }
  public get activeEntityID() {
    return this._activeEntityID.value;
  }
  
  private set activeMediaPlayer(player: ExtendedHassEntity) {
    const old_track = this?.activeMediaPlayer?.attributes?.media_content_id;
    const new_track = player?.attributes?.media_content_id;
    if (playerHasUpdated(this.activeMediaPlayer, player)) {
      this._activeMediaPlayer.setValue(player);
      if (old_track != new_track && this.config.expressive) {
        this._initialExpressiveLoad = true;
        void this.applyExpressiveTheme();
        return;
      }
    }
    if (this.config.expressive && !this._initialExpressiveLoad) {
      void this.applyExpressiveTheme();
    }
  }
  public get activeMediaPlayer() {
    return this._activeMediaPlayer.value;
  }

  private set activePlayerName(name: string) {
    if (name.length) {
      this._activePlayerName.setValue(name);
    }
    const ent = this.hass.states[this.activeEntityConfig.entity_id];
    this._activePlayerName.setValue(ent.attributes.friendly_name ?? "");
  }
  public get activePlayerName() {
    return this._activePlayerName.value;
  }

  private set volumeMediaPlayer(player: ExtendedHassEntity) {
    if (!player) {
      return
    }
    const old_attrs = this.volumeMediaPlayer?.attributes;
    const new_attrs = player?.attributes;
    if (
      old_attrs?.volume_level != new_attrs?.volume_level
      || old_attrs?.is_volume_muted != new_attrs?.is_volume_muted
    ) {
      this._volumeMediaPlayer.setValue(player);
    }
  }
  public get volumeMediaPlayer() {
    return this._volumeMediaPlayer.value;
  }

  private set expressiveTheme(theme: Theme | undefined) {
    this._expressiveTheme.setValue(theme);
  }
  public get expressiveTheme() {
    return this._expressiveTheme.value;
  }
  
  public getGroupedPlayers() {
    const activeQueue = this.activeMediaPlayer.attributes.active_queue;
    const ents = this.config.entities;
    return ents.filter(
      (item) => {
        return activeQueue == this.hass.states[item.entity_id].attributes.active_queue;
      }
    )
  }
  private setDefaultActivePlayer() {
    const states = this.hass.states;
    const players = this._config.entities
    const active_players = players.filter(
      (entity) => ["playing", "paused"].includes(states[entity.entity_id].state) && states[entity.entity_id].attributes.app_id == 'music_assistant'
    );
    if (active_players.length) {
      this.activeEntityConfig = active_players[0];
    } else {
      this.activeEntityConfig = players[0]
    }
  }
  public setActivePlayer(entity_id: string) {
    const entities_config = this.config.entities;
    const player_config = entities_config.find(
      (item) => {
        return item.entity_id == entity_id;
      }
    )
    if (player_config) {
      this.activeEntityConfig = player_config
    }
  }

  public getactivePlayerData(current_item: QueueItem | null): PlayerData {
    const player = this.activeMediaPlayer;
    const vol_player = this.volumeMediaPlayer;    
    return {
      playing: player?.state == 'playing',
      repeat: player?.attributes?.repeat ?? false,
      shuffle: player?.attributes?.shuffle ?? false,
      track_album: player?.attributes?.media_album_name ?? '',
      track_artist: player?.attributes?.media_artist ?? '',
      track_artwork: player?.attributes?.entity_picture_local ?? player?.attributes?.entity_picture,
      track_title: player?.attributes?.media_title ?? '',
      muted: vol_player?.attributes?.is_volume_muted ?? true,
      volume: Math.floor(vol_player?.attributes?.volume_level * 100) ?? 0,
      player_name: this.activePlayerName,
      favorite: current_item?.favorite ?? false,
    }
  }
  public isActive() {
    // Returns if a player is active.
    // An active player is not off, using Music Assistant, and has a queue set.
    const player = this.activeMediaPlayer;
    const not_off = player.state != 'off';
    const is_mass = player.attributes.app_id == MUSIC_ASSISTANT_APP_NAME;
    const has_queue = !!(player.attributes?.active_queue);
    return not_off && is_mass && has_queue;
  }
  public async getPlayerProgress(): Promise<number> {
    /* eslint-disable
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access,
      @typescript-eslint/no-unsafe-return,
    */
   if (!this.isActive()) {
    return 0;
   }
    const current_queue = await this.actionGetCurrentQueue();
    const elapsed = current_queue?.elapsed_time ?? 0;
    return elapsed;
  }
  public async getPlayerActiveItemDuration(): Promise<number> {
    if (!this.isActive()) {
      return 1;
    }
    const current_queue = await this.actionGetCurrentQueue();
    return current_queue?.current_item?.duration ?? 1;
    /* eslint-enable
      @typescript-eslint/no-unsafe-assignment,
      @typescript-eslint/no-unsafe-member-access,
      @typescript-eslint/no-unsafe-return,
    */
  }
  async actionGetCurrentQueue() {
    const entity_id = this.activeEntityID;
    try {
      /* eslint-disable
        @typescript-eslint/no-explicit-any,
        @typescript-eslint/no-unsafe-assignment,
        @typescript-eslint/no-unsafe-member-access
      */
      const data = {
        type: 'call_service',
        domain: 'music_assistant',
        service: 'get_queue',
        service_data: {
          entity_id: entity_id,
        },
        return_response: true
      }
      const ret = await this.hass.callWS<any>(data);
      /* eslint-disable
        @typescript-eslint/no-unsafe-return
      */
      const result = ret.response[entity_id]
      return result;
      /* eslint-enable */
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error('Error getting queue', e);
      return null;
    }
  }

  public applyExpressiveThemeTo(host: HTMLElement) {
    if (this.expressiveTheme) {
      applyTheme(this.expressiveTheme, {dark: this.hass.themes.darkMode, target: host})
    }
  }
  public async applyExpressiveTheme() { 
    if (!this.config.expressive) {
      return;
    }
    const _theme = this.generateExpressiveTheme();
    const options = {
      dark: this.hass.themes.darkMode,
      target: this._host
    }
    const theme = await _theme;
    if (theme) {
      applyTheme(theme, options)
    }
  }
  public async generateExpressiveTheme() {

    return this.generateExpressiveThemeFromImage();
  }
  public generateImageElement(): HTMLImageElement|undefined {
    const player_data = this.getactivePlayerData(null);
    const attrs = this.activeMediaPlayer.attributes;
    const def = getThumbnail(this.hass, Thumbnail.CLEFT);
    const url = player_data.playing ? attrs.entity_picture_local ?? attrs.entity_picture ?? def : def; 
    const elem = document.createElement('img');
    elem.height = 75;
    elem.width = 75;
    elem.src = url;
    return elem;
  }
  public async generateExpressiveThemeFromImage() {
    const elem = this.generateImageElement();
    if (!elem) {
      return;
    }
    const theme = await themeFromImage(elem);
    this.expressiveTheme = theme;
    return theme;
  }

}
