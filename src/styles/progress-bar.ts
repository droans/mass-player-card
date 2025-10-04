import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .progress {
    padding-left: 36px;
    padding-right: 36px;
    padding-bottom: 8px;
  }
  #time {
    justify-self: center;
    padding-bottom: 4px;
  }
  #progress-bar {
    --primary: var(--accent-color);
  }
  .progress-plain {
    --_light: var(--md-linear-progress-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));
    --_dark: var(--light);
    --_size: 8px;
  }
  .wavy {
    --_light: unset;
    --_dark: unset;
  }
  #progress-handle {
    background-color: var(--primary-color);
    top: 0;
    height: 100%;
    border-radius: 4px;
  }
  progress.wavy {
    --_size: 4px;
    background-size: var(--_size);
    block-size: calc(var(--_size) * 3);
  }
  
  .prog-incomplete-wavy {
    position: absolute;
    left: var(--incomplete-progress-start-pct);
    --height: 6px;
    top: calc(50% - (var(--height) / 2));
    height: var(--height);
    background-color: var(--md-linear-progress-track-color, var(--md-sys-color-surface-container-highest, #e6e0e9));
    width: calc(100% - var(--incomplete-progress-start-pct));
    border-radius: 0px 3px 3px 0px;
  }
`;
