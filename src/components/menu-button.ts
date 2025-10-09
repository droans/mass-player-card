import {
  html,
  LitElement,
  TemplateResult,
} from "lit";
import {
  property,
} from "lit/decorators.js";

import { ServiceCustomEvent } from "../const/common";
import { ListItems } from "../const/media-browser";

class MassMenuButton extends LitElement {
  @property( { attribute: false }) public iconPath!: string;
  @property( { attribute: false }) private _items!: ListItems;
  public onSelectAction!: ServiceCustomEvent;

  public set items(items: ListItems) {
    this._items = items;
  }
  public get items() {
    return this._items;
  }
  protected renderMenuItems(): TemplateResult|TemplateResult[] {
    if (!this.items) {
      return html``
    }
    return this._items.map(
      (item) => {
        return html`
          <ha-list-item
            class="menu-list-item"
            part="menu-list-item"
            .value="${item.option}"
            .graphic=${item.thumbnail}
          >
            <ha-svg-icon
              class="menu-list-item-svg"
              part="menu-list-item-svg"
              slot="graphic"
              .path=${item.thumbnail}
            ></ha-svg-icon>
            ${item.title}
          </ha-list-item>
        `
      }
    )
  }

  protected render() {
    return html`
        <div id="menu-button" part="menu-button">
          <ha-control-select-menu
            id="menu-select-menu"
            part="menu-select-menu"
            naturalMenuWidth
            @selected=${this.onSelectAction}
          >
            <ha-svg-icon
              slot="icon"
              id="menu-svg"
              part="menu-svg"
              .path=${this.iconPath}
            ></ha-svg-icon>
            ${this.renderMenuItems()}
            <slot></slot>
          </ha-control-select-menu>
        </div>
    `
  }
}

customElements.define('mass-menu-button', MassMenuButton);
