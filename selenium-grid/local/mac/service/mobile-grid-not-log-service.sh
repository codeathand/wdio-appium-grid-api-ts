#!/usr/bin/env bash
set -e

SELENIUM_JAR="/Users/yettel.bank/Project/milos_new_proj/wdio-mobile-api-ts/selenium-grid/local/lib/selenium-server-4.34.0.jar"
BASE_DIR="/Users/yettel.bank/Project/milos_new_proj/wdio-mobile-api-ts/selenium-grid/local/mac"

DEVICES=(
  "00008030-00116D5E3A12202E:8101:9101:rs.yettelbank.WebDriverAgentRunner1.xctrunner"
  "00008101-0019752E3C93A01E:8102:9102:rs.yettelbank.WebDriverAgentRunner2.xctrunner"
  "00008110-000C28A12145A01E:8103:9103:rs.yettelbank.WebDriverAgentRunner3.xctrunner"
  "00008110-001C58E03689A01E:8104:9104:rs.yettelbank.WebDriverAgentRunner4.xctrunner"
)

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

function start_hub() {
  nohup java -jar "$SELENIUM_JAR" hub > /dev/null 2>&1 &
  echo "✅ Selenium Hub started (no logs)"
}

function start_node() {
  local cfg="$1"
  nohup java -jar "$SELENIUM_JAR" node --config "$cfg" > /dev/null 2>&1 &
  echo "✅ Node started: $cfg (no logs)"
}

function start_appium() {
  local cfg="$1"
  nohup appium --config "$cfg" > /dev/null 2>&1 &
  echo "✅ Appium started: $cfg (no logs)"
}

function start_wda() {
  echo "🔄 Cleaning old WDA/iproxy"
  killall -9 iproxy xcodebuild 2>/dev/null || true

  # Start iproxy + WDA bundles
  for DEVICE in "${DEVICES[@]}"; do
    IFS=":" read -r UDID WDA_PORT MJPEG_PORT BUNDLE <<< "$DEVICE"

    echo "🚀 WDA $BUNDLE on $UDID (WDA:$WDA_PORT, MJPEG:$MJPEG_PORT)"
    iproxy -u "$UDID" "$WDA_PORT":8100 "$MJPEG_PORT":9100 > /dev/null 2>&1 &
    env DEVICECTL_CHILD_USE_PORT=8100 DEVICECTL_CHILD_MJPEG_SERVER_PORT=9100 \
      xcrun devicectl device process launch --terminate-existing \
      --device "$UDID" "$BUNDLE" > /dev/null 2>&1 &
  done
}

function start_all() {
  java -jar "$SELENIUM_JAR" hub &
  HUB_PID=$!

  for cfg in "$BASE_DIR/.appium-configs/"*.yml; do
    appium --config "$cfg" &
  done

  for cfg in "$BASE_DIR/.appium-nodes/"*.toml; do
    java -jar "$SELENIUM_JAR" node --config "$cfg" &
  done

  start_wda &

  # ✅ Launch user’s WDA Terminals once (if not already running)
  # sleep 10
  # echo "🚀 Starting iPhone 1"
  # cd /Users/yettel.bank/Project/milos_new_proj/wdio-mobile-api-ts/selenium-grid/local/mac/service
  # ./start-wda-device1.sh
  # sleep 3
  # echo "🚀 Starting iPhone 2"
  # ./start-wda-device2.sh
  # sleep 3  
  # echo "🚀 Starting iPhone 3"
  # ./start-wda-device3.sh
  # sleep 3  
  # echo "🚀 Starting iPhone 4"
  # ./start-wda-device4.sh

  # Keep the script running until hub dies
  wait $HUB_PID
}

function stop_all() {
  echo "🛑 Stopping all processes..."
  pkill -f "selenium.*hub" || true
  pkill -f "selenium.*node" || true
  pkill -f "appium --config" || true
  pkill -f "iproxy" || true
  pkill -f "devicectl.*WebDriverAgent" || true
  echo "✅ All processes stopped"
}

function list_processes() {
  echo -e "${YELLOW}📋 Running processes:${RESET}"

  pgrep -fl "selenium.*hub"   | sed "s/^/${GREEN}HUB    ${RESET}/"   || echo -e "${RED}No Hub running${RESET}"
  pgrep -fl "selenium.*node"  | sed "s/^/${GREEN}NODE   ${RESET}/"   || echo -e "${RED}No Nodes running${RESET}"
  pgrep -fl "appium --config" | sed "s/^/${GREEN}APPIUM ${RESET}/"   || echo -e "${RED}No Appium running${RESET}"
  pgrep -fl "iproxy"          | sed "s/^/${GREEN}IPROXY ${RESET}/"   || echo -e "${RED}No iproxy running${RESET}"
  pgrep -fl "devicectl.*WebDriverAgent" | sed "s/^/${GREEN}WDA    ${RESET}/" || echo -e "${RED}No WDA running${RESET}"
}

case "$1" in
  start)
    start_all
    # start_hub
    # for cfg in "$BASE_DIR/.appium-configs/"*.yml; do start_appium "$cfg"; done
    # for cfg in "$BASE_DIR/.appium-nodes/"*.toml; do start_node "$cfg"; done
    # start_wda
    ;;
  stop)
    stop_all
    ;;
  restart)
    shift
    case "$1" in
      node*)
        pkill -f "node --config.*$1" || true
        start_node "$BASE_DIR/.appium-nodes/$1.toml"
        ;;
      appium*)
        pkill -f "appium --config.*$1" || true
        start_appium "$BASE_DIR/.appium-configs/$1.yml"
        ;;
      wda)
        pkill -f "$2" || true
        start_wda
        ;;
      all)
        stop_all
        sleep 2
        "$0" start
        ;;
      *)
        echo "Usage: $0 restart {node1|appium2|wda <udid>|all}"
        ;;
    esac
    ;;
  list)
    list_processes
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|list}"
    ;;
esac
