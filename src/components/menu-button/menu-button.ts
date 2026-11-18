import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { consume } from "@lit/context";
import { controllerContext, useVibrantContext } from "../../const/context";
import { ControlSelectMenuElement } from "../../const/elements";
import { ListItems } from "../../const/types";
import { MassCardController } from "../../controller/controller";
import { jsonMatch } from "../../utils/utility";
import styles from "./menu-button-styles";
import "./menu-item";

export type MenuButtonScheme = "filled" | "tonal" | "standard" | "plain";
export type MenuPlacement =
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "top-start"
  | "top"
  | "top-end"
  | "left-start"
  | "left"
  | "left-end"
  | "right-start"
  | "right"
  | "right-end";
const DEFAULT_SCHEME: MenuButtonScheme = "filled";

@customElement("mpc-menu-button")
export class MassMenuButton extends LitElement {
  @property({ attribute: false }) public iconPath!: string;
  @property({ attribute: "placement", type: String }) placement: MenuPlacement =
    "bottom-start";

  @property({ attribute: false }) private _items?: ListItems;

  @property({
    attribute: "scheme",
    type: String,
    default: DEFAULT_SCHEME,
    reflect: true,
  })
  scheme: MenuButtonScheme = DEFAULT_SCHEME;

  @property({ type: Boolean, attribute: "fixedMenuPosition" })
  public fixedMenuPosition = false;

  @property({ type: Boolean, attribute: "dividers" })
  public dividers = false;

  @property({ type: Boolean, attribute: "use-md" })
  public useMD = false;

  @property({ type: Number, attribute: "elevation", default: 1, reflect: true })
  elevation = 1;

  @property({ type: Boolean, default: false, reflect: true })
  outlined = false;

  @query("#menu-select-menu")
  public menuElement?: ControlSelectMenuElement;

  @consume({ context: useVibrantContext, subscribe: true })
  private useVibrant!: boolean;

  @consume({ context: controllerContext, subscribe: true })
  private controller!: MassCardController;

  @state() private _selectedItem!: string;
  private _initialSelection?: string;

  // Need to remove gap from the select-anchor div
  private gapReset = false;
  private interval!: number | undefined;

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
    if (!this.interval) {
      return;
    }
    if (this.gapReset) {
      window.clearInterval(this.interval);
      this.interval = undefined;
      return;
    }
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
    this.menuElement.open = false;
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
          ?vibrant=${this.useVibrant}
          ?selected=${this._selectedItem == item.option}
          .menuItem=${item}
          ?use-md=${this.useMD}
          ?disabled=${item.disabled}
        ></mpc-menu-item>
      `;
    });
  }

  protected render() {
    const vibrant_class = this.useVibrant ? `vibrant` : ``;
    return html`
      <div id="menu-button" part="menu-button">
        <ha-dropdown
          id="menu-select-menu"
          class="${vibrant_class}"
          part="menu-select-menu"
          naturalMenuWidth
          placement="${this.placement}"
          @menu-item-selected=${this.onSelect}
          ?fixedMenuPosition=${this.fixedMenuPosition}
          @click=${(event_: Event) => {
            event_.stopPropagation();
          }}
        >
          <mpc-button
            slot="trigger"
            part="div-icon"
            role="variant"
            elevation="${this.elevation}"
            ?outlined=${this.outlined}
            style="display: block; height: 100%;"
          >
            <ha-svg-icon
              class="svg-menu"
              part="menu-svg"
              .path=${this.iconPath}
            ></ha-svg-icon>
          </mpc-button>
          ${this.renderMenuItems()}
          <slot></slot>
        </ha-dropdown>
      </div>
    `;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0 || !this.gapReset;
  }

  protected firstUpdated() {
    if (!this.gapReset) {
      this.interval = window.setInterval(() => {
        this.attemptGapReset();
      }, 20);
    }
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.interval) {
      window.clearInterval(this.interval);
      this.interval = undefined;
    }
  }
  static get styles(): CSSResultGroup {
    return styles;
  }
}
