import {
  buildClickButtonNear,
  buildClickByLocator,
  resolveLocator,
  resolveLocatorText,
} from './locator_strategy';
import type { ChainablePromiseElement } from 'webdriverio';
import { addStep } from '@wdio/allure-reporter';
import { Status } from 'allure-js-commons';
import { handleIncidents } from '../app-methods/global_app_methods';
import { scrollUp } from './scroll_actions';

export async function clickByLocatorWithScroll(
  locatorKey: string,
  index = 1,
  timeout = 10000,
  maxScrolls = 5,
  settlePause = 500,
) {
  const locator = resolveLocator(locatorKey);
  const { english, serbian } = locator;

  const selector = browser.isAndroid
    ? `//*[@text="${english}" or @text="${serbian}" or @content-desc="${english}" or @content-desc="${serbian}"]`
    : `//XCUIElementTypeAny[@name="${english}" or @name="${serbian}"]`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxScrolls; attempt++) {
    try {
      const elements = await $$(selector);

      if ((await elements.length) >= index) {
        const el = elements[index - 1];
        if (await el.isDisplayed()) {
          console.log(
            `✅ clickByLocatorWithScroll - Found element "${english}" / "${serbian}" at index ${index} on attempt ${attempt + 1}`,
          );

          await el.waitForDisplayed({ timeout });

          try {
            await el.click();
          } catch (err: any) {
            // 🩹 Handle Selenium Grid + Appium DELETE /actions issue
            if (
              err.message?.includes('actions') &&
              err.message?.includes('DELETE')
            ) {
              console.warn(
                '⚠️ Ignoring harmless /actions DELETE protocol error',
              );
            } else {
              throw err;
            }
          }

          return; // ✅ success
        }
      }
    } catch (err) {
      lastError = err as Error;
    }

    // 🔄 Scroll and retry
    console.log(
      `🔄 Attempt ${attempt + 1} failed, scrolling and retrying clickByLocator...`,
    );
    await scrollUp();
    await browser.pause(settlePause);

    try {
      await clickByLocator(locatorKey);
      console.log(
        `✅ clickByLocator succeeded after scroll on attempt ${attempt + 1}`,
      );
      return; // ✅ success
    } catch (err) {
      lastError = err as Error;
      console.log(`⚠️ clickByLocator also failed on attempt ${attempt + 1}`);
    }
  }

  throw new Error(
    `❌ Could not find or click element "${english}" or "${serbian}" at index ${index} after ${maxScrolls} scrolls. ${
      lastError ? `Last error: ${lastError.message}` : ''
    }`,
  );
}

export async function clickByLocator(
  locatorKey: string,
  index?: number,
  timeout = 2000,
  dynamic = false,
  doScroll = true,
  maxScrollRetries = 5,
): Promise<boolean> {
  const { english, serbian } = resolveLocatorText(locatorKey, dynamic);
  const locatorList = driver.isAndroid
    ? buildClickByLocator(english, serbian, index).android
    : buildClickByLocator(english, serbian, index).ios;

  await browser.pause(timeout);

  let found = false;

  for (
    let scrollAttempt = 0;
    scrollAttempt < (doScroll ? maxScrollRetries : 1);
    scrollAttempt++
  ) {
    for (const xpath of locatorList) {
      const candidates = await $$(xpath); // 🔹 re-query after each scroll
      console.log(
        `       🔍 ${driver.isAndroid ? 'Android' : 'iOS'} locator tried: ${xpath} → found ${candidates.length} element(s)`,
      );

      if ((await candidates.length) > 0) {
        let el = candidates[0];
        if (doScroll && !(await el.isDisplayed())) {
          try {
            el = await scrollIntoView(el);
          } catch {
            console.warn(
              `⚠️ Element not visible yet, trying to click anyway...`,
            );
          }
        }

        // await el.waitForDisplayed({ timeout });
        await browser.pause(timeout);
        await el.click();
        found = true;

        const logMsg = `✅ clickByLocator - Clicked "${english}" / "${serbian}" on attempt ${scrollAttempt + 1}`;
        console.log(logMsg);
        addStep(logMsg, {}, Status.PASSED);
        return true;
      }
    }

    // 🔹 Only scroll if not found
    if (doScroll && !found) {
      console.log(`⬇️ Scroll attempt ${scrollAttempt + 1} to find element...`);
      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: 300, y: 1000 },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 500 },
            { type: 'pointerMove', duration: 1000, x: 300, y: 300 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
          // 🩹 safely handle buggy DELETE /actions call
      try {
        await driver.releaseActions();
      } catch (err: any) {
        if (err.message?.includes('actions') && err.message?.includes('DELETE')) {
          console.warn(
            '    ⚠️ Ignoring harmless /actions DELETE protocol error (clickByLocator)',
          );
        } else {
          throw err;
        }
      }
      await browser.pause(500); // allow screen to stabilize
    }
  }

  if (!found) {
    const errMsg = `❌ clickByLocator - Element "${english}" / "${serbian}" not found after ${maxScrollRetries} scroll(s)`;
    console.warn(errMsg);
    addStep(errMsg, {}, Status.FAILED);

    // attempt to handle incidents dynamically
    const handled = await handleIncidents();
    if (handled) {
      console.log(`🔄 Retrying click after handling incident...`);
      return clickByLocator(
        locatorKey,
        index,
        timeout,
        dynamic,
        doScroll,
        maxScrollRetries,
      );
    }

    throw new Error(errMsg);
  }

  return false;
}

export async function scrollIntoView(
  target: ChainablePromiseElement,
  maxScrolls = 5,
): Promise<ChainablePromiseElement> {
  for (let i = 0; i < maxScrolls; i++) {
    if (await target.isDisplayed()) {
      return target; // return as ChainablePromiseElement
    }

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: 300, y: 1000 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 500 },
          { type: 'pointerMove', duration: 1000, x: 300, y: 300 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    await driver.releaseActions();
  }
  throw new Error(`Element not found after scrolling`);
}

// export async function clickButtonNearIfDisplayed(
//   locatorKey: string,
//   index?: number,
//   timeout = 3000,
//   dynamic = false,
// ): Promise<boolean> {
//   const { english, serbian } = resolveLocatorText(locatorKey, dynamic);
//   const { android, ios } = buildClickButtonNear(english, serbian, index);

//   try {
//     if (driver.isAndroid) {
//       const el = await $(android);
//       const isDisplayed = await el.isDisplayed().catch(() => false);

//       if (isDisplayed) {
//         await el.click();
//         const logMsg = `✅ clickButtonNearIfDisplayed - Clicked button near: "${english}" / "${serbian}"`;
//         console.log(logMsg);
//         addStep(logMsg, {}, Status.PASSED);
//         return true;
//       } else {
//         const logMsg = `      ℹ️ clickButtonNearIfDisplayed - Button near not displayed: "${english}" / "${serbian}"`;
//         console.log(logMsg);
//         addStep(logMsg, {}, Status.BROKEN); // optional
//         return false;
//       }
//     } else {
//       const buttons = await $$(ios);
//       if (!buttons.length) {
//         const logMsg = `      ℹ️ No buttons found near: "${english}" / "${serbian}"`;
//         console.log(logMsg);
//         addStep(logMsg, {}, Status.BROKEN);
//         return false;
//       }

//       const el = index ? buttons[index - 1] : buttons[await buttons.length - 1];
//       const isDisplayed = await el.isDisplayed().catch(() => false);

//       if (isDisplayed) {
//         await el.waitForDisplayed({ timeout });
//         await el.click();
//         const logMsg = `✅ clickButtonNearIfDisplayed - Clicked button near: "${english}" / "${serbian}"`;
//         console.log(logMsg);
//         addStep(logMsg, {}, Status.PASSED);
//         return true;
//       } else {
//         const logMsg = `      ℹ️ clickButtonNearIfDisplayed - Button near not displayed: "${english}" / "${serbian}"`;
//         console.log(logMsg);
//         addStep(logMsg, {}, Status.BROKEN);
//         return false;
//       }
//     }
//   } catch {
//     const logMsg = `      ℹ️ Button near not found or not clickable: "${english}" / "${serbian}"`;
//     console.log(logMsg);
//     addStep(logMsg, {}, Status.BROKEN);
//     return false;
//   }
// }

export async function clickButtonNearIfDisplayed(
  locatorKey: string,
  index?: number,
  timeout = 2000,
  dynamic = false,
): Promise<boolean> {
  const { english, serbian } = resolveLocatorText(locatorKey, dynamic);
  const { android, ios } = buildClickButtonNear(english, serbian, index);
  await browser.pause(timeout);
  try {
    let found = false;
    if (driver.isAndroid) {
      for (const xpath of android) {
        const candidates = await $$(xpath);
        console.log(
          `       🔍 Android locator tried: ${xpath} → found ${candidates.length} element(s)`,
        );

        if ((await candidates.length) > 0) {
          const el = candidates[0];
          console.log(`       🎯 Using Android XPath: ${xpath}`);
          await el.click();
          found = true;
          const logMsg = `ℹ️ clickButtonNearIfDisplayed - Button near not displayed: "${english}" / "${serbian}"`;
          console.log(logMsg);
          addStep(logMsg, {}, Status.PASSED);
          return true;
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
          await el.click();
          found = true;
          const logMsg = `ℹ️ clickButtonNearIfDisplayed - Button near not displayed: "${english}" / "${serbian}"`;
          console.log(logMsg);
          addStep(logMsg, {}, Status.PASSED);
          return true;
        }
      }
    }

    if (!found) {
      throw new Error(
        `❌ typeInFieldByLocator - Element "${english}" / "${serbian}" not found`,
      );
    }
  } catch {
    const logMsg = `ℹ️ Button near not found or not clickable: "${english}" / "${serbian}"`;
    console.log(logMsg);
    addStep(logMsg, {}, Status.BROKEN);
    return false;
  }

  return false;
}

// export async function clickIfDisplayed(
//   locatorKey: string,
//   index?: number,
//   timeout = 3000,
//   dynamic = false,
// ): Promise<boolean> {
//   try {
//     const { english, serbian } = resolveLocatorText(locatorKey, dynamic);
//     const { android, ios } = buildClickByLocator(english, serbian, index);

//     if (driver.isAndroid) {
//       const el = await $(android);
//       const isDisplayed = await el
//         .waitForDisplayed({ timeout })
//         .catch(() => false);

//       if (isDisplayed) {
//         await el.click();
//         const logMsg = `✅ clickIfDisplayed - Clicked button near: "${english}" / "${serbian}"`;
//         console.log(logMsg);
//         addStep(logMsg, {}, Status.PASSED);
//         return true;
//       } else {
//         const logMsg = `    ℹ️ clickIfDisplayed - Button not displayed: "${english}" / "${serbian}"`;
//         console.log(logMsg);
//         addStep(logMsg, {}, Status.BROKEN);
//         return false;
//       }
//     } else {
//       for (const iosSelector of ios) {
//         const el = await $(iosSelector);
//         const isDisplayed = await el
//           .waitForDisplayed({ timeout })
//           .catch(() => false);

//         if (isDisplayed) {
//           await el.click();
//           const logMsg = `✅ clickIfDisplayed - Clicked button near: "${english}" / "${serbian}"`;
//           console.log(logMsg);
//           addStep(logMsg, {}, Status.PASSED);
//           return true;
//         }
//       }
//       const logMsg = `    ℹ️ clickIfDisplayed - No iOS selector displayed for: "${english}" / "${serbian}"`;
//       console.log(logMsg);
//       addStep(logMsg, {}, Status.BROKEN);
//       return false;
//     }
//   } catch {
//     const logMsg = `ℹ️ clickIfDisplayed - Element not found or not clickable: "${locatorKey}"`;
//     console.log(logMsg);
//     addStep(logMsg, {}, Status.BROKEN);
//     return false;
//   }
// }

export async function clickIfDisplayed(
  locatorKey: string,
  index?: number,
  timeout = 3000,
  dynamic = false,
): Promise<boolean> {
  const { english, serbian } = resolveLocatorText(locatorKey, dynamic);
  const { android, ios } = buildClickByLocator(english, serbian, index);

  try {
    if (driver.isAndroid) {
      for (const xpath of android) {
        const candidates = await $$(xpath);
        console.log(
          `       🔍 Android locator tried: ${xpath} → found ${candidates.length} element(s)`,
        );

        if ((await candidates.length) > 0) {
          const el = candidates[0];
          const isDisplayed = await el
            .waitForDisplayed({ timeout })
            .catch(() => false);
          if (isDisplayed) {
            console.log(`       🎯 Using Android XPath: ${xpath}`);
            await el.click();
            const logMsg = `✅ clickIfDisplayed - Clicked Android element: "${english}" / "${serbian}"`;
            console.log(logMsg);
            addStep(logMsg, {}, Status.PASSED);
            return true;
          }
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
          const isDisplayed = await el
            .waitForDisplayed({ timeout })
            .catch(() => false);
          if (isDisplayed) {
            console.log(`       🎯 Using iOS XPath: ${xpath}`);
            await el.click();
            const logMsg = `✅ clickIfDisplayed - Clicked iOS element: "${english}" / "${serbian}"`;
            console.log(logMsg);
            addStep(logMsg, {}, Status.PASSED);
            return true;
          }
        }
      }
      const logMsg = `ℹ️ clickIfDisplayed - No iOS selector displayed for: "${english}" / "${serbian}"`;
      console.log(logMsg);
      addStep(logMsg, {}, Status.BROKEN);
      return false;
    }

    // If nothing was found at all
    const logMsg = `❌ clickIfDisplayed - Element "${english}" / "${serbian}" not found`;
    console.log(logMsg);
    addStep(logMsg, {}, Status.BROKEN);
    return false;
  } catch {
    const logMsg = `ℹ️ clickIfDisplayed - Error while clicking element: "${locatorKey}"`;
    console.log(logMsg);
    addStep(logMsg, {}, Status.BROKEN);
    return false;
  }
}
