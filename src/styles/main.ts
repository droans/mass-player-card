import { css } from 'lit';
export default css`
 ha-card {
    --mass-player-card-height: 35em;
    --expansion-panel-content-padding: 0px;
    --md-list-container-color: rgba(0,0,0,0) !important;
    --md-list-item-leading-space: 0px;
    --md-list-item-two-line-container-height: 48px;
    --md-ripple-hover-color: var(--mdc-theme-primary);
    --mdc-ripple-hover-color: var(--mdc-theme-primary);
    --mdc-ripple-color: var(--mdc-theme-primary);
    --md-ripple-color: var(--mdc-theme-primary);

    --media-row-background-color: var(--card-background-color);
    --media-row-height: 48px;
    --media-row-icon-width: 30px;
    --media-row-background-color-active: rgba(from var(--accent-color) r g b / 0.2);
    --media-row-thumbnail-height: var(--media-row-height);

   --player-control-icon-width: 30px;
   --player-play-pause-color: var(--secondary-background-color);
   --player-play-pause-icon-size: 6rem;
   --player-track-color: var(--ha-color-text-link);
   --player-name-color: var(--ha-color-text-secondary);
 }
  sl-tab-group {
    --track-width: 0px;
    display: flex;
    justify-content: center;
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
.action-button-svg-inactive {
  --icon-primary-color: var(--md-sys-color-on-surface-variant);
}
sl-tab-panel {
  height: var(--mass-player-card-height);
  display: block;
}
.section-hidden {
  display: none;
}
`