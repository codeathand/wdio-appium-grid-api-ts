import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SELENIUM_GRID_PORT = 4444;
const APPIUM_START_PORT = 4723;
const NODECONFIG_DIR = path.resolve(__dirname, '.appium-nodes');
const APPIUM_CONFIG_DIR = path.resolve(__dirname, '.appium-configs');

if (!fs.existsSync(NODECONFIG_DIR))
  fs.mkdirSync(NODECONFIG_DIR, { recursive: true });
if (!fs.existsSync(APPIUM_CONFIG_DIR))
  fs.mkdirSync(APPIUM_CONFIG_DIR, { recursive: true });

interface Device {
  id: string;
  platform: 'Android' | 'iOS';
  name: string;
}

// ---------------- DEVICE DETECTION ----------------
function getConnectedIOSDevices(): Device[] {
  try {
    const output = execSync('xcrun xctrace list devices').toString();
    return output
      .split('\n')
      .filter(
        (line) =>
          line.includes('Simulator') ||
          line.includes('iPhone') ||
          line.includes('iPad'),
      )
      .map((line) => {
        const match = line.match(/(.+) \(([\w-]+)\)/);
        if (match) {
          const name = match[1].trim();
          const id = match[2].trim();
          return { id, platform: 'iOS', name };
        }
        return null;
      })
      .filter((d): d is Device => !!d);
  } catch (err) {
    console.error('❌ Failed to detect iOS devices', err);
    return [];
  }
}

// ---------------- NODE CONFIG ----------------
function createNodeConfig(device: Device, nodeIndex: number) {
  const configPath = path.join(NODECONFIG_DIR, `node-${nodeIndex + 1}.toml`);
  const nodeConfig = `
[server]
port = ${SELENIUM_GRID_PORT + nodeIndex}

[node]
detect-drivers = false

[relay]
url = "http://localhost:${APPIUM_START_PORT + nodeIndex}"
status-endpoint = "/status"
configs = [
    "1", "{\\"platformName\\": \\"${device.platform.toLowerCase()}\\", \\"appium:udid\\": \\"${device.id}\\", \\"appium:automationName\\": \\"${device.platform === 'Android' ? 'UIAutomator2' : 'XCUITest'}\\", \\"appium:wdaLocalPort\\": \\"${8100 + nodeIndex}\\"}"
]
  `;
  fs.writeFileSync(configPath, nodeConfig.trim());
  return configPath;
}

// ---------------- APPIUM CONFIG ----------------
function createAppiumConfig(device: Device, nodeIndex: number) {
  const configPath = path.join(
    APPIUM_CONFIG_DIR,
    `appium-${nodeIndex + 1}.yml`,
  );
  const yaml = `
server:
  port: ${APPIUM_START_PORT + nodeIndex}
  use-drivers:
    - ${device.platform === 'Android' ? 'uiautomator2' : 'xcuitest'}
  default-capabilities:
    ${device.platform === 'iOS' ? `appium:wdaLocalPort: ${8100 + nodeIndex}` : `appium:systemPort: ${8200 + nodeIndex}`}
    appium:mjpegServerPort: ${9100 + nodeIndex}
    appium:mjpegScreenshotUrl: "http://localhost:${9100 + nodeIndex}"
  `;
  fs.writeFileSync(configPath, yaml.trim());
  return configPath;
}

// ---------------- MAIN ----------------
function main() {
  const devices = getConnectedIOSDevices(); // iOS only for macOS

  if (devices.length === 0) {
    console.error('❌ No connected iOS devices found!');
    process.exit(1);
  }

  console.log(`Detected ${devices.length} iOS devices.`);

  devices.forEach((device, index) => {
    const nodeConfig = createNodeConfig(device, index);
    const appiumConfig = createAppiumConfig(device, index);
    console.log(`✅ Created: ${nodeConfig}`);
    console.log(`✅ Created: ${appiumConfig}`);
  });

  console.log('✅ All Appium YAML and Node TOML files created.');
}

main();
