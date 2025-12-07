import { After, AfterAll, Before, BeforeAll } from '@wdio/cucumber-framework';
import {
  ensureOnboardingOrLogin,
  isScreenBlack,
  logout,
  preventDataLeakage,
  terminateOrRestartApp,
} from '../ui-utils/app-methods/global_app_methods';
import { userDataLoader } from './user_data_loader';
import { memory } from './memory';
import { DEVICES, generateCapability } from '../../config/devices/devices';
import { HOSTS } from '../../config/selenium-hosts/hosts';
import { generateMJPEGViewer } from './generateMJPEGViewer';

import envConfig from '../../config/env/env';

const mjpegProcesses: Record<string, any> = {};

BeforeAll(async function () {
  console.log('🎬 [Hook - BeforeAll] Starting test scenarios');
  //
  const sessionId = browser.sessionId;
  const currentCapability = (global as any).browser?.capabilities as any;
  const deviceTag = currentCapability?.['wdio:options']?.deviceTag;
  currentCapability['wdio:options']!.sessionId = sessionId;
  currentCapability['wdio:options']!.sessionStartTime =
    new Date().toISOString();

  console.log('🆔 SessionId (BeforeAll):', sessionId);

  memory.set('sessionId', sessionId);
  memory.set('sessionStartTime', new Date().toISOString());
  memory.set('deviceTag', deviceTag);
  const id = currentCapability?.['wdio:options']!.sessionId;
  console.log('===== SESSION ID =====', id);
  console.log('===== DEVICE TAG =====', deviceTag);
  //
  if (browser.isAndroid) {
    await browser.startActivity(
      envConfig.androidPackageName,
      envConfig.androidAppActivity,
    );
    // try {
    //   await expectElement('login_menu_locations').toBeVisible();
    //   console.log('✅ App is already running, continuing tests.');
    // } catch {
    //   await browser.startActivity(
    //     envConfig.androidPackageName,
    //     envConfig.androidAppActivity,
    //   );
    //   console.log(
    //     '✅ App was not running, reactivation done, continuing tests.',
    //   );
    // }
  }
});

Before(async function (scenario) {
  console.log(
    `🎬 [Hook - Before] Starting scenario: "${scenario.pickle.name}"`,
  );
  //
  // const sessionId = browser.sessionId;

  const sessionId = memory.get('sessionId');
  const sessionStartTime = memory.get('sessionStartTime');
  console.log(`ℹ️ [Hook] ${sessionId} ${sessionStartTime}`);

  //
  const deviceTag = memory.get('deviceTag');
  const deviceUdid = memory.get('deviceUdid');
  memory.deleteAll();
  memory.set('deviceUdid', deviceUdid);

  // Check for @user= tag
  const userTag = scenario.pickle.tags.find((t) => t.name.startsWith('@user='));
  if (userTag) {
    const userName = userTag.name.split('=')[1];
    console.log(`👤 [Hook] Loading user: ${userName}`);
    userDataLoader.loadFromJson(userName); // fills memory
    console.log('🚀 [Hook] Logging in using JSON user...');
    // await ensureOnboardingOrLogin.call(this);
  } else {
    console.log(
      'ℹ️ [Hook] No @user= tag found → will login in a step after Background.',
    );
  }

  const deviceInfo = DEVICES[deviceTag];
  const serverKey =
    deviceInfo.serverType === 'local' ? 'windows' : deviceInfo.serverType;
  const server = HOSTS[serverKey];
  if (server != 'localhost') {
    let port = deviceInfo.mjpegPort ?? 9100;

    // Adjust port for external access (like Bash EXTERNAL_PORT=$((MJPEG_PORT - 10)))
    if (deviceInfo.serverType === 'linux') {
      port -= 10; // e.g. 9110 -> 9100
    }

    const streamUrl = `http://${server}:${port}`;
    console.log(
      `🌐 [Hook] Setting up MJPEG viewer for device: ${deviceTag} at ${streamUrl}`,
    );
    // Pass scenario name + device tag
    mjpegProcesses[scenario.pickle.name] = generateMJPEGViewer(
      streamUrl,
      scenario.pickle.name,
      deviceTag,
    );
  }

  console.log(
    `✅ [Hook] Scenario setup completed for: "${scenario.pickle.name}"`,
  );

  // if (process.env.TEST_ENV === 't2') {
  //   const screenshotBase64 = await browser.takeScreenshot();
  //   const black = await isScreenBlack(screenshotBase64);
  //   if (black) {
  //     console.warn('    ⚠️ Detected black screen in MJPEG stream!');
  //     await preventDataLeakage();
  //   } else {
  //     console.log('     ✅ Black screen is not detected, continue...');
  //   }
  //   const screenshotBase64_new = await driver.takeScreenshot();
  //   const black_new = await isScreenBlack(screenshotBase64_new);
  //   if (black_new) {
  //     console.warn('    ⚠️ Detected black screen!');
  //   } else {
  //     console.log('     ✅ Black screen is not detected!');
  //   }
  // }
});

After(async function (scenario) {
  console.log(`🔚 Finishing scenario: ${scenario.pickle.name}`);
  //
  const currentCapability = (global as any).browser?.capabilities as any;
  const deviceTag = currentCapability?.['wdio:options']?.deviceTag;
  const sessionId = currentCapability?.['wdio:options']?.sessionId;
  console.log('🏁 [AfterAll] All scenarios finished');
  console.log(`🏁 Final session for ${deviceTag}: ${sessionId}`);
  //
  // if (scenario.result?.status === 'FAILED') {
  //   // you could attach screenshot here for Allure
  //   const screenshot = await browser.takeScreenshot();
  //   await this.attach(screenshot, 'image/png');
  // }
  try {
    // await logout.call(this);
    console.log('🚪 Logged out successfully.');
  } catch (err) {
    console.error('❌ Error during logout:', err);
  }
  // finally {
  //   // Ensure app is ter;minated for the next scenario
  //   if (driver.isIOS) {
  //     await terminateOrRestartApp();
  //   }

  // }
});

AfterAll(async function () {
  console.log('🔚 [Hook - AfterAll] scenarios finished');
  // //
  // const sessionId = memory.get('sessionId');
  // console.log(`🔚 Ending session: ${sessionId}`);
  // //
  try {
    await terminateOrRestartApp();
  } catch (err) {
    console.error('❌ Error terminating app in AfterAll:', err);
  }
});
