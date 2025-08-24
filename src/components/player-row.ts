import { html, type CSSResultGroup, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js'
import { 
  PlayerSelectedService
} from '../types';
import styles from '../styles/media-row';
import { HassEntity } from 'home-assistant-js-websocket';

class PlayerRow extends LitElement {
  @property({ type: Boolean }) player_entity!: HassEntity;
  @property({ type: Boolean }) selected = false;
  public selectedService!: PlayerSelectedService;
  
  private callOnPlayerSelectedService() {
    this.selectedService(this.player_entity.entity_id);
  }
  protected shouldUpdate(_changedProperties: PropertyValues<this>): boolean {
    if (_changedProperties.has('selected')) {
      return true;
    }
    return true;
  }
  private renderThumbnail() {
    const thumbnail=this.player_entity?.attributes?.entity_picture;
    if (thumbnail) {
      return html`
        <img
          class="thumbnail"
          slot="start"
          src=${thumbnail}
        >
        </img>
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
        ${this.player_entity.attributes?.friendly_name}
      </span>
    `
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
      </ha-md-list-item>
    `
  }
    static get styles(): CSSResultGroup {
      return styles;
    }
}

customElements.define('mass-player-player-row', PlayerRow);