import { resolveLocator } from '../ui-actions-methods/locator_strategy';
import {
  clickButtonNearIfDisplayed,
  clickByLocator,
  clickByLocatorWithScroll,
  clickIfDisplayed,
} from '../ui-actions-methods/click_actions';
import currentConfig from '../../../config/env/env';
import { getData } from '../../support/user_data_loader';
import { memory } from '../../support/memory';
import { expectElement } from '../ui-actions-methods/expect_actions';
import { swipeRightApp } from '../ui-actions-methods/swipe_actions';
import { executeActivationProcess } from './global_ui_methods';
import { typeInFieldByLocator } from '../ui-actions-methods/type_actions';
import sharp from 'sharp';

export async function handleIncidents(timeout = 400): Promise<boolean> {
  const clickedShow_more = await clickIfDisplayed('general_show_more', undefined, timeout);

  if (clickedShow_more) {
    const clickedIgnore = await clickIfDisplayed('ignore', undefined, timeout);
    console.log(`   ⚠️ Handled incident popup: general_show_more clicked: ${clickedShow_more} -> ignore clicked: ${clickedIgnore}`);
    return true;
  }
  return false;
}

export async function ensureOnboardingOrLogin(this: any): Promise<void> {
  // Helper: get value either from scenario testData or memory
  const locator = resolveLocator('onboarding_info');
  const { english, serbian } = locator;
  const androidBase =
    `//android.widget.Button[contains(@content-desc, "${english}") or contains(@content-desc, "${serbian}") or contains(@text, "${english}") or contains(@text, "${serbian}")] | ` +
    `//android.view.View[contains(@content-desc, "${english}") or contains(@content-desc, "${serbian}") or contains(@text, "${english}") or contains(@text, "${serbian}")]`;
  const iosXpath =
    `//XCUIElementTypeButton[@name="${english}" or @name="${serbian}"] | ` +
    `//XCUIElementTypeStaticText[@name="${english}" or @name="${serbian}"]`;
  const selector = driver.isAndroid ? androidBase : iosXpath;
  const el = await $(selector);

  if ((await el.isDisplayed()) === true) {
    if (process.env.NO_RESET_IOS === 'false') {
      console.log(
        'User is already onboarded, proceeding with clear cache',
      );
      await enterInvalidPIN('122334');
      await clickIfDisplayed('app_WhileUsingThisApp');
      await handleIncidents();
      await performOnboarding.call(this);
      return;
    }
    console.log(
      'User is already onboarded/logged in, proceeding to login flow',
    );
    await performLogin.call(this);
  } else {
    console.log(
      'User is not onboarded/logged in, proceeding to onboarding flow',
    );
    await clickIfDisplayed('app_WhileUsingThisApp');
    await handleIncidents();
    await performOnboarding.call(this);
  }
}

// internal helper functions
export async function goBack(timeout = 3000): Promise<boolean> {
  try {
    if (driver.isAndroid) {
      // Native Android back
      await driver.back();
      console.log('🔙 Pressed Android back button');
      return true;
    } else if (driver.isIOS) {
      // iOS doesn’t have a "hardware" back button → handle manually
      const iosBackLocators = [
        `//XCUIElementTypeButton[@name="Back"]`,
        `//XCUIElementTypeButton[@label="Back"]`,
        `//XCUIElementTypeButton[@name="Nazad"]`, // Serbian
        `//XCUIElementTypeButton[@label="Nazad"]`,
      ];

      for (const locator of iosBackLocators) {
        try {
          const el = await $(locator);
          if (await el.waitForDisplayed({ timeout })) {
            await el.click();
            console.log(`🔙 Clicked iOS back button with locator: ${locator}`);
            return true;
          }
        } catch {
          // keep trying others
        }
      }

      console.warn('⚠️ No iOS back button found');
      return false;
    }

    console.warn('⚠️ Unknown platform, cannot go back');
    return false;
  } catch (err) {
    console.error('❌ goBack() failed:', err);
    return false;
  }
}

async function performLogin(this: any): Promise<void> {
  //incident
  await handleIncidents();
  await typeInFieldByLocator(
    'authorization_dialog_description',
    getData.call(this, 'PIN'),
  );
  await clickByLocator('general_continue');
}

async function performOnboarding(this: any): Promise<void> {
  await clickIfDisplayed('app_WhileUsingThisApp');
  await clickIfDisplayed('app_Allow');
  await clickByLocator('activation_status_no_activation_button');
  await executeActivationProcess(this);
  await clickByLocator('activation_ready_button');
  await clickByLocator('general_next');
  await clickByLocator('welcome_ready_button');
  await clickButtonNearIfDisplayed(
    'tutorial_content_payment_menu_appbar_title',
  );
  await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
}

export async function logout(this: any): Promise<boolean> {
  console.log('🔐 Attempting logout...');

  const popupButtons = [
    'draft_save_payment_dialog_cancel_button',
    // add more popup locators here
  ];

  const tryOpenMenu = async (): Promise<boolean> =>
    await clickIfDisplayed('dashboard_bottom_navigation_menu');

  const tryClickLogout = async (): Promise<boolean> => {
    const accountName = getData.call(this, 'account_name');
    return await clickButtonNearIfDisplayed(accountName);
  };

  const handlePopups = async (afterMenuAttempt = false): Promise<boolean> => {
    for (const btn of popupButtons) {
      await browser.pause(500); // allow UI to settle
      console.log(
        `🔔 Checking for popup button (${afterMenuAttempt ? 'after menu' : 'before menu'}): ${btn}`,
      );
      const clicked = await clickIfDisplayed(btn);
      if (clicked) {
        console.log(`⚠️ Closed popup: ${btn}`);
        return true; // found and closed popup
      }
    }
    return false; // no popup handled
  };

  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔄 Logout attempt #${attempt}`);

      // 1️⃣ Try opening menu
      let menuOpened = await tryOpenMenu();

      // 2️⃣ Handle popups **before menu** if menu not opened
      if (!menuOpened) {
        const popupHandled = await handlePopups(false);
        if (popupHandled) {
          await browser.pause(500);
        }

        await goBack();
        await browser.pause(1000);

        // Retry opening menu
        menuOpened = await tryOpenMenu();

        // 3️⃣ Handle popups **after menu attempt**
        if (!menuOpened) {
          await handlePopups(true);
          await browser.pause(500);
          menuOpened = await tryOpenMenu();
        }
      }

      // 4️⃣ If menu opened, try clicking logout
      if (menuOpened) {
        const logoutClicked = await tryClickLogout();
        if (logoutClicked) {
          console.log('✅ Successfully clicked logout');
          return true;
        } else {
          console.warn('⚠️ Logout button not found, retrying...');
        }
      }

      // 5️⃣ If still cannot open menu, go back before retrying
      if (!menuOpened) {
        await goBack();
        await browser.pause(1000);
      }
    }

    console.error('❌ Logout failed after multiple attempts');
    return false;
  } catch (err) {
    console.error('❌ Unexpected error during logout:', err);
    return false;
  }
}

export async function terminateOrRestartApp(): Promise<void> {
  if (driver.isAndroid) {
    // const packageName = currentConfig.androidPackageName;
    // try {
    //   // Terminate app
    //   await driver.execute('mobile: terminateApp', { appId: packageName });
    // } catch (e) {
    //   console.warn('⚠️ Android terminateApp failed, using adb force-stop', e);
    //   execSync(`adb shell am force-stop ${packageName}`);
    // }
    await removeMyAppFromRecentAppsAndroid();
  } else if (driver.isIOS) {
    const bundleId = currentConfig.iosBundleId;
    try {
      await driver.terminateApp(bundleId);
    } catch (e) {
      console.warn('⚠️ iOS: terminateApp failed', e);
    }
  } else {
    console.warn('terminateOrRestartApp: Unsupported platform');
  }
}
export async function removeMyAppFromRecentAppsAndroid(): Promise<void> {
  try {
    const udid = memory.get('deviceUdid') as string | undefined;

    if (!udid) {
      console.warn('⚠️ No UDID found in memory, skipping recent apps cleanup.');
      return;
    }

    const isEmulator = udid.toLowerCase().includes('emulator');

    if (isEmulator) {
      await driver.pressKeyCode(187);
      await swipeRightApp(driver);
      await clickIfDisplayed('clear_all');
      console.log('🧹 Cleared all recent apps in emulator');
      return;
    }

    try {
      await driver.pressKeyCode(187);
      await expectElement('close_all').toBeVisible();
      await clickIfDisplayed('close_all');
    } catch (err) {
      console.warn('⚠️ Failed to interact with "Close all" button:', err);
    }
  } catch (e) {
    console.warn('⚠️ Unexpected error while removing app from recent apps:', e);
  }
}

export async function clearCacheAndReinstall(): Promise<void> {
  if (driver.isAndroid) {
    await reinstallViaTester();
  } else {
    await reinstallViaTestFlight();
  }
}

async function reinstallViaTester(): Promise<void> {
  // launch Firebase Tester
  await driver.activateApp(currentConfig.testerAppPackage!);

  // find app by display name (from EnvConfig)
  const appTile = await driver.$(
    `//android.widget.TextView[@text="${currentConfig.appDisplayName}"]`,
  );
  await appTile.click();

  // click "Download" (first button on screen)
  const downloadBtn = await driver.$(
    '//android.widget.Button[contains(@text, "Download")]',
  );
  await downloadBtn.click();

  // wait → click "Update"
  const updateBtn = await driver.$(
    '//android.widget.Button[contains(@text, "Update")]',
  );
  await updateBtn.click();

  // wait → click "Open"
  const openBtn = await driver.$(
    '//android.widget.Button[contains(@text, "Open")]',
  );
  await openBtn.click();
}

async function reinstallViaTestFlight(): Promise<void> {
  // launch TestFlight
  await driver.activateApp(currentConfig.testFlightBundleId!);

  // locate app by display name
  const appTile = await driver.$(
    `-ios predicate string: label == "${currentConfig.appDisplayName}"`,
  );
  await appTile.click();

  // click "Install"
  const installBtn = await driver.$('~Install');
  await installBtn.click();

  // confirm second "Install"
  const confirmBtn = await driver.$('~Install');
  await confirmBtn.click();

  // open app
  const openBtn = await driver.$('~Open');
  await openBtn.click();

  // handle permissions & onboarding
  const allowBtn = await driver.$('~Allow While Using App');
  if (await allowBtn.isDisplayed()) await allowBtn.click();

  const nextBtn = await driver.$('~Next');
  if (await nextBtn.isDisplayed()) await nextBtn.click();

  const startBtn = await driver.$('~Start Testing');
  if (await startBtn.isDisplayed()) await startBtn.click();
}

//helper to generate random text like "ABCD123" for device name
export function randomText(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const randomLetters = Array.from({ length: 4 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length)),
  ).join('');

  const randomNumbers = Array.from({ length: 3 }, () =>
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
  ).join('');

  return randomLetters + randomNumbers;
}

// Example usage:
console.log(randomText()); // e.g. "QZKP482"

export async function preventDataLeakage(): Promise<void> {
  await clickByLocator('dashboard_bottom_navigation_menu');
  if (browser.isAndroid === true) {
    await clickByLocatorWithScroll('prevent_data_leakage', 1, 1000, 8, 1000);
    await expectElement('data_leakage_protection_disabled').toBeVisible();
  } else {
    await clickByLocatorWithScroll('prevent_screenshots', 1, 1000, 5, 1000);
    await expectElement('screenshots_protection_disabled').toBeVisible();
  }
  await clickIfDisplayed('dashboard_bottom_navigation_review');
  await expectElement('dashboard_bottom_navigation_review').toBeVisible();
}

export async function isScreenBlack(base64: string): Promise<boolean> {
  const buffer = Buffer.from(base64, 'base64');
  const image = sharp(buffer);

  // Resize down for faster processing
  const resized = await image
    .resize(50, 50)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = resized;

  let blackPixels = 0;
  const totalPixels = info.width * info.height;

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 10) blackPixels++;
  }

  const blackRatio = blackPixels / totalPixels;
  console.log(`      ⚠️ Black pixel ratio: ${blackRatio}`);
  return blackRatio > 0.95;
}

async function enterInvalidPIN(pin: string) {
  for (let i = 0; i < 5; i++) {
    await handleIncidents();
    await typeInFieldByLocator('authorization_dialog_description', pin);
    await clickByLocator('general_continue');
    if (i < 4) {
      await expectElement('general_incorrect_pin').toBeVisible();
    } else {
      await expectElement('activation_status_blocked_title').toBeVisible();
    }
    await clickByLocator('general_ok');
  }
}