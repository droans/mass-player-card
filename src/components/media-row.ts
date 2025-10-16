import { consume } from '@lit/context';
import {
  html,
  type CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult
} from 'lit';
import { property, state } from 'lit/decorators.js'

import {
  QueueItemSelectedService,
  QueueService
} from '../const/actions';
import {
  ExtendedHass,
  Thumbnail
} from '../const/common';
import {
  activeEntityConf,
  EntityConfig,
  hassExt,
  IconsContext,
  mediaCardDisplayContext,
  playerQueueConfigContext,
  useExpressiveContext,
} from '../const/context';
import { QueueItem } from '../const/player-queue';

import styles from '../styles/media-row';

import {
  backgroundImageFallback,
  getFallbackBackgroundImage
} from '../utils/thumbnails';
import { queueItemhasUpdated, testMixedContent } from '../utils/util';
import { DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG, PlayerQueueHiddenElementsConfig, QueueConfig } from '../config/player-queue';
import { Icons } from '../const/icons.js';

class MediaRow extends LitElement {
  @property({ attribute: false }) media_item!: QueueItem;

  @consume({context: hassExt, subscribe: true})
  public hass!: ExtendedHass;
  @consume({ context: IconsContext}) private Icons!: Icons;

  @consume({ context: mediaCardDisplayContext, subscribe: true })
  @state()
  public display!: boolean;

  @consume({ context: useExpressiveContext})
  private useExpressive!: boolean;

  public moveQueueItemDownService!: QueueService;
  public moveQueueItemNextService!: QueueService;
  public moveQueueItemUpService!: QueueService;
  public removeService!: QueueService;
  public selectedService!: QueueItemSelectedService;
  public showAlbumCovers = true;

  private _config!: QueueConfig;
  private _entityConfig!: EntityConfig;
  private hide: PlayerQueueHiddenElementsConfig = DEFAULT_PLAYER_QUEUE_HIDDEN_ELEMENTS_CONFIG;
  
  @consume({ context: playerQueueConfigContext, subscribe: true})
  public set config(config: QueueConfig) {
    this._config = config;
    this.updateHiddenElements();
  }
  public get config() {
    return this._config;
  }

  @consume({ context: activeEntityConf, subscribe: true})
  public set entityConfig(config: EntityConfig) {
    this._entityConfig = config;
    this.updateHiddenElements();
  }
  public get entityConfig() {
    return this._entityConfig;
  }

  private updateHiddenElements() {
    if (!this.entityConfig || !this.config) {
      return;
    }
    const entity = this._entityConfig.hide.queue;
    const card = this._config.hide;
    this.hide = {
      album_covers: entity.album_covers || card.album_covers,
      artist_names: entity.artist_names || card.artist_names,
      action_buttons: entity.action_buttons || card.action_buttons,
      move_down_button: entity.move_down_button || card.move_down_button,
      move_next_button: entity.move_next_button || card.move_next_button,
      move_up_button: entity.move_up_button || card.move_up_button,
      remove_button: entity.remove_button || card.remove_button,
    }
  }
  private callMoveItemUpService(e: Event) {
    e.stopPropagation();
    this.moveQueueItemUpService(this.media_item.queue_item_id);
  }
  private callMoveItemDownService(e: Event) {
    e.stopPropagation();
    this.moveQueueItemDownService(this.media_item.queue_item_id);
  }
  private callMoveItemNextService(e: Event) {
    e.stopPropagation();
    this.moveQueueItemNextService(this.media_item.queue_item_id);
  }
  private callRemoveItemService(e: Event) {
    e.stopPropagation();
    this.removeService(this.media_item.queue_item_id);
  }
  private callOnQueueItemSelectedService() {
    this.selectedService(this.media_item.queue_item_id);
  }
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has('media_item')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const oldItem: QueueItem = _changedProperties.get('media_item')!;
      return queueItemhasUpdated(oldItem, this.media_item);
    }
    return true;
  }
  private artworkStyle() {
    const img = this.media_item.local_image_encoded ?? this.media_item.media_image ?? "";
    if (!testMixedContent(img)) {
      return getFallbackBackgroundImage(this.hass, Thumbnail.CLEFT);
    }
    return backgroundImageFallback(this.hass, img, Thumbnail.CLEFT);
  }
  private renderThumbnail(): TemplateResult {
    const played = !this.media_item.show_action_buttons  && !this.media_item.playing;
    const img = this.media_item.local_image_encoded ?? this.media_item.media_image;
    if (img && this.showAlbumCovers && !this.hide.album_covers) {
      return html`
        <span
          class="thumbnail${played ? '-disabled' : ''}"
          slot="start"
          style="${this.artworkStyle()}"
        >
        </span>
      `
    }
    return html``
  }
  private _calculateTitleWidth() {
    let button_ct = 0;
    const hide = this.config.hide;
    const media_item = this.media_item
    if (media_item.show_move_up_next && !hide.move_next_button) {
      button_ct += 1
    }
    if (media_item.show_move_up_next && !hide.move_up_button) {
      button_ct +=1
    }
    if (!hide.move_down_button) {
      button_ct += 1
    }
    if (!hide.remove_button) {
      button_ct += 1
    }
    if (button_ct == 0 || !media_item.show_action_buttons || hide.action_buttons) {
      return `100%`;
    }
    const gap_ct = button_ct - 1;
    return `calc(100% - ((32px * ${button_ct.toString()}) + (8px * ${gap_ct.toString()}) + 16px));`
  }
  private renderTitle(): TemplateResult {
    return html`
      <span
        slot="headline"
        class="title"
        style="width: ${this._calculateTitleWidth()}"
      >
        ${this.media_item.media_title}
      </span>
    `
  }
  private renderArtist(): TemplateResult {
    if (this.hide.artist_names) {
      return html``
    }
    return html`
      <span
        slot="supporting-text"
        class="title"
        style="width: ${this._calculateTitleWidth()}"
      >
        ${this.media_item.media_artist}
      </span>
    `
  }
  private renderActionButtons(): TemplateResult {
    if (this.hide.action_buttons || !this.media_item.show_action_buttons) {
      return html``
    };
    return html`
      <span
        slot="end"
        class="button-group"
        @click=${(e: Event) => {e.stopPropagation()}}
      >
        ${this.renderMoveNextButton()}
        ${this.renderMoveUpButton()}
        ${this.renderMoveDownButton()}
        ${this.renderRemoveButton()}
      </span>
    `;
  }
      /* eslint-disable @typescript-eslint/unbound-method */
  private renderMoveNextButton(): TemplateResult {
    if (this.hide.move_next_button || !this.media_item.show_move_up_next) {
      return html``
    };
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
        @click=${this.callMoveItemNextService}
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_PLAY_NEXT}
          class="svg-action-button ${this.useExpressive ? `svg-action-button-expressive` : ``}"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  private renderMoveUpButton(): TemplateResult {
    if (this.hide.move_up_button || !this.media_item.show_move_up_next) {
      return html``
    };
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
        @click=${this.callMoveItemUpService}
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_UP}
          class="svg-action-button ${this.useExpressive ? `svg-action-button-expressive` : ``}"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  private renderMoveDownButton(): TemplateResult {
    if (this.hide.move_down_button) {
      return html``
    };
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
        @click=${this.callMoveItemDownService}
      >
        <ha-svg-icon
          .path=${this.Icons.ARROW_DOWN}
          class="svg-action-button ${this.useExpressive ? `svg-action-button-expressive` : ``}"
        ></ha-svg-icon>
      </ha-button>
    `
  }
  private renderRemoveButton(): TemplateResult {
    if (this.hide.remove_button) {
      return html``
    };
    return html`
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="action-button ${this.useExpressive ? `action-button-expressive` : ``}"
          @click=${this.callRemoveItemService}
        >
        <ha-svg-icon
          .path=${this.Icons.CLOSE}
        class="svg-action-button ${this.useExpressive ? `svg-action-button-expressive` : ``}"
        ></ha-svg-icon>
      </ha-button>
    `
  }

  render(): TemplateResult {
    const playing = this.media_item.playing ? `-active` : ``;
    const expressive = this.useExpressive ? `button-expressive` : ``;
    return html`
        <ha-md-list-item
          style="${this.display? "" : "display: none;"}"
          class="button${playing} ${expressive}${playing}"
          @click=${this.callOnQueueItemSelectedService}
          type="button"
        >
          ${this.renderThumbnail()}
          ${this.renderTitle()}
          ${this.renderArtist()}
          ${this.renderActionButtons()}
        </ha-md-list-item>
        <div class="divider"></div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-player-media-row', MediaRow);