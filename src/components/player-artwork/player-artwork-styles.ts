import { css } from "lit";

export default css`
  .artwork {
    max-width: 100%;
    justify-self: center;
    display: block;
  }
  #asleep {
    height: 100%;
    width: 100%;
    color: rgba(from var(--md-sys-color-primary) r g b / 0.7);
  }

  #carousel {
    --aspect-ratio: 1;
    position: absolute;
    height: var(--artwork-height) !important;
    aspect-ratio: 1;
  }
  wa-carousel::part(base) {
    column-gap: 0px;
    border-radius: var(--artwork-border-radius);
    overflow: hidden;
  }
  wa-carousel::part(scroll-container) {
    height: var(--artwork-height) !important;
    --slide-gap: 0px;
  }
  wa-carousel-item img {
    max-height: 100%;
    max-width: 100%;
    aspect-ratio: 1;
    height: var(--artwork-height) !important;
    width: unset !important;
  }
  .panel .slot {
    max-height: 100%;
    max-width: 100%;
    aspect-ratio: 1;
    height: 100%;
  }
`;
