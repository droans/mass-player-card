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
[license-shield]: https://img.shields.io/github/license/droans/mass-player-card?style=for-the-badge
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

# Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

  - [Features](#features)
  - [Installation](#installation)
- [Configuration](#configuration)
  - [Base Config](#base-config)
  - [Entity Config](#entity-config)
  - [Entity Hidden Elements Config](#entity-hidden-elements-config)
  - [Expressive Scheme](#expressive-scheme)
  - [Music Player Config](#music-player-config)
  - [Music Player Hidden Elements Config](#music-player-hidden-elements-config)
  - [Music Player Layout Config](#music-player-layout-config)
  - [Queue Config](#queue-config)
  - [Queue Hidden Elements Config](#queue-hidden-elements-config)
  - [Media Browser Config](#media-browser-config)
  - [Media Browser Hidden Elements Config](#media-browser-hidden-elements-config)
  - [Favorites Config](#favorites-config)
  - [Recommendations Config](#recommendations-config)
  - [Sections Config](#sections-config)
  - [Section Item Config](#section-item-config)
  - [Players Config](#players-config)
  - [Players Hidden Elements Config](#players-hidden-elements-config)
- [FAQs](#faqs)
  - [The card won't display at all or won't display properly!](#the-card-wont-display-at-all-or-wont-display-properly)
  - [The media browser won't display any items for:](#the-media-browser-wont-display-any-items-for)
  - [I'm not seeing any artwork in the queue or media browser!](#im-not-seeing-any-artwork-in-the-queue-or-media-browser)
  - [How do I theme the card?](#how-do-i-theme-the-card)
  - [Can this card work in my local language?](#can-this-card-work-in-my-local-language)
  - [I am having issues with this card on my iOS/OSX device but it works fine elsewhere.](#i-am-having-issues-with-this-card-on-my-iososx-device-but-it-works-fine-elsewhere)
  - [I would like to sponsor you/the card and/or pay to add a new feature!](#i-would-like-to-sponsor-youthe-card-andor-pay-to-add-a-new-feature)
  - [I have other questions or issues not addressed](#i-have-other-questions-or-issues-not-addressed)
- [Contributing](#contributing)
- [Developing](#developing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features
* Responsive Material Expressive UI!
  * Set styles via HA theme variables - see below
  * Set custom Expressive scheme in your config
* Hide elements you don't want, even at the player level or for an entire tab
* Use a different `media_player` to control the volume of an entity
* Even artwork for local media will show!
* Music Player Tab
  * Swipe to change tracks
  * Hold ❤️ to Add to Playlist
  * Customizable layout
  * Adjust volume for current or any grouped players
  * Switch between any configured player
* Player Queue Tab
  * Select track to play it now
  * Move up, next, down, or remove items
  * Clear entire playlist
  * Configure the number of queue items to display
* Media Browser Tab
  * All media types - Albums, artists, audiobooks, playlists, podcasts, radios, and tracks
  * View your Favorites, Recents, or Provider Recommendations
  * Search your providers for any media type - both local and non-local media
  * Add your own custom media or scripts
  * Subviews to display the details and tracks/episodes for albums, artists, playlists, and podcasts
    * Select which track you want to start on!
    * Remove tracks from a playlist - **See below for important notes!**
  * Enqueue items to play now/next, clear queue and play now/next, or start radio
* Players Tab
  * Switch to any configured player
  * Join or transfer your active queues


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
This card comes with a visual editor. However, not every option can be set with it (eg, player name and volume player, custom items, etc). Use the below documentation to help. 

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
expressive: true
expressive_theme: expressive
panel: false
default_section: music_player
entities:
  - entity_id: <MEDIA_PLAYER_ENTITY>
    volume_entity_id: <MEDIA_PLAYER_ENTITY>
    max_volume: 100
    name: <MEDIA_PLAYER_ENTITY_NAME>
    inactive_when_idle: true
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
  recents:
    enabled: true
  recommendations:
    enabled: true
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
playlists_allow_removing_tracks: false
```

</details>

### Full Example Configuration

<details>
  <summary> Full Example Config</summary>

```yaml
type: custom:mass-player-card
expressive: true
expressive: true
expressive_theme: fruit_salad
download_local: false
panel: false
default_section: media_browser
entities:
  - media_player.kitchen_player_music_assistant
  - entity_id: media_player.bedroom_player_music_assistant
    inactive_when_idle: true
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
  columns: 2
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
  recents:
    enabled: true
  recommendations:
    enabled: true
    providers:
      - plex
      - tidal
playlists_allow_removing_tracks: false
```

</details>

## Base Config
| Parameter                    | Type                                             | Required | Default      | Description                                                  |
|------------------------------|--------------------------------------------------|----------|--------------|--------------------------------------------------------------|
| type                         | str                                              | Yes      | n/a          | Use `custom:mass-player-card`                                |
| expressive                   | boolean                                          | No       | true         | Enables Material Expressive theme                            |
| expressive_scheme            | str                                              | No       | expressive   | The expressive scheme to use for the theme, see below        |
| download_local               | boolean                                          | No       | false        | Download and encode images if not remotely accessible        |
| entities                     | list of string or [EntityConfig](#entity-config) | Yes      | n/a          | The Music Assistant `media_player` entities to use           |
| player                       | [MusicPlayerConfig](#music-player-config)        | No       | 5            | See Below                                                    |
| queue                        | [QueueConfig](#queue-config)                     | No       | 5            | See Below                                                    |
| media_browser                | [MediaBrowserConfig](#media-browser-config)      | No       | 5            | See Below                                                    |
| players                      | [PlayersConfig](#players-config)                 | No       | 5            | See Below                                                    |
| panel                        | boolean                                          | No       | false        | Displays a full-height card when enabled                     |
| default_section              | str                                              | No       | music_player | Default starting section, see below                          |
| sync_player_across_dashboard | boolean                                          | No       | false        | Syncs the selected player across all cards on the dashboard. |

## Entity Config
For each entity, you can either provide the Entity ID by itself or you can provide the Music Assistant media player Entity ID, the media player Entity ID for volume control, and/or the name of the player. Below is the config if you would like to provide the additional details.

| Parameter          | Type                                                          | Required | Default     | Description                              |
|--------------------|---------------------------------------------------------------|----------|-------------|------------------------------------------|
| entity_id          | str                                                           | Yes      | N/A         | The Music Assistant entity               |
| volume_entity_id   | str                                                           | No       | `entity_id` | The media player for volume control      |
| name               | str                                                           | No       | N/A         | The name of the media player             |
| inactive_when_idle | bool                                                          | No       | false       | Consider the player inactive if idle.    |
| max_volume         | int                                                           | No       | N/A         | Max volume for the volume slider (0-100) |
| hide               | [EntityHiddenElementsConfig](#entity-hidden-elements-config)  | No       | See below   | See Below                                |

## Entity Hidden Elements Config
Certain elements across the different sections can be hidden or displayed depending on your configuration. By default, every item will be displayed.

| Parameter     | Type                                                                     | Required | Default     | Description                              |
|---------------|--------------------------------------------------------------------------|----------|-------------|------------------------------------------|
| player        | [MusicPlayerHiddenElementsConfig](#music-player-hidden-elements-config)  | No       | See below   | See Below                                |
| queue         | [QueueHiddenElementsConfig](#queue-hidden-elements-config)  | No       | See below   | See Below                                |
| media_browser | [MediaBrowserHiddenElementsConfig](#media-browser-hidden-elements-config)  | No       | See below   | See Below                                |
| players       | [PlayersHiddenElementsConfig](#players-hidden-elements-config)  | No       | See below   | See Below                                |

## Expressive Scheme
This defines the expressive scheme which will be used for color generation. @Nerwyn has a [great description](https://github.com/Nerwyn/material-you-utilities) in the readme for his Material You Utilities which may be useful.

There are a handful of different options for the scheme:
* content
* expressive
* fidelity
* fruit_salad
* monochrome
* neutral
* rainbow
* tonal_spot
* vibrant

## Default Section

You can choose which section to start on by default. By default, the first enabled section listed below will be chosen. Any of these options are valid for the default section:

* music_player
* queue
* media_browser
* players

## Music Player Config

<details>
    <summary>📷 Media Player Example</summary>
<img src="https://github.com/droans/mass-player-card/blob/main/static/music_player/desktop.png" alt="Player Card Example">
</details>

| Parameter | Type                                                                    | Required | Default | Description                     |
|-----------|-------------------------------------------------------------------------|----------|---------|---------------------------------|
| enabled   | bool                                                                    | No       | true    | Enable/disable music player tab |
| hide      | [MusicPlayerHiddenElementsConfig](#music-player-hidden-elements-config) | No       | N/A     | See below                       |
| layout    | [MusicPlayerLayoutConfig](#music-player-layout-config)         | No       | N/A     | See below                       |


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
    artwork_size: large               # Options: small, medium, large (default: large)
    hide_labels: false                # Options: True/False (default: false)
                                      # Note: Medium/Large will display in the background behind the header and player controls. Small will display on its own.
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
      power:
        size: large                   # Options: small or large (default: small)
        box_shadow: true              # Options: True/False (default: false)
        label: false                  # Options: True/False (default: false)
                                      # Note: Label will never show if size is large
      favorite:
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

| Parameter          | Type  | Required | Default     | Description                  |
|--------------------|-------|----------|-------------|------------------------------|
| action_buttons     | bool  | No       | false       | Hides the action buttons     |
| move_down_button   | bool  | No       | false       | Hides the Move Down button   |
| move_up_button     | bool  | No       | false       | Hides the Move Up button     |
| move_next_button   | bool  | No       | false       | Hides the Move Next button   |
| remove_button      | bool  | No       | false       | Hides the Remove button      |
| album_covers       | bool  | No       | false       | Hides album covers           |
| artist_names       | bool  | No       | false       | Hides artist names           |
| clear_queue_button | bool  | No       | false       | Hides the Clear Queue button |

## Media Browser Config

<details>
    <summary>📷 Media Browser Example</summary>
<img src="https://github.com/droans/mass-player-card/blob/main/static/media_browser/desktop.png" alt="Player Card Media Browser Section Example">
</details>

| Parameter                       | Type                                                                      | Required | Default     | Description                                                           |
|---------------------------------|---------------------------------------------------------------------------|----------|-------------|-----------------------------------------------------------------------|
| enabled                         | bool                                                                      | No       | true        | Enable/disable media browser tab                                      |
| columns                         | number                                                                    | No       | 2           | Number of columns for each row.                                       |
| favorites                       | [FavoritesConfig](#favorites-config)                                      | No       | -           | See below                                                             |
| recents                         | [FavoritesConfig](#favorites-config)                                      | No       | -           | See below                                                             |
| recommendations                 | [RecommendationsConfig](#recommendations-config)                          | No       | -           | See below                                                             |
| sections                        | list of [SectionsConfig](#sections-config)                                | No       | -           | See below                                                             |
| hide                            | [MediaBrowserHiddenElementsConfig](#media-browser-hidden-elements-config) | No       | See below   | See Below                                                             |
| playlists_allow_removing_tracks | bool                                                                      | No       | false       | **EXPERIMENTAL - SEE BELOW** Allows removing tracks from playlists    |
| default_enqueue_option          | EnqueueConfigOption                                                       | No       | play_now    | Default enqueue mode when an item is selected, see below for options  |

### WARNING:
Music Assistant uses the position in a playlist to determine which tracks to remove. However, it does not provide an updated playlist when tracks are removed, instead waiting for its next refresh. 

To work around this, the card will automatically update the playlists when items are removed. **HOWEVER**, this will only work until you leave the playlist view.

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
| Parameter            | Type                            | Required | Default | Description                     |
|----------------------|---------------------------------|----------|---------|---------------------------------|
| enabled              | bool                            | No       | true    | Enable/disable music player tab |
| albums               | [FavoriteItem](#favorite-items) | No       | -       | See below                       |
| artists              | [FavoriteItem](#favorite-items) | No       | -       | See below                       |
| audiobooks           | [FavoriteItem](#favorite-items) | No       | -       | See below                       |
| playlists            | [FavoriteItem](#favorite-items) | No       | -       | See below                       |
| podcasts             | [FavoriteItem](#favorite-items) | No       | -       | See below                       |
| radios               | [FavoriteItem](#favorite-items) | No       | -       | See below                       |
| tracks               | [FavoriteItem](#favorite-items) | No       | -       | See below                       |
| show_collection_view | bool                            | No       | true    | See below                       |

## Recommendations Config
Recommendations can be enabled/disabled. You can also choose which providers can supply recommendations.

| Parameter            | Type            | Required | Default | Description                                       |
|----------------------|-----------------|----------|---------|---------------------------------------------------|
| enabled              | bool            | No       | true    | Enable/disable music player tab                   |
| providers            | list of strings | No       | true    | Choose whcih providers to use for recommendations |
| show_collection_view | bool            | No       | true    | See below                                         |

### default_enqueue_option

The default enqueue mode can be adjusted in your configuration. If not set, any media will play next when they are selected. 

The valid options are:

* play_now
* play_now_clear_queue
* play_next
* play_next_clear_queue
* add_to_queue
* radio

### show_collection_view

When `show_collection_view` is enabled, clicking on an album, artist, playlist, or podcast will open up a collection view displaying information on the collection, enqueue options, and individual tracks/episodes. When disabled, clicking on the items will instead enqueue the item. By default, this is enabled. 


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

# FAQs

## The card won't display at all or won't display properly!
1. Check to ensure you have [Music Assistant Queue Actions](https://github.com/droans/mass_queue) fully installed - including setting up the integration and creating config entries for your MA instances.
2. Check the other FAQs and [repository issues](https://github.com/droans/mass-player-card/issues) to see if they answer your issue.
3. If you still can't figure it out, [submit a new issue](https://github.com/droans/mass-player-card/issues/new).

## The media browser won't display any items for:

### Favorites
Usually, this issue is because you are looking at the Favorites section but don't have any favorites added in Music Assistant or your providers. If you don't want to favorite anything, consider adding [your own items](#favorite-items) instead.

### Recommendations
Ensure your music provider actually provides recommendations. 

### Recents
Have you tried listening to music?

## I'm not seeing any artwork in the queue or media browser!
If you are using a local provider, Music Assistant sends back a path which usually can't be accessed. Fortunately, this is something that we can easily work around. Music Assistant Queue Actions has the ability to download images for local providers and send them back to the card. This can cause a slowdown as downloading and encoding each image may take some time. Some of this is avoided - for ecample, images for queue items are usually only downloaded when HA first starts up, the integration is reloaded, or when the queue changes. 

To enable this feature:
1. Navigate to the Devices & Servies section in Home Assistant settings. 
2. Locate and select the Music Assistant Queue Actions integration. 
3. Click on the cog next to the config entry. 
4. Check the box titled either "download_local" or "Attempt fallback support for local media images" and click "Submit".

If you are using a non-local provider, [submit a new issue](https://github.com/droans/mass-player-card/issues/new). 

## How do I theme the card?

This card has initial support for custom themes. All tokens are listed in [src/styles/main.ts](https://github.com/droans/mass-player-card/blob/main/src/styles/main.ts) and are prefixed with `mass-player-card`. 

For example, the border radius for the sections and cards are set in the file as:

```css
--default-border-radius: var(--mass-player-card-default-border-radius, 28px);
```

If you would like to set the border radius to 12px instead, you would add this line to your theme:

```yaml
mass-player-card-default-border-radius: 12px;
```

## Can this card work in my local language?

**Current Language Support**

| Language  | Support |
|-----------|---------|
| English   | Full    |
| Dutch     | Most    |
| French    | Most    |
| Portugese | Most    |

If you would like to add new translations for other languages:
1. Fork this repository and clone it locally.
2. Navigate to `src/translations`. Make a copy of `en.ts` and save it with the name of your language code.
3. Set the strings for each key so they are correct for your language. The `player.messages.inactive` and `player.title.inactive` items do not need to match the English translation if they don't make sense or other strings make more sense for your language.
4. Make the following edits to `src/utils/translations.ts`. Use the existing translations as reference.
  * At the top, import your translations file - eg `import en from '../translations/en`
  * Under `const TRANSLATIONS`, add an entry for your translations.
5. Commit and push the changes to your forked copy of this repo.
6. Submit a pull request to this repository. The target branch should be `dev`. 

The instructions are rather similar for improving existing language support. However, you do not need to make a clone of `en.ts` (instead, use the existing translation file) and you do not need to follow Step #4.

## I am having issues with this card on my iOS/OSX device but it works fine elsewhere.

Apple's Webkit engine has some peculiarities that aren't present in other browsers. Unfortunately, I don't own the required equipment (an iOS device and a Mac) in order to properly debug this issue.

If you have the abilities and the equipment to do so, I am happy to accept any contributions to help fix this issue!

## I would like to sponsor you/the card and/or pay to add a new feature!

While I appreciate it, I am not going to accept any funding.

When someone funds development, there's often an implied belief that the card will keep being developed or the maintainer will provide new projects. I want to be able to drop development on this card when I feel that it is complete. I do not want people to feel misled, cheated, or that I should prioritize their wants over anything else. This card is something I created for myself

## I have other questions or issues not addressed

Check the [repository issues](https://github.com/droans/mass-player-card/issues) to see if your question has already been asked. If not, feel free to [submit a new issue](https://github.com/droans/mass-player-card/issues/new). 

# Contributing

I am happy to accept any new contributions to this repository. Feel free to fork and submit pull requests.

# Developing

This card uses `corepack` for development and relies on Node 22.

### Clone the repository:
```bash
git clone https://github.com/droans/mass-player-card
```

### Set up the environment
Switch to Node 22:
```bash
nvm use 22
```

Install `corepack`:
```bash
npm install corepack
```

Install dependencies:
```bash
yarn install
```

Build:
```bash
yarn rollup
```

The output file will be located at `./dist/mass-player-card.js`