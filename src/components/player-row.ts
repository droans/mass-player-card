import { html, type CSSResultGroup, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js'
import styles from '../styles/player-row';
import { HassEntity } from 'home-assistant-js-websocket';
import { mdiLink, mdiLinkOff, mdiSwapHorizontal } from '@mdi/js';
import { backgroundImageFallback, getFallbackImage } from '../utils/icons';
import { Icon } from '../const/common';
import { 
  PlayerJoinService, 
  PlayerSelectedService, 
  PlayerTransferService, 
  PlayerUnjoinService 
} from '../const/actions';
import { testMixedContent } from '../utils/util';
import { HomeAssistant } from 'custom-card-helpers';

class PlayerRow extends LitElement {
  @property({ type: Boolean }) player_entity!: HassEntity;
  @property({ type: Boolean }) selected = false;
  @property({ type: Boolean }) joined = false;
  public hass!: HomeAssistant;
  public playerName!: string;
  public selectedService!: PlayerSelectedService;
  public joinService!: PlayerJoinService;
  public unjoinService!: PlayerUnjoinService;
  public transferService!: PlayerTransferService;
  public allowJoin = true;
  private callOnPlayerSelectedService() {
    this.selectedService(this.player_entity.entity_id);
  }
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has('selected')) {
      return true;
    }
    return true;
  }
  private onJoinPressed(e: Event) {
    e.stopPropagation()
    if (this.joined) {
      this.unjoinService(this.player_entity.entity_id);
      return;
    }
    this.joinService(this.player_entity.entity_id);
    this.joined = !this.joined;
  }
  private onTransferPressed(e: Event) {
    e.stopPropagation()
    this.transferService(this.player_entity.entity_id);
  }
  private artworkStyle() {
    const img: string = this.player_entity?.attributes?.entity_picture_local ?? "";
    if (!testMixedContent(img)) {
      return getFallbackImage(this.hass, Icon.HEADPHONES);
    }
    return backgroundImageFallback(this.hass, img, Icon.HEADPHONES);
  }
  private renderThumbnail() {
    return html`
      <span 
        class="thumbnail" 
        slot="start" 
        style="${this.artworkStyle()}"
      >
      </span>
    `
  }
  private renderTitle() {
    let title = this.playerName;
    if (!title.length) {
      title = this.player_entity.attributes?.friendly_name ?? "Media Player"
    };
    return html`
      <span 
        slot="headline" 
        class="title"
      >
        ${title}
      </span>
      <span slot="supporting-text">
      </span>
    `
  }

  /* eslint-disable @typescript-eslint/unbound-method */
  protected renderTransferButton() {
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="action-button"
        @click=${this.onTransferPressed}
      >
        <ha-svg-icon
          .path=${mdiSwapHorizontal}
          style="height: 1.5rem; width: 1.5rem;"
        ></ha-svg-icon>
    `
  }
  protected renderJoinButon() {
    if (!this.player_entity.attributes?.group_members || !this.allowJoin) {
      return;
    }
    return html`
      <ha-button
        appearance="plain"
        variant="brand"
        size="medium"
        class="action-button"
        @click=${this.onJoinPressed}
      >
        <ha-svg-icon
          .path=${this.joined ? mdiLinkOff : mdiLink}
          style="height: 1.5rem; width: 1.5rem;"
        ></ha-svg-icon>
    `
  }
  protected renderActionButtons() {
    if (!this.selected) {
      return html`
        <span
          slot="end"
          class="button-group"
        >
          ${this.renderJoinButon()}
          ${this.renderTransferButton()}
        </span>
      `;
    }
    return html``;
  }
  render() {
    return html`
      <ha-md-list-item 
        class="button${this.selected ? '-active' : ''}"
		    @click=${this.callOnPlayerSelectedService}
        type="button"
      >
        ${this.renderThumbnail()}
        ${this.renderTitle()}
        ${this.renderActionButtons()}
      </ha-md-list-item>
      <div class="divider"</div>
    `
  }
  /* eslint-enable @typescript-eslint/unbound-method */
    static get styles(): CSSResultGroup {
      return styles;
    }
}

customElements.define('mass-player-player-row', PlayerRow);