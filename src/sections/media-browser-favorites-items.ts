import { html, LitElement, TemplateResult } from "lit";
import { MediaTypes } from "../const";
import { state } from "lit/decorators";
import { FavoriteItems, MediaBrowserItem } from "../types";
import { HomeAssistant } from "custom-card-helpers";
import MediaBrowserActions from "../actions/browser-actions";
import '../components/browser-item'
import { keyed } from "lit/directives/keyed";

class MediaBrowserFavoritesList extends LitElement {
  @state() private _code!: TemplateResult;
  private _media_items!: MediaBrowserItem[];
  private actions!: MediaBrowserActions;
  private _media_type!: MediaTypes;
  private _hass!: HomeAssistant;
  private _player_entity!: string;

  public set mediaType(mediaType: MediaTypes) {
    if (!mediaType) {
      return;
    }
    this._media_type = mediaType;
    this.setupIfReady()
  }
  public set playerEntity(playerEntity: string) {
    if (!playerEntity) {
      return;
    } 
    this._player_entity = playerEntity;
    this.setupIfReady()
  }
  private setupIfReady() {
    if (
      !this._media_items
      || !this._hass
      || this.actions
    ) {
      return;
    }
    this.actions = new MediaBrowserActions(this._hass);
    this.updateCode();
  }
  private onItemSelectedAction = async (content_id: string, content_type: string) => {
    await this.actions.actionPlayMedia(this._player_entity, content_id, content_type);
  }
  private updateCode() {
    this.getFavorites();
    const items_code = this._media_items.map(
      (item) => {
        return keyed(
          item.uri,
          html`
            <mass-browser-item
              .mediaItem=${item}
              .onSelectAction=${this.onItemSelectedAction}
            >
            </mass-browser-item>
          `
        )
      }
    )
    const code = html`
      <div class="favorites">
        ${items_code}
      </div>
    `
    this._code = code;
  }
  private getFavorites() {
    this.actions.actionGetFavorites(this._player_entity, this._media_type).then( 
      (result) => {
        this._media_items = result;
      }
    );
  }
  protected render() {
    return this._code;
  }
}
customElements.define('mass-favorites-card', MediaBrowserFavoritesList);
