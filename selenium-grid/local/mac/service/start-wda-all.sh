#!/usr/bin/env bash
set -e

SERVICE_DIR="/Users/yettel.bank/Project/milos_new_proj/wdio-mobile-api-ts/selenium-grid/local/mac/service"
LOG_DIR="$SERVICE_DIR/logs"

echo "===== 🚀 Starting all services at $(date) ====="

# Wait for Selenium to initialize

echo "📱 Starting WDA Device 1..."
bash "$SERVICE_DIR/start-wda-device1.sh" > "$LOG_DIR/wda-device1.log" 2>&1 &

echo "📱 Starting WDA Device 2..."
bash "$SERVICE_DIR/start-wda-device2.sh" > "$LOG_DIR/wda-device2.log" 2>&1 &

echo "📱 Starting WDA Device 3..."
bash "$SERVICE_DIR/start-wda-device3.sh" > "$LOG_DIR/wda-device3.log" 2>&1 &

echo "📱 Starting WDA Device 4..."
bash "$SERVICE_DIR/start-wda-device4.sh" > "$LOG_DIR/wda-device4.log" 2>&1 &

wait
echo "✅ All services started successfully at $(date)"
