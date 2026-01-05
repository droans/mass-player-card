import { css } from "lit";
export default css`
  :host {
    --mass-player-card-height: var(--mass-player-card-section-height, 40em);

    --artwork-large-height: var(
      --mass-player-card-artwork-large-height,
      var(--mass-player-card-height)
    ) !important;
    --artwork-medium-height: var(
      --mass-player-card-artwork-medium-height,
      22em
    ) !important;
    --artwork-small-height: var(
      --mass-player-card-artwork-small-height,
      14em
    ) !important;

    --audio-bars-color: var(
      --mass-player-card-audio-bars-color,
      var(--secondary-text-color)
    );
    --expressive-audio-bars-initial-color: var(
      --mass-player-card-audio-bars-initial-color,
      var(--md-sys-color-tertiary)
    );
    --expressive-audio-bars-middle-color: var(
      --mass-player-card-audio-bars-middle-color,
      var(--md-sys-color-secondary)
    );
    --expressive-audio-bars-max-color: var(
      --mass-player-card-audio-bars-max-color,
      var(--md-sys-color-primary)
    );

    --default-border-radius: var(
      --mass-player-card-default-border-radius,
      28px
    );
    --artwork-border-radius: var(
      --mass-player-card-artwork-border-radius,
      var(--default-border-radius)
    );
    --browser-card-border-radius: var(
      --mass-player-card-browser-card-border-radius,
      var(--default-border-radius)
    );
    --queue-border-radius: var(
      --mass-player-card-queue-border-radius,
      var(--default-border-radius)
    );
    --media-row-border-radius: var(
      --mass-player-card-media-row-border-radius,
      0.7em
    );
    --player-row-border-radius: var(
      --mass-player-card-player-row-border-radius,
      0.7em
    );

    --button-small-border-radius: var(
      --mass-player-card-small-button-border-radius,
      40%
    );

    --expressive-border-radius-container: var(
      --mass-player-card-expressive-border-radius-container,
      var(--default-border-radius) var(--default-border-radius) 0px 0px
    );

    --expressive-color-container: var(
      --mass-player-card-expressive-color-container,
      var(--md-sys-color-primary-container)
    );

    --expressive-row-color: var(
      --mass-player-card-expressive-row-color,
      var(--md-sys-color-surface)
    );
    --expressive-row-color-text: var(
      --mass-player-card-expressive-row-color-text,
      var(--md-sys-color-on-background)
    );
    --expressive-row-active-color: var(
      --mass-player-card-expressive-row-active-color,
      var(--md-sys-color-secondary-container)
    );
    --expressive-row-active-color-text: var(
      --mass-player-card-expressive-row-active-color-text,
      var(--md-sys-color-on-secondary-container)
    );

    --expressive-row-button-color-text: var(
      --mass-player-card-expressive-row-button-color-text,
      var(--md-sys-color-on-secondary-container)
    );
    --expressive-row-button-color-hover: var(
      --mass-player-card-expressive-row-button-color-hover,
      rgba(from var(--expressive-row-button-color-hover) r g b / 0.38) !important
    );
    --expressive-row-button-color-text-hover: var(
      --mass-player-card-expressive-row-button-color-text-hover,
      var(--md-sys-color-on-secondary-container)
    );

    --md-list-container-color: var(
      --mass-player-card-list-item-container-color,
      rgba(0, 0, 0, 0) !important
    );
    --md-list-item-leading-space: var(
      --mass-player-card-list-item-leading-space,
      0px
    );
    --md-list-item-two-line-container-height: var(
      --mass-player-card-list-item-two-line-height,
      48px
    );

    --menu-border-radius: var(--mass-player-card-menu-border-radius, 24px);

    --media-row-active-background-color: var(
      --mass-player-card-media-row-active-background-color,
      var(--table-row-alternative-background-color)
    );
    --media-row-height: var(--mass-player-card-media-row-height, 56px);
    --media-row-thumbnail-height: var(
      --mass-player-card-media-row-thumbnail-height,
      var(--media-row-height)
    );

    --player-blur-color: rgba(
      from var(--mass-player-card-player-blur-color, var(--ha-card-background))
        r g b / 0.6
    );
    --expressive-player-blur-color: rgba(
      from
        var(
          --mass-player-card-expressive-player-blur-color,
          var(--md-sys-color-primary-container)
        )
        r g b / 0.6
    ) !important;

    --player-control-icon-width: var(
      --mass-player-card-player-control-icon-width,
      30px
    );
    --player-volume-slider-height: var(
      --mass-player-card-player-volume-slider-height,
      40px
    );

    --player-name-color: var(
      --mass-player-card-player-name-color,
      var(--ha-color-text-secondary)
    );

    --player-play-pause-icon-size: var(
      --mass-player-card-player-play-pause-icon-size,
      6rem
    );

    --row-icon-button-height: var(
      --mass-player-card-row-icon-button-height,
      1.5rem
    );
    --menu-item-padding-left: var(--mass-player-card-menu-item-padding-left, 20px);

    --md-sys-elevation-level0: none;
    --md-sys-elevation-level1: rgba(from #000000 r g b / 0.2) 0px 2px 1px -1px, rgba(from #000000 r g b / 0.14) 0px 1px 1px 0px, rgba(from #000000 r g b / 0.12) 0px 1px 3px 0px;
    --md-sys-elevation-level2: rgba(from #000000 r g b / 0.2) 0px 3px 3px -2px, rgba(from #000000 r g b / 0.14) 0px 3px 4px 0px, rgba(from #000000 r g b / 0.12) 0px 1px 8px 0px;
    --md-sys-elevation-level3: rgba(from #000000 r g b / 0.2) 0px 3px 5px -1px, rgba(from #000000 r g b / 0.14) 0px 6px 10px 0px, rgba(from #000000 r g b / 0.12) 0px 1px 18px 0px;
    --md-sys-elevation-level4: rgba(from #000000 r g b / 0.2) 0px 5px 5px -3px, rgba(from #000000 r g b / 0.14) 0px 8px 10px 1px, rgba(from #000000 r g b / 0.12) 0px 3px 14px 2px;
    --md-sys-elevation-level5: rgba(from #000000 r g b / 0.2) 0px 7px 8px -4px, rgba(from #000000 r g b / 0.14) 0px 12px 17px 2px, rgba(from #000000 r g b / 0.12) 0px 5px 22px 4px;
  }

  ha-card {
    max-width: var(--mass-player-card-max-width, 100%);
    font-family: "Roboto Flex", var(--ha-font-family-body), "Roboto" !important;
    border-radius: var(--default-border-radius);
    height: var(--mass-player-card-height);
  }
  ha-card#expressive {
    background-color: var(--md-sys-color-background, var(--ha-card-background));
  }

  #navbar-expressive {
    background-color: var(--expressive-player-blur-color);
    border-radius: 0px 0px var(--default-border-radius)
      var(--default-border-radius);
  }

  .section-hidden {
    display: none;
  }
`;
