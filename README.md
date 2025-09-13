<div align="center">

[![GitHub Release][release-shield]][release]
![Downloads][downloads-shield]
[![HACS][hacs-badge-shield]][hacs-badge]

[![Maintainer][maintainer-shield]][maintainer]
[![GitHub Activity][activity-shield]][activity]
[![License][license-shield]][license]

</div>

[release-shield]: https://img.shields.io/github/release/droans/mass-player-card.svg?style=for-the-badge
[release]: https://github.com/droans/mass-player-card/releases
[license-shield]: https://img.shields.io/github/license/droans/mass-player-card.svg?style=for-the-badge
[license]: LICENSE
[hacs-badge-shield]: https://img.shields.io/badge/HACS-Default-blue.svg?style=for-the-badge
[hacs-badge]: https://github.com/hacs/default
[maintainer-shield]: https://img.shields.io/badge/maintainer-droans-blue.svg?style=for-the-badge
[maintainer]: https://github.com/droans
[activity-shield]: https://img.shields.io/github/last-commit/droans/mass-player-card?style=for-the-badge
[activity]: https://github.com/droans/mass-player-card/commits/main
[downloads-shield]: https://img.shields.io/github/downloads/droans/mass-player-card/total?style=for-the-badge

# Music Assistant Player Card

A Home Assistant media player card built for Music Assistant players.

### Important: This card requires the custom integration [Music Assistant Queue Actions](https://github.com/droans/mass_queue) to function. This integration must be installed before continuing!

## Install with HACS:

<!-- [![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=mass-player-card&owner=droans&category=Plugin) -->

## Installation

### Prequisites

In addition to the Music Assistant integration, this card depends on the custom integration `mass_queue` for all the actions. Follow all instructions [in the repository](https://github.com/droans/mass_queue) to install first.

<img src="https://github.com/droans/mass-player-card/blob/main/static/music_player/desktop.png" alt="Player Card Example">

### HACS Installation
1. Add this repository to your HACS custom repositories.
2. Find and install "Music Assistant Player Card".
<!-- 1. Use button above to add to your Home Assistant instance. -->

### Manual Installation
1. Download the card.
    - Navigate to the Releases and locate the latest release.
    - Download `mass-card.js`
    - Save `mass-card.js` to your Home Assistant `<config>/www` directory
2. Add card to your HA resources
    - Go to your Home Assistant Settings.
    - Select "Dashboards"
    - In the top left, select the three-dot overflow menu and click "Resources"
    - Press "Add Resource". For the URL, type in "/local/mass-card.js". Select "JavaScript module" and click "Create".

# Configuration
The card does not have a visual editor. Use this configuration to create your card:

## Example 
```yaml
type: custom:mass-card
entity: media_player.music_assistant_player
title: Play Queue
expanded: false
```

## Base Config
| Parameter     | Type                                             | Required | Default | Description                                        |
|---------------|--------------------------------------------------|----------|---------|----------------------------------------------------|
| type          | str                                              | Yes      | n/a     | Use `custom:mass-player-card`                      |
| entities      | list of string or [EntityConfig](#entity-config) | Yes      | n/a     | The Music Assistant `media_player` entities to use |
| player        | [PlayerConfig](#player-config)                   | No       | 5       | See Below                                          |
| queue         | [QueueConfig](#queue-config)                     | No       | 5       | See Below                                          |
| media_browser | [MediaBrowserConfig](#media-browser-config)      | No       | 5       | See Below                                          |
| players       | [PlayersConfig](#players-config)                 | No       | 5       | See Below                                          |

## Entity Config
For each entity, you can either provide the Entity ID by itself or you can provide the Music Assistant media player Entity ID, the media player Entity ID for volume control, and/or the name of the player. Below is the config if you would like to provide the additional details.

| Parameter        | Type | Required | Default     | Description                         |
|------------------|------|----------|-------------|-------------------------------------|
| entity_id        | str  | Yes      | N/A         | The Music Assistant entity          |
| volume_entity_id | str  | No       | `entity_id` | The media player for volume control |
| name             | str  | No       | N/A         | The name of the media player        |

## Player Config
| Parameter | Type | Required | Default | Description                     |
|-----------|------|----------|---------|---------------------------------|
| enabled   | bool | No       | true    | Enable/disable music player tab |

## Queue Config
Display and interact with the player's queue.

<details>
    <summary>📷 Queue Example</summary>
<img src="https://github.com/droans/mass-player-card/blob/main/static/queue/desktop.png" alt="Player Card Queue Section Example">
</details>

| Parameter         | Type | Required | Default | Description                                          |
|-------------------|------|----------|---------|------------------------------------------------------|
| enabled           | bool | No       | true    | Enable/disable queue tab                             |
| limit_before      | bool | No       | 5       | Number of item to display before current active item |
| limit_after       | bool | No       | 25      | Number of item to display after current active item  |
| show_album_covers | bool | No       | true    | Show album cover images for each item                |
| show_artist_names | bool | No       | true    | Show artist names for each item                      |

## Media Browser Config

<details>
    <summary>📷 Media Browser Example</summary>
<img src="https://github.com/droans/mass-player-card/blob/main/static/media_browser/desktop.png" alt="Player Card Media Browser Section Example">
</details>

| Parameter | Type                                      | Required | Default | Description                      |
|-----------|-------------------------------------------|----------|---------|----------------------------------|
| enabled   | bool                                      | No       | true    | Enable/disable media browser tab |
| favorites | [FavoritesConfig](#favorites-config)      | No       | -       | See below                        |
| sections | list of [SectionsConfig](#sections-config) | No       | -       | See below                        |

## Favorites Config
| Parameter  | Type                            | Required | Default | Description                     |
|------------|---------------------------------|----------|---------|---------------------------------|
| enabled    | bool                            | No       | true    | Enable/disable music player tab |
| albums     | [FavoriteItem](#favorite-items) | No       | true    | See below                       |
| artists    | [FavoriteItem](#favorite-items) | No       | true    | See below                       |
| audiobooks | [FavoriteItem](#favorite-items) | No       | true    | See below                       |
| playlists  | [FavoriteItem](#favorite-items) | No       | true    | See below                       |
| podcasts   | [FavoriteItem](#favorite-items) | No       | true    | See below                       |
| radios     | [FavoriteItem](#favorite-items) | No       | true    | See below                       |
| tracks     | [FavoriteItem](#favorite-items) | No       | true    | See below                       |

### Favorite Items
You can select which favorite items you'd like to display in the media browser. Use the example below to help set it up. By default, all favorites are enabled. If no favorites exist for a category, the section will not be displayed.

```yaml
type: custom:mass-player-card
entities:
  - media_player.my_player
media_browser:
  favorites:
    albums:
      enabled: false
    playlists:
      enabled: true
    ...
```

| Parameter  | Type | Required | Default | Description                                 |
|------------|------|----------|---------|---------------------------------------------|
| enabled    | bool | No       | true    | Enable/disable favorites for the media type |
| limit      | int  | No       | 25      | Maximum number of favorite items to return  |

## Sections Config
Sections lets you add your own sections to the browser with your own items. These can either be media items (by providing `media_content_id` and `media_type`) or they can be a script (by providing `service`). If the item is a script, the current media player will be passed to it with the `entity_id` parameter.
| Parameter  | Type                                      | Required | Default | Description                                        |
|------------|-------------------------------------------|----------|---------|----------------------------------------------------|
| name       | str                                       | Yes      | N/A     | The name for the custom section                    |
| image      | str                                       | Yes      | N/A     | The URL of the image to use for the custom section |
| items      | [SectionItemConfig](#section-item-config) | Yes      | true    | See below   |                                      |

## Section Item Config
These will be for each item inside of that section. Either `service` must be provided or `media_content_id` and `media_content_type`.
| Parameter          | Type  | Required | Default | Description                                        |
|--------------------|-------|----------|---------|----------------------------------------------------|
| name               | str   | Yes      | N/A     | The name for the custom section                    |
| image              | str   | Yes      | N/A     | The URL of the image to use for the custom section |
| media_content_id   | str   | No       | true    | Media Content ID of the item to be played          |                                      
| media_content_type | str   | No       | true    | Media Content type of the item to be played        |
| service            | str   | No       | true    | Service to be called when selected                 |          

## Players Config

<details>
    <summary>📷 Media Player Example</summary>
<img src="https://github.com/droans/mass-player-card/blob/main/static/players/desktop.png" alt="Player Card Players Section Example">
</details>

| Parameter | Type | Required | Default | Description                     |
|-----------|------|----------|---------|---------------------------------|
| enabled   | bool | No       | true    | Enable/disable music player tab |