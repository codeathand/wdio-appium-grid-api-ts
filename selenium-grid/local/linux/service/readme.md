# --------------------------------------------------

# 🔹 Commands (mobile-grid.sh)

# --------------------------------------------------

# ✅ Start everything

./mobile-grid.sh start

# ⛔ Stop everything

./mobile-grid.sh stop

# 🔄 Restart everything

./mobile-grid.sh restart all

# 📋 List running processes

./mobile-grid.sh list

# --------------------------------------------------

# 🔹 Restart individual components

# --------------------------------------------------

# Restart only a specific Node (example: node1.toml)

./mobile-grid.sh restart node1

# Restart only a specific Appium server (example: appium2.yml)

./mobile-grid.sh restart appium2

# Restart all WDA + iproxy processes

./mobile-grid.sh restart wda

# Restart everything in one line

./mobile-grid.sh stop && ./mobile-grid.sh start

# --------------------------------------------------

# Service commands

Command Action
sudo systemctl start selenium-grid Start Hub, Nodes, Appium, and Forwards
sudo systemctl stop selenium-grid Stop everything
sudo systemctl restart selenium-grid Restart all
sudo systemctl status selenium-grid Check running status
sudo journalctl -u selenium-grid -f Follow logs live
