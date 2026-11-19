import { RepeatMode } from "../const/enums";
import { Icons } from "../const/icons";

export function getIteratedRepeatMode(current_repeat: RepeatMode): RepeatMode {
  if (current_repeat == RepeatMode.ALL) {
    return RepeatMode.ONCE;
  }
  if (current_repeat == RepeatMode.ONCE) {
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
