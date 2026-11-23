import WaCarousel from "@droans/webawesome/dist/components/carousel/carousel.js";
import { DynamicScheme } from "@ktibow/material-color-utilities-nightly";
import { ContextProvider } from "@lit/context";
import {
  getGroupVolumeServiceResponse,
  getGroupVolumeServiceSchema,
} from "mass-queue-types/packages/mass_queue/actions/get_group_volume";
import { setGroupVolumeServiceSchema } from "mass-queue-types/packages/mass_queue/actions/set_group_volume";
import {
  getInfoWSResponseSchema,
  getInfoWSServiceSchema,
} from "mass-queue-types/packages/mass_queue/ws/get_info";
import BrowserActions from "../actions/browser-actions";
import { Config, EntityConfig } from "../config/config";
import {
  getQueueInfoWSServiceResponseSchema,
  getQueueInfoWSServiceSchema,
  setAutoplayServiceSchema,
  setCrossfadeServiceSchema,
} from "../const/actions";
import {
  activeEntityConfigContext,
  activeEntityIDContext,
  activeMediaPlayerContext,
  activePlayerDataContext,
  activePlayerNameContext,
  activeQueueInfoContext,
  canGroupWithContext,
  expressiveSchemeContext,
  groupedPlayersContext,
  groupVolumeContext,
  useVibrantContext,
  volumeMediaPlayerContext,
} from "../const/context";
import { RepeatMode } from "../const/enums";
import {
  EntityName,
  ExtendedHass,
  ExtendedHassEntity,
  getQueueResponse,
  MassGetQueueServiceDataSchema,
  MassGetQueueServiceResponseSchema,
  mediaCardAlbumData,
  mediaCardArtistData,
  MediaItemImage,
  PlayerData,
} from "../const/types";
import { computeEntityName } from "../utils/entity-name";
import {
  applyExpressiveScheme,
  generateDefaultExpressiveSchemeColor,
  generateExpressiveSchemeFromColor,
  getOrGenerateExpressiveScheme,
} from "../utils/expressive";
import {
  isActive,
  jsonMatch,
  playerHasUpdated,
  playerIsAvailable,
} from "../utils/utility";
import { MassCardConfigController } from "./config";

export class ActivePlayerController {
  private _activeEntityConfig: ContextProvider<
    typeof activeEntityConfigContext
  >;
  private _activeEntityID: ContextProvider<typeof activeEntityIDContext>;
  private _activeMediaPlayer: ContextProvider<typeof activeMediaPlayerContext>;
  private _activePlayerName: ContextProvider<typeof activePlayerNameContext>;
  private _volumeMediaPlayer: ContextProvider<typeof volumeMediaPlayerContext>;
  private _expressiveScheme!: ContextProvider<typeof expressiveSchemeContext>;
  private _useVibrant!: ContextProvider<typeof useVibrantContext>;
  private _groupMembers!: ContextProvider<typeof groupedPlayersContext>;
  private _groupVolume!: ContextProvider<typeof groupVolumeContext>;
  private _activePlayerData!: ContextProvider<typeof activePlayerDataContext>;
  private _queueInfo: ContextProvider<typeof activeQueueInfoContext>;
  private _playerData?: getQueueResponse;
  private _maxPlayerDataUpdateTimestampDelta = 5000;
  private _playerDataUpdateInterval?: number;
  private _browserActions!: BrowserActions;
  public albumCollectionData?: mediaCardAlbumData;
  public artistCollectionData?: mediaCardArtistData;

  private _hass!: ExtendedHass;
  private _config!: Config;
  private configController!: MassCardConfigController;
  private _host: HTMLElement;
  private _updatingScheme = false;
  private _carouselElement?: WaCarousel;
  private _observer?: MutationObserver;
  private _activeSchemeColor!: number;
  private _timeout?: number;
  private _observerDelay = 300;
  private _canGroupWith: ContextProvider<typeof canGroupWithContext>;
  // private _canGroupWith: string[] = [];
  private volumeEntityId!: string;

  constructor(
    hass: ExtendedHass,
    configController: MassCardConfigController,
    host: HTMLElement,
  ) {
    this._expressiveScheme = new ContextProvider(host, {
      context: expressiveSchemeContext,
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
      context: activeEntityConfigContext,
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
    this._canGroupWith = new ContextProvider(host, {
      context: canGroupWithContext,
      initialValue: [],
    });
    this._queueInfo = new ContextProvider(host, {
      context: activeQueueInfoContext,
    });
    this._hass = hass;
    this._browserActions = new BrowserActions(hass);
    this.config = configController.config;
    this.configController = configController;
    this._host = host;
    this.setDefaultActivePlayer();
    this._playerDataUpdateInterval = setInterval(() => {
      void this.actionGetCurrentQueue();
    }, this._maxPlayerDataUpdateTimestampDelta);
  }
  public set hass(hass: ExtendedHass) {
    this._hass = hass;
    const currentEntity = this.activeMediaPlayer;
    const newEntity = hass.states[this.activeEntityID];
    const currentVolEntity = this.volumeMediaPlayer;
    const newVolEntity = hass.states[this.volumeEntityId];
    const playerUpdated = playerHasUpdated(currentEntity, newEntity, true);
    const volumePlayerUpdated = playerHasUpdated(
      currentVolEntity,
      newVolEntity,
      true,
    );
    if (playerUpdated) {
      const mediaChanged =
        newEntity?.attributes.media_title !=
          this.activePlayerData?.track_title ||
        newEntity?.attributes.media_artist !=
          this.activePlayerData?.track_artist;
      this.activeMediaPlayer = newEntity;
      this.setActivePlayer(this.activeEntityID);
      void this.updateActivePlayerData(mediaChanged);
    }
    if (volumePlayerUpdated) {
      this.volumeMediaPlayer = newVolEntity;
    }
    const volumeChanged =
      currentVolEntity?.attributes.volume_level !=
      newVolEntity?.attributes.volume_level;
    if (volumeChanged) {
      this.selectivelyUpdateActivePlayerData({
        updatedVolumePlayer: newVolEntity,
      });
    }
  }
  public get hass() {
    return this._hass;
  }

  public set config(config: Config) {
    this._config = config;
    this.useVibrant = config.expressive_scheme == "vibrant";
  }
  public get config() {
    return this._config;
  }

  public set useVibrant(vibrant: boolean) {
    this._useVibrant.setValue(vibrant);
  }
  public get useVibrant() {
    return this._useVibrant.value;
  }

  public set queueInfo(queueInfo: getQueueInfoWSServiceResponseSchema) {
    this._queueInfo.setValue(queueInfo);
  }
  public get queueInfo() {
    return this._queueInfo.value;
  }

  private set activeEntityConfig(config: EntityConfig) {
    this._activeEntityConfig.setValue(config);
    const states = this.hass.states;
    this.activePlayerName = config.name;
    this.volumeMediaPlayer = states[config.volume_entity_id];
    this.activeMediaPlayer = states[config.entity_id];
    this.activeEntityID = config.entity_id;
    this.volumeEntityId = config.volume_entity_id;
    this.configController.activeEntityConfig = config;
    void this.setCanGroupWith();
  }
  public get activeEntityConfig() {
    return this._activeEntityConfig.value;
  }

  public set activeEntityID(entityId: string) {
    this._activeEntityID.setValue(entityId);
    void this.setQueueInfo();
  }
  public get activeEntityID() {
    return this._activeEntityID.value;
  }

  private set activeMediaPlayer(player: ExtendedHassEntity | undefined) {
    if (!player) {
      return;
    }
    if (playerHasUpdated(this.activeMediaPlayer, player, true)) {
      this._activeMediaPlayer.setValue(player);
      this.dispatchUpdatedActivePlayer();
      this.selectivelyUpdateActivePlayerData({ updatedPlayer: player });
      this.setGroupAttributes();
    }
  }
  public get activeMediaPlayer() {
    return this._activeMediaPlayer.value;
  }

  private set activePlayerName(name: EntityName) {
    if (typeof name === "string" && name.length > 0) {
      this._activePlayerName.setValue(name);
      return;
    }
    const ent = this.hass.states[this.activeEntityConfig.entity_id];
    if (ent) {
      this._activePlayerName.setValue(computeEntityName(this.hass, ent, name));
    }
  }
  public get activePlayerName(): string {
    return this._activePlayerName.value;
  }
  private set groupMembers(members: string[] | undefined) {
    if (jsonMatch(this._groupMembers.value, members) || !members) {
      return;
    }
    if (members.length == 1 && members[0] == this.activeEntityID) {
      this._groupMembers.setValue([]);
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
    const oldAttributes = this.volumeMediaPlayer?.attributes;
    const newAttributes = player.attributes;
    if (
      oldAttributes?.volume_level != newAttributes.volume_level ||
      oldAttributes?.is_volume_muted != newAttributes.is_volume_muted ||
      !oldAttributes
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

  private set activePlayerData(data: PlayerData | undefined) {
    if (!data) {
      return;
    }
    this._activePlayerData.setValue(data);
    void this.setActiveArtistAndAlbum();
  }
  public get activePlayerData() {
    return this._activePlayerData.value;
  }
  public set carouselElement(element: WaCarousel | undefined) {
    if (element) {
      this._carouselElement = element;
      this.createObserver();
    }
  }
  public get carouselElement() {
    return this._carouselElement;
  }

  private set canGroupWith(entityIds: string[]) {
    this._canGroupWith.setValue(entityIds);
  }
  public get canGroupWith() {
    return this._canGroupWith.value;
  }

  public get queueLength() {
    return this._playerData?.items ?? 0;
  }

  public get currentIndex() {
    return this._playerData?.current_index ?? 0;
  }

  private createObserver() {
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

  public selectivelyUpdateActivePlayerData(data: {
    updatedPlayer?: ExtendedHassEntity;
    updatedVolumePlayer?: ExtendedHassEntity;
  }) {
    let anyChanges = false;
    const updatedPlayer = data.updatedPlayer;
    const updatedVolumePlayer = data.updatedVolumePlayer;
    if (!this.activePlayerData) {
      void this.updateActivePlayerData(true);
      return;
    }

    if (updatedVolumePlayer) {
      const updatedVolume = Math.floor(
        (updatedVolumePlayer.attributes.volume_level ?? 0) * 100,
      );
      const updatedMute = updatedVolumePlayer.attributes.is_volume_muted;
      if (this.activePlayerData.volume != updatedVolume) {
        anyChanges = true;
        this.activePlayerData.volume = updatedVolume;
      }
      if (updatedMute && this.activePlayerData.muted != updatedMute) {
        anyChanges = true;
        this.activePlayerData.muted = updatedMute;
      }
    }

    if (updatedPlayer) {
      const newAttributes = updatedPlayer.attributes;

      const playing = updatedPlayer.state == "playing";
      if (this.activePlayerData.playing != playing) {
        anyChanges = true;
        this.activePlayerData.playing = playing;
      }
      if (this.activePlayerData.repeat != newAttributes.repeat) {
        anyChanges = true;
        this.activePlayerData.repeat = newAttributes.repeat ?? RepeatMode.OFF;
      }
      if (this.activePlayerData.shuffle != newAttributes.shuffle) {
        anyChanges = true;
        this.activePlayerData.shuffle = newAttributes.shuffle ?? false;
      }

      if (
        newAttributes.media_album_name &&
        this.activePlayerData.track_album != newAttributes.media_album_name
      ) {
        anyChanges = true;
        this.activePlayerData.track_album = newAttributes.media_album_name;
      }
      if (
        newAttributes.media_artist &&
        this.activePlayerData.track_artist != newAttributes.media_artist
      ) {
        anyChanges = true;
        this.activePlayerData.track_artist = newAttributes.media_artist;
      }

      const newArtwork =
        newAttributes.entity_picture_local ?? newAttributes.entity_picture;
      if (newArtwork && newArtwork != this.activePlayerData.track_artwork) {
        anyChanges = true;
        this.activePlayerData.track_artwork = newArtwork;
      }

      if (
        newAttributes.media_title &&
        this.activePlayerData.track_title != newAttributes.media_title
      ) {
        anyChanges = true;
        this.activePlayerData.track_title = newAttributes.media_title;
      }

      if (this.activePlayerData.player_name != this.activePlayerName) {
        anyChanges = true;
        this.activePlayerData.player_name = this.activePlayerName;
      }
    }
    if (anyChanges) {
      this._activePlayerData.setValue(this.activePlayerData);
    }
  }

  public async updateActivePlayerData(forceUpdate = false) {
    const badStates = ["unavailable", "unknown"];
    if (
      !this.activeMediaPlayer ||
      badStates.includes(this.activeMediaPlayer.state) ||
      !this.volumeMediaPlayer ||
      badStates.includes(this.volumeMediaPlayer.state) ||
      !this.activeEntityID
    ) {
      return;
    }
    if (!playerIsAvailable(this.hass, this.activeEntityID)) {
      return;
    }
    const data = await this.getactivePlayerData(forceUpdate);
    const newData = JSON.stringify(data);
    const currentData = JSON.stringify(this.activePlayerData);
    if (newData != currentData) {
      this.activePlayerData = data;
    }
  }

  private dispatchUpdatedActivePlayer() {
    const event_ = new CustomEvent("active-player-updated", {
      detail: this.activeMediaPlayer,
    });
    this._host.dispatchEvent(event_);
  }
  public setGroupAttributes() {
    this.groupMembers = this.getGroupedPlayers().map((item) => {
      return item.entity_id;
    });
    void this._getAndSetGroupedVolume();
  }
  public getGroupedPlayers() {
    if (!this.activeMediaPlayer) {
      return [];
    }
    const activeQueue = this.activeMediaPlayer.attributes.active_queue;
    const ents = this.config.entities;
    return ents.filter((item) => {
      const ent = this.hass.states[item.entity_id];
      if (ent) {
        const attributes = ent.attributes;
        return (
          attributes.active_queue == activeQueue &&
          attributes.mass_player_type != "group"
        );
      }
      return false;
    });
  }
  private setDefaultActivePlayer() {
    const states = this.hass.states;
    const players = this._config.entities;
    const firstActivePlayer = players.find((entity) => {
      const ent = states[entity.entity_id];
      return isActive(this.hass, ent, entity);
    });
    const firstAvailablePlayer = players.find((entity) => {
      return playerIsAvailable(this.hass, entity.entity_id);
    });
    if (firstActivePlayer) {
      this.activeEntityConfig = firstActivePlayer;
      return;
    }
    if (firstAvailablePlayer) {
      this.activeEntityConfig = firstAvailablePlayer;
      return;
    }
    this.activeEntityConfig = players[0];
  }
  public setActivePlayer(entityId: string) {
    const entitiesConfig = this.config.entities;
    const playerConfig = entitiesConfig.find((item) => {
      return item.entity_id == entityId;
    });
    if (playerConfig && this.activeEntityConfig != playerConfig) {
      this.activeEntityConfig = playerConfig;
    }
  }

  public async getactivePlayerData(forceUpdate = false): Promise<PlayerData> {
    const player = this.activeMediaPlayer;
    const volumePlayer = this.volumeMediaPlayer;
    const updateQueue = forceUpdate || !this._playerData;
    const currentQueue = updateQueue
      ? await this.actionGetCurrentQueue()
      : this._playerData;
    const currentItem = currentQueue?.current_item;
    const favorite =
      currentItem?.media_item?.favorite ??
      this.activePlayerData?.favorite ??
      false;

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
      muted: volumePlayer?.attributes.is_volume_muted ?? true,
      volume: Math.floor((volumePlayer?.attributes.volume_level ?? 0) * 100),
      player_name: this.activePlayerName,
      favorite,
    };
  }
  public async getPlayerProgress(): Promise<number> {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return 0;
    }
    if (!this._playerData) {
      await this.actionGetCurrentQueue();
    }
    return this._playerData?.elapsed_time ?? 0;
  }
  public async getPlayerActiveItemDuration(): Promise<number> {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return 1;
    }
    if (!this._playerData) {
      await this.actionGetCurrentQueue();
    }
    return this._playerData?.current_item?.duration ?? 1;
  }
  async actionGetCurrentQueue(): Promise<getQueueResponse> {
    const entityId = this.activeEntityID;
    const player = this.activeMediaPlayer;
    const defaultResponse = {
      queue_id: "",
      active: false,
      name: this.activePlayerName,
      items: 0,
      shuffle_enabled: false,
      repeat_mode: false,
      current_index: 0,
      elapsed_time: 0,
      current_item: null,
      next_item: null,
    };
    if (
      !playerIsAvailable(this.hass, entityId) ||
      !player?.state ||
      ["unknown", "unavailable"].includes(player.state)
    ) {
      return defaultResponse;
    }
    const data: MassGetQueueServiceDataSchema = {
      type: "call_service",
      domain: "music_assistant",
      service: "get_queue",
      service_data: {
        entity_id: entityId,
      },
      return_response: true,
    };
    try {
      const returnValue =
        await this.hass.callWS<MassGetQueueServiceResponseSchema>(data);
      const result = returnValue.response[entityId];
      this._playerData = result;
      return result;
    } catch {
      return defaultResponse;
    }
  }
  public createAndApplyExpressiveScheme() {
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
    const activeArtwork = this.getActiveArtwork();
    const schemeName = this.config.expressive_scheme;
    const darkMode = this.hass.themes.darkMode;
    if (
      !this.activeMediaPlayer?.attributes.media_content_id ||
      !activeArtwork
    ) {
      const color = generateDefaultExpressiveSchemeColor();
      const scheme = generateExpressiveSchemeFromColor(
        color,
        schemeName,
        darkMode,
      );
      this._activeSchemeColor = color;
      this.expressiveScheme = scheme;
      this._updatingScheme = false;
      return this.expressiveScheme;
    }
    const scheme = await getOrGenerateExpressiveScheme(
      activeArtwork,
      schemeName,
      darkMode,
    );
    this.expressiveScheme = scheme.scheme;
    this._activeSchemeColor = scheme.color;
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
    entityId: string,
    volumeLevel: number,
  ): Promise<void> {
    const data: setGroupVolumeServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "set_group_volume",
      service_data: {
        entity: entityId,
        volume_level: volumeLevel,
      },
    };
    await this.hass.callWS(data);
  }
  public async setActiveGroupVolume(volumeLevel: number): Promise<void> {
    if (!this.activeMediaPlayer) {
      return;
    }
    await this.setGroupedVolume(this.activeMediaPlayer.entity_id, volumeLevel);
    this.groupVolume = volumeLevel;
  }
  public async getActiveGroupVolume(): Promise<number> {
    if (!this.activeMediaPlayer) {
      return 0;
    }
    return await this.getGroupedVolume(this.activeMediaPlayer.entity_id);
  }
  public async getGroupedVolume(entityId: string): Promise<number> {
    const data: getGroupVolumeServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "get_group_volume",
      service_data: {
        entity: entityId,
      },
      return_response: true,
    };
    const returnValue =
      await this.hass.callWS<getGroupVolumeServiceResponse>(data);
    const vol = returnValue.response.volume_level;
    return vol;
  }
  public async toggleAutoplay(entityId = this.activeEntityID) {
    const currentAutoplay = this.queueInfo.autoplay_enabled;
    const data: setAutoplayServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "set_autoplay",
      service_data: {
        entity: entityId,
        enabled: !currentAutoplay,
      },
    };
    await this.hass.callWS<setCrossfadeServiceSchema>(data);
    await this.setQueueInfo();
  }
  public async toggleCrossfade(entityId = this.activeEntityID) {
    const currentCrossfade = this.queueInfo.crossfade_enabled;
    const data: setCrossfadeServiceSchema = {
      type: "call_service",
      domain: "mass_queue",
      service: "set_crossfade",
      service_data: {
        entity: entityId,
        enabled: !currentCrossfade,
      },
    };
    await this.hass.callWS<setCrossfadeServiceSchema>(data);
    await this.setQueueInfo();
  }
  public async setQueueInfo() {
    this.queueInfo = await this.getQueueInfo();
  }
  public async getQueueInfo(
    entityId = this.activeEntityID,
  ): Promise<getQueueInfoWSServiceResponseSchema> {
    const data: getQueueInfoWSServiceSchema = {
      type: "mass_queue/get_queue_info",
      entity_id: entityId,
    };
    try {
      const resp =
        await this.hass.callWS<getQueueInfoWSServiceResponseSchema>(data);
      return resp;
    } catch {
      return {
        autoplay_enabled: false,
        crossfade_enabled: false,
        display_name: "N/A",
        ended: false,
        flow_mode: false,
        playback_speed: 1,
        smart_fades_active: false,
        smart_shuffle_active: false,
      };
    }
  }
  public async getEntityInfo(
    entityId = this.activeEntityID,
  ): Promise<getInfoWSResponseSchema> {
    const data: getInfoWSServiceSchema = {
      type: "mass_queue/get_info",
      entity_id: entityId,
    };
    const resp = await this.hass.callWS<getInfoWSResponseSchema>(data);
    return resp;
  }
  private async getPlayerProvider(entityId: string) {
    const resp = await this.getEntityInfo(entityId);
    return resp.provider;
  }
  public async playerCanGroupWith(
    entityId = this.activeEntityID,
  ): Promise<string[]> {
    if (!playerIsAvailable(this.hass, entityId)) {
      return [];
    }
    const info = await this.getEntityInfo(entityId);
    const groupableIds = info.can_group_with;
    const result: string[] = [];
    for (const entity of this.config.entities) {
      const entId = entity.entity_id;
      if (playerIsAvailable(this.hass, entId)) {
        const entInfo = await this.getEntityInfo(entity.entity_id);
        if (groupableIds.includes(entInfo.player_id)) {
          result.push(entity.entity_id);
        }
      }
    }
    this.groupMembers?.forEach((member) => {
      if (!result.includes(member) && member != this.activeEntityID) {
        result.push(member);
      }
    });
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
    if (this._playerDataUpdateInterval) {
      clearInterval(this._playerDataUpdateInterval);
    }
  }
  public reconnected(hass: ExtendedHass) {
    this.hass = hass;
    this.setActivePlayer(this.activeEntityID);
    this.createObserver();
    this._playerDataUpdateInterval = setInterval(() => {
      void this.actionGetCurrentQueue();
    }, this._maxPlayerDataUpdateTimestampDelta);
  }
  private async setActiveArtistAndAlbum() {
    if (!this.activeEntityID) {
      return;
    }
    const activeItem = this._playerData?.current_item?.media_item;
    if (!activeItem) {
      return;
    }
    const albumUri = activeItem.album?.uri;
    const artists = activeItem.artists;
    if (albumUri) {
      const albumData = await this._browserActions.actionGetAlbumData(
        albumUri,
        this.activeEntityID,
      );
      const artistNames = albumData.response.artists.map((artist) => {
        return artist.name;
      });
      const usedArtistNames =
        artistNames.length > 0 ? artistNames.join(", ") : "Unknown Artists";
      const images = albumData.response.metadata.images as
        MediaItemImage | MediaItemImage[] | null;
      let albumImageUrl = "";
      if (images) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ((images as unknown as MediaItemImage[])?.length) {
          const usedImage = (images as MediaItemImage[])[0];
          albumImageUrl = usedImage.path;
        } else {
          albumImageUrl = (images as MediaItemImage).path;
        }
      }
      this.albumCollectionData = {
        type: "album",
        media_artist: usedArtistNames,
        media_content_id: albumUri,
        media_image: albumImageUrl,
        media_title: albumData.response.name,
      };
    }
    if (artists) {
      const artistData = await this._browserActions.actionGetArtistData(
        artists[0].uri,
        this.activeEntityID,
      );
      const images = artistData.response.metadata.images;
      let artistImageUrl = "";
      if (images) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ((images as unknown as MediaItemImage[])?.length) {
          const usedImage = (images as unknown as MediaItemImage[])[0];
          artistImageUrl = usedImage.path;
        } else {
          artistImageUrl = images.path;
        }
      }
      this.artistCollectionData = {
        type: "artist",
        media_content_id: artists[0].uri,
        media_image: artistImageUrl,
        media_title: artists[0].name,
        media_artist: artists[0].name,
      };
    }
  }
}
