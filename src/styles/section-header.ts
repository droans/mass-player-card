import { css } from "lit";

export default css`
  #header {
    padding: 0.5em 0.5em 0em 0.5em;
    box-sizing: border-box;
    width: 100%;
    display: block;
    position: relative;
    z-index: 1;
    height: 3.5em;
  }
  .header {
    
  }
  .header-expressive {
    background-color: var(--md-sys-primary-container);
    border-radius: 20px 20px 0px 0px
  }
  .start {
    display: block;
    position: absolute;
    left: 1em;
    top: 0.5em;
    z-index: 1;
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
  .end {
    display: block;
    position: absolute;
    right: 1em;
    top: 0.5em;
    z-index: 1;
  }
`