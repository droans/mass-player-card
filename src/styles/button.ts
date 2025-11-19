import { css } from "lit";

// Styles belonging to the card
// https://lit.dev/docs/components/styles/
export default css`
  :host {
    --button-default-height-small: 32px;
    --button-default-width-small: 32px;
    --button-default-border-radius-small: 10px;
    
    --button-default-height-medium: 40px;
    --button-default-width-medium: 40px;
    --button-default-border-radius-medium: 12px;
    
    --button-default-height-large: 64px;
    --button-default-width-large: 64px;
    --button-default-border-radius-small: 20px;

    --animation-duration: 0.25s;
    --used-button-height: var(--button-button-height);
    --used-button-width: var(--button-button-width);
    
  }
  
  ha-button::part(base) {
    width: var(--used-button-width, 100%);
    box-shadow: var(--button-elevation);
    padding: unset;
    --inherited-background-color: var(--used-button-background-color, var(--button-background-color));
    --inherited-text-color: var(--used-button-text-color, var(--button-text-color));
    --used-button-height: var(--button-button-height);
    --used-button-width: var(--button-button-width);
  }

  .small::part(base) {
    height: var(--used-button-height, var(--button-default-height-small));
    --ha-button-border-radius: var(--button-border-radius, var(--button-default-border-radius-small));
    padding-left: var(--button-padding-left, var(--button-padding, 8px));
    padding-right: var(--button-padding-right, var(--button-padding, 12px));
  }
  .small {

  }

  .medium::part(base) {
    height: var(--used-button-height, var(--button-default-height-medium));
    --ha-button-border-radius: var(--button-border-radius, var(--button-default-border-radius-medium));
    padding-left: var(--button-padding-left, var(--button-padding, 16px));
    padding-right: var(--button-padding-right, var(--button-padding, 16px));
  }
  .medium {

  }
  
  .large::part(base) {
    height: var(--used-button-height, var(--button-default-height-large));
    --ha-button-border-radius: var(--button-border-radius, var(--button-default-border-radius-large));
    padding-left: var(--button-padding-left, var(--button-padding, 24px));
    padding-right: var(--button-padding-right, var(--button-padding, 24px));
  }
  .large {

  }

  .filled {
    --button-outline-color: var(--md-sys-color-outline-variant, var(--outline-color));
  }
  .filled.expressive {
    --button-background-color: var(--md-sys-color-primary);
    --button-text-color: var(--md-sys-color-on-primary);

    --button-selected-background-color: var(--md-sys-color-primary);
    --button-selected-text-color: var(--md-sys-color-on-primary);

    --button-unselected-background-color: var(--md-sys-color-surface-container);
    --button-unselected-text-color: var(--md-sys-color-on-surface-variant);
    
    --button-disabled-background-color: var(--md-sys-color-on-surface);
    --button-disabled-text-color: var(--md-sys-color-on-surface);
    
    --button-hovered-background-color: ;
    --button-hovered-text-color: ;
  }
  .filled-variant {
    --button-outline-color: var(--md-sys-color-outline, var(--outline-color));
  }
  .filled-variant.expressive {
    --button-background-color: var(--md-sys-color-surface-variant);
    --button-text-color: var(--md-sys-color-on-surface-variant);

    --button-selected-background-color: var(--md-sys-color-primary);
    --button-selected-text-color: var(--md-sys-color-on-primary);

    --button-unselected-background-color: var(--md-sys-color-surface-container);
    --button-unselected-text-color: var(--md-sys-color-on-surface-variant);
    
    --button-disabled-background-color: var(--md-sys-color-on-surface-variant);
    --button-disabled-text-color: var(--md-sys-color-on-surface-variant);
  }
  
  .standard {
    --button-outline-color: var(--md-sys-color-outline-variant, var(--outline-color));
    
  }
  .standard.expressive {
    --button-background-color: var(--md-sys-color-primary);
    --button-text-color: var(--md-sys-color-on-primary);

    --button-selected-background-color: var(--md-sys-color-primary);
    --button-selected-text-color: var(--md-sys-color-on-primary);

    --button-unselected-background-color: var(--md-sys-color-surface-container);
    --button-unselected-text-color: var(--md-sys-color-on-surface-variant);
    
    --button-disabled-background-color: var(--md-sys-color-on-surface);
    --button-disabled-text-color: var(--md-sys-color-on-surface);
    
  }

  .tonal {
    --button-outline-color: var(--md-sys-color-outline, var(--outline-color));
  }
  .tonal.expressive {
    --button-background-color: var(--md-sys-color-secondary-container);
    --button-text-color: var(--md-sys-color-on-secondary-container);

    --button-selected-background-color: var(--md-sys-color-secondary);
    --button-selected-text-color: var(--md-sys-color-on-secondary);

    --button-unselected-background-color: var(--md-sys-color-secondary-container);
    --button-unselected-text-color: var(--md-sys-color-on-secondary-container);
    
    --button-disabled-background-color: var(--md-sys-color-on-surface);
    --button-disabled-text-color: var(--md-sys-color-on-surface);

  }
  
  .variant {
    --button-outline-color: var(--md-sys-color-outline, var(--outline-color));
  }
  .variant.expressive {
    --button-background-color: var(--md-sys-color-tertiary-container);
    --button-text-color: var(--md-sys-color-on-tertiary-container);

    --button-selected-background-color: var(--md-sys-color-tertiary-fixed-dim);
    --button-selected-text-color: var(--md-sys-color-on-tertiary-fixed-variant);

    --button-unselected-background-color: var(--md-sys-color-tertiary-container);
    --button-unselected-text-color: var(--md-sys-color-on-tertiary-container);
    
    --button-disabled-background-color: var(--md-sys-color-on-surface-variant);
    --button-disabled-text-color: var(--md-sys-color-on-surface-variant);

  }
  .plain.expressive {
    --button-background-color: transparent;
    --button-text-color: var(--md-sys-color-on-tertiary-container);

    --button-selected-background-color: transparent;
    --button-selected-text-color: var(--md-sys-color-on-tertiary-fixed-variant);

    --button-unselected-background-color: transparent;
    --button-unselected-text-color: var(--md-sys-color-on-tertiary-container);
    
    --button-disabled-background-color: transparent;
    --button-disabled-text-color: var(--md-sys-color-on-surface-variant);

  }

  .elevation-0 {
    --button-elevation: none;
    --hover-button-elevation: var(--md-sys-elevation-level1);
  }
  
  .elevation-1 {
    --button-elevation: var(--md-sys-elevation-level1);
    --hover-button-elevation: var(--md-sys-elevation-level2);
  }

  .elevation-2 {
    --button-elevation: var(--md-sys-elevation-level2);
    --hover-button-elevation: var(--md-sys-elevation-level3);
  }

  .elevation-3 {
    --button-elevation: var(--md-sys-elevation-level3);
    --hover-button-elevation: var(--md-sys-elevation-level4);
  }
  .elevation-4 {
    --button-elevation: var(--md-sys-elevation-level4);
    --hover-button-elevation: var(--md-sys-elevation-level5);
  }

  .elevation-5 {
    --button-elevation: var(--md-sys-elevation-level5);
    --hover-button-elevation: var(--md-sys-elevation-level5);
  }

  .elevation-0, .elevation-1, .elevation-2, .elevation-3, .elevation-4, .elevation-5 {
    animation: elevate-hover-off var(--animation-duration) linear forwards;
  }
  .elevation-0:hover, .elevation-1:hover, .elevation-2:hover, .elevation-3:hover, .elevation-4:hover, .elevation-5:hover {
    animation: elevate-hover var(--animation-duration) linear forwards;
  }

  .outlined::part(base) {
    /* border: var(--md-sys-color-outline-variant) 2px solid; */
    border: var(--button-outline-color) 2px solid;
  }

  .disabled {
    --used-button-background-color: var(--button-disabled-background-color);
    --used-button-text-color: var(--button-disabled-text-color);
  }
  .selected {
    --used-button-background-color: var(--button-selected-background-color);
    --used-button-text-color: var(--button-selected-text-color);

  }
  .unselected {
    --used-button-background-color: var(--button-unselected-background-color);
    --used-button-text-color: var(--button-unselected-text-color);

  }
  
  @keyframes elevate-hover {
    to {
      box-shadow: var(--hover-button-elevation);
    }
  }
  @keyframes elevate-hover-off {
    to {
      box-shadow: var(--button-elevation);
    }
  }

  
`;
