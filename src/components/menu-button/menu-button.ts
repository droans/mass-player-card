import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { property, query, state } from "lit/decorators.js";

import { ListItems } from "../../const/types";
import { consume } from "@lit/context";
import {
  controllerContext,
  useExpressiveContext,
  useVibrantContext,
} from "../../const/context";
import styles from "./menu-button-styles";
import { jsonMatch } from "../../utils/utility";
import { MassCardController } from "../../controller/controller";
import "./menu-item";
import { ControlSelectMenuElement } from "../../const/elements";

export class MassMenuButton extends LitElement {
  @property({ attribute: false }) public iconPath!: string;

  @property({ attribute: false }) private _items?: ListItems;

  @property({ type: Boolean, attribute: "fixedMenuPosition" })
  public fixedMenuPosition = false;

  @property({ type: Boolean, attribute: "dividers" })
  public dividers = false;

  @property({ type: Boolean, attribute: "use-md" })
  public useMD = false;

  @property({ type: Number, attribute: "elevation" }) elevation = 0;

  @query("#menu-select-menu")
  public menuElement?: ControlSelectMenuElement;

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;

  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant!: boolean;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @state() private _selectedItem!: string;
  private _initialSelection?: string;

  // Need to remove gap from the select-anchor div
  private gapReset = false;

  @property({ attribute: false })
  public set initialSelection(selection: string) {
    this._initialSelection = selection;
    this._selectedItem = selection;
  }
  public get initialSelection() {
    return this._initialSelection ?? ``;
  }

  public set items(items: ListItems | undefined) {
    if (jsonMatch(this._items, items)) {
      return;
    }
    if (!items) {
      return;
    }
    this._items = items;
    if (!this._selectedItem) {
      this._selectedItem = items[0].option;
    }
  }
  public get items() {
    return this._items ?? [];
  }

  private attemptGapReset() {
    const anchor =
      this.menuElement?.shadowRoot?.querySelector(".select-anchor");
    if (!anchor) {
      return;
    }
    (anchor as HTMLElement).style.gap = "unset";
    this.gapReset = true;
  }

  private onSelect = (event_: CustomEvent) => {
    event_.stopPropagation();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = { detail: event_.detail };
    const _event = new CustomEvent("menu-item-selected", data);
    this.dispatchEvent(_event);
    if (!this.menuElement) {
      return;
    }
    this.menuElement.menuOpen = false;
  };

  protected renderMenuItems(): TemplateResult | TemplateResult[] {
    if (!this.items?.length) {
      return html``;
    }
    const ct = this.items.length;
    return this.items.map((item, idx) => {
      const use_dividers = idx < ct - 1 && this.dividers;
      return html`
        <mpc-menu-item
          class="menu-items"
          ?divider=${use_dividers}
          ?expressive=${this.useExpressive}
          ?vibrant=${this.useVibrant}
          ?selected=${this._selectedItem == item.option}
          .menuItem=${item}
          ?use-md=${this.useMD}
        ></mpc-menu-item>
      `;
    });
  }

  protected render() {
    const expressive_class = this.useExpressive ? `menu-expressive` : ``;
    const vibrant_class = this.useVibrant ? `vibrant` : ``;
    return html`
      <div id="menu-button" part="menu-button">
        <ha-control-select-menu
          id="menu-select-menu"
          class="${expressive_class} ${vibrant_class}"
          part="menu-select-menu"
          naturalMenuWidth
          @menu-item-selected=${this.onSelect}
          ?fixedMenuPosition=${this.fixedMenuPosition}
          @click=${(event_: Event) => {
            event_.stopPropagation();
          }}
        >
          <div class="div-icon" slot="icon" part="div-icon">
            <ha-svg-icon
              class="svg-menu ${this.useExpressive ? `expressive` : ``}"
              part="menu-svg"
              .path=${this.iconPath}
            ></ha-svg-icon>
          </div>
          ${this.renderMenuItems()}
          <slot></slot>
        </ha-control-select-menu>
      </div>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0;
  }

  protected updated(): void {
    if (!this.gapReset) {
      this.attemptGapReset();
    }
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}

customElements.define("mass-menu-button", MassMenuButton);
