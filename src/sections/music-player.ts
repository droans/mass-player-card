import "@material/web/progress/linear-progress.js";

import { consume } from "@lit/context";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { html } from "lit/static-html.js";

import "../components/grouped-player-menu/grouped-player-menu";
import "../components/marquee-text/marquee-text";
import "../components/media-progress/media-progress";
import "../components/player-artwork/player-artwork";
import "../components/player-controls/player-controls-expressive";
import "../components/player-selector-menu/player-selector-menu";
import "../components/section-header/section-header";
import "../components/volume-row/volume-row";

import PlayerActions from "../actions/player-actions";

import {
  activeEntityConfigContext,
  activeMediaPlayerContext,
  activePlayerControllerContext,
  activePlayerDataContext,
  activeQueueInfoContext,
  configContext,
  controllerContext,
  entitiesConfigContext,
  EntityConfig,
  groupedPlayersContext,
  hassContext,
  IconsContext,
  musicPlayerConfigContext,
  musicPlayerHiddenElementsConfigContext,
} from "../const/context";
import {
  MediaTypes,
  PlayerSupportedFeatures,
  Sections,
  Thumbnail,
} from "../const/enums";
import { PLAYLIST_DIALOG_MAX_ITEMS } from "../const/music-player";
import {
  ExtendedHass,
  ExtendedHassEntity,
  MediaLibraryItem,
  PlayerData,
  PlaylistDialogItem,
} from "../const/types";

import styles from "../styles/music-player";

import { Config } from "../config/config";
import { PlayerConfig, PlayerHiddenElementsConfig } from "../config/player";
import {
  getQueueInfoWSServiceResponseSchema,
  PlayerSelectedService,
} from "../const/actions";
import { DialogElement } from "../const/elements";
import {
  ForceUpdatePlayerDataEvent,
  HaDropdownEventData,
} from "../const/events";
import { Icons } from "../const/icons";
import { ActivePlayerController } from "../controller/active-player";
import { MassCardController } from "../controller/controller";
import { asyncImageURLWithFallback } from "../utils/thumbnails";
import { getTranslation } from "../utils/translations";
import {
  isActive,
  jsonMatch,
  playerHasUpdated,
  playerSupportsFeature,
} from "../utils/utility";

@customElement("mpc-music-player-card")
export class MusicPlayerCard extends LitElement {
  @state() protected _playlists?: PlaylistDialogItem[];
  @state()
  private _activePlayerController?: ActivePlayerController;
  @state() private _groupedPlayers?: EntityConfig[];

  @consume({ context: activePlayerDataContext, subscribe: true })
  @state()
  public playerData?: PlayerData;
  @consume({ context: activeQueueInfoContext, subscribe: true })
  @state()
  private queueInfo!: getQueueInfoWSServiceResponseSchema;

  @query("#dialog-favorites") favoritesDialog?: DialogElement;

  @consume({ context: entitiesConfigContext, subscribe: true })
  public playerEntities!: EntityConfig[];
  @consume({ context: configContext, subscribe: true })
  private cardConfig?: Config;
  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;
  @consume({ context: musicPlayerHiddenElementsConfigContext, subscribe: true })
  private hiddenElements!: PlayerHiddenElementsConfig;
  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  private _activeEntityConfig!: EntityConfig;
  private _activeEntity!: ExtendedHassEntity;
  private _config!: PlayerConfig;

  public selectedPlayerService!: PlayerSelectedService;
  private _hass!: ExtendedHass;
  private actions!: PlayerActions;

  @consume({ context: activeEntityConfigContext, subscribe: true })
  public set activeEntityConfig(entity: EntityConfig) {
    this._activeEntityConfig = entity;
    void this.updatePlaylists();
  }
  public get activeEntityConfig() {
    return this._activeEntityConfig;
  }
  public get activeMediaPlayer() {
    return this.activePlayerController?.activeMediaPlayer;
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
  public set hass(hass: ExtendedHass | undefined) {
    if (hass) {
      this.actions = new PlayerActions(hass);
      this._hass = hass;
    }
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
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activePlayerControllerContext, subscribe: true })
  private set activePlayerController(
    controller: ActivePlayerController | undefined,
  ) {
    if (!controller) {
      return;
    }
    this._activePlayerController = controller;
    if (!this.playerData) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      void this.activePlayerController!.updateActivePlayerData();
    }
  }
  private get activePlayerController() {
    return this._activePlayerController;
  }

  @consume({ context: groupedPlayersContext, subscribe: true })
  private set groupedPlayersList(players: string[] | undefined) {
    const cardPlayers = this.playerEntities.filter((entity) =>
      players?.includes(entity.entity_id),
    );
    if (jsonMatch(this._groupedPlayers, cardPlayers)) {
      return;
    }
    this._groupedPlayers = cardPlayers;
  }

  private get groupedPlayers() {
    return this._groupedPlayers;
  }

  public forceUpdatePlayerDataValue(key: string, value: string) {
    if (!this.playerData) {
      return;
    }
    const data = this.playerData;
    if (!Object.keys(data).includes(key)) {
      return;
    }
    data[key] = value;
    this.playerData = { ...data };
  }
  private async generatePlaylistData(
    playlist: MediaLibraryItem,
  ): Promise<PlaylistDialogItem> {
    return {
      name: playlist.name,
      image: await asyncImageURLWithFallback(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.controller.hass!,
        playlist.image ?? ``,
        Thumbnail.PLAYLIST,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.controller.config!.download_local,
        this.cardConfig?.proxy_all_artwork,
      ),
      uri: playlist.uri,
    };
  }
  public async updatePlaylists() {
    if (!this.controller.Actions) {
      return;
    }
    const user = this.controller.massUser;
    const playlistData =
      await this.controller.Actions.browserActions.actionGetLibrary(
        this.activeEntityConfig.entity_id,
        MediaTypes.PLAYLIST,
        PLAYLIST_DIALOG_MAX_ITEMS,
        null,
        null,
        user,
      );
    const _promises = playlistData.map((playlist) => {
      return this.generatePlaylistData(playlist);
    });
    this._playlists = await Promise.all(_promises);
  }

  protected openAddToPlaylistDialog() {
    if (!this.favoritesDialog) {
      throw new Error(`Dialog element doesn't exist!`);
    }
    this.favoritesDialog.open = true;
  }
  protected closeAddToPlaylistDialog() {
    if (!this.favoritesDialog) {
      throw new Error(`Dialog element doesn't exist!`);
    }
    this.favoritesDialog.open = false;
  }

  public openActiveAlbumView() {
    if (
      !this.activePlayerController?.albumCollectionData ||
      !this.controller.Browser
    ) {
      return;
    }
    this.controller.Browser.activeAlbumCollectionData =
      this.activePlayerController.albumCollectionData;
    this.controller.activeSection = Sections.MEDIA_BROWSER;
  }
  public openActiveArtistView() {
    if (
      !this.activePlayerController?.artistCollectionData ||
      !this.controller.Browser
    ) {
      return;
    }
    this.controller.Browser.activeArtistCollectionData =
      this.activePlayerController.artistCollectionData;
    this.controller.activeSection = Sections.MEDIA_BROWSER;
  }

  private onForceLoadEvent = (event_: Event) => {
    const coaxedEvent = event_ as ForceUpdatePlayerDataEvent;
    const key = coaxedEvent.detail.key;
    /* eslint-disable
      @typescript-eslint/no-unsafe-argument,
      @typescript-eslint/no-unsafe-assignment
    */
    const value = coaxedEvent.detail.value;
    this.forceUpdatePlayerDataValue(key, value);
    /* eslint-enable
      @typescript-eslint/no-unsafe-argument,
      @typescript-eslint/no-unsafe-assignment
    */
  };
  private onPlayerSelect = (event_: HaDropdownEventData) => {
    event_.stopPropagation();
    const target = event_.detail;
    const player = target.item.value;
    if (player.length === 0) {
      return;
    }
    this.selectedPlayerService(player);
  };

  protected onAddToPlaylist = (event_: Event) => {
    if (!this.activeMediaPlayer || !this.hass) {
      return;
    }
    const uri = (event_.target as HTMLElement).dataset.uri as string;
    const ent = this.hass.states[this.activeEntity.entity_id];
    if (!ent) {
      return;
    }
    const mediaId = ent.attributes.media_content_id;
    if (!mediaId) {
      return;
    }
    void this.actions.actionAddToPlaylist(mediaId, uri, this.activeMediaPlayer);
    this.closeAddToPlaylistDialog();
  };
  protected onArtistNameSelect = () => {
    this.openActiveArtistView();
  };
  protected onAlbumNameSelect = () => {
    this.openActiveAlbumView();
  };

  protected onPlayerMenuItemSelected = (event_: HaDropdownEventData) => {
    const selection = event_.detail.item.value;
    if (selection == "autoplay") {
      void this.activePlayerController?.toggleAutoplay();
      return;
    }
    if (selection == "crossfade") {
      void this.activePlayerController?.toggleCrossfade();
      return;
    }
  };

  protected hideSectionHeader(): boolean {
    return this.hiddenElements.header;
  }

  /*
    Render Playlist Dialog
  */
  protected renderPlaylistDialogList(): TemplateResult | TemplateResult[] {
    if (!this._playlists) {
      return html`
        <div class="dialog-playlists-none-loading">Loading Playlists...</div>
      `;
    }
    if (this._playlists.length === 0) {
      return html`
        <div class="dialog-playlists-none-loading">No playlists found!</div>
      `;
    }
    return this._playlists.map((playlist) => {
      return html`
        <ha-list-item-button
          class="dialog-playlist-item"
          @click=${this.onAddToPlaylist}
          data-uri="${playlist.uri}"
          type="button"
        >
          <img
            class="dialog-playlist-thumbnail"
            slot="start"
            src="${playlist.image.image_url}"
            loading="lazy"
            onerror="this.src = '${playlist.image.fallback_url}'"
          />
          <span slot="headline" class="dialog-playlist-title" inert>
            ${playlist.name}
          </span>
        </ha-list-item-button>
      `;
    });
  }
  protected renderAddToPlaylistDialog(): TemplateResult {
    if (!this.cardConfig) {
      return html``;
    }
    return html`
      <ha-dialog
        id="dialog-favorites"
        class="dialog-favorites"
        header-title="${this.controller.translate("player.playlist_dialog.header")}"
      >
        <div class="dialog-items">${this.renderPlaylistDialogList()}</div>
      </ha-dialog>
    `;
  }

  /*
    Render Header
  */
  protected renderHeader(): TemplateResult {
    if (!this.cardConfig || this.hiddenElements.header) {
      return html``;
    }
    return html`
      <div id="player-card-header">${this.renderSectionHeader()}</div>
    `;
  }
  protected renderSectionHeader(): TemplateResult {
    if (!this.cardConfig) {
      return html``;
    }
    return html`
      <div id="header">
        ${this.renderPlayerMenu()} ${this.renderPlayerSelector()}
        ${this.renderGrouped()}
      </div>
    `;
  }
  protected renderPlayerMenu(): TemplateResult {
    if (this.hiddenElements.menu) {
      return html``;
    }
    return html`
      <div class="menu-player">
        <ha-dropdown
          class="player-menu-dropdown"
          @wa-select=${this.onPlayerMenuItemSelected}
        >
          <mpc-button
            slot="trigger"
            class="player-menu-trigger"
            .onPressService=${() => {
              return;
            }}
            role="tonal"
            elevation="-1"
          >
            <ha-svg-icon
              class="player-menu-trigger-icon"
              .path=${this.Icons.MENU}
            ></ha-svg-icon>
          </mpc-button>
          ${this.renderAutoplayMenuItem()} ${this.renderCrossfadeMenuItem()}
        </ha-dropdown>
      </div>
    `;
  }
  protected renderAutoplayMenuItem(): TemplateResult {
    if (this.hiddenElements.autoplay_button) {
      return html``;
    }
    const autoplay = this.queueInfo.autoplay_enabled;
    const translationKey = `player.label.autoplay.${autoplay ? `enabled` : `disabled`}`;
    const translation = getTranslation(translationKey, this.hass);
    return html`
      <ha-dropdown-item value="autoplay">
        <ha-svg-icon
          class="player-menu-icon autoplay"
          .path=${this.Icons.AUTOPLAY}
          slot="icon"
        ></ha-svg-icon>
        ${translation}
      </ha-dropdown-item>
    `;
  }
  protected renderCrossfadeMenuItem(): TemplateResult {
    if (this.hiddenElements.crossfade_button) {
      return html``;
    }
    const crossfade = this.queueInfo.crossfade_enabled;
    const translationKey = `player.label.crossfade.${crossfade ? `enabled` : `disabled`}`;
    const translation = getTranslation(translationKey, this.hass);
    return html`
      <ha-dropdown-item value="crossfade">
        <ha-svg-icon
          class="player-menu-icon crossfade"
          .path=${this.Icons.CROSSFADE}
          slot="icon"
        ></ha-svg-icon>
        ${translation}
      </ha-dropdown-item>
    `;
  }
  protected renderPlayerSelector(): TemplateResult {
    if (this.hiddenElements.player_selector) {
      return html``;
    }
    return html`
      <div class="menu-player-selector">
        <mpc-player-selector @menu-item-selected=${this.onPlayerSelect}>
        </mpc-player-selector>
      </span>
    `;
  }
  protected renderGrouped(): TemplateResult {
    const hide = this.hiddenElements.group_selector;
    if (this.groupedPlayers && this.groupedPlayers.length > 1 && !hide) {
      return html`
        <div class="menu-grouped">
          <mpc-grouped-player-menu></mpc-grouped-player-menu>
        </div>
      `;
    }
    return html``;
  }

  /*
    Render Artwork
  */
  protected renderArtwork(): TemplateResult {
    return html` <mpc-player-artwork></mpc-player-artwork>`;
  }

  /*
    Render Active Track section
  */
  protected wrapTitleMarquee(): TemplateResult {
    if (!this.playerData) {
      return html``;
    }
    return html`
      <mpc-marquee-text class="player-track-title marquee">
        <button
          class="hidden player-track-title"
          @click=${this.onAlbumNameSelect}
        >
          ${this.playerData.track_title}${this.hiddenElements.track_album ? `` : ` - ${this.playerData.track_album}`}
        </button>
      </mpc-marquee-text>
    `;
  }

  protected renderActiveTrack(): TemplateResult {
    return html`
      <div class="title">${this.renderTitle()}</div>
      <div class="artist">${this.renderArtist()}</div>
      <div class="progress">${this.renderProgress()}</div>
    `;
  }
  protected renderTitle(): TemplateResult {
    if (this.hiddenElements.track_title) {
      return html``;
    }
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      return html`
        <button class="hidden player-track-title" @click=${this.onAlbumNameSelect}>
          ${this.controller.translate("player.title.inactive")}
        </div>
      `;
    }
    return this.wrapTitleMarquee();
  }
  protected renderArtist(): TemplateResult {
    if (
      !this.playerData ||
      !this.cardConfig ||
      this.hiddenElements.track_artist
    ) {
      return html``;
    }
    if (!isActive(this.hass, this.activeMediaPlayer, this.activeEntityConfig)) {
      const msgs: string[] = this.controller.translate(
        "player.messages.inactive",
      ) as string[];
      const i = Math.floor(Math.random() * msgs.length);
      return html` <div class="player-track-artist">${msgs[i]}</div> `;
    }
    return html`
      <button
        @click=${this.onArtistNameSelect}
        class="hidden player-track-artist"
      >
        ${this.playerData.track_artist}
      </div>
    `;
  }
  protected renderProgress(): TemplateResult {
    if (
      this.hiddenElements.track_progress_bar &&
      this.hiddenElements.track_progress_time
    ) {
      return html``;
    }
    const style = isActive(
      this.hass,
      this.activeMediaPlayer,
      this.activeEntityConfig,
    )
      ? ``
      : `opacity: 0;`;
    return html`
      <mpc-progress-bar class="bg-art" style="${style}"></mpc-progress-bar>
    `;
  }

  /*
    Render Controls
  */
  protected renderControls(): TemplateResult {
    if (!this.cardConfig) {
      return html``;
    }
    return html`
      <div class="player-controls">
        <mpc-player-controls-expressive></mpc-player-controls-expressive>
      </div>
      ${this.renderVolumeRow()}
    `;
  }
  protected renderVolumeRow(): TemplateResult {
    const feats = this.activeEntity.attributes.supported_features;
    const canSetVolume = playerSupportsFeature(
      feats,
      PlayerSupportedFeatures.VOLUME_SET,
    );
    if (!this.cardConfig || !canSetVolume) {
      return html``;
    }
    const canMute = playerSupportsFeature(
      feats,
      PlayerSupportedFeatures.VOLUME_MUTE,
    );
    return html`
      <div id="volume">
        <mpc-volume-row
          class="volume vol-art"
          ?can-mute=${canMute}
        ></mpc-volume-row>
      </div>
    `;
  }
  protected render(): TemplateResult {
    if (!this.cardConfig) {
      return html``;
    }
    return html`
      <div id="container">
        ${this.renderHeader()}
        <div class="artwork">${this.renderArtwork()}</div>
        <div class="active-track">${this.renderActiveTrack()}</div>
        <div class="controls">${this.renderControls()}</div>
      </div>
    `;
  }
  private delayedUpdatePlayerData = () => {
    setTimeout(() => {
      if (!this.activePlayerController) {
        return;
      }
      void this.activePlayerController.updateActivePlayerData();
    }, 2000);
  };
  private openPlaylistDialogOnEvent = () => {
    this.openAddToPlaylistDialog();
  };
  protected firstUpdated(): void {
    this.controller.host.addEventListener(
      "request-player-data-update",
      this.delayedUpdatePlayerData,
    );
    this.controller.host.addEventListener(
      "force-update-player",
      this.onForceLoadEvent,
    );
    this.controller.host.addEventListener(
      "active-player-updated",
      this.onActivePlayerUpdated,
    );
    this.controller.host.addEventListener(
      "open-add-to-playlist-dialog",
      this.openPlaylistDialogOnEvent,
    );
  }
  protected onActivePlayerUpdated = () => {
    if (!this.activePlayerController) {
      return;
    }
    void this.activePlayerController.updateActivePlayerData();
  };
  protected updated(): void {
    const favoritesDialog = this.favoritesDialog;
    if (!favoritesDialog) {
      return;
    }
    const actionsDiv = favoritesDialog.shadowRoot?.querySelector("#actions") as
      HTMLElement | undefined;
    if (actionsDiv && actionsDiv.style.display != "none") {
      actionsDiv.style.display = "none";
    }
    const contentDiv = favoritesDialog.shadowRoot?.querySelector("#content") as
      HTMLElement | undefined;
    if (contentDiv && contentDiv.style.scrollbarWidth != "none") {
      contentDiv.style.scrollbarWidth = "none";
    }
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    if (!this.playerData || _changedProperties.size === 0) {
      return false;
    }
    return super.shouldUpdate(_changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.controller.host.removeEventListener(
      "request-player-data-update",
      this.delayedUpdatePlayerData,
    );
    this.controller.host.removeEventListener(
      "force-update-player",
      this.onForceLoadEvent,
    );
    this.controller.host.removeEventListener(
      "active-player-updated",
      this.onActivePlayerUpdated,
    );
    this.controller.host.removeEventListener(
      "open-add-to-playlist-dialog",
      this.openPlaylistDialogOnEvent,
    );
  }
  connectedCallback(): void {
    super.connectedCallback();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.controller?.host) {
      this.controller.host.addEventListener(
        "request-player-data-update",
        this.delayedUpdatePlayerData,
      );
      this.controller.host.addEventListener(
        "force-update-player",
        this.onForceLoadEvent,
      );
      this.controller.host.addEventListener(
        "active-player-updated",
        this.onActivePlayerUpdated,
      );
      this.controller.host.addEventListener(
        "open-add-to-playlist-dialog",
        this.openPlaylistDialogOnEvent,
      );
    }
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
