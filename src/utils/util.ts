import { Config } from "../config/config";
import { DEFAULT_SECTION_PRIORITY, Sections } from "../const/card";

export function testMixedContent(url: string) {
  try {
    if (window.location.protocol == 'http') {
      return true;
    }
    return isHttpsOrRelative(url);
  } catch {
    return false;
  }
}

export function isHttpsOrRelative(url: string) {
  try {
    return !url.startsWith('http:');
  } catch {
    return false;
  }
}

export function getDefaultSection(config: Config) {
  const defaults = DEFAULT_SECTION_PRIORITY;
  const sections_conf: Record<string, boolean> = {
    [Sections.MUSIC_PLAYER]: config.player.enabled,
    [Sections.QUEUE]: config.queue.enabled,
    [Sections.PLAYERS]: config.players.enabled,
    [Sections.MEDIA_BROWSER]: config.media_browser.enabled
  }
  const filtered = Object.entries(sections_conf).filter(
    (item) => item[1]
  ).map( 
    (item) => item[0]
  )
  const enabled_defaults = defaults.filter(
    (item) => filtered.includes(item)
  );
  return enabled_defaults[0];
}