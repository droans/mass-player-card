import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import "./menu-button";
import styles from "../styles/player-selector-menu";
import { consume } from "@lit/context";
import {
  activeEntityConfigContext,
  entitiesConfigContext,
  EntityConfig,
  hassContext,
  IconsContext,
  musicPlayerConfigContext,
  useExpressiveContext,
} from "../const/context";
import { PlayerConfig } from "../config/player";
import { Icons } from "../const/icons";
import { ExtendedHass, ListItemData } from "../const/types";
import { customElement } from "lit/decorators.js";

@customElement("mpc-player-selector")
export class MassCardPlayerSelector extends LitElement {
  @consume({ context: musicPlayerConfigContext, subscribe: true })
  private config!: PlayerConfig;

  @consume({ context: activeEntityConfigContext, subscribe: true })
  private activeEntityConfig!: EntityConfig;

  @consume({ context: useExpressiveContext, subscribe: true })
  private useExpressive!: boolean;

  @consume({ context: IconsContext, subscribe: true })
  private Icons!: Icons;

  @consume({ context: entitiesConfigContext, subscribe: true })
  private playerEntities!: EntityConfig[];

  @consume({ context: hassContext, subscribe: true })
  private hass!: ExtendedHass;

  protected renderPlayerItems() {
    return this.playerEntities.map((item) => {
      const ent = this.hass.states[item.entity_id];
      if (!ent) {
        return;
      }
      const name =
        item.name.length > 0
          ? item.name
          : (ent.attributes.friendly_name ?? `Missing- ${item.entity_id}`);
      let url: string;
      let fallback: string;
      // eslint-disable-next-line unicorn/no-negated-condition
      if (ent.attributes.app_id != "music_assistant") {
        url = "";
        fallback = "";
      } else {
        url =
          ent.attributes.entity_picture_local ??
          ent.attributes.entity_picture ??
          "";
        fallback = ent.attributes.entity_picture ?? "";
      }
      const r: ListItemData = {
        option: item.entity_id,
        icon: this.Icons.SPEAKER,
        title: name,
        image: {
          url,
          fallback,
        },
      };
      return r;
    });
  }

  protected render(): TemplateResult {
    const config_hide = this.config.hide.player_selector;
    const entity_hide = this.activeEntityConfig.hide.player.player_selector;
    if (config_hide || entity_hide) {
      return html``;
    }
    return html`
      <mass-menu-button
        id="players-select-menu"
        class="menu-header ${this.useExpressive ? `expressive` : ``}"
        .iconPath=${this.Icons.SPEAKER}
        .initialSelection=${this.activeEntityConfig.entity_id}
        .items=${this.renderPlayerItems()}
        dividers
        use-md
        fixedMenuPosition
        naturalMenuWidth
      ></mass-menu-button>
    `;
  }

  static get styles(): CSSResultGroup {
    return styles;
  }
}
