import { html, LitElement, TemplateResult } from "lit"
import { ExtendedHass } from "../../../const/context.js"
import { customElement, property } from "lit/decorators.js"
import { getTranslation } from "../../../utils/translations.js"

const PLAYER_HIDDEN_ELEMENTS_TRANSLATIONS = {
  favorite: "config.player.favorite",
  mute: "config.player.mute",
  player_selector: "config.player.player_selector",
  power: "config.player.power",
  repeat: "config.player.repeat",
  shuffle: "config.player.shuffle",
  volume: "config.player.volume",
  group_volume: "config.player.group_volume", 
}

const QUEUE_HIDDEN_ELEMENTS_TRANSLATIONS = {
  action_buttons: "config.queue.action_buttons",
  move_down_button: "config.queue.move_down",
  move_next_button:   "config.queue.move_next",
  move_up_button: "config.queue.move_up",
  remove_button: "config.queue.remove",
  album_covers: "config.queue.album_covers",
  artist_names: "config.queue.artist_names",
}

const BROWSER_HIDDEN_ELEMENTS_TRANSLATIONS = {
  back_button: "config.browser.back_button",
  search: "config.browser.search",
  recents: "config.browser.recents",
  titles: "config.browser.titles",
  enqueue_menu: "config.browser.enqueue_menu",
  add_to_queue_button: "config.browser.add_to_queue_button",
  play_next_button: "config.browser.play_next_button",
  play_next_clear_queue_button: "config.browser.play_next_clear_queue_button",
  play_now_button: "config.browser.play_now_button",
  play_now_clear_queue_button: "config.browser.play_now_clear_queue_button",
}

const PLAYERS_HIDDEN_ELEMENTS_TRANSLATIONS = {
  action_buttons: "config.players.action_buttons",
  join_button: "config.players.join_button",
  transfer_button: "config.players.transfer_button",
}

class HiddenElementsConfigBase extends LitElement {
  @property({ attribute: false }) hass!: ExtendedHass;
  @property({ attribute: false }) elements!: Record<string, boolean>
  @property({ attribute: false }) onToggle!: (path: string) => void;
  protected label!: string;
  protected translations!: Record<string, string>;

  private onToggleEvent = (ev: Event, path: string) => {
    ev;
    this.onToggle(path);
  }
  protected renderElement(key: string): TemplateResult {
    const translate_key = this.translations[key];
    const val = this.elements[key];
    const label = getTranslation(translate_key, this.hass)
    return html`
      <mass-config-bool-selector
        label=${label}
        .path=${key}
        .value=${val}
        .hass=${this.hass}
        .valueChangedFunction=${this.onToggleEvent}
      >
    </mass-config-bool-selector>
    `
  }
  protected renderElements() {
    const keys = Object.keys(this.elements);
    return keys.map(
      (key) => {
        this.renderElement(key)
      }
    )
  }
  protected render(): TemplateResult {
    return html`
      <div id="hidden-elements">
        ${this.renderElements()}
      </div>
    `
  }
}

@customElement('mass-config-player-hidden-elements-editor')
class PlayerHiddenElementsEditor extends HiddenElementsConfigBase {
  constructor() {
    super();
    this.label = 'Player';
    this.translations = PLAYER_HIDDEN_ELEMENTS_TRANSLATIONS;
  }
}

@customElement('mass-config-queue-hidden-elements-editor')
class QueueHiddenElementsEditor extends HiddenElementsConfigBase {
  constructor() {
    super();
    this.label = 'Queue';
    this.translations = QUEUE_HIDDEN_ELEMENTS_TRANSLATIONS;
  }
}
@customElement('mass-config-browser-hidden-elements-editor')
class BrowserHiddenElementsEditor extends HiddenElementsConfigBase {
  constructor() {
    super();
    this.label = 'Music Browser';
    this.translations = BROWSER_HIDDEN_ELEMENTS_TRANSLATIONS;
  }
}
@customElement('mass-config-players-hidden-elements-editor')
class PlayersHiddenElementsEditor extends HiddenElementsConfigBase {
  constructor() {
    super();
    this.label = 'Players';
    this.translations = PLAYERS_HIDDEN_ELEMENTS_TRANSLATIONS;
  }
}