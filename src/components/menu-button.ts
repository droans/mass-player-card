import {
  CSSResultGroup,
  html,
  LitElement,
  TemplateResult,
} from "lit";
import {
  property,
} from "lit/decorators.js";

import { ServiceCustomEvent } from "../const/common";
import { ListItems } from "../const/media-browser";
import { consume } from "@lit/context";
import { useExpressiveContext } from "../const/context.js";
import styles from '../styles/menu-button';

class MassMenuButton extends LitElement {
  @property( { attribute: false }) public iconPath!: string;
  @property( { attribute: false }) private _items!: ListItems;
  @property( { type: Boolean, attribute: "fixedMenuPosition" }) public fixedMenuPosition!: boolean;
  @consume({ context: useExpressiveContext, subscribe: true }) private useExpressive!: boolean;
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
            .graphic=${item.icon}
          >
            <ha-svg-icon
              class="menu-list-item-svg ${this.useExpressive ? `svg-expressive` : ``}"
              part="menu-list-item-svg"
              slot="graphic"
              .path=${item.icon}
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
            class="${this.useExpressive ? `menu-expressive` : ``}"
            part="menu-select-menu"
            naturalMenuWidth
            ?fixedMenuPosition=${this.fixedMenuPosition}
            @selected=${this.onSelectAction}
          >
            <ha-svg-icon
              slot="icon"
              class="${this.useExpressive ? `svg-menu-expressive` : `svg-menu`}"
              part="menu-svg"
              .path=${this.iconPath}
            ></ha-svg-icon>
            ${this.renderMenuItems()}
            <slot></slot>
          </ha-control-select-menu>
        </div>
    `
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define('mass-menu-button', MassMenuButton);
