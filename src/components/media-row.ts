import { html, type CSSResultGroup, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js'
import {
  mdiClose,
  mdiArrowCollapseUp,
  mdiArrowUp,
  mdiArrowDown
} from '@mdi/js';
import styles from '../styles/media-row';
import { QueueItem } from '../const/player-queue';
import { QueueItemSelectedService, QueueService } from '../const/actions';
import { backgroundImageFallback } from '../utils/icons';
import { Icons } from '../const/common';

class MediaRow extends LitElement {
  @property({ attribute: false }) media_item!: QueueItem;
  @property({ type: Boolean }) selected = false;
  public removeService!: QueueService;
  public moveQueueItemNextService!: QueueService;
  public moveQueueItemUpService!: QueueService;
  public moveQueueItemDownService!: QueueService;
  public selectedService!: QueueItemSelectedService;
  public showAlbumCovers = true;
  
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
    this.selectedService(this.media_item.queue_item_id, this.media_item.media_content_id);
  }
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has('selected')) {
      return true;
    }
    if (_changedProperties.has('media_item')) {
      const oldItem: QueueItem = _changedProperties.get('media_item')!;
      return oldItem.media_title !== this.media_item.media_title
        || oldItem.media_artist !== this.media_item.media_artist
        || oldItem.media_image !== this.media_item.media_image
        || oldItem.playing !== this.media_item.playing
        || oldItem.show_action_buttons !== this.media_item.show_action_buttons
        || oldItem.show_move_up_next !== this.media_item.show_move_up_next
    }
    return true;
  }
  private renderThumbnail() {
    const played = !this.media_item.show_action_buttons  && !this.media_item.playing;
    if (this.media_item.media_image && this.showAlbumCovers) {
      return html`
        <span 
          class="thumbnail${played ? '-disabled' : ''}" 
          slot="start" 
          style=${backgroundImageFallback(this.media_item.media_image, Icons.CLEFT)}
        >
        </span>
      `
    }
    return html``
  }
  private renderTitle() {
    return html`
      <span 
        slot="headline" 
        class="title"
      >
        ${this.media_item.media_title}
      </span>
    `
  }
  private renderArtist() {
    if (this.media_item.show_artist_name) {
      return html`
        <span 
          slot="supporting-text" 
          class="title"
        >
          ${this.media_item.media_artist}
        </span>
      `
    }
    return html``
  }
  private renderActionButtons() {
    if (this.media_item.show_action_buttons) {
      return html`
        <span 
          slot="end"
          class="button-group"
        >
          ${this.renderMoveNextButton()}
          ${this.renderMoveUpButton()}
          ${this.renderMoveDownButton()}
          ${this.renderRemoveButton()}
        </span>
      `;
    }
    return html``
  }
      /* eslint-disable @typescript-eslint/unbound-method */
  private renderMoveNextButton() {
    if (this.media_item.show_move_up_next) {
      return html`
        <ha-icon-button 
          class="action-button"
          .path=${mdiArrowCollapseUp}
          @click=${this.callMoveItemNextService}>
        </ha-icon-button>
      `
    }
    return html``
  }
  private renderMoveUpButton() {
    if (this.media_item.show_move_up_next) {
      return html`
        <ha-icon-button 
          class="action-button"
          .path=${mdiArrowUp}
          @click=${this.callMoveItemUpService}>
        </ha-icon-button>
      `
    }
    return html``
  }
  private renderMoveDownButton() {
    return html`
      <ha-icon-button 
        class="action-button"
        .path=${mdiArrowDown}
        @click=${this.callMoveItemDownService}>
      </ha-icon-button>
    `    
  }
  private renderRemoveButton() {
    return html`
      <ha-icon-button 
        class="action-button"
        .path=${mdiClose}
        @click=${this.callRemoveItemService}>
      </ha-icon-button>
    `
  }

  render() {
    return html`
      <ha-md-list-item 
        class="button${this.media_item.playing ? '-active' : ''}"
		    @click=${this.callOnQueueItemSelectedService}
        type="button"
      >
        ${this.renderThumbnail()}
        ${this.renderTitle()}
        ${this.renderArtist()}
        ${this.renderActionButtons()}
      </ha-md-list-item>
      <div class="divider"</div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-player-media-row', MediaRow);