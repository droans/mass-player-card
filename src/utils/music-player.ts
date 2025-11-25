import { html } from "lit";
import { PlayerIcon, PlayerIconSize } from "../config/player";
import { RepeatMode } from "../const/common.js";
import { Icons } from "../const/icons.js";

export function generateControlSlotHtml(icon_style: PlayerIcon) {
  if (icon_style.size == PlayerIconSize.LARGE || !icon_style.label) {
    return html``;
  }
  return html`slot="start"`;
}

export function generateControlLabelHtml(
  icon_style: PlayerIcon,
  label: string,
  hide_labels: boolean,
) {
  if (icon_style.size == PlayerIconSize.LARGE || !icon_style.label || hide_labels) {
    return html``;
  }
  return html`${label}`;
}

export function getIteratedRepeatMode(cur_repeat: RepeatMode): RepeatMode {
  if (cur_repeat == RepeatMode.ALL) {
    return RepeatMode.ONCE;
  }
  if (cur_repeat == RepeatMode.ONCE) {
    return RepeatMode.OFF;
  }
  return RepeatMode.ALL;
}
export function getRepeatIcon(repeat: RepeatMode, icons: Icons): string {
  if (repeat == RepeatMode.ALL) {
    return icons.REPEAT;
  }
  if (repeat == RepeatMode.ONCE) {
    return icons.REPEAT_ONCE;
  }
  return icons.REPEAT_OFF;
}
