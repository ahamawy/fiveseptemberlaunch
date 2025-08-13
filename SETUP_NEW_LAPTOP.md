# Setup Guide for New Laptop

## Prerequisites Installation

### 1. Install Development Tools
```bash
# Install Homebrew (macOS)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git
brew install git

# Install Flutter
brew install --cask flutter

# Verify Flutter installation
flutter doctor
```

### 2. Install Claude Code
```bash
# Install via npm (recommended)
npm install -g @anthropic/claude-code

# Or install via Homebrew
brew install claude-code

# Verify installation
claude --version
```

## Project Setup

### 1. Clone the Repository
```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/equitie-app.git
cd equitie-app

# Or if using SSH
git clone git@github.com:YOUR_USERNAME/equitie-app.git
cd equitie-app
```

### 2. Flutter Setup
```bash
# Navigate to Flutter project
cd equitie_app

# Get Flutter dependencies
flutter pub get

# iOS specific setup (macOS only)
cd ios
pod install
cd ..

# Verify setup
flutter doctor
```

### 3. IDE Setup

#### VS Code (Recommended)
```bash
# Install VS Code
brew install --cask visual-studio-code

# Install Flutter extension
code --install-extension Dart-Code.flutter
code --install-extension Dart-Code.dart-code

# Open project
code .
```

#### Xcode (for iOS development)
```bash
# Install from App Store or:
xcode-select --install

# Accept license
sudo xcodebuild -license accept

# Open iOS project
open ios/Runner.xcworkspace
```

## Claude Code Setup

### 1. Initialize Claude Code in Project
```bash
# In project root
claude

# Claude will automatically detect the CLAUDE.md file
# and understand the project context
```

### 2. Using Claude Code Subagents
```bash
# For Flutter-specific tasks
claude "Help me implement [feature] using the flutter-expert agent"

# For iOS-specific animations
claude "Create iOS spring animation using the ios-expert agent"

# For general development
claude "Review and optimize the code using the code-refactorer agent"
```

### 3. Useful Claude Commands
```bash
# Continue where you left off
claude --resume

# Extended thinking for complex tasks
claude --think

# Get help
claude --help

# View Claude Code documentation
claude docs
```

## Project-Specific Setup

### 1. Figma Integration
If you need to update design tokens from Figma:
```bash
# Install Node dependencies for scripts
cd scripts
npm install
cd ..

# Run Figma extraction (need Figma access token)
node scripts/figma_quick_extract.js
```

### 2. Environment Configuration
Create `.env` file in `equitie_app/`:
```env
# Add your API endpoints and keys
API_BASE_URL=https://your-api.com
FIGMA_ACCESS_TOKEN=your-figma-token
```

## Quick Start Development

### Run the App
```bash
# iOS Simulator
flutter run -d ios

# Android Emulator
flutter run -d android

# Chrome (Web)
flutter run -d chrome

# List all available devices
flutter devices
```

### Common Tasks with Claude Code
```bash
# Add new feature
claude "Add a new screen for [feature]"

# Fix issues
claude "Debug and fix the [issue description]"

# Optimize performance
claude "Optimize the iOS animations in the motion system"

# Update from Figma
claude "Update the design tokens from Figma"
```

## Troubleshooting

### Flutter Issues
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run

# Reset iOS pods
cd ios
pod deintegrate
pod install
cd ..
```

### Git Issues
```bash
# If you have uncommitted changes
git stash
git pull
git stash pop

# Reset to remote
git fetch origin
git reset --hard origin/main
```

## Recommended Claude Code Workflow

1. **Start Claude in the project directory**
   ```bash
   cd equitie-app
   claude
   ```

2. **Claude will read CLAUDE.md automatically** and understand:
   - Project structure
   - Tech stack
   - Custom implementations (motion system, theme)
   - Development patterns

3. **Use specialized agents for specific tasks**:
   - `flutter-expert` for Flutter-specific code
   - `ios-expert` for iOS native features
   - `typescript-expert` for Figma scripts
   - `code-refactorer` for code improvements

4. **Leverage Claude's memory**:
   - Claude remembers context within a session
   - Use `--resume` to continue previous work
   - CLAUDE.md provides persistent context

## Project Architecture Quick Reference

```
Key Directories:
- lib/motion/ios/ - iOS animations
- lib/theme/equitie_theme.dart - Custom theme
- lib/theme/figma/ - Figma tokens
- lib/screens/ - All app screens
- scripts/ - Figma extraction tools
```

## Contact & Resources
- Flutter Documentation: https://docs.flutter.dev
- Claude Code Docs: https://docs.anthropic.com/claude-code
- iOS HIG: https://developer.apple.com/design/
- Figma API: https://www.figma.com/developers/api