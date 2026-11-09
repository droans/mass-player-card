import { getInfoWSResponseSchema } from "mass-queue-types/packages/mass_queue/ws/get_info";
import { EnqueueOptions } from "../const/enums";
import { ExtendedHass } from "../const/types";

export interface FolderItem {
  name: string;
  uri: string;
  media_type: string;
  path?: string;
  available?: boolean;
}

export function folderItemName(item: FolderItem): string {
  const path = item.path ?? item.uri.split("/").slice(3).join("/");
  const filename = path.split("/").findLast(Boolean);
  if (item.media_type == "folder" || !filename) {
    return item.name;
  }
  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

export function sortFolderItems(items: FolderItem[]): FolderItem[] {
  return items.toSorted((first, second) => {
    const firstName = folderItemName(first);
    const secondName = folderItemName(second);
    if (firstName === secondName) {
      return 0;
    }
    return firstName < secondName ? -1 : 1;
  });
}

export class FolderActions {
  constructor(private hass: ExtendedHass) {}

  async browse(entityId: string, path = "root") {
    const info = await this.hass.callWS<getInfoWSResponseSchema>({
      type: "mass_queue/get_info",
      entity_id: entityId,
    });
    const response = await this.hass.callWS<{
      response: { response: FolderItem[] };
    }>({
      type: "call_service",
      domain: "mass_queue",
      service: "send_command",
      service_data: {
        config_entry_id: info.entries.mass_queue,
        command: "music/browse",
        data: { path },
      },
      return_response: true,
    });
    return sortFolderItems(
      response.response.response.filter((item) => item.name != ".."),
    );
  }

  async enqueue(
    entityId: string,
    item: FolderItem,
    enqueue: EnqueueOptions,
    user?: string | null,
  ) {
    const items =
      item.media_type == "folder"
        ? await this.collectTracks(entityId, item.path ?? item.uri)
        : [item];
    if (items.length === 0) {
      return;
    }
    await this.hass.callService("music_assistant", "play_media", {
      entity_id: entityId,
      media_id: items.map((track) => track.uri),
      ...(item.media_type == "folder" ? { shuffle: false } : {}),
      ...(enqueue == EnqueueOptions.RADIO ? { radio_mode: true } : { enqueue }),
      ...(user ? { username: user } : {}),
    });
  }

  private async collectTracks(
    entityId: string,
    path: string,
    visited = new Set<string>(),
  ): Promise<FolderItem[]> {
    if (visited.has(path)) {
      return [];
    }
    visited.add(path);
    const tracks: FolderItem[] = [];
    for (const item of await this.browse(entityId, path)) {
      if (item.available === false) {
        continue;
      }
      if (item.media_type == "folder") {
        tracks.push(
          ...(await this.collectTracks(
            entityId,
            item.path ?? item.uri,
            visited,
          )),
        );
      } else {
        tracks.push(item);
      }
    }
    return tracks;
  }
}
