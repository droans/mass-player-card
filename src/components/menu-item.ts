import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import styles from '../styles/menu-item';
import { customElement, property, state } from "lit/decorators.js";
import { ListImageData, ListItemData } from "../const/common.js";

@customElement('mpc-menu-item')
export class MassMenuItem extends LitElement {
  private _menuItem!: ListItemData;

  // Image/Icon Element
  @state() imgOrIconTemplate!: TemplateResult;
  
  // Add a divider
  @property({ attribute: 'divider', type: Boolean }) public divider = false;
  
  // Use Expressive Design tokens
  @property({ attribute: 'expressive', type: Boolean }) public expressive = false;

  // Use ha-md-list-item instead of ha-list-item
  @property({ attribute: 'use-md', type: Boolean }) public useMD = false;

  // Sets the list item class to "selected-item"
  @property({ attribute: 'selected', type: Boolean}) selected = false;

  @property({ attribute: false })
  public set menuItem(item: ListItemData) {
    this._menuItem = item;
    void this.setImageOrIconElement();
  }
  public get menuItem() {
    return this._menuItem;
  }
  private async setImageOrIconElement() {
    this.imgOrIconTemplate = await this.renderIconOrImage()
  }

  protected onSelection = () => {
    const detail = {option: this.menuItem.option}
    const event = new CustomEvent('menu-item-selected', {detail: detail, bubbles: true, composed: true})
    this.dispatchEvent(event)
  }

  protected renderIcon(): TemplateResult {
    const expressive_class = this.expressive ? `expressive` : ``;
    const selected_class = this.selected ? `selected` : ``;
    const slot = this.useMD ? `start` : `graphic`
    return html`
      <ha-svg-icon
        class="menu-list-item-svg ${expressive_class} ${selected_class}"
        part="menu-list-item-svg"
        slot="${slot}"
        .path=${this.menuItem.icon}
      ></ha-svg-icon>
    `
  }
  protected renderImage(src: string): TemplateResult {
    const slot = this.useMD ? `start` : `graphic`
    const expressive_class = this.expressive ? `expressive` : ``
    return html`
      <img
        class="menu-list-item-image ${expressive_class}"
        part="menu-list-item-image"
        src="${src}"
        slot="${slot}"
      >
    `
  }
  private async tryPrefetchImage(image_url: string): Promise<string | boolean> {
    if (!image_url?.length || image_url.length < 10) {
      return false;
    }
    try {
      const response = await fetch(image_url)
      if (!response.ok) {
        return false
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch {
      return false
    }
  }
  protected async renderImageFallbackOrIcon(): Promise<TemplateResult> {
    const img_data = this.menuItem.image as ListImageData;
    const def_img_src = await this.tryPrefetchImage(img_data.url);
    if (typeof(def_img_src) == 'string') {
      return this.renderImage(def_img_src)
    }
    
    const fallback_img_src = this.tryPrefetchImage(img_data.fallback);
    if (typeof(fallback_img_src) == 'string') {
      return this.renderImage(fallback_img_src)
    }
    return this.renderIcon()
  }
  protected async renderIconOrImage(): Promise<TemplateResult> {
    if (this.menuItem?.image) {
      return await this.renderImageFallbackOrIcon()
    }
    return this.renderIcon()
  }

  protected renderDivider(): TemplateResult {
    if (!this.divider) {
      return html``
    }
    return html`
      <div class="divider"></div>
    `
  }

  protected renderMD(): TemplateResult {
    const expressive_class = this.expressive ? `expressive` : ``;
    const selected_class = this.selected ? `selected` : ``;
    const itm = this.menuItem;
    return html`
      <ha-md-list-item
        class="menu-list-item-md ${expressive_class} ${selected_class}" 
        type="button"
        @click=${this.onSelection}
      >
        ${this.imgOrIconTemplate}
        <span
          slot="headline"
          class="title-md ${expressive_class} ${selected_class}"
        >
          ${itm.title}
        </span>
      </ha-md-list-item>
    `
  }
  protected renderMWC(): TemplateResult {
    const expressive_class = this.expressive ? `expressive` : ``;
    const selected_class = this.selected ? `selected` : ``;
    const itm = this.menuItem;
    return html`
      <ha-list-item
        class="menu-list-item ${expressive_class} ${selected_class}"
        part="menu-list-item"
        .value="${itm.option}"
        graphic="icon"
        @click=${this.onSelection}
      >
        ${this.imgOrIconTemplate}
        <span class="title ${expressive_class} ${selected_class}">
          ${itm.title}
        </span>
      </ha-list-item>
    `
  }
  protected render(): TemplateResult {
    return html`
      ${this.useMD ? this.renderMD() : this.renderMWC()}
      ${this.renderDivider()}
    `
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}