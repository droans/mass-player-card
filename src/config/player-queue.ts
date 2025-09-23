export interface QueueConfig {
  enabled: boolean;
  limit_before: number;
  limit_after: number;
  show_album_covers: boolean;
  show_artist_names: boolean;
}
export const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  enabled: true,
  limit_before: 5,
  limit_after: 100,
  show_album_covers: true,
  show_artist_names: true
}

export function queueConfigForm() {
  return [
    { name: "enabled", selector: { boolean: {} } },
    {
      name: "",
      type: "grid",
      schema: [
        { name: "limit_before", selector: { number: { min: 0, max: 500, mode: "box"}}},
        { name: "limit_after", selector: { number: { min: 0, max: 500, mode: "box"}}},
        { name: "show_album_covers", selector: { boolean: {} } },
        { name: "show_artist_names", selector: { boolean: {} } },
      ]
    }
  ]
}

export enum QueueConfigErrors {
  CONFIG_MISSING = 'Invalid configuration.',
  NO_ENTITY = 'You need to define entity.',
  ENTITY_TYPE = 'Entity must be a string!',
  MISSING_ENTITY = 'Entity does not exist!',
  OK = 'ok'
}