import { css } from 'lit';

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  ha-card {
    box-shadow: unset;
    height: var(--mass-player-card-height);
  }
.header {
  padding: 0.5em 0.5em 0em 0.5em;
  box-sizing: border-box;
  width: 100%;
}
  #header-main {
  }
  #header-search {
  }
  #header-section {
  }
  #title {
    position: relative;
    height: 40px;
    width: 100%;
    text-indent: var(--title-indent);
    text-transform: capitalize;
    font-size: 1.5rem;
    text-align: center;
    font-weight: 600;
    z-index: 0;
  }
  #search-input {
    left: 4em; 
    height: 40px;
    position: relative;
    width: calc(100% - 5em);
    z-index: 2;
  }
  #back-button {
    position: absolute;
    left: 1em;
    top: 0.5em;
    z-index: 1;
  }
  #search-button {
    position: absolute;
    right: 1em;
    top: 0.5em;
    z-index: 1;
  }
  #search-media-type-menu-control {
    --control-select-menu-background-color: unset;
    --ha-ripple-color: rgba(0,0,0,0);
    --mdc-icon-size: 1.5em;
    --control-select-menu-height: 6em;
    --control-select-menu-padding: 0px;
  }
  #search-media-type-list-item {
  }
  #search-media-type-menu-svg {
    color: var(--mdc-theme-primary);
  }
  .search-media-type-item-svg {
    height: 2em;
    width: 2em;
    color: var(--mdc-theme-primary);
  }
`;