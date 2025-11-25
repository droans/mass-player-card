import { LitElement } from "lit";

export interface WaAnimation extends LitElement {
  play: boolean;
  cancel?: () => void;
}

export interface DialogElement extends LitElement {
  open: boolean;
}