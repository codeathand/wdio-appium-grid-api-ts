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
  local ts=$(date +"%Y%m%d_%H%M%S")
  local logfile="/tmp/selenium-hub_${ts}.log"
  nohup java -jar "$SELENIUM_JAR" hub > "$logfile" 2>&1 &
  echo "✅ Selenium Hub started (log: $logfile)"
}

function start_node() {
  local cfg="$1"
  local ts=$(date +"%Y%m%d_%H%M%S")
  local logfile="/tmp/node_${cfg##*/}_${ts}.log"
  nohup java -jar "$SELENIUM_JAR" node --config "$cfg" > "$logfile" 2>&1 &
  echo "✅ Node started: $cfg (log: $logfile)"
}


function start_appium() {
  local cfg="$1"
  local ts=$(date +"%Y%m%d_%H%M%S")
  local logfile="/tmp/appium_${cfg##*/}_${ts}.log"
  nohup appium --config "$cfg" > "$logfile" 2>&1 &
  echo "✅ Appium started: $cfg (log: $logfile)"
}

function start_wda() {
  echo "🔄 Cleaning old WDA/iproxy"
  killall -9 iproxy xcodebuild 2>/dev/null || true

  for DEVICE in "${DEVICES[@]}"; do
    IFS=":" read -r UDID WDA_PORT MJPEG_PORT BUNDLE <<< "$DEVICE"
    local ts=$(date +"%Y%m%d_%H%M%S")

    echo "🚀 WDA $BUNDLE on $UDID (WDA:$WDA_PORT, MJPEG:$MJPEG_PORT)"
    iproxy -u "$UDID" "$WDA_PORT":8100 "$MJPEG_PORT":9100 >"/tmp/iproxy_${UDID}_${ts}.log" 2>&1 &
    env DEVICECTL_CHILD_USE_PORT=8100 DEVICECTL_CHILD_MJPEG_SERVER_PORT=9100 \
      xcrun devicectl device process launch --terminate-existing \
      --device "$UDID" "$BUNDLE" >"/tmp/wda_${UDID}_${ts}.log" 2>&1 &
  done
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

  echo -e "${YELLOW}👉 Logs are in /tmp/*.log${RESET}"
}

case "$1" in
  start)
    start_hub
    for cfg in "$BASE_DIR/.appium-configs/"*.yml; do start_appium "$cfg"; done
    for cfg in "$BASE_DIR/.appium-nodes/"*.toml; do start_node "$cfg"; done
    start_wda
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
