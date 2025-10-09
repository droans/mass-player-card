import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --play-pause-icon-height: 64px;
    --next-prev-icon-height: 36px;
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

  }
  #player-controls-lower {

  }
  .icons-next-previous {
    height: var(--next-prev-icon-height);
    width: var(--next-prev-icon-height);
  }
  .icon-play-pause {
    height: var(--play-pause-icon-height);
    width: var(--play-pause-icon-height);
  }
  .button-next-previous {
    --surface-container: var(--md-sys-color-secondary-container);
    --on-surface-container: var(--md-sys-color-on-surface-variant);
    border-radius: 18px !important;
    height: var(--play-pause-icon-height);

  }
  #button-next {
    --_padding: 6px !important;
  }
  #button-previous {
    --_padding: 6px !important;
  }
  .button-play-pause {
    height: var(--play-pause-icon-height);
  }
  #button-play {
    --primary: var(--md-sys-color-primary);
    --on-primary: var(--md-sys-color-on-primary);
    --_padding: 6px;
    border-radius: 18px !important;
    height: var(--play-pause-icon-height);
  }
  #button-pause {
    --primary: var(--md-sys-color-secondary-container);
    --on-primary: var(--md-sys-color-on-secondary-container);
    --_padding: 6px;
    border-radius: 18px !important;
    height: var(--play-pause-icon-height);
  }
  #nav-upper {
    column-gap: 4px;
    margin-top: unset;
    row-gap: unset;
  }
  #nav-lower {
    padding: 6px;
    border-radius: 24px;
    background-color: rgba(from var(--ha-card-background) r g b / 0.4) !important
  }
  .icons-lower {
    height: 24px;
    width: 24px;

  }
  .button-lower {
    --surface-container: var(--md-sys-color-surface);
    --on-surface-container: var(--md-sys-color-on-surface);
  }
  .button-lower-active {
    --secondary-container: var(--md-sys-color-secondary-container);
    --on-secondary-container: var(--md-sys-color-on-secondary-container);
  }
`;