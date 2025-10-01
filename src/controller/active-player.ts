import { ContextProvider } from "@lit/context";
import { ExtendedHass, ExtendedHassEntity } from "../const/common";
import {
  activeEntityConf,
  activeEntityID,
  activeMediaPlayer,
  activePlayerName,
  volumeMediaPlayer
} from "../const/context";
import { Config, EntityConfig } from "../config/config";
import { PlayerData } from "../const/music-player";
import { QueueItem } from "../const/player-queue";
export class ActivePlayerController {
  private _activeEntityConfig: ContextProvider<{ __context__: EntityConfig; }, HTMLElement>;
  private _activeEntityID!: ContextProvider<{ __context__: string; }, HTMLElement>;
  private _activeMediaPlayer: ContextProvider<{ __context__: ExtendedHassEntity; }, HTMLElement>;
  private _activePlayerName: ContextProvider<{ __context__: string; }, HTMLElement>;
  private _volumeMediaPlayer: ContextProvider<{ __context__: ExtendedHassEntity; }, HTMLElement>;
  
  private _hass: ExtendedHass;
  private _config: Config;
  private _host: HTMLElement;

  constructor(hass: ExtendedHass, config: Config, host: HTMLElement) {
    this._hass = hass;
    this._config = config;
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
  }
  public get config() {
    return this._config;
  }
  private set activeEntityConfig(conf: EntityConfig) {
    this._activeEntityConfig.setValue(conf);
    const states = this.hass.states;
    this.activePlayerName = this.activeEntityConfig.name;
    this.activeMediaPlayer = states[this.activeEntityConfig.entity_id];
    this.volumeMediaPlayer = states[this.activeEntityConfig.volume_entity_id];
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
    this._activeMediaPlayer.setValue(player);
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
    this._volumeMediaPlayer.setValue(player);
  }
  public get volumeMediaPlayer() {
    return this._volumeMediaPlayer.value;
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
      playing: player.state == 'playing',
      repeat: player.attributes.repeat ?? false,
      shuffle: player.attributes.shuffle ?? false,
      track_album: player.attributes.media_album_name,
      track_artist: player.attributes.media_artist,
      track_artwork: player.attributes.entity_picture_local ?? player.attributes.entity_picture,
      track_title: player.attributes.media_title,
      muted: vol_player.attributes.is_volume_muted,
      volume: Math.floor(vol_player.attributes.volume_level * 100),
      player_name: this.activePlayerName,
      favorite: current_item?.favorite ?? false,
    }
  }
}
