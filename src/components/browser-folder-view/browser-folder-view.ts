import { consume } from "@lit/context";
import { mdiFolder, mdiMusicNote, mdiRefresh } from "@mdi/js";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  FolderActions,
  FolderItem,
  folderItemName,
} from "../../actions/folder-actions";
import {
  HIDDEN_BUTTON_VALUE,
  MediaBrowserConfig,
  MediaBrowserHiddenElementsConfig,
} from "../../config/media-browser";
import {
  activeEntityIDContext,
  browserControllerContext,
  hassContext,
  IconsContext,
  mediaBrowserConfigContext,
  mediaBrowserHiddenElementsConfigContext,
} from "../../const/context";
import { EnqueueOptions } from "../../const/enums";
import { MenuButtonEventData } from "../../const/events";
import { Icons } from "../../const/icons";
import { EnqueueConfigMap, getEnqueueButtons } from "../../const/media-browser";
import { ExtendedHass } from "../../const/types";
import { MediaBrowserController } from "../../controller/browser";
import { getTranslation } from "../../utils/translations";
import "../button/button";
import "../menu-button/menu-button";

export interface FolderLocation {
  path: string;
  name: string;
}

@customElement("mpc-browser-folder-view")
export class BrowserFolderView extends LitElement {
  @property({ attribute: false }) location: FolderLocation = {
    path: "root",
    name: "Folders",
  };
  @property({ attribute: false }) onNavigate!: (
    location: FolderLocation,
  ) => void;
  @property({ attribute: false }) onMediaSelectedAction!: () => void;
  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass;
  @consume({ context: activeEntityIDContext, subscribe: true })
  @state()
  private entityId!: string;
  @consume({ context: browserControllerContext, subscribe: true })
  private controller!: MediaBrowserController;
  @consume({ context: mediaBrowserConfigContext, subscribe: true })
  private config!: MediaBrowserConfig;
  @consume({
    context: mediaBrowserHiddenElementsConfigContext,
    subscribe: true,
  })
  private hide!: MediaBrowserHiddenElementsConfig;
  @consume({ context: IconsContext, subscribe: true })
  private icons!: Icons;
  @state() private items: FolderItem[] = [];
  @state() private loading = false;
  @state() private error = "";
  private request = 0;

  protected updated(changed: PropertyValues) {
    if (changed.has("location") || changed.has("entityId")) {
      void this.load();
    }
  }

  private async load() {
    const request = ++this.request;
    this.loading = true;
    this.error = "";
    try {
      const items = await new FolderActions(this.hass).browse(
        this.entityId,
        this.location.path,
      );
      if (request == this.request) {
        this.items = items;
        this.renderRoot.querySelector(".list")?.scrollTo(0, 0);
      }
    } catch (error: unknown) {
      if (request == this.request) {
        this.error = error instanceof Error ? error.message : String(error);
      }
    } finally {
      if (request == this.request) {
        this.loading = false;
      }
    }
  }

  private retry = () => {
    void this.load();
  };

  private async enqueue(item: FolderItem, option: EnqueueOptions) {
    this.error = "";
    try {
      await new FolderActions(this.hass).enqueue(
        this.entityId,
        item,
        option,
        this.controller.massUser,
      );
    } catch (error: unknown) {
      this.error = error instanceof Error ? error.message : String(error);
    }
  }

  private select = (event: Event) => {
    const item = this.itemFromEvent(event);
    if (!item || item.available === false) {
      return;
    }
    if (
      item.media_type == "folder" &&
      this.config.folders.show_collection_view
    ) {
      this.onNavigate({ path: item.path ?? item.uri, name: item.name });
    } else {
      void this.enqueue(
        item,
        EnqueueConfigMap[this.config.default_enqueue_option],
      );
      this.onMediaSelectedAction();
    }
  };

  private itemFromEvent(event: Event) {
    const index = (event.currentTarget as HTMLElement).dataset.index;
    return index === undefined ? undefined : this.items[Number(index)];
  }

  private menuSelected = (event: MenuButtonEventData) => {
    event.stopPropagation();
    const item = this.itemFromEvent(event);
    if (item) {
      void this.enqueue(item, event.detail.option as EnqueueOptions);
    }
  };

  /* eslint-disable unicorn/template-indent */
  protected render() {
    const buttons = getEnqueueButtons(this.icons, this.hass).filter(
      (button) => {
        const key = HIDDEN_BUTTON_VALUE[button.option] as
          keyof MediaBrowserHiddenElementsConfig | undefined;
        return !key || !this.hide[key];
      },
    );
    return html`
      ${
        this.error
          ? html`<div role="alert" class="status">
              ${this.error}
              <mpc-button
                .onPressService=${this.retry}
                title=${getTranslation("browser.folders.retry", this.hass)}
                role="plain"
                size="small"
              >
                <ha-svg-icon .path=${mdiRefresh}></ha-svg-icon>
              </mpc-button>
            </div>`
          : html``
      }
      ${
        this.loading
          ? html`<div role="status" class="status">
              ${getTranslation("browser.loading", this.hass)}
            </div>`
          : html`<div class="list" aria-label=${this.location.name}>
              ${this.items.length === 0 ? html`<div class="status">${getTranslation("browser.folders.empty", this.hass)}</div>` : html``}
              ${this.items.map(
                (item, index) =>
                  html` <div class="row">
                    <button
                      class="item"
                      data-index=${index}
                      @click=${this.select}
                      ?disabled=${item.available === false}
                    >
                      <ha-svg-icon
                        .path=${item.media_type == "folder" ? mdiFolder : mdiMusicNote}
                      ></ha-svg-icon>
                      <span title=${folderItemName(item)}
                        >${folderItemName(item)}</span
                      >
                    </button>
                    ${
                      this.hide.enqueue_menu || item.available === false
                        ? html``
                        : html` <mpc-menu-button
                            data-index=${index}
                            .iconPath=${this.icons.OVERFLOW}
                            .items=${buttons}
                            @menu-item-selected=${this.menuSelected}
                            fixedMenuPosition
                            naturalMenuWidth
                            scheme="plain"
                            elevation="0"
                          ></mpc-menu-button>`
                    }
                  </div>`,
              )}
            </div>`
      }
    `;
  }

  /* eslint-enable unicorn/template-indent */
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
      color: var(--primary-text-color);
    }
    .list {
      overflow: auto;
      min-height: 0;
    }
    .row {
      display: flex;
      align-items: center;
      min-height: 52px;
      border-bottom: 1px solid var(--divider-color);
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
      min-height: 52px;
      padding: 8px 12px;
      color: inherit;
      background: transparent;
      border: 0;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .item:hover {
      background: var(--secondary-background-color);
    }
    .item:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .item span {
      overflow-wrap: anywhere;
      min-width: 0;
    }
    ha-svg-icon {
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      color: var(--secondary-text-color);
    }
    mpc-menu-button {
      flex: 0 0 44px;
    }
    .status {
      padding: 16px;
      overflow-wrap: anywhere;
    }
  `;
}
