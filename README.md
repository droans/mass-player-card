<div align="center">

[![GitHub Release][release-shield]][release]
[![Beta][beta-shield]][beta]
![Downloads][downloads-shield]

[![HACS][hacs-badge-shield]][hacs-badge]
[![Maintainer][maintainer-shield]][maintainer]
[![GitHub Activity][activity-shield]][activity]
[![License][license-shield]][license]

</div>

[release-shield]: https://img.shields.io/github/release/droans/mass_card.svg?style=for-the-badge
[release]: https://github.com/droans/mass_card/releases
[license-shield]: https://img.shields.io/github/license/droans/mass_card.svg?style=for-the-badge
[license]: LICENSE
[hacs-badge-shield]: https://img.shields.io/badge/HACS-Default-blue.svg?style=for-the-badge
[hacs-badge]: https://github.com/hacs/default
[maintainer-shield]: https://img.shields.io/badge/maintainer-droans-blue.svg?style=for-the-badge
[maintainer]: https://github.com/droans
[activity-shield]: https://img.shields.io/github/last-commit/droans/mass_card?style=for-the-badge
[activity]: https://github.com/droans/mass_card/commits/main
[beta-shield]: https://img.shields.io/github/v/release/droans/mass_card?include_prereleases&style=for-the-badge&filter=*b*&label=Pre-Release
[beta]: https://github.com/droans/mass_card/releases
[downloads-shield]: https://img.shields.io/github/downloads/droans/mass_card/total?style=for-the-badge

# Music Assistant Queue Card

Display the queue for any given media player.

### Important: This card requires the custom integration [Music Assistant Queue Actions](https://github.com/droans/mass_queue) to function. This integration must be installed before continuing!

## Install with HACS:

[![My Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?repository=mass_card&owner=droans&category=Plugin)

### Desktop:
<img src="https://github.com/droans/mass_card/blob/main/static/queue_example.png" alt="Queue Card Example">

### Mobile:
<img src="https://github.com/droans/mass_card/blob/main/static/queue_example_mobile.png" alt="Queue Card Mobile Example" height=300>

## Installation

### Prequisites

In addition to the Music Assistant integration, this card depends on the custom integration `mass_queue` for all the actions. Follow all instructions [in the repository](https://github.com/droans/mass_queue) to install first.

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

## Configuration
The card does not have a visual editor. Use this configuration to create your card:

## Example 
```yaml
type: custom:mass-card
entity: media_player.music_assistant_player
title: Play Queue
expanded: false
```

## Parameters
| Parameter         | Type | Required | Default      | Description                                                                     |
|-------------------|------|----------|--------------|---------------------------------------------------------------------------------|
| type              | str  | Yes      | n/a          | Use `custom:mass-card`                                                          |
| entity            | str  | Yes      | n/a          | The Music Assistant `media_player` entity to use                                |
| title             | str  | No       | Play Queue   | Header title for card                                                           |
| expanded          | bool | No       | false        | Sets card to be expanded by default. User can always manually show/hide content |
| limit_before      | int  | No       | 5            | Number of item to display before current active item                            |
| limit_after       | int  | No       | 100          | Number of item to display after current active item                             |
| show_album_covers | bool | No       | true         | Show album cover images for each item                                           |
| show_artist_names | bool | No       | true         | Show artist names for each item                                                 |
| allow_collapsing  | bool | No       | true         | Allow card to collapse when true, show full card (max 400px tall) if false      |