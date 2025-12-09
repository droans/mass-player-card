import { LitElement } from "lit";

export interface WaAnimation extends LitElement {
  play: boolean;
  keyframes?: Keyframe[],
  duration?: number,
  iterations?: number;
  cancel?: () => void;
}

export interface DialogElement extends LitElement {
  open: boolean;
}

export interface ControlSelectMenuElement extends LitElement {
  menuOpen: boolean;
}