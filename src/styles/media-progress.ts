import { css } from "lit"

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  .progress {
    padding-left: 36px;
    padding-right: 36px;
    padding-bottom: 8px;
    touch-action: none;
  }
  .progress-plain {
    --_light: var(
      --md-sys-color-primary,
      var(
        --md-linear-progress-track-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      )
    );
    --_dark: var(--light);
    --_size: 6px !important;
  }

  #progress-bar {
    --primary: var(
      --md-sys-color-primary,
      var(
        --md-linear-progress-track-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      )
    );
    --_light: unset;
    --_dark: unset;
  }

  #progress-div {
    margin-bottom: 4px;
  }
  .prog-incomplete {
    position: absolute;
    left: var(--incomplete-progress-start-pct);
    --height: 6px;
    top: calc(50% - (var(--height) / 2 - 1px));
    height: var(--height);
    background-color: var(
      --md-sys-color-secondary-container,
      var(
        --md-linear-progress-track-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      )
    );
    width: calc(100% - var(--incomplete-progress-start-pct));
    border-radius: 0px 3px 3px 0px;
  }

  #progress-handle {
    background-color: var(
      --md-sys-color-primary,
      var(
        --md-linear-progress-track-color,
        var(--md-sys-color-surface-container-highest, #e6e0e9)
      )
    );
    top: 0;
    height: 100%;
    border-radius: 4px;
  }

  progress.wavy {
    --_size: 4px;
    background-size: var(--_size);
    block-size: calc(var(--_size) * 3);
  }

  #time {
    justify-self: center;
    margin-bottom: 4px;
    padding-top: 4px;
  }
  .time-expressive {
    color: var(--md-sys-color-on-primary-container) !important;
  }

  .wavy {
  }
`
