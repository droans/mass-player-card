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
import { backgroundImageFallback, getFallbackImage } from '../utils/icons';
import { ExtendedHass, Icon } from '../const/common';
import { testMixedContent } from '../utils/util';

class MediaRow extends LitElement {
  @property({ attribute: false }) media_item!: QueueItem;
  @property({ type: Boolean }) selected = false;
  public hass!: ExtendedHass;
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  private artworkStyle() {
    const img = this.media_item.media_image || "";
    if (!testMixedContent(img)) {
      return getFallbackImage(this.hass, Icon.CLEFT);
    }
    return backgroundImageFallback(this.hass, img, Icon.CLEFT);
  }
  private renderThumbnail() {
    const played = !this.media_item.show_action_buttons  && !this.media_item.playing;
    if (this.media_item.media_image && this.showAlbumCovers) {
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
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="action-button"
          @click=${this.callMoveItemNextService}
        >
          <ha-svg-icon
            .path=${mdiArrowCollapseUp}
            style="height: 1.5rem; width: 1.5rem;"
          ></ha-svg-icon>
        </ha-button>
      `
    }
    return html``
  }
  private renderMoveUpButton() {
    if (this.media_item.show_move_up_next) {
      return html`
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="action-button"
          @click=${this.callMoveItemUpService}
        >
          <ha-svg-icon
            .path=${mdiArrowUp}
            style="height: 1.5rem; width: 1.5rem;"
          ></ha-svg-icon>
        </ha-button>
      `
    }
    return html``
  }
  private renderMoveDownButton() {
    return html`
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="action-button"
          @click=${this.callMoveItemDownService}
        >
          <ha-svg-icon
            .path=${mdiArrowDown}
            style="height: 1.5rem; width: 1.5rem;"
          ></ha-svg-icon>
        </ha-button>
    `    
  }
  private renderRemoveButton() {
    return html`
        <ha-button
          appearance="plain"
          variant="brand"
          size="medium"
          class="action-button"
          @click=${this.callRemoveItemService}
        >
          <ha-svg-icon
            .path=${mdiClose}
            style="height: 1.5rem; width: 1.5rem;"
          ></ha-svg-icon>
        </ha-button>
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