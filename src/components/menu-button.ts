import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { property, state } from "lit/decorators.js";

import { TargetValEvent, TargetValEventData } from "../const/events";
import { ListItems } from "../const/media-browser";
import { consume } from "@lit/context";
import { useExpressiveContext } from "../const/context.js";
import styles from "../styles/menu-button";
import { jsonMatch } from "../utils/util.js";

class MassMenuButton extends LitElement {
  @property({ attribute: false }) public iconPath!: string;
  @property({ attribute: false }) private _items!: ListItems;
  @property({ type: Boolean, attribute: "fixedMenuPosition" })
  public fixedMenuPosition!: boolean;
  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;
  public onSelectAction!: TargetValEvent;
  @state() private _selectedItem!: string;
  private _initialSelection?: string;

  @property({ attribute: false })
  public set initialSelection(selection: string) {
    this._initialSelection = selection;
    this._selectedItem = selection;
  }
  public get initialSelection() {
    return this._initialSelection ?? ``;
  }
  public set items(items: ListItems) {
    if (jsonMatch(this._items, items)) {
      return;
    }
    this._items = items;
    if (!this._selectedItem) {
      this._selectedItem = items[0].option;
    }
  }
  public get items() {
    return this._items;
  }
  private onSelect = (ev: TargetValEventData) => {
    const val = ev.target.value;
    if (val == "") {
      return;
    }
    this._selectedItem = ev.target.value;
    this.onSelectAction(ev);
  };

  protected renderMenuItems(): TemplateResult | TemplateResult[] {
    if (!this.items) {
      return html``;
    }

    return this._items.map((item) => {
      return html`
        <ha-list-item
          class="menu-list-item ${this._selectedItem == item.option
            ? `selected-item`
            : `inactive-item`}${this.useExpressive ? `-expressive` : ``}"
          part="menu-list-item"
          .value="${item.option}"
          .graphic=${item.icon}
        >
          <ha-svg-icon
            class="menu-list-item-svg ${this.useExpressive
              ? `svg-expressive`
              : ``}"
            part="menu-list-item-svg"
            slot="graphic"
            .path=${item.icon}
          ></ha-svg-icon>
          ${item.title}
        </ha-list-item>
      `;
    });
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
          @selected=${this.onSelect}
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
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-menu-button", MassMenuButton);
