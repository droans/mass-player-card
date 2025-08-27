import { html, type CSSResultGroup, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js'
import { 
  PlayerJoinService,
  PlayerSelectedService,
  PlayerTransferService,
  PlayerUnjoinService
} from '../types';
import styles from '../styles/player-row';
import { HassEntity } from 'home-assistant-js-websocket';
import { mdiLink, mdiLinkOff, mdiSwapHorizontal } from '@mdi/js';

class PlayerRow extends LitElement {
  @property({ type: Boolean }) player_entity!: HassEntity;
  @property({ type: Boolean }) selected = false;
  @property({ type: Boolean }) joined = false;

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
  private renderThumbnail() {
    const thumbnail=this.player_entity?.attributes?.entity_picture;
    return html`
      <span 
        class="thumbnail" 
        slot="start" 
        style="background-image: url(${thumbnail})"
      >
      </span>
    `
  }
  private renderTitle() {
    const title = this.player_entity.attributes?.friendly_name ?? "Media Player";
    return html`
      <span 
        slot="headline" 
        class="title"
      >
        ${title}
      </span>
    `
  }

  /* eslint-disable @typescript-eslint/unbound-method */
  protected renderTransferButton() {
    return html`
      <ha-icon-button
        class="action-button"
        .path=${mdiSwapHorizontal}
        @click=${this.onTransferPressed}
      >
      </ha-icon-button>
    `
  }
  protected renderJoinButon() {
    if (!this.player_entity.attributes?.group_members || !this.allowJoin) {
      return;
    }
    return html`
      <ha-icon-button
        class="action-button"
        .path=${this.joined ? mdiLinkOff : mdiLink}
        @click=${this.onJoinPressed}
      >
      </ha-icon-button>
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
    `
  }
  /* eslint-enable @typescript-eslint/unbound-method */
    static get styles(): CSSResultGroup {
      return styles;
    }
}

customElements.define('mass-player-player-row', PlayerRow);