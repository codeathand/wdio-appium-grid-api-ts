import { addStep } from '@wdio/allure-reporter';
import { Status } from 'allure-js-commons';
import { scrollIntoView } from './scroll_actions';
import { buildTypeByLocator, resolveLocatorText } from './locator_strategy';
import type { ChainablePromiseElement } from 'webdriverio';
import { memory } from '../../support/memory';
import { handleIncidents } from '../app-methods/global_app_methods';

export async function typeAmountField(
  value: string,
  timeout = 5000,
  clearBefore = true,
): Promise<void> {
  // Define platform-specific selectors
  const isAndroid = driver.isAndroid;

  const androidSelectors = [
    `//android.widget.EditText[@content-desc="null" or @hint="0,00"]`,
    `//android.widget.EditText[@hint="0,00"]`,
    `//android.view.View[@content-desc="Iznos"]/following-sibling::android.widget.EditText[1]`,
    `//android.view.View[@content-desc="Amount"]/following-sibling::android.widget.EditText[1]`,
  ];

  const iosSelectors = [
    `//XCUIElementTypeTextField[@name="0,00" or @label="0,00"]`,
    // `//XCUIElementTypeStaticText[@name="Iznos"]/following-sibling::XCUIElementTypeTextField[1]`,
    // `//XCUIElementTypeStaticText[@name="Amount"]/following-sibling::XCUIElementTypeTextField[1]`,
  ];

  const selectors = isAndroid ? androidSelectors : iosSelectors;

  let lastError: unknown;

  for (const selector of selectors) {
    try {
      driver.pause(500); // allow UI to stabilize
      const el = await scrollIntoView(selector);

      if (!(await el.isDisplayed())) {
        continue; // skip if not displayed
      }

      await el.waitForDisplayed({ timeout });
      if (driver.isAndroid) {
        await el.click();
      }

      if (clearBefore) {
        try {
          await el.clearValue();
        } catch {
          const currentText = await el.getText();
          if (currentText) {
            const backspaces = new Array(currentText.length)
              .fill('\uE003')
              .join('');
            await el.setValue(backspaces);
          }
        }
      }

      await hideKeyboardIfRealDevice();
      await el.setValue(value);

      const logMsg = `✅ Typed "${value}" in amount field using selector: ${selector}`;
      console.log(logMsg);
      addStep(logMsg, {}, Status.PASSED);

      return; // stop after first success
    } catch (err) {
      lastError = err;
      const warnMsg = `⚠️ Failed typing "${value}" using selector: ${selector}`;
      console.warn(warnMsg);
      addStep(warnMsg, {}, Status.BROKEN);
    }
  }

  const errorMsg = `❌ Could not type amount "${value}". Last error: ${lastError}`;
  console.error(errorMsg);
  addStep(errorMsg, {}, Status.FAILED);
  throw new Error(errorMsg);
}

export async function typeInFieldByLocator(
  locatorKey: string,
  value?: string,
  index?: number,
  dynamic = false,
  timeout = 5000,
  clearBefore = false,
  doScroll = true,
  retries = 1, // 👈 add retry counter
): Promise<void> {
  const { english, serbian } = resolveLocatorText(locatorKey, dynamic);
  const { android, ios } = buildTypeByLocator(english, serbian, index);

  const typeAction = async (el: ChainablePromiseElement) => {
    await el.waitForDisplayed({
      timeout,
      timeoutMsg: `Field "${english}" / "${serbian}" not displayed`,
    });

    if (value !== undefined) {
      if (driver.isAndroid) {
        await el.click();
      }

      if (clearBefore) {
        try {
          await el.clearValue();
        } catch {
          const currentText = await el.getText();
          if (currentText) {
            const backspaces = new Array(currentText.length)
              .fill('\uE003')
              .join('');
            await el.setValue(backspaces);
          }
        }
      }
      await hideKeyboardIfRealDevice();
      // await browser.pause(500);
      await el.setValue(value);
    }

    const logMsg = `✅ typeInFieldByLocator - Typed into field "${english}" / "${serbian}", value: ${value}`;
    console.log(logMsg);
    addStep(logMsg, {}, Status.PASSED);
  };

  try {
    let found = false;

    if (driver.isAndroid) {
      // browser.pause(500);

      for (const xpath of android) {
        const candidates = await $$(xpath);
        console.log(
          `       🔍 Android locator tried: ${xpath} → found ${candidates.length} element(s)`,
        );

        if ((await candidates.length) > 0) {
          const el = candidates[0];
          console.log(`       🎯 Using Android XPath: ${xpath}`);
          await typeAction(el);
          found = true;
          break;
        }
      }
    } else {
      for (const xpath of ios) {
        const candidates = await $$(xpath);
        console.log(
          `       🔍 iOS locator tried: ${xpath} → found ${candidates.length} element(s)`,
        );

        if ((await candidates.length) > 0) {
          const el = candidates[0];
          console.log(`       🎯 Using iOS XPath: ${xpath}`);
          await typeAction(el);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      throw new Error(
        `   ❌ typeInFieldByLocator - Element "${english}" / "${serbian}" not found`,
      );
    }
  } catch (err) {
    const warnMsg = `   ⚠️ typeInFieldByLocator failed for "${english}" / "${serbian}": ${err}`;
    console.warn(warnMsg);
    addStep(warnMsg, {}, Status.FAILED);

    if (retries > 0) {
      const handled = await handleIncidents();
      if (handled) {
        const retryMsg = `    🔄 Retrying typeInFieldByLocator for "${english}" / "${serbian}" (remaining retries: ${retries})`;
        console.log(retryMsg);
        return typeInFieldByLocator(
          locatorKey,
          value,
          index,
          dynamic,
          timeout,
          clearBefore,
          doScroll,
          retries - 1,
        );
      }
    }

    throw err; // no retries left
  }
}

export async function hideKeyboardIfRealDevice(): Promise<void> {
  const udid = memory.get('deviceUdid') as string | undefined;
  if (!udid) {
    console.warn('⚠️ No UDID found in memory, skipping hideKeyboard.');
    return;
  }
  if (!udid.toLowerCase().includes('emulator') && !udid.startsWith('0000')) {
    try {
      await browser.hideKeyboard();
    } catch (err) {
      console.warn('⚠️ Could not hide keyboard:', err);
    }
  }
}
