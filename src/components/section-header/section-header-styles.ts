import { css } from "lit";

export default css`
  .end {
    display: block;
    position: absolute;
    right: 1em;
    top: 0.5em;
    z-index: 1;
  }

  #header {
    padding: 0.5em 0.5em 0em 0.5em;
    box-sizing: border-box;
    width: 100%;
    display: block;
    position: relative;
    z-index: 2;
    height: 3.5em;
  }
  .header.expressive {
    background-color: var(--md-sys-primary-container);
    border-radius: 20px 20px 0px 0px;
  }

  .label {
    display: block;
    position: relative;
    height: 40px;
    width: 100%;
    font-size: 1.5rem;
    text-align: center;
    font-weight: 600;
    z-index: 0;
    color: var(--md-sys-color-on-primary-container);
  }
  .label.expressive {
    font-family:
      "Google Sans Flex", "Roboto Flex", var(--ha-font-family-body), "Roboto",
      sans-serif !important;
    font-variation-settings: "ROND" 100;
    font-stretch: 25%;
    font-size: 2em;
    font-style: italic;
    line-height: 1em;
  }
  .expressive::slotted([slot="label"]) {
    vertical-align: text-bottom;
  }

  .start {
    display: block;
    position: absolute;
    left: 1em;
    top: 0.5em;
    z-index: 1;
  }
`;
