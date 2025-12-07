# --------------------------------------------------

# 🔹 Commands (mobile-grid-not-log.sh)

# --------------------------------------------------

# Source and make executable

cd Project/milos_new_proj/wdio-mobile-api-ts/selenium-grid/local/mac/service
source ./mobile-grid-not-log.sh
chmod +x ./mobile-grid-not-log.sh

# Start

./mobile-grid-not-log.sh start

# Stop

./mobile-grid-not-log.sh stop

# See errors

tail -f /Users/yettel.bank/Project/milos_new_proj/wdio-mobile-api-ts/selenium-grid/local/mac/service/mobile-grid.err

# --------------------------------------------------

# Service commands (mobile-grid-not-log-service.sh)

# --------------------------------------------------

# ✅ Load sarvice

sudo launchctl load /Library/LaunchDaemons/com.selenium.grid.plist

# ✅ Start sarvice

sudo launchctl start com.selenium.grid

# ⛔ Unload service

sudo launchctl unload /Library/LaunchDaemons/com.selenium.grid.plist

# ⛔ Stop service

sudo launchctl stop com.selenium.grid

# 📋 List running processes

sudo launchctl list | grep selenium

# --------------------------------------------------

# WebDriverAgent

# --------------------------------------------------

# ✅ Clean and start testing on WDA

cd Project/milos_new_proj/wdio-mobile-api-ts/selenium-grid/local/mac/service
chmod +x ./start-wda-device1.sh
chmod +x ./start-wda-device2.sh
chmod +x ./start-wda-device3.sh
chmod +x ./start-wda-device4.sh
chmod +x ./start-wda-all.sh
./start-wda-terminals.sh

# ✅ Load sarvice

launchctl load com.wda.clean.test.plist

# ✅ Start sarvice

launchctl start com.wda.clean.test

# ⛔ Unload service

launchctl unload com.wda.clean.test.plist

# ⛔ Stop service

launchctl stop com.wda.clean.test
