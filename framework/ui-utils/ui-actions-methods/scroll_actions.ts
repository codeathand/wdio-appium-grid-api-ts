// import type { ChainablePromiseElement } from 'webdriverio';

export async function scrollRight(driver: WebdriverIO.Browser): Promise<void> {
  if (!driver) throw new Error('Driver is not initialized');

  const size = await driver.getWindowSize();
  const startX = size.width * 0.8;
  const endX = size.width * 0.2;
  const y = size.height * 0.5;

  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: startX, y },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 500, x: endX, y },
        { type: 'pointerUp', button: 0 },
      ],
    },
  ]);

  await driver.releaseActions();
}

export async function scrollIntoView(selector: string, maxScrolls = 5) {
  for (let i = 0; i < maxScrolls; i++) {
    const els = await $$(selector);

    if ((await els.length) > 0 && (await els[0].isDisplayed())) {
      return els[0];
    }

    // 👇 W3C actions instead of touchPerform
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

  throw new Error(`Element ${selector} not found after ${maxScrolls} scrolls`);
}

export async function scrollUp() {
  try {
    const windowSize = await driver.getWindowRect();
    const startX = windowSize.width / 2;
    const startY = windowSize.height * 0.8;
    const endY = windowSize.height * 0.3;

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 200 },
          { type: 'pointerMove', duration: 500, x: startX, y: endY },
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
          '    ⚠️ Ignoring harmless /actions DELETE protocol error (scrollUp)',
        );
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error(`❌ scrollUp failed: ${(err as Error).message}`);
  }
}
