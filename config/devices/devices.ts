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
  '@localMilos_SM_A546B': {
    platformName: 'Android',
    udid: 'RZCWB0Z0KYL',
    mjpegPort: 9120,
    serverType: 'local',
    pcOwner: 'PC_Milos',
  },
  '@localMilosCards': {
    platformName: 'Android',
    udid: 'emulator-5554',
    mjpegPort: 9100,
    serverType: 'local',
    pcOwner: 'PC_Milos',
  },
  '@localMilosPayments': {
    platformName: 'Android',
    udid: 'emulator-5556',
    mjpegPort: 9110,
    serverType: 'local',
    pcOwner: 'PC_Milos',
  },
  '@localJovica_SM_A546B': {
    platformName: 'Android',
    udid: 'RZCWB10LWWX',
    serverType: 'local',
    pcOwner: 'PC_Jovica',
  },
  '@localJovicaCards': {
    platformName: 'Android',
    udid: 'emulator-5554',
    serverType: 'local',
    pcOwner: 'PC_Jovica',
  },
  '@localJovicaPayments': {
    platformName: 'Android',
    udid: 'emulator-5555',
    serverType: 'local',
    pcOwner: 'PC_Jovica',
  },
  '@localSinisa_SM_A546B': {
    platformName: 'Android',
    udid: 'ZY227GGQFT',
    serverType: 'local',
    pcOwner: 'PC_Sinisa',
  },
  '@localSinisaCards': {
    platformName: 'Android',
    udid: 'emulator-5554',
    serverType: 'local',
    pcOwner: 'PC_Sinisa',
  },
  '@localSinisaPayments': {
    platformName: 'Android',
    udid: 'emulator-5555',
    serverType: 'local',
    pcOwner: 'PC_Sinisa',
  },
  '@androidDevice1': {
    platformName: 'Android',
    udid: 'RZCWB0Z0HGH',
    mjpegPort: 9110,
    serverType: 'linux',
  },
  '@androidDevice2': {
    platformName: 'Android',
    udid: 'RZCWB10LFEY',
    mjpegPort: 9111,
    serverType: 'linux',
  },
  '@androidDevice3': {
    platformName: 'Android',
    udid: 'RZCWB10LLFF',
    mjpegPort: 9112,
    serverType: 'linux',
  },
  '@androidDevice4': {
    platformName: 'Android',
    udid: 'RZCWB10MP0M',
    mjpegPort: 9113,
    serverType: 'linux',
  },
  '@androidDevice5': {
    platformName: 'Android',
    udid: 'RZCWB10MQ2P',
    mjpegPort: 9114,
    serverType: 'linux',
  },
  '@androidDevice6': {
    platformName: 'Android',
    udid: 'RZCWB10MTCM',
    mjpegPort: 9115,
    serverType: 'linux',
  },
  '@iosDevice11_iPhone': {
    platformName: 'iOS',
    udid: '00008030-00116D5E3A12202E',
    wdaPort: 8101,
    mjpegPort: 9100,
    serverType: 'mac',
    bundleId: 'rs.yettelbank.WebDriverAgentRunner1',
  },
  '@iosDevice12_iPhone': {
    platformName: 'iOS',
    udid: '00008101-0019752E3C93A01E',
    wdaPort: 8102,
    mjpegPort: 9100,
    serverType: 'mac',
    bundleId: 'rs.yettelbank.WebDriverAgentRunner2',
  },
  '@iosDevice13_iPhone': {
    platformName: 'iOS',
    udid: '00008110-000C28A12145A01E',
    wdaPort: 8103,
    mjpegPort: 9100,
    serverType: 'mac',
    bundleId: 'rs.yettelbank.WebDriverAgentRunner3',
  },
  '@iosDevice14_iPhone': {
    platformName: 'iOS',
    udid: '00008110-001C58E03689A01E',
    wdaPort: 8104,
    mjpegPort: 9100,
    serverType: 'mac',
    bundleId: 'rs.yettelbank.WebDriverAgentRunner4',
  },
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
