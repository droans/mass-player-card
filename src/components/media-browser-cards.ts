import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import './media-card'
import { MediaCardData, MediaCardItem } from "../const/media-browser";
import { CardSelectedService } from "../const/actions";
import { state } from "lit/decorators.js";
import styles from '../styles/media-browser-cards';

class MediaBrowserCards extends LitElement {
  public onSelectAction!: CardSelectedService;
  private _items!: MediaCardItem[];
  @state() private code!: TemplateResult;

  public set items(items: MediaCardItem[]) {
    if (!items || !items.length) {
      return;
    }
    this._items = items;
    this.generateCode();
  }
  public get items() {
    return this._items;
  }
  private onItemSelected = (data: MediaCardData) => {
    this.onSelectAction(data);
  }
  private generateCode() {
    const result = this.items.map(
      (item) => {
        return html`
          <mass-media-card
            .config=${item}
            .onSelectAction=${this.onItemSelected}
          >
          </mass-media-card>
        `
      }
    )
    this.code = html`
      <ha-card>
        <div class="icons">
          ${result}
        </div>
      </ha-card>
    `
  }

  protected render() {
    return this.code;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
customElements.define('mass-browser-cards', MediaBrowserCards);
