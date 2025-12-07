#!/usr/bin/env bash
set -e

# === Ensure Node + Appium paths are available ===
export PATH="/home/qateamadm/.nvm/versions/node/v20.19.4/bin:/data/tools/npm-global/bin:$PATH"
# === Android SDK Environment (for Appium) ===
export ANDROID_HOME="/data/android-sdk"
export ANDROID_SDK_ROOT="/data/android-sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin"

# === Device list ===
DEVICES=(
  "RZCWB0Z0HGH:8100:9110"
  "RZCWB10LFEY:8101:9111"
  "RZCWB10LLFF:8102:9112"
  "RZCWB10MP0M:8103:9113"
  "RZCWB10MQ2P:8104:9114"
  "RZCWB10MTCM:8105:9115"
)

# === Paths ===
BASE_DIR="/data/tools/selenium-grid/service"
SELENIUM_JAR="$BASE_DIR/lib/selenium-server-4.34.0.jar"
LOG_DIR="$BASE_DIR/logs"
mkdir -p "$LOG_DIR"

# === Colors ===
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

# === Hub ===
function start_hub() {
  nohup java -jar "$SELENIUM_JAR" hub > /dev/null 2>&1 &
  echo -e "${GREEN}✅ Selenium Hub started (no logs)${RESET}"
}

# === Node ===
function start_node() {
  local cfg="$1"
  nohup java -jar "$SELENIUM_JAR" node --config "$cfg" > /dev/null 2>&1 &
  echo -e "${GREEN}✅ Node started: $cfg (no logs)${RESET}"
}

# === Appium ===
function start_appium() {
  local cfg="$1"
  nohup appium --config "$cfg" > /dev/null 2>&1 &
  echo -e "${GREEN}✅ Appium started: $cfg (no logs)${RESET}"
}

# === ADB & socat forwards ===
function start_forwards() {
  echo -e "${YELLOW} Setting up ADB & socat port forwarding...${RESET}"
  for DEVICE in "${DEVICES[@]}"; do
    IFS=":" read -r UDID APP_PORT MJPEG_PORT <<< "$DEVICE"
    echo " $UDID → Appium:$APP_PORT, MJPEG:$MJPEG_PORT"

    # Forward MJPEG stream locally via ADB
    adb -s "$UDID" forward tcp:$MJPEG_PORT tcp:$MJPEG_PORT || true

    # External proxy port (accessible from outside host)
    EXTERNAL_PORT=$((MJPEG_PORT - 10))
    echo "   ↳ Exposing external MJPEG on $EXTERNAL_PORT"

    # Start socat proxy
    sudo nohup socat TCP-LISTEN:$EXTERNAL_PORT,fork,reuseaddr,bind=0.0.0.0 \
      TCP:127.0.0.1:$MJPEG_PORT > "$LOG_DIR/socat-$EXTERNAL_PORT.log" 2>&1 &

    echo $! > "$LOG_DIR/socat-$EXTERNAL_PORT.pid"
  done
  echo -e "${GREEN}✅ All Android forwards & proxies started${RESET}"
}

function stop_forwards() {
  echo -e "${YELLOW}粒 Stopping ADB & socat forwards...${RESET}"
  for DEVICE in "${DEVICES[@]}"; do
    IFS=":" read -r UDID APP_PORT MJPEG_PORT <<< "$DEVICE"
    adb -s "$UDID" forward --remove tcp:$MJPEG_PORT || true

    EXTERNAL_PORT=$((MJPEG_PORT - 10))
    if [ -f "$LOG_DIR/socat-$EXTERNAL_PORT.pid" ]; then
      kill "$(cat "$LOG_DIR/socat-$EXTERNAL_PORT.pid")" 2>/dev/null || true
      rm -f "$LOG_DIR/socat-$EXTERNAL_PORT.pid"
    fi
  done
  echo -e "${GREEN}✅ All forwards stopped${RESET}"
}

# === Utility ===
function list_android_devices() {
  echo " Connected Android devices:"
  adb devices | grep -w "device" | awk '{print " " $1}' || echo -e "${RED}No devices detected${RESET}"
}

function stop_all() {
  echo -e "${YELLOW} Stopping all processes...${RESET}"
  pkill -f "selenium.*hub" || true
  pkill -f "selenium.*node" || true
  pkill -f "appium --config" || true
  stop_forwards
  echo -e "${GREEN}✅ All processes stopped${RESET}"
}

function list_processes() {
  echo -e "${YELLOW} Running processes:${RESET}"
  pgrep -fl "selenium.*hub"   | sed "s/^/${GREEN}HUB    ${RESET}/"   || echo -e "${RED}No Hub running${RESET}"
  pgrep -fl "selenium.*node"  | sed "s/^/${GREEN}NODE   ${RESET}/"   || echo -e "${RED}No Nodes running${RESET}"
  pgrep -fl "appium --config" | sed "s/^/${GREEN}APPIUM ${RESET}/"   || echo -e "${RED}No Appium running${RESET}"
  pgrep -fl "socat.*LISTEN"   | sed "s/^/${GREEN}SOCAT  ${RESET}/"   || echo -e "${RED}No socat forwards${RESET}"
}

# === CLI ===
case "$1" in
  start)
    start_hub
    for cfg in "$BASE_DIR/.appium-configs/"*.yml; do start_appium "$cfg"; done
    for cfg in "$BASE_DIR/.appium-nodes/"*.toml; do start_node "$cfg"; done
    start_forwards
    list_android_devices
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
      forwards)
        stop_forwards
        start_forwards
        ;;
      all)
        stop_all
        sleep 2
        "$0" start
        ;;
      *)
        echo "Usage: $0 restart {nodeX|appiumY|forwards|all}"
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
