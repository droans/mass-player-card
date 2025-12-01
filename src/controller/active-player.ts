import { ContextProvider } from "@lit/context";
import { ExtendedHass, ExtendedHassEntity } from "../const/common";
import {
  activeEntityConf,
  activeEntityID,
  activeMediaPlayer,
  activePlayerDataContext,
  activePlayerName,
  expressiveSchemeContext,
  groupedPlayersContext,
  groupVolumeContext,
  useExpressiveContext,
  volumeMediaPlayer,
} from "../const/context";
import { Config, EntityConfig } from "../config/config";
import { MassGetQueueServiceDataSchema, MassGetQueueServiceResponseSchema, PlayerData } from "../const/music-player";
import { DynamicScheme } from "@material/material-color-utilities";
import { getGroupVolumeServiceResponse, getGroupVolumeServiceSchema } from "mass-queue-types/packages/mass_queue/actions/get_group_volume";
import { setGroupVolumeServiceSchema } from "mass-queue-types/packages/mass_queue/actions/set_group_volume";
import { isActive, jsonMatch, playerHasUpdated } from "../utils/util.js";
import { applyDefaultExpressiveScheme, applyExpressiveSchemeFromImage } from "../utils/expressive.js";
import { ArtworkUpdatedEventData } from "../const/events.js";

export class ActivePlayerController {
  private _activeEntityConfig: ContextProvider<typeof activeEntityConf>;
  private _activeEntityID: ContextProvider<typeof activeEntityID>;
  private _activeMediaPlayer: ContextProvider<typeof activeMediaPlayer>;
  private _activePlayerName: ContextProvider<typeof activePlayerName>;
  private _volumeMediaPlayer: ContextProvider<typeof volumeMediaPlayer>;
  private _expressiveScheme!: ContextProvider<typeof expressiveSchemeContext>;
  private _useExpressive!: ContextProvider<typeof useExpressiveContext>;
  private _groupMembers!: ContextProvider<typeof groupedPlayersContext>;
  private _groupVolume!: ContextProvider<typeof groupVolumeContext>;
  private _activePlayerData!: ContextProvider<typeof activePlayerDataContext>;

  private _hass!: ExtendedHass;
  private _config!: Config;
  private _host: HTMLElement;
  private _updatingScheme = false;

  constructor(hass: ExtendedHass, config: Config, host: HTMLElement) {
    this._expressiveScheme = new ContextProvider(host, {
      context: expressiveSchemeContext,
    });
    this._useExpressive = new ContextProvider(host, {
      context: useExpressiveContext,
    });
    this._groupMembers = new ContextProvider(host, {
      context: groupedPlayersContext,
    });
    this._groupVolume = new ContextProvider(host, {
      context: groupVolumeContext,
    });
    this._activeEntityConfig = new ContextProvider(host, {
      context: activeEntityConf,
    });
    this._activeEntityID = new ContextProvider(host, {
      context: activeEntityID,
    });
    this._activeMediaPlayer = new ContextProvider(host, {
      context: activeMediaPlayer,
    });
    this._activePlayerName = new ContextProvider(host, {
      context: activePlayerName,
    });
    this._volumeMediaPlayer = new ContextProvider(host, {
      context: volumeMediaPlayer,
    });
    this._activePlayerData = new ContextProvider(host, {
      context: activePlayerDataContext,
    });
    this._hass = hass;
    this.config = config;
    this._host = host;
    host.addEventListener("artwork-updated", this.onActiveTrackChange);
    this.setDefaultActivePlayer();
  }
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    const cur_entity = this.activeMediaPlayer;
    const new_entity = hass.states[this.activeEntityID];
    if (playerHasUpdated(cur_entity, new_entity)) {
      this.setActivePlayer(this.activeEntityID);
    }
    void this.updateActivePlayerData();
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
    this.activePlayerName = conf.name;
    this.volumeMediaPlayer = states[conf.volume_entity_id];
    this.activeMediaPlayer = states[conf.entity_id];
    this.activeEntityID = conf.entity_id;
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
    if (playerHasUpdated(this.activeMediaPlayer, player)) {
      this._activeMediaPlayer.setValue(player);
      this.dispatchUpdatedActivePlayer();
      void this.updateActivePlayerData();
      if (player.attributes?.group_members) {
        this.setGroupAttributes();
      }
      if (
        isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig) 
        && (
          !this.expressiveScheme
        || player.attributes.media_content_id != this.activeMediaPlayer.attributes.media_content_id
        )
      ) {
        const img =
          player.attributes.entity_picture_local ??
          player.attributes.entity_picture;
        void this.applyExpressiveSchemeFromImage(img);
      }
    }
  }
  public get activeMediaPlayer() {
    return this._activeMediaPlayer.value;
  }

  private set activePlayerName(name: string) {
    if (name.length) {
      this._activePlayerName.setValue(name);
      return;
    }
    const ent = this.hass.states[this.activeEntityConfig.entity_id];
    this._activePlayerName.setValue(ent.attributes.friendly_name ?? "");
  }
  public get activePlayerName() {
    return this._activePlayerName.value;
  }
  private set groupMembers(members: string[]) {
    if (jsonMatch(this._groupMembers.value, members) || !members) {
      return;
    }
    this._groupMembers.setValue(members);
  }
  public get groupMembers() {
    return this._groupMembers.value;
  }
  private set groupVolume(volume: number) {
    if (this._groupVolume.value == volume) {
      return;
    }
    this._groupVolume.setValue(volume);
  }
  public get groupVolume() {
    return this._groupVolume.value;
  }

  private set volumeMediaPlayer(player: ExtendedHassEntity) {
    if (!player) {
      return;
    }
    const old_attrs = this.volumeMediaPlayer?.attributes;
    const new_attrs = player?.attributes;
    if (
      old_attrs?.volume_level != new_attrs?.volume_level ||
      old_attrs?.is_volume_muted != new_attrs?.is_volume_muted || 
      !old_attrs
    ) {
      this._volumeMediaPlayer.setValue(player);
    }
  }
  public get volumeMediaPlayer() {
    return this._volumeMediaPlayer.value;
  }

  private set expressiveScheme(scheme: DynamicScheme | undefined) {
    if (scheme) {
      this._expressiveScheme.setValue(scheme);
    }
  }
  public get expressiveScheme() {
    return this._expressiveScheme.value;
  }

  private set activePlayerData(data: PlayerData) {
    this._activePlayerData.setValue(data);
  }
  public get activePlayerData() {
    return this._activePlayerData.value;
  }

  public async updateActivePlayerData() {
    if (!this.activeMediaPlayer || !this.volumeMediaPlayer || !this.activeEntityID) {
      return;
    }
    const data = await this.getactivePlayerData();
    const new_data = JSON.stringify(data);
    const cur_data = JSON.stringify(this.activePlayerData);
    if (new_data != cur_data) {
      this.activePlayerData = data;
    }
  }

  private dispatchUpdatedActivePlayer() {
    const ev = new CustomEvent("active-player-updated", {
      detail: this.activeMediaPlayer,
    });
    this._host.dispatchEvent(ev);
  }
  public firstUpdateComplete() {
    if (
      !isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig) ||
      !this.expressiveScheme
    ) {
      this.applyDefaultExpressiveScheme();
    }
  }
  private setGroupAttributes() {
    this.groupMembers = this.getGroupedPlayers().map((item) => {
      return item.entity_id;
    });
    void this._getAndSetGroupedVolume();
  }
  public getGroupedPlayers() {
    const active_queue = this.activeMediaPlayer.attributes.active_queue;
    const ents = this.config.entities;
    return ents.filter((item) => {
      const attrs = this.hass.states[item.entity_id]?.attributes;
      return (
        attrs?.active_queue == active_queue && attrs.mass_player_type != "group"
      );
    });
  }
  private setDefaultActivePlayer() {
    const states = this.hass.states;
    const players = this._config.entities;
    const active_players = players.filter((entity) => {
      const ent = states[entity.entity_id];
      return isActive(this.hass, ent, entity);
    });
    if (active_players.length) {
      this.activeEntityConfig = active_players[0];
    } else {
      this.activeEntityConfig = players[0];
    }
  }
  public setActivePlayer(entity_id: string) {
    const entities_config = this.config.entities;
    const player_config = entities_config.find((item) => {
      return item.entity_id == entity_id;
    });
    if (player_config) {
      this.activeEntityConfig = player_config;
    }
  }

  public async getactivePlayerData(): Promise<PlayerData> {
    const player = this.activeMediaPlayer;
    const vol_player = this.volumeMediaPlayer;
    const current_queue = await this.actionGetCurrentQueue();
    const current_item = current_queue.current_item;

    return {
      playing: player?.state == "playing",
      repeat: player?.attributes?.repeat ?? false,
      shuffle: player?.attributes?.shuffle ?? false,
      track_album: player?.attributes?.media_album_name ?? "",
      track_artist: player?.attributes?.media_artist ?? "",
      track_artwork:
        player?.attributes?.entity_picture_local ??
        player?.attributes?.entity_picture,
      track_title: player?.attributes?.media_title ?? "",
      muted: vol_player?.attributes?.is_volume_muted ?? true,
      volume: Math.floor(vol_player?.attributes?.volume_level * 100) ?? 0,
      player_name: this.activePlayerName,
      favorite: current_item?.media_item?.favorite ?? false,
    };
  }
  public async getPlayerProgress(): Promise<number> {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return 0;
    }
    const current_queue = await this.actionGetCurrentQueue();
    const elapsed = current_queue?.elapsed_time ?? 0;
    return elapsed;
  }
  public async getPlayerActiveItemDuration(): Promise<number> {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return 1;
    }
    const current_queue = await this.actionGetCurrentQueue();
    return current_queue?.current_item?.duration ?? 1;
  }
  async actionGetCurrentQueue() {
    const entity_id = this.activeEntityID;
    const data: MassGetQueueServiceDataSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "get_queue",
      service_data: {
        entity_id: entity_id,
      },
      return_response: true,
    };
    const ret = await this.hass.callWS<MassGetQueueServiceResponseSchema>(data);
    const result = ret.response[entity_id];
    return result;
  }
  public onActiveTrackChange = (ev: Event) => {
    const detail = (ev as ArtworkUpdatedEventData).detail;
    if (detail.type != "current") {
      return;
    }
    const img = detail.image;
    if (!img || !(this.activeMediaPlayer.state == 'playing') ) {
      return;
    }
    void this.applyExpressiveSchemeFromImage(img);
  };
  public applyDefaultExpressiveScheme() {
    if (!this.config.expressive || this._updatingScheme) {
      return;
    }
    this._host.getRootNode()
    this.expressiveScheme = applyDefaultExpressiveScheme(this.hass, this.config.expressive_scheme, this._host);
  }
  public async applyExpressiveSchemeFromImage(img: string) {
    if (!this.config.expressive || this._updatingScheme) {
      return;
    }
    this._updatingScheme = true;
    this.expressiveScheme = await applyExpressiveSchemeFromImage(
      img,
      this.hass,
      this.config.expressive_scheme,
      this._host,
    );
    this._updatingScheme = false;
  }
  private async _getAndSetGroupedVolume() {
    const entity = this.activeMediaPlayer.entity_id;
    const vol = await this.getGroupedVolume(entity);
    this.groupVolume = vol;
  }
  public async setGroupedVolume(
    entity_id: string,
    volume_level: number,
  ): Promise<void> {
    const data: setGroupVolumeServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "set_group_volume",
      service_data: {
        entity: entity_id,
        volume_level: volume_level,
      },
    };
    await this.hass.callWS(data);
  }
  public async setActiveGroupVolume(volume_level: number): Promise<void> {
    await this.setGroupedVolume(this.activeMediaPlayer.entity_id, volume_level);
    this.groupVolume = volume_level;
  }
  public async getActiveGroupVolume(): Promise<number> {
    return await this.getGroupedVolume(this.activeMediaPlayer.entity_id);
  }
  public async getGroupedVolume(entity_id: string): Promise<number> {
    const data: getGroupVolumeServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_group_volume",
      service_data: {
        entity: entity_id,
      },
      return_response: true,
    };
    const ret = await this.hass.callWS<getGroupVolumeServiceResponse>(data);
    const vol = ret.response.volume_level ?? 0;
    return vol;
  }
  public disconnected() {
    this._host.removeEventListener("artwork-updated", this.onActiveTrackChange);
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass;
    this._host.addEventListener("artwork-updated", this.onActiveTrackChange);
    this.setActivePlayer(this.activeEntityID);
  }
}
