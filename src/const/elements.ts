import { LitElement } from "lit";

export interface WaAnimation extends LitElement {
  play: boolean;
  keyframes?: Keyframe[];
  duration?: number;
  iterations?: number;
  cancel?: () => void;
}

export interface DialogElement extends LitElement {
  open: boolean;
}

export interface ControlSelectMenuElement extends LitElement {
  open: boolean;
}

interface LitVirtualizerElement {
  scrollIntoView: (options?: {
    block?: "start" | "center" | "end" | "nearest";
    behavior?: "auto" | "smooth";
  }) => void;
}

export interface LitVirtualizer extends LitElement {
  scrollToIndex: (
    index: number,
    position?: "start" | "center" | "end" | "nearest",
  ) => void;
  element: (idx: number) => LitVirtualizerElement;
}
