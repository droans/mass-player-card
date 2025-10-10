import { css } from 'lit';
export default css`
:host {
    --mass-player-card-height: 40em;
    --md-list-container-color: rgba(0,0,0,0) !important;
    --md-list-item-leading-space: 0px;
    --md-list-item-two-line-container-height: 48px;
    --expressive-media-row-color-active: var(--md-sys-color-secondary-container);
    --expressive-media-row-color-text-active: var(--md-sys-color-on-secondary-container);
    --expressive-media-row-color: var(--md-sys-color-surface);
    --expressive-media-row-color-text: var(--md-sys-color-on-surface);
    --media-row-height: 48px;
    --media-row-thumbnail-height: var(--media-row-height);

   --player-control-icon-width: 30px;
   --player-play-pause-color: var(--secondary-background-color);
   --player-play-pause-icon-size: 6rem;
   --player-name-color: var(--ha-color-text-secondary);
   --expressive-color-container: var(--md-sys-color-primary-container);
   --expressive-border-radius-container: 20px 20px 0px 0px;
   --expressive-card-color: var(--md-sys-color-background);
   --player-blur-color: rgba(from var(--ha-card-background) r g b / 0.6);;
   --expressive-player-blur-color: rgba(from var(--md-sys-color-primary-container) r g b / 0.6) !important;
   --player-blur: blur(3px);
}
 ha-card {
   border-radius: 20px 20px 28px 28px;
 }
  ha-card#expressive {
   background-color: var(--md-sys-color-background);
  }
  .action-button::part(base) {
    height: 48px;
    width: 48px;
  }
  .action-button-active::part(base) {
    height: 48px;
    width: 48px;
  }
.action-button-active {
  background: rgba(from var(--md-ripple-color) r g b / 0.2);
  border-radius: 50%;
}
sl-tab-panel {
  height: var(--mass-player-card-height);
  display: block;
}
.section-hidden {
  display: none;
}
  #navbar-expressive {
    background-color: var(--expressive-player-blur-color);
    border-radius: 0px 0px 28px 28px;
  }
`