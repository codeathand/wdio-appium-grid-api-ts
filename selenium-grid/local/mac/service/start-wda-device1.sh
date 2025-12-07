#!/usr/bin/env bash
set -e

echo "📱 Starting WDA for Device 1 (00008030-00116D5E3A12202E)..."

xcodebuild \
  -project "/Users/yettel.bank/Project/WebDriverAgentProject1/WebDriverAgent/WebDriverAgent.xcodeproj" \
  -scheme "WebDriverAgentRunner1" \
  -destination "id=00008030-00116D5E3A12202E" \
  clean test
