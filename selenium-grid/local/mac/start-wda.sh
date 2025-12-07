# #!/bin/bash
# # ======================================
# # Multi-device WDA launcher for Appium
# # chmod +x start-wda.sh && ./start-wda.sh
# # ======================================

# DEVICES=(
#   "00008030-00116D5E3A12202E:8100:9100:com.facebook.WebDriverAgentRunner1.xctrunner1"
#   "00008101-0019752E3C93A01E:8110:9110:com.facebook.WebDriverAgentRunner2.xctrunner2"
#   "00008110-000C28A12145A01E:8120:9120:com.facebook.WebDriverAgentRunner3.xctrunner3"
#   "00008110-001C58E03689A01E:8130:9130:com.facebook.WebDriverAgentRunner4.xctrunner4"
# )

# echo "🔄 Cleaning up old processes..."
# killall -9 iproxy 2>/dev/null || true
# killall -9 xcodebuild 2>/dev/null || true
# killall -9 WebDriverAgentRunner* 2>/dev/null || true
# echo "✅ Old processes stopped."

# echo "📱 Checking connected devices..."
# CONNECTED=$(idevice_id -l)
# if [ -z "$CONNECTED" ]; then
#   echo "❌ No iOS devices detected!"
#   exit 1
# else
#   echo "✅ Devices detected:"
#   echo "$CONNECTED"
# fi

# for DEVICE in "${DEVICES[@]}"; do
#   IFS=":" read -r UDID WDA_PORT MJPEG_PORT BUNDLE <<< "$DEVICE"

#   if ! echo "$CONNECTED" | grep -q "$UDID"; then
#     echo "⚠️  Skipping $UDID (not connected)"
#     continue
#   fi

#   echo "🚀 Starting WDA for $UDID on ports WDA=$WDA_PORT MJPEG=$MJPEG_PORT (bundle: $BUNDLE)"

#   # Forward local ports
#   iproxy -u "$UDID" $WDA_PORT:8100 $MJPEG_PORT:9100 >/tmp/iproxy_$UDID.log 2>&1 &

#   # Launch the preinstalled WDA app
#   env DEVICECTL_CHILD_USE_PORT=8100 \
#       DEVICECTL_CHILD_MJPEG_SERVER_PORT=9100 \
#       xcrun devicectl device process launch --terminate-existing \
#       --device "$UDID" "$BUNDLE" \
#       >/tmp/wda_$UDID.log 2>&1 &

#   # Wait for WDA /status
#   echo "⏳ Waiting for WDA on http://localhost:$WDA_PORT/status ..."
#   for i in {1..15}; do
#     STATUS=$(curl -s "http://localhost:$WDA_PORT/status" | grep -o '"state":"success"')
#     if [ "$STATUS" == '"state":"success"' ]; then
#       echo "✅ WDA is alive on $UDID (http://localhost:$WDA_PORT)"
#       break
#     else
#       echo "⌛ Still waiting ($i)..."
#       sleep 2
#     fi
#   done

#   if [ "$STATUS" != '"state":"success"' ]; then
#     echo "❌ WDA failed to start for $UDID (check /tmp/wda_$UDID.log)"
#   fi
# done

# echo "🎉 All requested devices processed."

#!/bin/bash
# set -e

# # --- Device 1 ---
# env DEVICECTL_CHILD_USE_PORT=8101 \
#     DEVICECTL_CHILD_MJPEG_SERVER_PORT=9101 \
#     xcrun devicectl device process launch \
#         --terminate-existing \
#         --device 00008030-00116D5E3A12202E \
#         com.facebook.WebDriverAgentRunner1.xctrunner1 &

# # --- Device 2 ---
# env DEVICECTL_CHILD_USE_PORT=8102 \
#     DEVICECTL_CHILD_MJPEG_SERVER_PORT=9102 \
#     xcrun devicectl device process launch \
#         --terminate-existing \
#         --device 00008101-0019752E3C93A01E \
#         com.facebook.WebDriverAgentRunner2.xctrunner2 &

# # --- Device 3 ---
# env DEVICECTL_CHILD_USE_PORT=8103 \
#     DEVICECTL_CHILD_MJPEG_SERVER_PORT=9103 \
#     xcrun devicectl device process launch \
#         --terminate-existing \
#         --device 00008110-000C28A12145A01E \
#         com.facebook.WebDriverAgentRunner3.xctrunner3 &

# # --- Device 4 ---
# env DEVICECTL_CHILD_USE_PORT=8104 \
#     DEVICECTL_CHILD_MJPEG_SERVER_PORT=9104 \
#     xcrun devicectl device process launch \
#         --terminate-existing \
#         --device 00008110-001C58E03689A01E \
#         com.facebook.WebDriverAgentRunner4.xctrunner4 &


#!/bin/bash
set -e

DEVICES=(
  "00008030-00116D5E3A12202E:8101:9101:rs.yettelbank.WebDriverAgentRunner1.xctrunner"
  "00008101-0019752E3C93A01E:8102:9102:rs.yettelbank.WebDriverAgentRunner2.xctrunner"
  "00008110-000C28A12145A01E:8103:9103:rs.yettelbank.WebDriverAgentRunner3.xctrunner"
  "00008110-001C58E03689A01E:8104:9104:rs.yettelbank.WebDriverAgentRunner4.xctrunner"
)

echo "🔄 Cleaning up old WDA and iproxy..."
killall -9 iproxy 2>/dev/null || true
killall -9 xcodebuild 2>/dev/null || true

for DEVICE in "${DEVICES[@]}"; do
  IFS=":" read -r UDID WDA_PORT MJPEG_PORT BUNDLE <<< "$DEVICE"

  echo "🚀 Launching $BUNDLE on $UDID (WDA:$WDA_PORT, MJPEG:$MJPEG_PORT)"

  # start iproxy
  iproxy -u "$UDID" "$WDA_PORT":8100 "$MJPEG_PORT":9100 >/tmp/iproxy_$UDID.log 2>&1 &

  # launch prebuilt WDA
  env DEVICECTL_CHILD_USE_PORT=8100 \
      DEVICECTL_CHILD_MJPEG_SERVER_PORT=9100 \
      xcrun devicectl device process launch --terminate-existing \
          --device "$UDID" "$BUNDLE" >/tmp/wda_$UDID.log 2>&1 &

done

echo "✅ All WDA launched. Use http://localhost:8101-8104 per device."


