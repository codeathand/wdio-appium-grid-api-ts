import { expect as pwExpect } from '@playwright/test';
import {
  buildClickByLocator,
  buildTypeByLocator,
  resolveLocatorText,
} from './locator_strategy';
import type { ChainablePromiseElement } from 'webdriverio';

const DEFAULT_TIMEOUT = 12000;
const DEFAULT_INTERVAL = 200;

class WdioElementExpect {
  private el?: ChainablePromiseElement;
  private timeout: number;
  private locatorKey?: string;
  private locatorType: 'click' | 'type';
  private index?: number;

  constructor(
    elOrKey: ChainablePromiseElement | string,
    timeout = DEFAULT_TIMEOUT,
    locatorType: 'click' | 'type' = 'click',
    index?: number,
  ) {
    this.timeout = timeout;
    this.locatorType = locatorType;
    this.index = index;

    if (typeof elOrKey === 'string') {
      this.locatorKey = elOrKey;
    } else {
      this.el = elOrKey;
    }
  }

  /** Always resolve the element fresh (helps with slow apps) */
  private async getElement(): Promise<WebdriverIO.Element> {
    if (this.el) {
      return this.el as unknown as WebdriverIO.Element;
    }

    if (!this.locatorKey) {
      throw new Error('No locator key or element provided');
    }

    const { english, serbian } = resolveLocatorText(this.locatorKey);

    let locators: string[] = [];
    if (this.locatorType === 'click') {
      const { android, ios } = buildClickByLocator(
        english,
        serbian,
        this.index,
      );
      locators = driver.isAndroid ? [android].flat() : ios.flat();
    } else {
      const { android, ios } = buildTypeByLocator(english, serbian, this.index);
      locators = driver.isAndroid ? android.flat() : ios.flat();
    }

    return await browser.waitUntil(
      async () => {
        for (const loc of locators) {
          const candidate = await $(loc);
          if (await candidate.isExisting()) {
            return candidate;
          }
        }
        return undefined as any;
      },
      {
        interval: DEFAULT_INTERVAL,
        timeout: DEFAULT_TIMEOUT,
        timeoutMsg: `Element not found for key "${this.locatorKey}"`,
      },
    );
  }

  private async performWithLog(
    fn: () => Promise<void>,
    successMsg: string,
    failMsg: string,
  ) {
    try {
      await fn();
      console.log(successMsg);
    } catch (err) {
      console.log(failMsg, err);
      throw err;
    }
  }
  async toExist() {
    const { english, serbian } = this.locatorKey
      ? resolveLocatorText(this.locatorKey)
      : { english: '', serbian: '' };

    const successMsg = `    🟢 toExist - Element "${english}" / "${serbian}" exists`;
    const failMsg = `   🔴 toExist - Element "${english}" / "${serbian}" does not exist`;

    await this.performWithLog(
      async () => {
        await browser.waitUntil(
          async () => {
            try {
              const el = await this.getElement();
              const exists = await el.isExisting();
              pwExpect(exists).toBeTruthy();
              return true;
            } catch {
              return false; // element not found yet, retry
            }
          },
          {
            interval: DEFAULT_INTERVAL,
            timeout: this.timeout,
            timeoutMsg: `Element "${english}" / "${serbian}" did not exist after ${this.timeout}ms`,
          },
        );
      },
      successMsg,
      failMsg,
    );
  }

  async toBeClickable() {
    const { english, serbian } = this.locatorKey
      ? resolveLocatorText(this.locatorKey)
      : { english: '', serbian: '' };

    const successMsg = `    🟢 toBeClickable - Element "${english}" / "${serbian}" is clickable`;
    const failMsg = `    🔴 toBeClickable - Element "${english}" / "${serbian}" not clickable`;

    await this.performWithLog(
      async () => {
        let el = await this.getElement();
        let retryCount = 0;

        await browser.waitUntil(
          async () => {
            retryCount++;

            try {
              const exist = await el.isExisting();
              const displayed = await el.isDisplayed();
              const enabled = await el.isEnabled();

              let clickable = exist && displayed && enabled;

              if (driver.isAndroid) {
                const clickableAttr = await el.getAttribute('clickable');
                // console.log(`Android clickable attribute: ${clickableAttr}`);
                clickable = clickable && clickableAttr === 'true';
              }

              // console.log(`toBeClickable check [${retryCount}]: exist=${exist}, displayed=${displayed}, enabled=${enabled}, clickable=${clickable}`);
              pwExpect(clickable).toBeTruthy();
              return clickable;
            } catch {
              el = await this.getElement();
              console.log(`    ⚠️toBeClickable, retrying: ${retryCount}`);
              return false; // retry
            }
          },
          {
            interval: DEFAULT_INTERVAL,
            timeout: 20000,
          },
        );
      },
      successMsg,
      failMsg,
    );
  }

  async toBeVisible() {
    console.log('locator key', this.locatorKey);
    const { english, serbian } = this.locatorKey
      ? resolveLocatorText(this.locatorKey)
      : { english: '', serbian: '' };

    const successMsg = `    🟢 toBeVisible - Element "${english}" / "${serbian}" is visible`;
    const failMsg = `   🔴 toBeVisible - Element "${english}" / "${serbian}" not visible`;

    await this.performWithLog(
      async () => {
        const el = await this.getElement();
        console.log('gwr wlwmwnt', el);
        await browser.waitUntil(
          async () => {
            try {
              const displayed = await el.isDisplayed();
              pwExpect(displayed).toBeTruthy();
              return true;
            } catch {
              return false;
            }
          },
          { interval: DEFAULT_INTERVAL, timeout: DEFAULT_TIMEOUT },
        );
      },
      successMsg,
      failMsg,
    );
  }

  async toHaveText(expected: string) {
    const el = await this.getElement();
    await this.performWithLog(
      async () => {
        const text = await el.getText();
        pwExpect(text).toContain(expected);
      },
      `    🟢 toHaveText - Found text "${expected}"`,
      `    🔴 toHaveText - Missing text "${expected}"`,
    );
  }
  async toHaveValue(expected: string) {
    const el = await this.getElement();
    await this.performWithLog(
      async () => {
        let actual: string;

        if (driver.isAndroid) {
          // On Android, use getText() for entered/visible value
          actual = await el.getText();
        } else {
          // On iOS, getValue() is the right call
          actual = await el.getValue();
        }

        pwExpect(actual).toBe(expected);
      },
      `    🟢 toHaveValue - Value "${expected}" matched`,
      `    🔴 toHaveValue - Value "${expected}" mismatch`,
    );
  }
}

// Global expect wrapper
export function expectElement(
  elOrKey: ChainablePromiseElement | string,
  locatorType: 'click' | 'type' = 'click',
  timeout?: number,
  index?: number,
) {
  return new WdioElementExpect(elOrKey, timeout, locatorType, index);
}
