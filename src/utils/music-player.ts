import { html } from "lit";
import { PlayerIcon, PlayerIconSize } from "../config/player";

export function generateControlSlotHtml(icon_style: PlayerIcon) {
  if (
    icon_style.size == PlayerIconSize.LARGE
      || !icon_style.label
  ) {
    return html``;
  }
  return html`slot="start"`;
}

export function generateControlLabelHtml(icon_style: PlayerIcon, label: string) {
  if (
    icon_style.size == PlayerIconSize.LARGE
      || !icon_style.label
  ) {
    return html``;
  }
  return html`${label}`;
}