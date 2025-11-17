# Assets

This folder contains app assets like icons and splash screens.

## Required Assets

For a production app, you'll need to create:

1. **icon.png** - App icon (1024x1024 px)
2. **adaptive-icon.png** - Android adaptive icon (1024x1024 px)
3. **splash.png** - Splash screen image (1284x2778 px recommended)
4. **favicon.png** - Web favicon (48x48 px)

## Using the Icon Placeholder

The `icon-placeholder.svg` file provides a template for your app icon design.

To convert it to required formats:

```bash
# Using ImageMagick or similar tool
convert icon-placeholder.svg -resize 1024x1024 icon.png
convert icon-placeholder.svg -resize 1024x1024 adaptive-icon.png
convert icon-placeholder.svg -resize 48x48 favicon.png
```

Or use online tools like:
- https://www.figma.com
- https://www.canva.com
- https://appicon.co

## Design Guidelines

- Use the gold (#D4AF37) and black (#1A1A1A) color scheme
- Keep the sparkle/magic theme to represent AI restoration
- Ensure the icon is recognizable at small sizes
- Follow Apple and Google design guidelines for app icons
