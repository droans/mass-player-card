import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Config, ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG, EntityConfig, HiddenElementsConfig } from "../config.js";
import { SelectorEntityFilters } from "./common/selector_entity.js";
import { DEFAULT_MAX_VOLUME } from "../../const/music-player.js";
import { ConfigElement, ConfigSectionUpdatedEventData, DetailBoolValEventData, DetailStrValEventData, DetailValEventData, ExtendedHass } from "../../const/common.js";

import './common/selector_entity';
import './common/selector_number';
import './common/selector_string';
import './common/hidden_elements';
import { MaterialExpressiveIcons } from "../../const/icons.js";
import { getTranslation } from "../../utils/translations.js";

const STUB_ENTITY_CONFIG: EntityConfig = {
  entity_id: '',
  volume_entity_id: '',
  max_volume: DEFAULT_MAX_VOLUME,
  name: '',
  hide: ENTITY_DEFAULT_HIDDEN_ITEM_CONFIG,
  inactive_when_idle: false
}


@customElement('mass-config-entities-editor')
class MassConfigEntitiesEditor extends LitElement {
  @property({ attribute: false }) entitiesConfig!: EntityConfig[];
  @property({ attribute: false }) host!: ConfigElement;
  private removeIcon = MaterialExpressiveIcons.REMOVE;
  private addIcon = MaterialExpressiveIcons.SPEAKER_MULTIPLE;

  private onPlayerEntitySelected = (ev: DetailStrValEventData, path: number) => {
    this.entitiesConfig[path].entity_id = ev.detail.value;
    this._fireUpdatedConfig();
  }
  private onVolumeEntitySelected = (ev: DetailStrValEventData, path: number) => {
    this.entitiesConfig[path].volume_entity_id = ev.detail.value;
    this._fireUpdatedConfig();
  }
  private onMaxVolumeChanged = (ev: DetailValEventData, path: number) => {
    this.entitiesConfig[path].max_volume = ev.detail.value;
    this._fireUpdatedConfig();
  }
  private onNameChanged = (ev: DetailStrValEventData, path: number) => {
    this.entitiesConfig[path].name = ev.detail.value;
    this._fireUpdatedConfig();
  }
  private onHideChanged = (ev: DetailStrValEventData, path: string) => {
    const _path = path.split('.');
    const idx = parseInt(_path[0]);
    const section = _path[1]
    const key = _path[2]
    this.entitiesConfig[idx].hide[section][key] = ev.detail.value;
    this._fireUpdatedConfig();
  }
  private onInactiveWhenIdleChanged = (ev: DetailBoolValEventData, path: number) => {
    this.entitiesConfig[path].inactive_when_idle = ev.detail.value;
    this._fireUpdatedConfig();
  }
  private onPlayerHiddenElementsToggle = (idx: number, path: string) => {
    this.entitiesConfig[idx].hide.player[path] = !this.entitiesConfig[idx].hide.player[path];
    this._fireUpdatedConfig();
  }
  private onQueueHiddenElementsToggle = (idx: number, path: string) => {
    this.entitiesConfig[idx].hide.queue[path] = !this.entitiesConfig[idx].hide.queue[path];
    this._fireUpdatedConfig();
  }
  private onBrowserHiddenElementsToggle = (idx: number, path: string) => {
    this.entitiesConfig[idx].hide.media_browser[path] = !this.entitiesConfig[idx].hide.media_browser[path];
    this._fireUpdatedConfig();
  }
  private onPlayersHiddenElementsToggle = (idx: number, path: string) => {
    this.entitiesConfig[idx].hide.players[path] = !this.entitiesConfig[idx].hide.players[path];
    this._fireUpdatedConfig();
  }

  private onRemoveEntity = (path: number) => {
    this.entitiesConfig.splice(path, 1);
    this._fireUpdatedConfig();
  }
  private onAddEntity = () => {
    this.entitiesConfig.push(STUB_ENTITY_CONFIG);
    this._fireUpdatedConfig();
  }

  private _fireUpdatedConfig() {
    const detail: ConfigSectionUpdatedEventData = {
      detail: {
        section: 'entities',
        config: this.entitiesConfig
      }
    }
    const event = new CustomEvent('mass-card-config', detail)
    this.host.dispatchEvent(event)
  }

  protected renderPlayerEntitySelector(
    path: number,
    entity_id: string | undefined = undefined) {
    const entityFilters: SelectorEntityFilters = {
      integration: 'music_assistant',
      domain: 'media_player'
    }
    return html`
      <mass-config-entity-selector
        label="Player Entity"
        required
        .filters=${entityFilters}
        .value=${entity_id ?? ``}
        .valueChangedFunction=${this.onPlayerEntitySelected}
        .path=${path}

      ></mass-config-entity-selector>
    `
  }
  protected renderVolumeEntitySelector(
    path: number,
    entity_id: string | undefined = undefined) {
    const entityFilters: SelectorEntityFilters = {
      domain: 'media_player'
    }
    return html`
      <mass-config-entity-selector
        id="volume-player"
        label="Volume Entity"
        required
        .filters=${entityFilters}
        .value=${entity_id ?? ``}
        .valueChangedFunction=${this.onVolumeEntitySelected}
        .path=${path}

      ></mass-config-entity-selector>
    `
  }
  protected renderMaxVolumeSelector(
    path: number,
    entityConfig: EntityConfig
  ) {
    return html`
     <mass-config-number-selector
      id="max-volume"
      label="Max Volume"
      min-val=0
      max-val=100
      unit="%"
      mode="box"
      .path=${path}
      .value=${entityConfig.max_volume}
      .valueChangedFunction=${this.onMaxVolumeChanged}
     ></mass-config-number-selector> 
    `
  }
  protected renderNameSelector(
    path: number,
    name: string | undefined = undefined
  ) {
    return html`
      <mass-config-entity-selector
        label="Name"
        required
        .value=${name ?? ``}
        .valueChangedFunction=${this.onNameChanged}
        .path=${path}

      ></mass-config-entity-selector>
    `
  }
  protected renderRemoveButton(path: number): TemplateResult {
    return html`
      <ha-button
        appearance="filled"
        variant="danger"
        size="small"
        @click=${ () => {this.onRemoveEntity(path)} }
      >
        <ha-svg-icon
          .path=${this.removeIcon}
          class="icon icon-remove"
          slot="start"
        ></ha-svg-icon>
        ${getTranslation("config.entities.remove", this.host.hass)}
      </ha-button>
    `
  }
  protected renderAddButton(): TemplateResult {
    return html`
      <ha-button
        appearance="filled"
        variant="brand"
        size="small"
        @click=${this.onAddEntity}
      >
        <ha-svg-icon
          .path=${this.addIcon}
          class="icon icon-add"
          slot="start"
        ></ha-svg-icon>
        ${getTranslation("config.entities.add", this.host.hass)}
      </ha-button>
    `
  }
  protected renderHiddenElements(hidden_elements_config: HiddenElementsConfig, path: number) {
    return html`
      <ha-expansion-panel
        class="panel-hidden-elements"
        header="Hide Elements"
      >
        <ha-expansion-panel
          class="panel-hidden-elements"
          header="Player"
        >
          <mass-config-player-hidden-elements-editor
            .elements=${hidden_elements_config.player}
            .hass=${this.host.hass}
            .onToggle=${(p: string) => { this.onPlayerHiddenElementsToggle(path, p)}}
            name=${path}
          >
          </mass-config-player-hidden-elements-editor>
        </ha-expansion-panel>
        
        <ha-expansion-panel
          class="panel-hidden-elements"
          header="Queue"
        >
          <mass-config-queue-hidden-elements-editor
            .elements=${hidden_elements_config.queue}
            .hass=${this.host.hass}
            .onToggle=${(p: string) => { this.onQueueHiddenElementsToggle(path, p)}}
            name=${path}
          >
          </mass-config-queue-hidden-elements-editor>
        </ha-expansion-panel>
        
        <ha-expansion-panel
          class="panel-hidden-elements"
          header="Music Browser"
        >
          <mass-config-browser-hidden-elements-editor
            .elements=${hidden_elements_config.media_browser}
            .hass=${this.host.hass}
            .onToggle=${(p: string) => { this.onBrowserHiddenElementsToggle(path, p)}}
            name=${path}
          >
          </mass-config-browser-hidden-elements-editor>
        </ha-expansion-panel>
        
        <ha-expansion-panel
          class="panel-hidden-elements"
          header="Player"
        >
          <mass-config-players-hidden-elements-editor
            .elements=${hidden_elements_config.players}
            .hass=${this.host.hass}
            .onToggle=${(p: string) => { this.onPlayersHiddenElementsToggle(path, p)}}
            name=${path}
          >
          </mass-config-players-hidden-elements-editor>
        </ha-expansion-panel>
      </ha-expansion-panel>
    `
  }
  protected renderEntityConfig(entityConfig: EntityConfig, path: number): TemplateResult {
    const entityFilters: SelectorEntityFilters = {
      integration: 'music_assistant',
      domain: 'media_player'
    }
    return html`
      <ha-expansion-panel
        class="entity-panel"
        header="Player: ${entityConfig?.name?.length ? entityConfig.name : this.host.hass.states[entityConfig.entity_id].attributes.friendly_name}"
      >
        <div id="entity">
          ${this.renderPlayerEntitySelector(path, entityConfig.entity_id)}
          <div class="entity-part-divider"></div>
          <div id="volume">
            ${this.renderVolumeEntitySelector(path, entityConfig.volume_entity_id)}
            ${this.renderMaxVolumeSelector(path, entityConfig)}
          </div>
          <div class="entity-part-divider"></div>
          ${this.renderNameSelector(path, entityConfig.name)}
          <div class="entity-part-divider"></div>
          <div class="div-hidden-elements">
            ${this.renderHiddenElements(entityConfig.hide, path)}
          </div>
          <div id="div-remove">
            ${this.renderRemoveButton(path)}
          </div>
          
        </div>
      </ha-expansion-panel>
    `
  }
  protected renderEntities() {
    return this.entitiesConfig.map(
      (item, idx) => {
        return html`
          ${this.renderEntityConfig(item, idx)}
        <div class="entity-divider"></div>
        `
      }
    )
  }
  protected render(): TemplateResult {
    return html`
      <ha-expansion-panel
        class="entity-panel"
        header="Entities"
      >
        <div id="entities">
          ${this.renderEntities()}
        </div>
        <div id="div-add">
          ${this.renderAddButton()}
        </div>
      </ha-expansion-panel>
    `
  }
  static get styles(): CSSResultGroup {
    return css`
      .entity-divider::before, .entity-part-divider::before {
        content: " ";
        display: block;
      }
      .entity-divider::before {
        height: 2px;
        background-color: var(--divider-color);
        margin-left: 8px;
        margin-right: 8px;
      }
      .entity-part-divider::before {
        height: 1px;
        background-color: var(--divider-color);
        margin-left: 8px;
        margin-right: 8px;
      }
      #div-remove {
        justify-self: end;
      }
      #div-add, #div-remove {
        padding: 8px;
      }
      #entities, #entity {
        display: grid;
        row-gap: 8px;
      }
      #max-volume {
        align-self: end;
        width: 25%;
      }
      #volume {
        display: flex;
        column-gap: 8px;
      }
      #volume-player {
        width: 100%;
        min-width: 100px;
      }
    `
  }
}