import { css } from "lit";

export default css`
  #collection-artists {
    font-size: 1.5em;
    margin-right: 0.5em;
    font-style: italic;
  }
  #collection-year {
    margin-right: 0.5em;
    font-style: italic;
  }
  #collection-artists.expressive,
  #collection-year.expressive {
    font-family: var(--expressive-font-family);
  }
  #collection-artists::not(.expressive),
  #collection-year::not(.expressive) {
    font-family: "Roboto", sans-serif;
  }
`;
