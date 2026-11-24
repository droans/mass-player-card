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
    display: flex;
    position: relative;
    z-index: 2;
    height: 3.5em;
  }
  .header {
    background-color: var(--md-sys-color-background);
    border-radius: 20px 20px 0px 0px;
  }

  .label {
    display: block;
    position: relative;
    height: 40px;
    width: 100%;
    font-size: 1.5rem;
    padding-left: 1.5rem;
    font-weight: 700;
    z-index: 0;
    color: var(--md-sys-color-on-background);
  }
  .label {
    font-family: var(--expressive-font-family);
    font-variation-settings: "ROND" 100;
    font-stretch: 50%;
    font-size: 2em;
    line-height: 1em;
  }
  ::slotted([slot="label"]) {
    vertical-align: text-bottom;
  }

  .start {
    display: block;
    left: 1em;
    top: 0.5em;
    z-index: 1;
  }
`;
