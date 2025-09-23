export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  enabled: true
}
export interface PlayerConfig {
  enabled: boolean;
}

export function playerConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
  ]
}