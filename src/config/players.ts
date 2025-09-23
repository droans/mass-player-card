export interface PlayersConfig {
  enabled: boolean,
}
export const DEFAULT_PLAYERS_CONFIG: PlayersConfig = {
  enabled: true
}

export function playersConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
  ]
}