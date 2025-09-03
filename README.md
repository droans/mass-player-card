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

<img src="https://github.com/droans/mass-player-card/blob/dev/static/music_player/desktop.png" alt="Player Card Example" width=68%> <img src="https://github.com/droans/mass-player-card/blob/dev/static/music_player/mobile.png" alt="Player Card Mobile Example" width=31%>

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
| Parameter     | Type                                        | Required | Default | Description                                        |
|---------------|---------------------------------------------|----------|---------|----------------------------------------------------|
| type          | str                                         | Yes      | n/a     | Use `custom:mass-player-card`                      |
| entities      | list                                        | Yes      | n/a     | The Music Assistant `media_player` entities to use |
| player        | [PlayerConfig](#player-config)              | No       | 5       | See Below                                          |
| queue         | [QueueConfig](#queue-config)                | No       | 5       | See Below                                          |
| media_browser | [MediaBrowserConfig](#media-browser-config) | No       | 5       | See Below                                          |
| players       | [PlayersConfig](#players-config)            | No       | 5       | See Below                                          |

## Player Config
| Parameter | Type | Required | Default | Description                     |
|-----------|------|----------|---------|---------------------------------|
| enabled   | bool | No       | true    | Enable/disable music player tab |

## Queue Config
Display and interact with the player's queue.

<img src="https://github.com/droans/mass-player-card/blob/dev/static/queue/desktop.png" alt="Player Card Queue Section Example" width=68%> <img src="https://github.com/droans/mass-player-card/blob/dev/static/queue/mobile.png" alt="Player Card Queue Section Mobile Example" width=31%>

| Parameter         | Type | Required | Default | Description                                          |
|-------------------|------|----------|---------|------------------------------------------------------|
| enabled           | bool | No       | true    | Enable/disable queue tab                             |
| limit_before      | bool | No       | 5       | Number of item to display before current active item |
| limit_after       | bool | No       | 25      | Number of item to display after current active item  |
| show_album_covers | bool | No       | true    | Show album cover images for each item                |
| show_artist_names | bool | No       | true    | Show artist names for each item                      |

## Media Browser Config

<img src="https://github.com/droans/mass-player-card/blob/dev/static/media_browser/desktop.png" alt="Player Card Media Browser Section Example" width=68%> <img src="https://github.com/droans/mass-player-card/blob/dev/static/media_browser/mobile.png" alt="Player Card Media Browser Mobile Section Example" width=31%>
| Parameter | Type                                 | Required | Default | Description                      |
|-----------|--------------------------------------|----------|---------|----------------------------------|
| enabled   | bool                                 | No       | true    | Enable/disable media browser tab |
| favorites | [FavoritesConfig](#favorites-config) | No       | -       | See below                        |

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


## Players Config

<img src="https://github.com/droans/mass-player-card/blob/dev/static/players/desktop.png" alt="Player Card Players Section Example" width=68%> <img src="https://github.com/droans/mass-player-card/blob/dev/static/players/mobile.png" alt="Player Card Players Section Mobile Example" width=31%>
| Parameter | Type | Required | Default | Description                     |
|-----------|------|----------|---------|---------------------------------|
| enabled   | bool | No       | true    | Enable/disable music player tab |