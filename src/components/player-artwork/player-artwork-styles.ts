import { css } from "lit";

export default css`
  .artwork {
    border-radius: var(--artwork-border-radius);
    max-width: 100%;
    justify-self: center;
    display: block;
  }
  #asleep {
    height: 100%;
    width: 100%;
  }
  #asleep.expressive {
    color: rgba(from var(--md-sys-color-primary) r g b / 0.7);
  }

  #carousel {
    --aspect-ratio: 1;
    position: absolute;
  }
  #carousel.large {
    height: var(--artwork-large-height);
    aspect-ratio: 1;
    width: 100%;
  }
  #carousel.large.panel {
    height: 100% !important;
  }
  #carousel.medium {
    height: var(--artwork-medium-height);
    aspect-ratio: 1;
    place-content: center;
    position: absolute;
    top: calc(50% - (var(--artwork-medium-height) / 2) - 2em);
  }
  #carousel.small {
    position: absolute;
    height: var(--artwork-small-height);
    display: flex;
    aspect-ratio: 1;
    left: calc(50% - (var(--artwork-small-height) / 2));
    top: calc(50% - (var(--artwork-small-height) / 2));
  }
  wa-carousel-item img {
    max-height: 100%;
    max-width: 100%;
    aspect-ratio: 1;
    height: 100% !important;
    width: unset !important;
  }
  .panel .slot {
    max-height: 100%;
    max-width: 100%;
    aspect-ratio: 1;
    height: 100%;
  }
`;
