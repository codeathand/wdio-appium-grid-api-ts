#!/usr/bin/env bash
set -e

echo "📱 Starting WDA for Device 2 (00008101-0019752E3C93A01E)..."

xcodebuild \
  -project "/Users/yettel.bank/Project/WebDriverAgentProject2/WebDriverAgent/WebDriverAgent.xcodeproj" \
  -scheme "WebDriverAgentRunner2" \
  -destination "id=00008101-0019752E3C93A01E" \
  clean test
