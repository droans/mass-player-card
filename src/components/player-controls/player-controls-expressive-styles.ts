import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --lower-button-border-radius: 8px;
    --lower-button-start-border-radius: 24px 8px 8px 24px;
    --lower-button-end-border-radius: 8px 24px 24px 8px;
    --lower-button-only-border-radius: 24px 24px 24px 24px;

    --next-prev-button-height: var(--play-pause-icon-height);
    --next-prev-button-width: 48px;
    --next-prev-icon-height: 48px;
    --next-border-radius: 36px 18px 18px 36px !important;
    --prev-border-radius: 18px 36px 36px 18px !important;

    --play-pause-icon-height: 64px;
    --pause-button-width: 96px;
    --play-button-width: 110px;
    --play-pause-border-radius: 18px !important;
  }

  .mpc-button.lower {
    --button-border-radius: var(--lower-button-border-radius);
  }
  .mpc-button.lower::part(base) {
    border-radius: var(--button-border-radius);
  }
  .mpc-button.lower::part(button) {
    --button-padding-left: 8px;
    --button-padding-right: 12px;
    border-radius: var(--button-border-radius);
  }
  .mpc-button.lower:hover {
    --button-border-radius: 40px !important;
  }

  .mpc-button.lower:first-of-type {
    --button-border-radius: var(--lower-button-start-border-radius);
  }
  .mpc-button.lower:last-of-type {
    --button-border-radius: var(--lower-button-end-border-radius);
  }
  .mpc-button.lower:only-of-type {
    --button-border-radius: var(--lower-button-only-border-radius) !important;
  }

  .mpc-button.lower.active {
    --button-border-radius: 20px;
  }

  .mpc-button.next,
  .mpc-button.previous::part(button) {
    --button-button-height: var(--next-prev-button-height);
    --button-button-width: var(--next-prev-button-width);
    --button-elevation: var(--md-sys-elevation-level1);
    --button-padding: 0px;
  }

  #button-next {
    --button-border-radius: var(--prev-border-radius);
  }
  #button-next::part(button) {
    border-radius: var(--button-border-radius);
  }
  #button-previous {
    --button-border-radius: var(--next-border-radius);
  }
  #button-previous::part(button) {
    border-radius: var(--button-border-radius);
  }
  .mpc-button.play-pause {
    --button-button-height: var(--play-pause-icon-height);
    --button-border-radius: var(--play-pause-border-radius);
    --button-padding: 0px;
    --button-elevation: var(--md-sys-elevation-level2);
  }
  #button-play {
    --button-button-width: var(--play-button-width);
  }
  #button-pause {
    --button-button-width: var(--pause-button-width);
  }

  #div-controls {
    container-name: controls;
    container-type: inline-size;
    row-gap: 6px;
    display: grid;
    margin-top: 12px;
    margin-bottom: 6px;
  }

  .icons.favorite.lower.active {
    color: var(--md-sys-color-tertiary);
  }

  .icons.lower,
  .icons.lower.active {
    height: var(--icon-height);
    width: var(--icon-height);
  }

  .icons.next,
  .icons.previous {
    height: var(--next-prev-icon-height);
    width: var(--next-prev-icon-height);
  }
  .icons.play-pause {
    height: var(--play-pause-icon-height);
    width: var(--play-pause-icon-height);
  }

  .no-label::part(button) {
    --button-padding-left: 12px;
    --button-padding-right: 12px;
  }
  .player-controls {
    justify-items: center;
  }
  #player-controls-lower {
    place-self: center;
    padding: 6px;
    border-radius: 24px;
    background-color: rgba(
      from var(--ha-card-background) r g b / 0.4
    ) !important;
  }
  #player-controls-upper {
    place-self: center;
    column-gap: 4px;
    margin-top: unset;
    row-gap: unset;
  }
  @container controls (width <= 30em) {
    #player-controls-lower {
      --md-sys-typescale-label-large-size: 10px;
      --icon-height: 16px;
    }
    .mpc-button.lower::part(label) {
      --md-sys-typescale-label-large-size: 10px;
      --icon-height: 16px;
    }
  }
  @container controls (width > 30em) {
    #player-controls-lower {
      --md-sys-typescale-label-large-size: 14px;
      --icon-height: 24px;
    }
    .mpc-button-lower::part(label) {
      --md-sys-typescale-label-large-size: 14px;
      --icon-height: 24px;
    }
  }
`;
