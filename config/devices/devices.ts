import { HOSTS } from '../selenium-hosts/hosts';
import envConfig from '../env/env';
export interface DeviceInfo {
  platformName: 'Android' | 'iOS';
  udid: string;
  wdaPort?: number;
  mjpegPort?: number;
  serverType: 'local' | 'linux' | 'mac';
  pcOwner?: string;
  tag?: string;
  bundleId?: string;
}

export const DEVICE_COUNT_BY_SERVER = {
  local: 2,
  linux: 6,
  mac: 4,
};

export const DEVICES: Record<string, DeviceInfo> = {
  '@localBase1': {
    platformName: 'Android',
    udid: 'emulator-5554',
    serverType: 'local',
    pcOwner: 'PC_Dell',
  },
  '@localBase2': {
    platformName: 'Android',
    udid: 'emulator-5556',
    serverType: 'local',
    pcOwner: 'PC_Dell',
  },
};

export function generateCapability(tag: string): WebdriverIO.Capabilities {
  const d = DEVICES[tag];
  if (!d) throw new Error(`❌ Unknown device tag: ${tag}`);
  const serverKey: 'windows' | 'linux' | 'mac' =
    d.serverType === 'local' ? 'windows' : d.serverType;

  const hostname = HOSTS[serverKey]; // pick hostname from HOSTS
  // const hostname = HOSTS[d.serverType];
  // const port = 4723;                     // default Appium port
  const protocol: 'http' | 'https' = 'http';

  const base: WebdriverIO.Capabilities = {
    platformName: d.platformName,
    hostname,
    protocol,
    'appium:udid': d.udid,
    'appium:automationName':
      d.platformName === 'iOS' ? 'XCUITest' : 'UiAutomator2',
    // 'appium:noReset': true,
    'appium:noReset': process.env.NO_RESET === 'false' ? false : true,
    'appium:newCommandTimeout': 800,
    // 'appium:mjpegScreenshotUrl'
  };

  if (d.platformName === 'Android') {
    base['appium:appPackage'] = envConfig.androidPackageName;
    base['appium:appActivity'] = envConfig.androidAppActivity;
    base['appium:adbExecTimeout'] = 600000;
    // ✅ Enable hideKeyboard only for emulators
    if (d.udid.includes('emulator')) {
      base['appium:hideKeyboard'] = true;
    }
    if (d.serverType === 'linux') {
      base['appium:mjpegServerPort'] = d.mjpegPort;
    }
  } else if (d.platformName === 'iOS') {
    base['appium:bundleId'] = envConfig.iosBundleId;

    // ✅ Add WDA + MJPEG ports for iOS
    base['appium:webDriverAgentUrl'] = `http://localhost:${d.wdaPort}`;
    // base['appium:mjpegServerPort'] = d.mjpegPort;
    base['appium:usePrebuiltWDA'] = true;
    base['appium:updatedWDABundleId'] = d.bundleId;
  }

  return base;
}
