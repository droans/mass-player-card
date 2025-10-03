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

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=mass-player-card&owner=droans&category=Plugin)

## Installation

### Prequisites

In addition to the Music Assistant integration, this card depends on the custom integration `mass_queue` for all the actions. Follow all instructions [in the repository](https://github.com/droans/mass_queue) to install first.

<img src="https://github.com/droans/mass-player-card/blob/main/static/combined.png" alt="Player Card Example">

### HACS Installation
1. Use button above to add to your Home Assistant instance.

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

### Minimal Config

This is the minimal config you need for the card to work.

```yaml
type: custom:mass-player-card
entities:
  - media_player.music_assistant_player
```

### Default Configuration

<details>
  <summary>Full Default Config</summary>

```yaml
type: custom:mass-player-card
entities:
  - entity_id: <MEDIA_PLAYER_ENTITY>
    volume_entity_id: <MEDIA_PLAYER_ENTITY>
    max_volume: 100
    name: <MEDIA_PLAYER_ENTITY_NAME>
    hide:
      player:
        favorite: false
        mute: false
        player_selector: false
        power: false
        repeat: false
        shuffle: false
        volume: false
queue:
  enabled: true
  hide:
    action_buttons: false
    move_down_button: false
    move_next_button: false
    move_up_button: false
    remove_button: false
    album_covers: false
    artist_names: false
  limit_before: 5
  limit_after: 100
  show_album_covers: true
  show_artist_names: true
player:
  enabled: true
  hide:
    favorite: false
    mute: false
    player_selector: false
    power: false
    repeat: false
    shuffle: false
    volume: false
    group_volume: false
  layout:
    controls_layout: compact
    icons:
      shuffle:
        size: small
        box_shadow: false
      previous:
        size: small
        box_shadow: false
      play_pause:
        size: large
        box_shadow: true
      next:
        size: small
        box_shadow: false
      repeat:
        size: small
        box_shadow: false
players:
  enabled: true
  hide:
    action_buttons: false
    join_button: false
    transfer_button: false
media_browser:
  enabled: true
  hidden:
    back_button: false
    search: false
    titles: false
    enqueue_menu: false
    add_to_queue_button: false
    play_next_button: false
    play_next_clear_queue_button: false
    play_now_button: false
    play_now_clear_queue_button: false
  favorites:
    albums:
      enabled: true
      limit: 25
      favorites_only: true
    artists:
      enabled: true
      limit: 25
      favorites_only: true
    audiobooks:
      enabled: true
      limit: 25
      favorites_only: true
    playlists:
      enabled: true
      limit: 25
      favorites_only: true
    podcasts:
      enabled: true
      limit: 25
      favorites_only: true
    radios:
      enabled: true
      limit: 25
      favorites_only: true
    tracks:
      enabled: true
      limit: 25
      favorites_only: true
```

</details>

### Full Example Configuration

<details>
  <summary> Full Example Config</summary>

```yaml
type: custom:mass-player-card
entities:
  - media_player.kitchen_player_music_assistant
  - entity_id: media_player.bedroom_player_music_assistant
    hide:
      player:
        favorite: true
        mute: true
        player_selector: true
        power: true
        repeat: true
        shuffle: true
        volume: true
  - entity_id: media_player.living_room_player_music_assistant
    volume_entity_id: media_player.living_room_tv
  - entity_id: media_player.bathoom_music_assistant
    name: Bathroom Speaker
    max_volume: 50
    hide:
      player:
        mute: true
        power: true
        volume: true
      queue:
        move_up_button: true
  - entity_id: media_player.loft_music_assistant
    volume_entity_id: media_player.loft_tv
    max_volume: 40
    name: Loft TV
  - entity_id: media_player.basement_music_assistant
    name: Basement
    hide:
      player:
        mute: true
        power: true
queue:
  enabled: true
  limit_before: 10
  limit_after: 50
  show_album_covers: true
  show_artist_names: true
player:
  enabled: true
  layout:
    controls_layout: spaced
    icons:
      play_pause:
        size: small
        box_shadow: true
players:
  enabled: true
media_browser:
  enabled: true
  favorites:
    albums:
      enabled: true
      limit: 25
      favorites_only: true
    artists:
      enabled: true
      limit: 10
      favorites_only: true
    audiobooks:
      enabled: true
      limit: 5
      favorites_only: false
    playlists:
      enabled: true
      limit: 5
      favorites_only: false
    podcasts:
      enabled: true
      limit: 15
      favorites_only: false
    radios:
      enabled: true
      limit: 4
      favorites_only: false
    tracks:
      enabled: true
      limit: 100
      favorites_only: true
      items:
        - name: My Playlist
          image: https://resources.tidal.com/images/10c59b67/bb86/4960/8071/a23a03b8cbdd/750x750.jpg
          service: script.play_example_playlist
  sections:
    - name: My Tracks
      image: https://resources.tidal.com/images/0b5ff69d/b031/4445/a804/01b18b5a525f/750x750.jpg
      items:
        - name: The Show Goes On
          image: https://resources.tidal.com/images/9a18c67f/1062/4068/986b/45654fade74a/750x750.jpg
          media_content_id: tidal://track/241647167
          media_content_type: track
        - name: TRUSTFALL (Album)
          image: https://i.scdn.co/image/ab67616d0000b2735b8cf73dd4eebd286d9a2c78
          media_content_id: library://artist/40
          media_content_type: track
        - name: Where Is The Love?
          image: https://resources.tidal.com/images/b15ef956/5eed/43ba/9bba/d1ea1c3e48a4/750x750.jpg
          media_content_id: tidal://track/222419939
          media_content_type: track
```

</details>

## Base Config
| Parameter     | Type                                             | Required | Default | Description                                        |
|---------------|--------------------------------------------------|----------|---------|----------------------------------------------------|
| type          | str                                              | Yes      | n/a     | Use `custom:mass-player-card`                      |
| entities      | list of string or [EntityConfig](#entity-config) | Yes      | n/a     | The Music Assistant `media_player` entities to use |
| player        | [MusicPlayerConfig](#music-player-config)        | No       | 5       | See Below                                          |
| queue         | [QueueConfig](#queue-config)                     | No       | 5       | See Below                                          |
| media_browser | [MediaBrowserConfig](#media-browser-config)      | No       | 5       | See Below                                          |
| players       | [PlayersConfig](#players-config)                 | No       | 5       | See Below                                          |

## Entity Config
For each entity, you can either provide the Entity ID by itself or you can provide the Music Assistant media player Entity ID, the media player Entity ID for volume control, and/or the name of the player. Below is the config if you would like to provide the additional details.

| Parameter        | Type                                                          | Required | Default     | Description                              |
|------------------|---------------------------------------------------------------|----------|-------------|------------------------------------------|
| entity_id        | str                                                           | Yes      | N/A         | The Music Assistant entity               |
| volume_entity_id | str                                                           | No       | `entity_id` | The media player for volume control      |
| name             | str                                                           | No       | N/A         | The name of the media player             |
| max_volume       | int                                                           | No       | N/A         | Max volume for the volume slider (0-100) |
| hide             | [EntityHiddenElementsConfig](#entity-hidden-elements-config)  | No       | See below   | See Below                                |

## Entity Hidden Elements Config
Certain elements across the different sections can be hidden or displayed depending on your configuration. By default, every item will be displayed.

| Parameter     | Type                                                                     | Required | Default     | Description                              |
|---------------|--------------------------------------------------------------------------|----------|-------------|------------------------------------------|
| player        | [MusicPlayerHiddenElementsConfig](#music-player-hidden-elements-config)  | No       | See below   | See Below                                |
| queue         | [QueueHiddenElementsConfig](#queue-hidden-elements-config)  | No       | See below   | See Below                                |
| media_browser | [MediaBrowserHiddenElementsConfig](#media-browser-hidden-elements-config)  | No       | See below   | See Below                                |
| players       | [PlayersHiddenElementsConfig](#players-hidden-elements-config)  | No       | See below   | See Below                                |

## Music Player Config

<details>
    <summary>📷 Media Player Example</summary>
<img src="https://github.com/droans/mass-player-card/blob/main/static/music_player/desktop.png" alt="Player Card Example">
</details>

| Parameter | Type                                                                    | Required | Default | Description                     |
|-----------|-------------------------------------------------------------------------|----------|---------|---------------------------------|
| enabled   | bool                                                                    | No       | true    | Enable/disable music player tab |
| hide      | [MusicPlayerHiddenElementsConfig](#music-player-hidden-elements-config) | No       | N/A     | See below                       |
| layout    | [MusicPlayerLayoutConfig](#music-player-hidden-elements-config)         | No       | N/A     | See below                       |


## Music Player Hidden Elements Config
Multiple elements on the Music Player tab can be hidden. By default, all elements are visible

| Parameter       | Type | Required | Default     | Description                           |
|-----------------|------|----------|-------------|---------------------------------------|
| favorite        | bool  | No       | false       | Hides the favorite button            |
| mute            | bool  | No       | false       | Hides the mute button                |
| player_selector | bool  | No       | false       | Hides the player selector button     |
| power           | bool  | No       | false       | Hides the power button               |
| repeat          | bool  | No       | false       | Hides the repeat button              |
| shuffle         | bool  | No       | false       | Hides the shuffle button             |
| volume          | bool  | No       | false       | Hides the volume button              |
| group_volume    | bool  | No       | false       | Hides the grouped player volume menu |

## Music Player Layout Config
The layout of the control buttons can be adjusted to your liking. Use the full default configuration below as an example.

<detail>
<summary>Full Default Configuration</summary>

```yaml
type: custom:mass-player-card
player:
  layout:
    controls_layout: compact          # Options: compact or spaced (default: compact)
    icons:
      shuffle:
        size: small                   # Options: small or large (default: small)
        box_shadow: false             # Options: True/False (default: false)
        label: true                   # Options: True/False (default: false)
                                      # Note: Label will never show if size is large
      previous:
        size: small                   # Options: small or large (default: small)
        box_shadow: false             # Options: True/False (default: false)
        label: false                  # Options: True/False (default: false)
                                      # Note: Label will never show if size is large
      next:
        size: small                   # Options: small or large (default: small)
        box_shadow: false             # Options: True/False (default: false)
        label: false                  # Options: True/False (default: false)
                                      # Note: Label will never show if size is large
      repeat:
        size: small                   # Options: small or large (default: small)
        box_shadow: false             # Options: True/False (default: false)
        label: true                   # Options: True/False (default: false)
                                      # Note: Label will never show if size is large
      play_pause:
        size: large                   # Options: small or large (default: small)
        box_shadow: true              # Options: True/False (default: false)
        label: false                  # Options: True/False (default: false)
                                      # Note: Label will never show if size is large
      
```

</detail>

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
| hide              | [QueueHiddenElementsConfig](#queue-hidden-elements-config)  | No       | See below   | See Below                                |

## Queue Hidden Elements Config
Multiple elements on the queue tab can be hidden. By default, all elements are visible

| Parameter        | Type  | Required | Default     | Description                |
|------------------|-------|----------|-------------|----------------------------|
| action_buttons   | bool  | No       | false       | Hides the action buttons   |
| move_down_button | bool  | No       | false       | Hides the Move Down button |
| move_up_button   | bool  | No       | false       | Hides the Move Up button   |
| move_next_button | bool  | No       | false       | Hides the Move Next button |
| remove_button    | bool  | No       | false       | Hides the Remove button    |
| album_covers     | bool  | No       | false       | Hides album covers         |
| artist_names     | bool  | No       | false       | Hides artist names         |

## Media Browser Config

<details>
    <summary>📷 Media Browser Example</summary>
<img src="https://github.com/droans/mass-player-card/blob/main/static/media_browser/desktop.png" alt="Player Card Media Browser Section Example">
</details>

| Parameter | Type                                                                       | Required | Default     | Description                      |
|-----------|----------------------------------------------------------------------------|----------|-------------|----------------------------------|
| enabled   | bool                                                                       | No       | true        | Enable/disable media browser tab |
| favorites | [FavoritesConfig](#favorites-config)                                       | No       | -           | See below                        |
| sections  | list of [SectionsConfig](#sections-config)                                 | No       | -           | See below                        |
| hide      | [MediaBrowserHiddenElementsConfig](#media-browser-hidden-elements-config)  | No       | See below   | See Below                                |

## Media Browser Hidden Elements Config
Multiple elements on the media browser tab can be hidden. By default, all elements are visible

| Parameter                    | Type  | Required | Default     | Description                                |
|------------------------------|-------|----------|-------------|--------------------------------------------|
| back_button                  | bool  | No       | false       | Hides the back button                      |
| search                       | bool  | No       | false       | Hides the search button                    |
| titles                       | bool  | No       | false       | Hides titles for each section/item         |
| enqueue_menu                 | bool  | No       | false       | Hides the enqueue menu                     |
| add_to_queue_button          | bool  | No       | false       | Hides the "Add to Queue" button            |
| play_now_button              | bool  | No       | false       | Hides the "Play Now" button                |
| play_now_clear_queue_button  | bool  | No       | false       | Hides the "Play Now & Clear Queue" button  |
| play_next_button             | bool  | No       | false       | Hides the "Play Next" button               |
| play_next_clear_queue_button | bool  | No       | false       | Hides the "Play Next & Clear Queue" button |

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
You can select which favorite items you'd like to display in the media browser. Use the example below to help set it up. By default, all favorites are enabled. If no favorites exist for a category, the section will not be displayed. You can also add your own custom items to the favorite section by specifying it under `items`.

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

| Parameter      | Type                                      | Required | Default | Description                                                              |
|----------------|-------------------------------------------|----------|---------|--------------------------------------------------------------------------|
| enabled        | bool                                      | No       | true    | Enable/disable favorites for the media type                              |
| limit          | int                                       | No       | 25      | Maximum number of favorite items to return                               |
| favorites_only | bool                                      | No       | true    | True: Only return favorited items. False: Return any items from library  |
| items          | [SectionItemConfig](#section-item-config) | No       | N/A     | See below                                                                |

### WARNING: 

Unless you have a small library, `favorites_only` will likely not work as you expect:
* Music Assistant will always return items in alphabetical order. 
* It will limit the returned items to 500. This may not cover all your items. Simultaneously, this many items may also cause performance issues.

It is recommended that you add custom items instead. 

## Sections Config
Sections lets you add your own sections to the browser with your own items. These can either be media items (by providing `media_content_id` and `media_content_type`) or they can be a script (by providing `service`). If the item is a script, the current media player will be passed to it with the `entity_id` parameter.
| Parameter  | Type                                      | Required | Default | Description                                        |
|------------|-------------------------------------------|----------|---------|----------------------------------------------------|
| name       | str                                       | Yes      | N/A     | The name for the custom section                    |
| image      | str                                       | Yes      | N/A     | The URL of the image to use for the custom section |
| items      | [SectionItemConfig](#section-item-config) | Yes      | true    | See below                                          |

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

| Parameter | Type                                                            | Required | Default     | Description                     |
|-----------|-----------------------------------------------------------------|----------|-------------|---------------------------------|
| enabled   | bool                                                            | No       | true        | Enable/disable music player tab |
| hide      | [PlayersHiddenElementsConfig](#players-hidden-elements-config)  | No       | See below   | See Below                       |

## Players Hidden Elements Config
Multiple elements on the players tab can be hidden. By default, all elements are visible

| Parameter       | Type  | Required | Default     | Description               |
|-----------------|-------|----------|-------------|---------------------------|
| action_buttons  | bool  | No       | false       | Hides the action buttons  |
| join_button     | bool  | No       | false       | Hides the join button     |
| transfer_button | bool  | No       | false       | Hides the transfer button |