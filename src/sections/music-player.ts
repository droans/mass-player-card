import "@material/web/progress/linear-progress.js";

import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { query, state } from "lit/decorators.js";
import { html } from "lit/static-html.js";

import "../components/grouped-player-menu";
import "../components/media-progress";
import "../components/player-artwork";
import "../components/player-controls";
import "../components/player-controls-expressive";
import "../components/player-selector-menu";
import "../components/section-header";
import "../components/volume-row";
import "../components/volume-slider";

import PlayerActions from "../actions/player-actions";

import {
  MediaTypes,
  Thumbnail,
} from "../const/enums";
import {
  activeEntityConfContext,
  activeMediaPlayerContext,
  activePlayerControllerContext,
  activePlayerDataContext,
  configContext,
  controllerContext,
  entitiesConfigContext,
  EntityConfig,
  groupedPlayersContext,
  hassContext,
  musicPlayerConfigContext,
} from "../const/context";
import { ExtendedHass, ExtendedHassEntity, MediaLibraryItem, PlayerData, PlaylistDialogItem } from "../const/types";
import { PLAYLIST_DIALOG_MAX_ITEMS } from "../const/music-player";

import styles from "../styles/music-player";

import { PlayerSelectedService } from "../const/actions";
import { ArtworkSize, PlayerConfig } from "../config/player";
import { ActivePlayerController } from "../controller/active-player";
import { Config } from "../config/config";
import { isActive, jsonMatch, playerHasUpdated } from "../utils/util";
import { MassCardController } from "../controller/controller";
import { ForceUpdatePlayerDataEvent, MenuButtonEventData } from "../const/events";
import { asyncImageURLWithFallback } from "../utils/thumbnails";
import { DialogElement } from "../const/elements";

class MusicPlayerCard extends LitElement {
  @query('#dialog-favorites') favoritesDialog!: DialogElement;
  @state() protected _playlists!: PlaylistDialogItem[];

  @consume({ context: entitiesConfigContext, subscribe: true })
  public playerEntities!: EntityConfig[];

  @consume({ context: configContext, subscribe: true })
  private cardConfig!: Config;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @consume({ context: activePlayerDataContext, subscribe: true })
  @state()
  public player_data!: PlayerData;

  private _activeEntityConfig!: EntityConfig;
  private _activeEntity!: ExtendedHassEntity;
  private _config!: PlayerConfig;

  public selectedPlayerService!: PlayerSelectedService;
  private _hass!: ExtendedHass;
  private _groupedPlayers!: EntityConfig[];
  private actions!: PlayerActions;

  private _artworkHeaderClass!: string;
  private _artworkProgressClass!: string;
  private _artworkVolumeClass!: string;
  private _artworkMediaControlsClass!: string;
  private _artworkActiveTrackClass!: string;
  @state()
  private _activePlayerController!: ActivePlayerController;

  @consume({ context: activeEntityConfContext, subscribe: true })
  public set activeEntityConfig(entity: EntityConfig) {
    this._activeEntityConfig = entity;
    void this.updatePlaylists()
  }
  public get activeEntityConfig() {
    return this._activeEntityConfig;
  }
  public get activeMediaPlayer() {
    return this?.activePlayerController?.activeMediaPlayer;
  }

  @consume({ context: activeMediaPlayerContext, subscribe: true })
  @state()
  private set activeEntity(entity: ExtendedHassEntity) {
    if (!playerHasUpdated(this._activeEntity, entity)) {
      return;
    }
    this._activeEntity = entity;
  }
  public get activeEntity() {
    return this._activeEntity;
  }

  @consume({ context: hassContext, subscribe: true })
  public set hass(hass: ExtendedHass) {
    if (hass) {
      this.actions = new PlayerActions(hass);
    }
    this._hass = hass;
  }
  public get hass() {
    return this._hass;
  }

  @consume({ context: musicPlayerConfigContext, subscribe: true })
  public set config(config: PlayerConfig) {
    if (jsonMatch(this._config, config)) {
      return;
    }
    this._config = config;
    switch (config.layout.artwork_size) {
      case ArtworkSize.LARGE:
        this._artworkHeaderClass = "header-art-lg";
        this._artworkProgressClass = "bg-art-lg";
        this._artworkVolumeClass = "vol-art-lg";
        this._artworkMediaControlsClass = "controls-art-lg";
        this._artworkActiveTrackClass = "active-track-lg";
        break;
      case ArtworkSize.MEDIUM:
        this._artworkHeaderClass = "header-art-med";
        this._artworkProgressClass = "bg-art-med";
        this._artworkVolumeClass = "vol-art-med";
        this._artworkMediaControlsClass = "controls-art-med";
        this._artworkActiveTrackClass = "active-track-med";
        break;
      case ArtworkSize.SMALL:
        this._artworkHeaderClass = "header-art-sm";
        this._artworkProgressClass = "bg-art-sm";
        this._artworkVolumeClass = "vol-art-sm";
        this._artworkMediaControlsClass = "controls-art-sm";
        this._artworkActiveTrackClass = "active-track-sm";
    }
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activePlayerControllerContext, subscribe: true })
  private set activePlayerController(controller: ActivePlayerController) {
    if (!controller) {
      return;
    }
    this._activePlayerController = controller;
    if (!this.player_data) {
      void this.activePlayerController.updateActivePlayerData();
    }
  }
  private get activePlayerController() {
    return this._activePlayerController;
  }

  @consume({ context: groupedPlayersContext, subscribe: true })
  private set groupedPlayersList(players: string[]) {
    const card_players = this.playerEntities.filter((entity) =>
      players?.includes(entity.entity_id),
    );
    if (jsonMatch(this._groupedPlayers, card_players)) {
      return;
    }
    this._groupedPlayers = card_players;
  }

  private get groupedPlayers() {
    return this._groupedPlayers;
  }

  public forceUpdatePlayerDataValue(key: string, value: string) {
    const data = this.player_data;
    if (!Object.keys(data).includes(key)) {
      return;
    }
    data[key] = value;
    this.player_data = { ...data };
  }
  private async generatePlaylistData(playlist: MediaLibraryItem): Promise<PlaylistDialogItem> {
    return {
      name: playlist.name,
      image: await asyncImageURLWithFallback(
        this.controller.hass,
        playlist.image ?? ``,
        Thumbnail.PLAYLIST,
        this.controller.config.download_local
      ),
      uri: playlist.uri
    }
  }
  public async updatePlaylists() {
    const playlistData = await this.controller.Actions.browserActions.actionGetLibrary(
      this.activeEntityConfig.entity_id,
      MediaTypes.PLAYLIST,
      PLAYLIST_DIALOG_MAX_ITEMS,
      null
    );
    const _promises = playlistData.map(
      (playlist) => {
        return this.generatePlaylistData(playlist)
      }
    );
    this._playlists = await Promise.all(_promises);
  }

  protected openAddToPlaylistDialog() {
    if (!this?.favoritesDialog) {
      throw new Error(`Dialog element doesn't exist!`)
    }
    this.favoritesDialog.open = true;
  }
  protected closeAddToPlaylistDialog() {
    if (!this?.favoritesDialog) {
      throw new Error(`Dialog element doesn't exist!`)
    }
    this.favoritesDialog.open = false;
  }

  private onForceLoadEvent = (ev: Event) => {
    const e = ev as ForceUpdatePlayerDataEvent;
    const key = e.detail.key;
    /* eslint-disable
      @typescript-eslint/no-unsafe-argument,
      @typescript-eslint/no-unsafe-assignment
    */
    const val = e.detail.value;
    this.forceUpdatePlayerDataValue(key, val);
    /* eslint-enable
      @typescript-eslint/no-unsafe-argument,
      @typescript-eslint/no-unsafe-assignment
    */
  };
  private onPlayerSelect = (ev: MenuButtonEventData) => {
    ev.stopPropagation();
    const target = ev.detail;
    const player = target.option;
    if (!player.length) {
      return;
    }
    this.selectedPlayerService(player);
  };

  protected onAddToPlaylist = (ev: Event) => {
    const uri = (ev.target as HTMLElement).dataset.uri as string;
    const media_id = this.hass.states[this.activeEntity.entity_id].attributes.media_content_id;
    void this.actions.actionAddToPlaylist(
      media_id,
      uri,
      this.activeMediaPlayer
    );
    this.closeAddToPlaylistDialog();
  };
  protected renderPlaylistDialogList() {
    if (!this._playlists) {
      return html`
        <div class="dialog-playlists-none-loading">
          Loading Playlists...
        </div>
      `
    }
    if (!this._playlists.length) {
      return html`
        <div class="dialog-playlists-none-loading">
          No playlists found!
        </div>
      `
    }
    return this._playlists.map(
      (playlist) => {
        return html`
          <ha-md-list-item
            class="dialog-playlist-item"
            @click=${this.onAddToPlaylist}
            data-uri="${playlist.uri}"
            type="button"
          >
            <img
              class="dialog-playlist-thumbnail"
              slot="start"
              src="${playlist.image.image_url}"
              onerror="this.src = '${playlist.image.fallback_url}'"
            >
            <span
              slot="headline"
              class="dialog-playlist-title"
              inert
            >
              ${playlist.name}
            </span>
          </ha-md-list-item>
          <div class="dialog-playlist-divider"></div>
        `
      }
    )
  }
  protected renderAddToPlaylistDialog(): TemplateResult {
    const cls = `dialog-favorites${this.cardConfig.expressive ? `-expressive` : ``}`
    return html`
      <ha-dialog
        id="dialog-favorites"
        class="${cls}"
        heading="${this.controller.translate("player.playlist_dialog.header")}"
      >
        <div class="dialog-items">
          ${this.renderPlaylistDialogList()}
        </div>
      </ha-dialog>
    `
  }
  protected wrapTitleMarquee() {
    const title = `${this.player_data.track_title} - ${this.player_data.track_album}`;
    return html`
      <ha-marquee-text class="player-track-title marquee">
        ${title}
      </ha-marquee-text>
    `;
  }
  protected renderPlayerName() {
    return html`
      <div
        class="player-name ${this.cardConfig.expressive
          ? `player-name-expressive`
          : ``}"
      >
        ${this.player_data?.player_name ??
        this.activePlayerController.activePlayerName}
      </div>
    `;
  }
  protected renderTitle() {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return html`
        <div class="player-track-title">
          ${this.controller.translate("player.title.inactive")}
        </div>
      `;
    }
    return this.wrapTitleMarquee();
  }
  protected renderGrouped() {
    const hide =
      this.config.hide.group_volume ||
      this.activeEntityConfig.hide.player.group_volume;
    if (this?.groupedPlayers?.length > 1 && !hide) {
      return html`
        <mpc-grouped-player-menu slot="end"></mpc-grouped-player-menu>
      `
    }
    return html``;
  }
  protected renderArtist() {
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      const msgs: string[] = this.controller.translate(
        "player.messages.inactive",
      ) as string[];
      const i = Math.floor(Math.random() * msgs.length);
      return html`
        <div
          class="player-track-artist ${this.cardConfig.expressive
            ? `player-track-artist-expressive`
            : ``}"
        >
          ${msgs[i]}
        </div>
        ;
      `;
    }
    return html` <div
      class="player-track-artist ${this.cardConfig.expressive
        ? `player-track-artist-expressive`
        : ``}"
    >
      ${this.player_data.track_artist}
    </div>`;
  }
  protected renderSectionTitle() {
    const label = this.controller.translate("player.header") as string;
    return html` <span slot="label">${label}</span> `;
  }
  protected renderHeader(): TemplateResult {
    const expressive = this.cardConfig.expressive;
    return html`
      <div
        id="player-card-header"
        class="player-card-header${expressive ? `-expressive` : ``}"
      >
        <mass-section-header
          class="${this._artworkHeaderClass} ${this.cardConfig.expressive
            ? `header-expressive`
            : ``}"
        >
          ${this.renderPlayerSelector()} ${this.renderSectionTitle()}
          ${this.renderGrouped()}
        </mass-section-header>
        ${this.renderActiveItemSection()}
      </div>
    `;
  }
  protected renderPlayerSelector(): TemplateResult {
    return html`
      <span slot="start">
        <mpc-player-selector
          @menu-item-selected=${this.onPlayerSelect}
        >
        </mpc-player-selector>
      </span>
    `
  }
  protected renderActiveItemSection() {
    return html`
      <div id="${this._artworkActiveTrackClass}">
        <div
          id="active-track-text"
          class="${this.cardConfig.expressive
            ? `active-track-text-expressive`
            : ``} ${this.config.layout.artwork_size != ArtworkSize.LARGE
            ? `active-track-text-rounded`
            : ``}"
        >
          ${this.renderPlayerHeader()} ${this.renderProgress()}
        </div>
      </div>
    `;
  }
  protected renderPlayerHeader() {
    return html`
      <div class="player-header">
        ${this.renderPlayerName()} ${this.renderTitle()} ${this.renderArtist()}
      </div>
    `;
  }
  protected renderProgress() {
    return html`
      <mass-progress-bar
        class="${this._artworkProgressClass}"
        style="${isActive(this.hass,this.activeMediaPlayer,this.activeEntityConfig,) ? `` : `opacity: 0;`}"
      ></mass-progress-bar>
    `;
  }
  protected renderArtwork() {
    return html` <mpc-artwork></mpc-artwork>`;
  }
  protected renderVolumeRow() {
    return html`
      <div id="volume">
        <mass-volume-row
          class="${this._artworkVolumeClass} ${this.cardConfig.expressive
            ? `volume-expressive`
            : ``}"
        ></mass-volume-row>
      </div>
    `;
  }
  protected renderControls() {
    return html`
      <div
        class="media-controls ${this._artworkMediaControlsClass} ${this
          .cardConfig.expressive
          ? `media-controls-expressive`
          : ``}"
      >
        ${this?.cardConfig?.expressive
          ? html`<mass-player-controls-expressive></mass-player-controls-expressive>`
          : html`<mass-player-controls></mass-player-controls>`}
        ${this.renderVolumeRow()}
      </div>
    `;
  }
  protected render() {
    const expressive = this.cardConfig.expressive;
    return html`
      <div id="container" class="${expressive ? `container-expressive` : ``}">
        ${this.renderHeader()}
        <div
          id="player-card"
          class="${expressive ? `player-card-expressive` : ``}"
        >
          ${this.renderArtwork()} ${this.renderControls()}
        </div>
        ${this.renderAddToPlaylistDialog()}
      </div>
    `;
  }
  private delayedUpdatePlayerData = () => {
    setTimeout(() => {
      void this.activePlayerController.updateActivePlayerData();
    }, 2000);
  };
  private openPlaylistDialogOnEvent = () => {
    this.openAddToPlaylistDialog();
  }
  protected firstUpdated(): void {
    this.controller.host.addEventListener(
      "request-player-data-update",
      this.delayedUpdatePlayerData,
    );
    this.controller.host.addEventListener(
      "force-update-player",
      this.onForceLoadEvent,
    );
    this.controller.host.addEventListener("active-player-updated", () => {
      void this.activePlayerController.updateActivePlayerData();
    });
    this.controller.host.addEventListener(
      "open-add-to-playlist-dialog",
      this.openPlaylistDialogOnEvent,
    );
  }
  protected updated(): void {
    const favoritesDialog = this?.favoritesDialog
    if (!favoritesDialog) {
      return;
    }
    const actions_div = favoritesDialog.shadowRoot?.querySelector('#actions') as HTMLElement;
    if (actions_div && actions_div.style.display != 'none'){
      actions_div.style.display = 'none';
    }
    const content_div = favoritesDialog.shadowRoot?.querySelector('#content') as HTMLElement;
    if (content_div && content_div.style.scrollbarWidth != 'none'){
      content_div.style.scrollbarWidth = 'none';
    }
    
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!this.player_data || !_changedProperties.size) {
      return false;
    }
    return super.shouldUpdate(_changedProperties);
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-music-player-card", MusicPlayerCard);
