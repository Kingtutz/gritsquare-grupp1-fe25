# Garden Gathering

Garden Gathering is a cozy, pixel-art message board where each post appears as a flower in a shared garden.

## Live Site

https://kingtutz.github.io/gritsquare-grupp1-fe25/

## Overview

The project is a front-end web app focused on a calm and playful social space.
Users can post messages, open flower threads, react to posts, and explore saved content in a cabin view.

## Features

- Create a new post with title/message (rendered as a flower in the garden).
- Open flowers to read thread content.
- Add replies to posts.
- Username flow for posting/replying and user-specific actions.
- Like and dislike reactions with user tracking.
- Like/dislike are mutually exclusive (switching one removes the other).
- Toggle reaction behavior (click again to remove your reaction).
- Cabin view for user posts and liked posts.
- Theme support with day/night visual changes.

## Run Locally

This is a static front-end project.

1. Clone the repository.
2. Open the project folder in VS Code.
3. Start a local server (recommended: Live Server extension).
4. Open `index.html` through the local server.

Note: Some features rely on Firebase Realtime Database and require network access.

## Tech Stack

- HTML
- CSS
- JavaScript (ES modules)
- Firebase Realtime Database

## Design Notes

The visual direction is cozy, calm, and retro-inspired:

- Pixel-art garden environment.
- Theme-aware backgrounds and color palettes.
- Pixel-style UI icons and typography.

### Color Tokens

#### Default Theme

| Token | Preview |
| --- | --- |
| `--theme-first-color` | ![93E4C1](https://img.shields.io/badge/-%2393E4C1-93E4C1?style=flat-square) |
| `--theme-second-color` | ![3BAEA0](https://img.shields.io/badge/-%233BAEA0-3BAEA0?style=flat-square) |
| `--theme-third-color` | ![118A7E](https://img.shields.io/badge/-%23118A7E-118A7E?style=flat-square) |
| `--theme-fourth-color` | ![1F6F78](https://img.shields.io/badge/-%231F6F78-1F6F78?style=flat-square) |

#### Dark Theme

| Token | Preview |
| --- | --- |
| `--dark-first-color` | ![27296D](https://img.shields.io/badge/-%2327296D-27296D?style=flat-square) |
| `--dark-second-color` | ![5E63B6](https://img.shields.io/badge/-%235E63B6-5E63B6?style=flat-square) |
| `--dark-third-color` | ![A393EB](https://img.shields.io/badge/-%23A393EB-A393EB?style=flat-square) |
| `--dark-fourth-color` | ![F5C7F7](https://img.shields.io/badge/-%23F5C7F7-F5C7F7?style=flat-square) |

#### Flower Theme

| Token | Preview |
| --- | --- |
| `--flower-first-color` | ![F92A82](https://img.shields.io/badge/-%23F92A82-F92A82?style=flat-square) |
| `--flower-second-color` | ![FDE549](https://img.shields.io/badge/-%23FDE549-FDE549?style=flat-square) |
| `--flower-third-color` | ![3D2EAF](https://img.shields.io/badge/-%233D2EAF-3D2EAF?style=flat-square) |
| `--flower-fourth-color` | ![FF7433](https://img.shields.io/badge/-%23FF7433-FF7433?style=flat-square) |
| `--flower-fifth-color` | ![C585B3](https://img.shields.io/badge/-%23C585B3-C585B3?style=flat-square) |

## Font

- Pixelify Sans:
  https://fonts.google.com/specimen/Pixelify+Sans

![Pixelify Sans Preview](https://readme-typing-svg.demolab.com?font=Pixelify+Sans&size=26&pause=999999&color=000000&background=11111100&vCenter=true&width=680&lines=Garden+Gathering+%E2%80%A2+Cozy+Pixel+Garden)

## Credits

- Flower image source:
  https://pixabay.com/illustrations/flowers-icon-pixelart-pixel-retro-9359943/

