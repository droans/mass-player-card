import { ContextProvider } from "@lit/context";
import {
  activeEntityConfContext,
  activeEntityIDContext,
  activeMediaPlayerContext,
  activePlayerDataContext,
  activePlayerNameContext,
  expressiveSchemeContext,
  groupedPlayersContext,
  groupVolumeContext,
  useExpressiveContext,
  useVibrantContext,
  volumeMediaPlayerContext,
} from "../const/context";
import { Config, EntityConfig } from "../config/config";
import {
  ExtendedHass,
  ExtendedHassEntity,
  getQueueResponse,
  MassGetQueueServiceDataSchema,
  MassGetQueueServiceResponseSchema,
  PlayerData,
} from "../const/types";
import { DynamicScheme } from "@ktibow/material-color-utilities-nightly";
import {
  getGroupVolumeServiceResponse,
  getGroupVolumeServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_group_volume";
import { setGroupVolumeServiceSchema } from "mass-queue-types/packages/mass_queue/actions/set_group_volume";
import { isActive, jsonMatch, playerHasUpdated } from "../utils/utility";
import {
  applyExpressiveScheme,
  generateDefaultExpressiveSchemeColor,
  generateExpressiveSchemeFromColor,
  generateExpressiveSourceColorFromImageElement,
} from "../utils/expressive";
import {
  getInfoWSResponseSchema,
  getInfoWSServiceSchema,
} from "mass-queue-types/packages/mass_queue/ws/get_info";
import WaCarousel from "@droans/webawesome/dist/components/carousel/carousel";
import { RepeatMode } from "../const/enums";

export class ActivePlayerController {
  private _activeEntityConfig: ContextProvider<typeof activeEntityConfContext>;
  private _activeEntityID: ContextProvider<typeof activeEntityIDContext>;
  private _activeMediaPlayer: ContextProvider<typeof activeMediaPlayerContext>;
  private _activePlayerName: ContextProvider<typeof activePlayerNameContext>;
  private _volumeMediaPlayer: ContextProvider<typeof volumeMediaPlayerContext>;
  private _expressiveScheme!: ContextProvider<typeof expressiveSchemeContext>;
  private _useExpressive!: ContextProvider<typeof useExpressiveContext>;
  private _useVibrant!: ContextProvider<typeof useVibrantContext>;
  private _groupMembers!: ContextProvider<typeof groupedPlayersContext>;
  private _groupVolume!: ContextProvider<typeof groupVolumeContext>;
  private _activePlayerData!: ContextProvider<typeof activePlayerDataContext>;

  private _hass!: ExtendedHass;
  private _config!: Config;
  private _host: HTMLElement;
  private _updatingScheme = false;
  private _carouselElement?: WaCarousel;
  private _observer?: MutationObserver;
  private _activeSchemeColor!: number;
  private _timeout?: number;
  private _observerDelay = 300;
  private _canGroupWith: string[] = [];

  constructor(hass: ExtendedHass, config: Config, host: HTMLElement) {
    this._expressiveScheme = new ContextProvider(host, {
      context: expressiveSchemeContext,
    });
    this._useExpressive = new ContextProvider(host, {
      context: useExpressiveContext,
    });
    this._useVibrant = new ContextProvider(host, {
      context: useVibrantContext,
    });
    this._groupMembers = new ContextProvider(host, {
      context: groupedPlayersContext,
    });
    this._groupVolume = new ContextProvider(host, {
      context: groupVolumeContext,
    });
    this._activeEntityConfig = new ContextProvider(host, {
      context: activeEntityConfContext,
    });
    this._activeEntityID = new ContextProvider(host, {
      context: activeEntityIDContext,
    });
    this._activeMediaPlayer = new ContextProvider(host, {
      context: activeMediaPlayerContext,
    });
    this._activePlayerName = new ContextProvider(host, {
      context: activePlayerNameContext,
    });
    this._volumeMediaPlayer = new ContextProvider(host, {
      context: volumeMediaPlayerContext,
    });
    this._activePlayerData = new ContextProvider(host, {
      context: activePlayerDataContext,
    });
    this._hass = hass;
    this.config = config;
    this._host = host;
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
    this.useVibrant = config.expressive_scheme == "vibrant";
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

  public set useVibrant(vibrant: boolean) {
    this._useVibrant.setValue(vibrant);
  }
  public get useVibrant() {
    return this._useVibrant.value;
  }

  private set activeEntityConfig(conf: EntityConfig) {
    this._activeEntityConfig.setValue(conf);
    const states = this.hass.states;
    this.activePlayerName = conf.name;
    this.volumeMediaPlayer = states[conf.volume_entity_id];
    this.activeMediaPlayer = states[conf.entity_id];
    this.activeEntityID = conf.entity_id;
    void this.setCanGroupWith();
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

  private set activeMediaPlayer(player: ExtendedHassEntity | undefined) {
    if (!player) {
      return;
    }
    if (playerHasUpdated(this.activeMediaPlayer, player)) {
      this._activeMediaPlayer.setValue(player);
      this.dispatchUpdatedActivePlayer();
      void this.updateActivePlayerData();
      if (player.attributes.group_members) {
        this.setGroupAttributes();
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
    if (ent) {
      this._activePlayerName.setValue(ent.attributes.friendly_name ?? "");
    }
  }
  public get activePlayerName() {
    return this._activePlayerName.value;
  }
  private set groupMembers(members: string[] | undefined) {
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

  private set volumeMediaPlayer(player: ExtendedHassEntity | undefined) {
    if (!player) {
      return;
    }
    const old_attrs = this.volumeMediaPlayer?.attributes;
    const new_attrs = player.attributes;
    if (
      old_attrs?.volume_level != new_attrs.volume_level ||
      old_attrs?.is_volume_muted != new_attrs.is_volume_muted ||
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
  public set carouselElement(elem: WaCarousel | undefined) {
    if (elem) {
      this._carouselElement = elem;
      this.createObserver();
    }
  }
  public get carouselElement() {
    return this._carouselElement;
  }

  private set canGroupWith(entity_ids: string[]) {
    this._canGroupWith = entity_ids;
  }
  public get canGroupWith() {
    return this._canGroupWith;
  }

  private createObserver() {
    if (!this.config.expressive) {
      return;
    }
    if (this._observer) {
      try {
        this._observer.disconnect();
      } catch {
        // pass
      }
    }
    if (!this.carouselElement) {
      return;
    }
    const config = {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src", "data-playing"],
    };
    const observer = new MutationObserver(this.observerCallback);
    observer.observe(this.carouselElement, config);
    if (!this.expressiveScheme) {
      this.createAndApplyExpressiveScheme();
    }
    this._observer = observer;
  }
  public getActiveArtwork(): HTMLElement | undefined {
    if (!this.carouselElement) {
      return;
    }
    return this.carouselElement.querySelector("#img-playing") as HTMLElement;
  }
  private observerCallback = () => {
    if (this._timeout) {
      try {
        clearTimeout(this._timeout);
      } catch {
        // assume already canceled
      }
    }
    this._timeout = window.setTimeout(() => {
      this._timeout = undefined;
      this.createAndApplyExpressiveScheme();
    }, this._observerDelay);
  };

  public async updateActivePlayerData() {
    if (
      !this.activeMediaPlayer ||
      !this.volumeMediaPlayer ||
      !this.activeEntityID
    ) {
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
  private setGroupAttributes() {
    this.groupMembers = this.getGroupedPlayers().map((item) => {
      return item.entity_id;
    });
    void this._getAndSetGroupedVolume();
  }
  public getGroupedPlayers() {
    if (!this.activeMediaPlayer) {
      return [];
    }
    const active_queue = this.activeMediaPlayer.attributes.active_queue;
    const ents = this.config.entities;
    return ents.filter((item) => {
      const ent = this.hass.states[item.entity_id];
      if (ent) {
        const attrs = ent.attributes;
        return (
          attrs.active_queue == active_queue &&
          attrs.mass_player_type != "group"
        );
      }
      return false;
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
      repeat: player?.attributes.repeat ?? RepeatMode.OFF,
      shuffle: player?.attributes.shuffle ?? false,
      track_album: player?.attributes.media_album_name ?? "",
      track_artist: player?.attributes.media_artist ?? "",
      track_artwork:
        player?.attributes.entity_picture_local ??
        player?.attributes.entity_picture ??
        "",
      track_title: player?.attributes.media_title ?? "",
      muted: vol_player?.attributes.is_volume_muted ?? true,
      volume: Math.floor(vol_player?.attributes.volume_level ?? 0 * 100),
      player_name: this.activePlayerName,
      favorite: current_item?.media_item?.favorite ?? false,
    };
  }
  public async getPlayerProgress(): Promise<number> {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return 0;
    }
    const current_queue = await this.actionGetCurrentQueue();
    const elapsed = current_queue.elapsed_time;
    return elapsed;
  }
  public async getPlayerActiveItemDuration(): Promise<number> {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return 1;
    }
    const current_queue = await this.actionGetCurrentQueue();
    return current_queue.current_item?.duration ?? 1;
  }
  async actionGetCurrentQueue(): Promise<getQueueResponse> {
    const entity_id = this.activeEntityID;
    const data: MassGetQueueServiceDataSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "get_queue",
      service_data: {
        entity_id,
      },
      return_response: true,
    };
    const ret = await this.hass.callWS<MassGetQueueServiceResponseSchema>(data);
    const result = ret.response[entity_id];
    return result;
  }
  public createAndApplyExpressiveScheme() {
    if (!this.config.expressive) {
      return;
    }
    void this.createExpressiveSchemeFromArtwork().then((result) => {
      if (!result) {
        return;
      }
      this.applyExpressiveScheme();
    });
  }
  public applyExpressiveScheme() {
    const scheme = this.expressiveScheme;
    if (!scheme) {
      return;
    }
    applyExpressiveScheme(scheme, this._host);
  }
  public async createExpressiveSchemeFromArtwork(): Promise<
    DynamicScheme | undefined
  > {
    if (this._updatingScheme) {
      return;
    }
    this._updatingScheme = true;
    let schemeColor: number;
    const activeArtwork = this.getActiveArtwork();
    if (!(activeArtwork?.tagName.toLowerCase() == "img")) {
      schemeColor = generateDefaultExpressiveSchemeColor();
    } else {
      schemeColor = await generateExpressiveSourceColorFromImageElement(
        activeArtwork as HTMLImageElement,
      );
    }
    if (schemeColor == this._activeSchemeColor) {
      this._updatingScheme = false;
      return;
    }
    this._activeSchemeColor = schemeColor;
    const schemeName = this.config.expressive_scheme;
    const scheme = generateExpressiveSchemeFromColor(
      schemeColor,
      schemeName,
      this.hass.themes.darkMode,
    );
    this.expressiveScheme = scheme;
    this._updatingScheme = false;
    return this.expressiveScheme;
  }
  private async _getAndSetGroupedVolume() {
    if (!this.activeMediaPlayer) {
      return;
    }
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
        volume_level,
      },
    };
    await this.hass.callWS(data);
  }
  public async setActiveGroupVolume(volume_level: number): Promise<void> {
    if (!this.activeMediaPlayer) {
      return;
    }
    await this.setGroupedVolume(this.activeMediaPlayer.entity_id, volume_level);
    this.groupVolume = volume_level;
  }
  public async getActiveGroupVolume(): Promise<number> {
    if (!this.activeMediaPlayer) {
      return 0;
    }
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
    const vol = ret.response.volume_level;
    return vol;
  }
  public async getEntityInfo(
    entity_id = this.activeEntityID,
  ): Promise<getInfoWSResponseSchema> {
    const data: getInfoWSServiceSchema = {
      type: "mass_queue/get_info",
      entity_id,
    };
    const resp = await this.hass.callWS<getInfoWSResponseSchema>(data);
    return resp;
  }
  private async getPlayerProvider(entity_id: string) {
    const resp = await this.getEntityInfo(entity_id);
    return resp.provider;
  }
  public async playerCanGroupWith(
    entity_id = this.activeEntityID,
  ): Promise<string[]> {
    const provider = await this.getPlayerProvider(entity_id);
    const ents = this.config.entities;
    const result: string[] = [];
    for (const ent of ents) {
      const _id = ent.entity_id;
      const _prov = await this.getPlayerProvider(_id);
      if (_prov == provider && _id != entity_id) {
        result.push(_id);
      }
    }
    return result;
  }
  private async setCanGroupWith() {
    if (this.activeEntityID) {
      this.canGroupWith = await this.playerCanGroupWith();
    }
  }
  public disconnected() {
    this._observer?.disconnect();
    this._observer = undefined;
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass;
    this.setActivePlayer(this.activeEntityID);
    this.createObserver();
  }
}
