# Broadcast Logos

This directory contains logos for various broadcast networks and stations.

## Directory Structure

```
broadcasts/
├── tv/
│   ├── fox.png
│   ├── tbs.png
│   ├── espn.png
│   ├── hbo-max.png
│   └── fs1.png
├── radio/
│   ├── espn-radio.png
│   ├── wfan.png
│   ├── sn590.png
│   └── other-stations.png
└── generic/
    ├── tv-placeholder.png
    └── radio-placeholder.png
```

## Logo Guidelines

- **Format**: PNG with transparent background
- **Size**: 64x64px minimum, square aspect ratio preferred
- **Naming**: Use lowercase with hyphens (e.g., `hbo-max.png`, `fs1.png`)
- **Quality**: High resolution for crisp display

## Common Networks

### Television
- FOX → `fox.png`
- TBS → `tbs.png`
- ESPN → `espn.png`
- HBO Max → `hbo-max.png`
- FS1 → `fs1.png`
- MLB Network → `mlb-network.png`

### Radio
- ESPN Radio → `espn-radio.png`
- WFAN → `wfan.png`
- SN590 → `sn590.png`
- 670 The Score → `670-the-score.png`
- WTMJ 620 → `wtmj-620.png`

## Fallback Behavior

If a logo is not found, the component will display the call sign as text in a placeholder box.