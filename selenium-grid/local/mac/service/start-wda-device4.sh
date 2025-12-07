#!/usr/bin/env bash
set -e

echo "📱 Starting WDA for Device 4 (00008110-001C58E03689A01E)..."

xcodebuild \
  -project "/Users/yettel.bank/Project/WebDriverAgentProject4/WebDriverAgent/WebDriverAgent.xcodeproj" \
  -scheme "WebDriverAgentRunner4" \
  -destination "id=00008110-001C58E03689A01E" \
  clean test
