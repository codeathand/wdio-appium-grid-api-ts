import { buildClickByLocator, resolveLocatorText } from './locator_strategy';
import { addStep } from '@wdio/allure-reporter';
import { Status } from 'allure-js-commons';

export async function clickOnCopyIcon(
  locatorKey: string,
  index?: number,
  timeout = 2000,
  dynamic = false,
): Promise<boolean> {
  const { english, serbian } = resolveLocatorText(locatorKey, dynamic);
  const { android, ios } = buildClickByLocator(english, serbian, index);

  await browser.pause(timeout);

  let found = false;

  try {
    if (browser.isAndroid) {
      for (const xpath of android) {
        const candidates = await $$(xpath);
        console.log(
          `       🔍 Android locator tried: ${xpath} → found ${candidates.length} element(s)`,
        );

        if ((await candidates.length) > 0) {
          const el = candidates[0];
          const location = await el.getLocation();
          const size = await el.getSize();
          console.log(`       🎯 Using Android XPath: ${xpath}`);

          const startX = location.x;
          const startY = location.y;
          const elementWidth = size.width;
          const elementHeight = size.height;

          const clickX = startX + elementWidth - 90;
          const clickY = startY + elementHeight / 2;

          await browser.performActions([
            {
              type: 'pointer',
              id: 'finger1',
              parameters: { pointerType: 'touch' },
              actions: [
                { type: 'pointerMove', duration: 0, x: clickX, y: clickY },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 100 },
                { type: 'pointerUp', button: 0 },
              ],
            },
          ]);

          await browser.releaseActions();

          found = true;

          const logMsg = `✅ clickOnCopyIcon - Clicked copy icon (index ${index})`;
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
          const location = await el.getLocation();
          const size = await el.getSize();
          console.log(`       🎯 Using iOS XPath: ${xpath}`);

          const { x: startX, y: startY } = location;
          const { width: elementWidth, height: elementHeight } = size;

          // Calculate the click coordinates
          const clickX = startX + elementWidth - 30;
          const clickY = startY + elementHeight / 2;

          // Perform the click using W3C touch actions
          await browser.performActions([
            {
              type: 'pointer',
              id: 'finger1',
              parameters: { pointerType: 'touch' },
              actions: [
                { type: 'pointerMove', duration: 0, x: clickX, y: clickY },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 },
              ],
            },
          ]);

          await browser.releaseActions();

          found = true;

          const logMsg = `✅ clickOnCopyIcon - Clicked copy icon (index ${index})`;
          console.log(logMsg);
          addStep(logMsg, {}, Status.PASSED);
          return true;
        }
      }
    }

    if (!found) {
      const errMsg = `❌ clickOnCopyIcon - Element "${english}" / "${serbian}" not found`;
      console.warn(errMsg);
      addStep(errMsg, {}, Status.FAILED);
    }
  } catch {
    const logMsg = `ℹ️ clickOnCopyIcon - Error while clicking element: "${locatorKey}"`;
    console.log(logMsg);
    addStep(logMsg, {}, Status.BROKEN);
    return false;
  }

  return false;
}
