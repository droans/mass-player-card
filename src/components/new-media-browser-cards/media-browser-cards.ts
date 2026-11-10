import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./media-card";

import { mediaCardData, MediaCardItem } from "../../const/types";

import { jsonMatch } from "../../utils/utility";
import { literal } from "lit/static-html.js";
import { EnqueueOptions } from "../../const/enums";
import { CardEnqueueService, CardSelectedService } from "../../const/actions";
import styles from "./media-browser-cards-styles";
import { consume } from "@lit/context";
import { IconsContext } from "../../const/context";
import { Icons } from "../../const/icons";
import { flow } from "@lit-labs/virtualizer/layouts/flow.js";

export type SectionType = "favorite" | "recent" | "recommendation";

@customElement("mpc-browser-cards")
export class MediaBrowserCards extends LitElement {
  @property({ attribute: "title" }) title!: string;
  @property({ attribute: "id" }) id!: string;
  @property({ attribute: "direction", type: String })
  direction: "horizontal" | "vertical" = "horizontal";

  @property({ attribute: false })
  public onEnqueueAction!: CardEnqueueService;
  @property({ attribute: false })
  public onSelectAction!: CardSelectedService;
  @property({ attribute: false })
  public onDrillAction!: (
    mediaType: string,
    mediaId: string,
    mediaTitle: string,
  ) => void;
  @property({ attribute: "section-type", type: String })
  public sectionType!: SectionType | "drill";

  @state()
  private _cards!: MediaCardItem[];

  @consume({ context: IconsContext }) public Icons!: Icons;

  @property({ attribute: false })
  public set cards(cards: MediaCardItem[]) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!cards || jsonMatch(cards, this._cards)) {
      return;
    }
    this._cards = cards;
  }
  public get cards() {
    return this._cards;
  }

  private onItemSelected = (data: mediaCardData, target: HTMLElement) => {
    // this.resetScroll();
    this.onSelectAction(data, target);
  };
  private onEnqueue = (data: mediaCardData, enqueue: EnqueueOptions) => {
    this.onEnqueueAction(data, enqueue);
  };
  private onDrill = () => {
    this.onDrillAction(this.sectionType, this.id, this.title);
  };
  protected renderCard(card: MediaCardItem): TemplateResult {
    const queueable = [
      "service",
      "playlist",
      "album",
      "artist",
      "podcast",
    ].includes(card.data.type)
      ? literal`queueable`
      : literal``;
    return html`
      <mpc-browser-media-card
        .config=${card}
        .onSelectAction=${this.onItemSelected}
        .onEnqueueAction=${this.onEnqueue}
        ${queueable}
      ></mpc-browser-media-card>
    `;
  }
  protected renderCards(): TemplateResult {
    return html`
      <lit-virtualizer
        id="cards-virtualizer"
        .items=${this.cards}
        .layout=${flow({ direction: "horizontal" })}
        .renderItem=${(item: MediaCardItem) => {
          return this.renderCard(item);
        }}
      >
      </lit-virtualizer>
    `;
  }

  protected renderDrillButton(): TemplateResult {
    if (this.sectionType == "drill") {
      return html``;
    }
    return html`
      <div id="drill-button">
        <mpc-button
          .onPressService=${this.onDrill}
          role="plain"
          size="xsmall"
          elevation="none"
          class="button drill"
        >
          <ha-svg-icon
            .path=${this.Icons.ARROW_RIGHT_CIRCLE}
            class="svg drill"
          ></ha-svg-icon>
        </mpc-button>
      </div>
    `;
  }

  protected render(): TemplateResult {
    return html`
      <div id="title-div">
        <div id="title">${this.title}</div>
        ${this.renderDrillButton()}
      </div>
      <div id="cards">${this.renderCards()}</div>
    `;
  }

  static get styles() {
    return styles;
  }
}
