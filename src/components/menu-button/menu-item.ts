import { consume } from "@lit/context";
import {
  CSSResultGroup,
  html,
  LitElement,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { hassUpdatedContext } from "../../const/context";
import { ExtendedHass, ListItemData } from "../../const/types";
import { tryPrefetchImageWithFallbacks } from "../../utils/utility";
import styles from "./menu-item-styles";

@customElement("mpc-menu-item")
export class MassMenuItem extends LitElement {
  private _menuItem!: ListItemData;

  @consume({ context: hassUpdatedContext, subscribe: false })
  private hass!: ExtendedHass;
  // Valid Image Path
  @state() imgPath?: string;

  // Add a divider
  @property({ attribute: "divider", type: Boolean }) public divider = false;

  // Use Vibrant Expressive scheme
  @property({ attribute: "vibrant", type: Boolean }) public vibrant = false;

  // Sets the list item class to "selected-item"
  @property({ attribute: "selected", type: Boolean }) selected = false;

  // Sets the item as disabled
  @property({ type: Boolean }) disabled = false;

  @query("ha-dropdown-item") dropdownItem?: HTMLElement;

  @property({ attribute: false })
  public set menuItem(item: ListItemData) {
    this._menuItem = item;
    this.setImageOrIconElement();
  }
  public get menuItem() {
    return this._menuItem;
  }
  private setImageOrIconElement() {
    this.getImagePath();
  }

  private getImageCallback = (source: string | false) => {
    this.imgPath = typeof source == "string" ? source : undefined;
  };

  private getImagePath() {
    const imageData = this.menuItem.image;
    const defaultImage = imageData?.url;
    const fallback = imageData?.fallback;
    if (defaultImage?.length ?? fallback?.length) {
      void tryPrefetchImageWithFallbacks(
        defaultImage ?? (fallback as string),
        [fallback ?? (defaultImage as string)],
        this.hass,
      ).then((source) => {
        this.getImageCallback(source as string | false);
      });
    }
  }

  protected onSelection = () => {
    if (this.disabled) {
      return;
    }
    const detail = { option: this.menuItem.option };
    const event = new CustomEvent("menu-item-selected", {
      detail,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  };

  private hasExtraStyles(): boolean {
    const styleElement = this.dropdownItem?.shadowRoot?.querySelector("style");
    return !!styleElement;
  }

  private checkAndRemoveExtraStyles() {
    const styleElement = this.dropdownItem?.shadowRoot?.querySelector("style");
    if (styleElement) {
      styleElement.remove();
    }
  }

  protected renderIcon(): TemplateResult {
    const vibrantClass = this.vibrant ? `vibrant` : ``;
    const selectedClass = this.selected ? `selected` : ``;
    return html`
      <ha-svg-icon
        class="menu-list-item-svg ${vibrantClass} ${selectedClass}"
        part="menu-list-item-svg"
        slot="icon"
        .path=${this.menuItem.icon}
      ></ha-svg-icon>
    `;
  }
  protected renderImage(): TemplateResult {
    return html`
      <img
        class="menu-list-item-image"
        part="menu-list-item-image"
        src="${this.imgPath}"
        slot="icon"
        loading="lazy"
      />
    `;
  }

  protected renderImageOrIcon(): TemplateResult {
    if (this.imgPath) {
      return this.renderImage();
    }
    return this.renderIcon();
  }
  protected renderDivider(): TemplateResult {
    if (!this.divider) {
      return html``;
    }
    return html` <div class="divider"></div> `;
  }

  protected render(): TemplateResult {
    const vibrantClass = this.vibrant ? `vibrant` : ``;
    const selectedClass = this.selected ? `selected` : ``;
    const itm = this.menuItem;
    return html`
      <ha-dropdown-item
        class="menu-list-item-md ${vibrantClass} ${selectedClass}"
        type="button"
        @click=${this.onSelection}
        ?disabled=${this.disabled}
      >
        ${this.renderImageOrIcon()}
        <div class="title">${itm.title}</div>
      </ha-dropdown-item>
      ${this.renderDivider()}
    `;
  }

  protected updated() {
    if (this.hasExtraStyles()) {
      this.checkAndRemoveExtraStyles();
    }
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
  protected shouldUpdate(_changedProperties: PropertyValues): boolean {
    return _changedProperties.size > 0 || this.hasExtraStyles();
  }
}
