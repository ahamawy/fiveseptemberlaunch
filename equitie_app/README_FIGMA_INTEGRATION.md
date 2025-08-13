# 🎨 Figma to Flutter Integration Guide

## Quick Integration Methods

### Method 1: Figma Dev Mode (Fastest)
1. **Open your Figma file** in Figma Desktop or Web
2. **Switch to Dev Mode** (Developer icon in top right)
3. **Select any element** to see:
   - Colors in hex format
   - Typography specs
   - Spacing values
   - Export assets

### Method 2: Figma-to-Code Plugin (Recommended)
```bash
# Install Figma to Flutter package
flutter pub add figma_to_flutter

# Or use the Figma plugin:
# 1. Open Figma
# 2. Go to Plugins → Browse
# 3. Search "Flutter" 
# 4. Install "Figma to Flutter" by Figma Community
```

### Method 3: Automated Extraction Script
```bash
# Run our custom extractor
cd scripts
python3 figma_extractor.py
```

## 🚀 Step-by-Step Integration

### Step 1: Export Assets from Figma
1. Open `/Users/ahmedelhamawy/Downloads/equitie.fig` in Figma
2. Select all icons/images
3. Export as SVG (for icons) or PNG @2x, @3x (for images)
4. Place in `/assets/images/` and `/assets/icons/`

### Step 2: Extract Design Tokens
Open Figma Dev Mode and note:
- **Primary Color**: #______
- **Secondary Color**: #______
- **Background Color**: #______
- **Font Family**: ______
- **Font Sizes**: H1:__, H2:__, Body:__

### Step 3: Update Flutter Theme
```dart
// Update /lib/theme/app_colors.dart
static const Color primary = Color(0xFF______); // Your Figma primary
static const Color secondary = Color(0xFF______); // Your Figma secondary
```

### Step 4: Add Custom Fonts
```yaml
# Update pubspec.yaml
fonts:
  - family: YourFigmaFont
    fonts:
      - asset: assets/fonts/YourFont-Regular.ttf
      - asset: assets/fonts/YourFont-Bold.ttf
        weight: 700
```

## 🎯 Using Figma API (Advanced)

### Get Figma Access Token:
1. Go to Figma → Settings → Personal Access Tokens
2. Create new token
3. Copy token

### Extract File Key:
Your Figma URL: `https://www.figma.com/file/FILE_KEY/...`
Extract: `FILE_KEY`

### Run API Extraction:
```bash
export FIGMA_TOKEN="your-token-here"
export FIGMA_FILE="your-file-key"

curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FIGMA_FILE" \
  > figma_data.json
```

## 🔄 Real-time Sync with Figma

### Option 1: Figma Webhooks
```dart
// Add to pubspec.yaml
dependencies:
  figma_client: ^1.0.0
  
// Use in code
final figmaClient = FigmaClient(token: 'YOUR_TOKEN');
final file = await figmaClient.getFile('FILE_KEY');
```

### Option 2: Design Tokens
Use Figma Tokens plugin to sync design system:
1. Install "Figma Tokens" plugin
2. Export tokens as JSON
3. Import in Flutter using our converter

## 📱 Component Mapping

| Figma Component | Flutter Widget |
|----------------|---------------|
| Frame | Container |
| Auto Layout | Row/Column |
| Component | Custom Widget |
| Text | Text |
| Rectangle | Container |
| Image | Image.asset() |
| Icon | Icon/SvgPicture |

## ✅ Quick Checklist

- [ ] Export all assets from Figma
- [ ] Extract color palette
- [ ] Extract typography scale
- [ ] Extract spacing system
- [ ] Map components to widgets
- [ ] Update theme files
- [ ] Add custom fonts
- [ ] Test on devices

## 🛠 Troubleshooting

### Can't open .fig file?
- Use Figma Desktop app (free download)
- Or import to Figma web

### Colors look different?
- Ensure using correct color space (sRGB)
- Check opacity values

### Fonts not loading?
- Add to pubspec.yaml
- Run `flutter pub get`
- Check font file paths

## 📚 Resources

- [Figma Dev Mode Guide](https://help.figma.com/hc/en-us/articles/360055203533)
- [Flutter Figma Package](https://pub.dev/packages/figma_to_flutter)
- [Figma API Docs](https://www.figma.com/developers/api)