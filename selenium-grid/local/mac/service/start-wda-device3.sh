#!/usr/bin/env bash
set -e

echo "📱 Starting WDA for Device 3 (00008110-000C28A12145A01E)..."

xcodebuild \
  -project "/Users/yettel.bank/Project/WebDriverAgentProject3/WebDriverAgent/WebDriverAgent.xcodeproj" \
  -scheme "WebDriverAgentRunner3" \
  -destination "id=00008110-000C28A12145A01E" \
  clean test
