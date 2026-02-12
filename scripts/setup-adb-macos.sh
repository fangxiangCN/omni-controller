#!/bin/bash

# Download and setup ADB for macOS
# This script downloads the Android SDK Platform Tools for macOS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PLATFORM_TOOLS_URL="https://dl.google.com/android/repository/platform-tools-latest-darwin.zip"
DOWNLOAD_FILE="$PROJECT_ROOT/platform-tools-darwin.zip"
EXTRACT_DIR="$PROJECT_ROOT/platform-tools"

echo "=== Setting up ADB for macOS ==="
echo ""

# Check if adb already exists
if [ -f "$PROJECT_ROOT/adb" ]; then
    echo "✓ ADB already exists at: $PROJECT_ROOT/adb"
    echo ""
    "$PROJECT_ROOT/adb" version
    exit 0
fi

echo "Downloading Android SDK Platform Tools for macOS..."
echo "URL: $PLATFORM_TOOLS_URL"
echo ""

# Download using curl
curl -L -o "$DOWNLOAD_FILE" "$PLATFORM_TOOLS_URL"

echo ""
echo "Extracting platform-tools..."

# Extract
cd "$PROJECT_ROOT"
unzip -o "$DOWNLOAD_FILE"

# Move adb to project root
if [ -f "$EXTRACT_DIR/adb" ]; then
    cp "$EXTRACT_DIR/adb" "$PROJECT_ROOT/adb"
    chmod +x "$PROJECT_ROOT/adb"
    echo ""
    echo "✓ ADB installed successfully!"
else
    echo "✗ Failed to find adb in extracted files"
    exit 1
fi

# Cleanup
rm -rf "$EXTRACT_DIR"
rm -f "$DOWNLOAD_FILE"

echo ""
echo "=== Installation complete ==="
echo ""
"$PROJECT_ROOT/adb" version
echo ""
echo "You can now run: pnpm dev"
