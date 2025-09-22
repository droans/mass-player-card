import { html, LitElement } from "lit";
import { ListItems } from "../const/media-browser";
import { MenuButtonSelectAction } from "../const/common";

class MassMenuButton extends LitElement {
  public iconPath!: string;
  public onSelectAction!: MenuButtonSelectAction;
  private _items!: ListItems;
  public set items(items: ListItems) {
    this._items = items;
  }
  public get items() {
    return this._items;
  }
  protected renderMenuItems() {
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
              class="menu-list-item-svg"
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
          part="menu-select-menu"
          fixedMenuPosition
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
        </ha-control-select-menu>
      </div>
    `
  }
}

customElements.define('mass-menu-button', MassMenuButton);
