import { css } from 'lit';
export default css`
  :host {
    --mass-player-card-height: 40em;

    --button-small-border-radius: 12px;
    --expressive-border-radius-container: 20px 20px 0px 0px;

    --expressive-color-container: var(--md-sys-color-primary-container);
    --expressive-card-color: var(--md-sys-color-background);

    --expressive-row-color: var(--md-sys-color-background);
    --expressive-row-color-text: var(--md-sys-color-on-background);
    --expressive-row-active-color: var(--md-sys-color-secondary-container);
    --expressive-row-active-color-text: var(--md-sys-color-on-secondary-container);

    --expressive-row-button-color: var(--md-sys-color-primary-container);
    --expressive-row-button-color-text: var(--md-sys-color-on-primary-container);
    --expressive-row-button-color-hover: var(--md-sys-color-tertiary-container);
    --expressive-row-button-color-text-hover: var(--md-sys-color-on-tertiary-container);
    
    --md-list-container-color: rgba(0,0,0,0) !important;
    --md-list-item-leading-space: 0px;
    --md-list-item-two-line-container-height: 48px;

    --media-row-active-background-color: var(--table-row-alternative-background-color);
    --media-row-height: 56px;
    --media-row-thumbnail-height: var(--media-row-height);

    --player-blur: blur(3px);
    --player-blur-color: rgba(from var(--ha-card-background) r g b / 0.6);;
    --expressive-player-blur-color: rgba(from var(--md-sys-color-primary-container) r g b / 0.6) !important;

    --player-control-icon-width: 30px;

    --player-name-color: var(--ha-color-text-secondary);

    --player-play-pause-color: var(--secondary-background-color);
    --player-play-pause-icon-size: 6rem;

    --row-icon-button-height: 1.5rem;
  }

  ha-card {
    font-family: 'Roboto Flex', var(--ha-font-family-body), 'Roboto', !important;
    border-radius: 28px;
  }
  ha-card#expressive {
    background-color: var(--md-sys-color-background);
  }
  sl-tab-panel {
    height: var(--mass-player-card-height);
    display: block;
  }

  #navbar-expressive {
    background-color: var(--expressive-player-blur-color);
    border-radius: 0px 0px 28px 28px;
  }

  .section-hidden {
    display: none;
  }
`