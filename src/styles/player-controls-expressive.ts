import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --play-pause-icon-height: 64px;
    --play-pause-button-width: 96px;
    --play-pause-border-radius: 18px !important;
    --next-prev-button-height: var(--play-pause-icon-height);
    --next-prev-button-width: 48px;
    --next-prev-icon-height: 48px;
    --next-border-radius: 36px 18px 18px 36px !important;
    --prev-border-radius: 18px 36px 36px 18px !important;
    --next-prev-background-color: var(--md-sys-color-secondary-container, var(--inherited-background-color,var(--ha-button-background-color))) !important;
    --play-background-color: var(--md-sys-color-primary, var(--inherited-background-color,var(--ha-button-background-color))) !important;
    --pause-background-color: var(--md-sys-color-secondary-container, var(--inherited-background-color,var(--ha-button-background-color))) !important;
    --next-prev-icon-color: var(--md-sys-color-on-surface-variant);
    --play-icon-color: var(--md-sys-color-on-primary);
    --pause-icon-color: var(--md-sys-color-on-secondary-container);

    --lower-button-background-color: var(--md-sys-color-secondary-container) !important;
    --lower-button-background-color-active: var(--md-sys-color-secondary) !important;
    --lower-button-icon-color: var(--md-sys-color-on-secondary-container);
    --lower-button-icon-color-active: var(--md-sys-color-on-secondary);
    --lower-button-border-radius: 8px;
    --lower-button-start-border-radius: 24px 8px 8px 24px;
    --lower-button-end-border-radius: 8px 24px 24px 8px;
    --lower-button-only-border-radius: 24px 24px 24px 24px;
  }
  #div-controls {
    row-gap: 6px;
    display: grid;
    margin-top: 8px;
    margin-bottom: 12px;
  }
  .player-controls {
    justify-items: center;
  }
  #player-controls-upper {
    place-self: center;
    column-gap: 4px;
    margin-top: unset;
    row-gap: unset;
  }
  #player-controls-lower {
    place-self: center;
    padding: 6px;
    border-radius: 24px;
    background-color: rgba(from var(--ha-card-background) r g b / 0.4) !important;
    /* box-shadow: var(--md-sys-elevation-level1); */
  }
  .button-next-previous::part(base) {
    height: var(--next-prev-button-height);
    width: var(--next-prev-button-width);
    --inherited-background-color: var(--next-prev-background-color);
    --wa-color-fill-normal: var(--next-prev-background-color);
    box-shadow: var(--md-sys-elevation-level1);
  }
  #button-previous::part(base) {
    --ha-button-border-radius: var(--next-border-radius);
  }
  #button-next::part(base) {
    --ha-button-border-radius: var(--prev-border-radius);
  }
  .icons-next-previous {
    color: var(--next-prev-icon-color);
    height: var(--next-prev-icon-height);
    width: var(--next-prev-icon-height);
  }
  .button-play-pause::part(base) {
    height: var(--play-pause-icon-height);
    width: var(--play-pause-button-width);
    --ha-button-border-radius: var(--play-pause-border-radius);
    box-shadow: var(--md-sys-elevation-level2);
  }
  #button-play::part(base) {
    --wa-color-fill-normal: var(--play-background-color);
    --inherited-background-color: var(--play-background-color);
  }
  #button-pause::part(base) {
    --wa-color-fill-normal: var(--pause-background-color);
    --inherited-background-color: var(--pause-background-color);
  }
  .icon-play-pause {
    height: var(--play-pause-icon-height);
    width: var(--play-pause-icon-height);
  }
  #icon-play {
    color: var(--md-sys-color-on-primary);
  }
  #icon-pause {
    color: var(--md-sys-color-on-secondary-container);
  }
  .icons-lower {
    height: 24px;
    width: 24px;

  }
  .button-lower::part(base) {
    --wa-color-fill-normal: var(--lower-button-background-color);
    --inherited-background-color: var(--lower-button-background-color);
    --ha-button-border-radius: var(--lower-button-border-radius);
    box-shadow: var(--md-sys-elevation-level1);
  }
  .button-lower-active::part(base) {
    --wa-color-fill-normal: var(--lower-button-background-color-active);
    --inherited-background-color: var(--lower-button-background-color-active);
    --ha-button-border-radius: var(--lower-button-border-radius);
  }
  .button-lower::part(label) {
    color:  var(--lower-button-icon-color);
    --inherited-text-color: var(--lower-button-icon-color);
  }
  .button-lower-active::part(label) {
    color: var(--lower-button-icon-color-active);
    --inherited-text-color: var(--lower-button-icon-color-active);
  }
  .icons-lower {
   color: var(--lower-button-icon-color);
  }
  .icons-lower-active {
   color: var(--lower-button-icon-color-active);
  }
  .button-lower:first-of-type::part(base) {
    --ha-button-border-radius: var(--lower-button-start-border-radius);
  }
  .button-lower:last-of-type::part(base) {
    --ha-button-border-radius: var(--lower-button-end-border-radius);
  }
  .button-lower:only-of-type::part(base) {
    --ha-button-border-radius: var(--lower-button-only-border-radius) !important;
  }
`;