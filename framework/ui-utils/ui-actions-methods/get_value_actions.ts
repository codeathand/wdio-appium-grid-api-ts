import { resolveLocator } from './locator_strategy';

export async function getVisibleCardNumber(): Promise<string | null> {
  const allElements = await $$('//*'); // all elements in the hierarchy
  for (const el of allElements) {
    try {
      const isDisplayed = await el.isDisplayed();
      if (!isDisplayed) continue;

      const contentDesc = await el
        .getAttribute('content-desc')
        .catch(() => null);
      if (contentDesc && /^\d{4} \*{4} \*{4} \d{4}$/.test(contentDesc)) {
        console.log('✅ Found card number element:', {
          contentDesc,
          elementId: el.elementId,
        });
        return contentDesc;
      }
    } catch {
      // ignore individual element errors
    }
  }
  console.warn('⚠ Could not find card number');
  return null;
}

export async function getValueByLocator(
  locatorKey: string,
  timeout = 100,
): Promise<string> {
  const locator = resolveLocator(locatorKey);
  if (!locator) throw new Error(`Locator not found: ${locatorKey}`);
  await browser.pause(timeout);
  const { english, serbian } = locator;
  let value: string | null = null;

  if (driver.isAndroid) {
    const elements = await $$(
      '//android.view.View[@content-desc and normalize-space(@content-desc)!=""]',
    );

    for (let i = 0; i < (await elements.length); i++) {
      const desc = await elements[i].getAttribute('content-desc');
      let matchedLabel: string | null = null;

      if (desc?.includes(english)) matchedLabel = english;
      else if (desc?.includes(serbian)) matchedLabel = serbian;

      if (matchedLabel) {
        const parts = desc.split(/\s|\n/).filter(Boolean);
        console.log(`     📦 Candidate (same element): ${parts.join(' | ')}`);

        // Look for amount in same element (like 15,50)
        const amountHere = parts.find((p) => /\d+[.,]\d{2}/.test(p));
        if (amountHere && amountHere !== matchedLabel) {
          console.log(
            `     🤖 ANDROID Extracted (same element): ${amountHere}`,
          );
          return amountHere;
        }

        // Value is in the next element
        if (i + 1 < (await elements.length)) {
          const nextDesc = await elements[i + 1].getAttribute('content-desc');
          if (!nextDesc) continue;

          console.log(`     📦 Candidate (next element): ${nextDesc}`);

          const nextParts = nextDesc.split(/\s|\n/).filter(Boolean);
          const amountNext = nextParts.find((p) => /\d+[.,]\d{2}/.test(p));
          if (amountNext) {
            console.log(
              `     🤖 ANDROID Extracted (next element): ${amountNext}`,
            );
            return amountNext;
          }

          // If no amount pattern, return whole text (for card numbers, names, etc.)
          console.log(`     🤖 ANDROID Extracted text: ${nextDesc}`);
          return nextDesc;
        }
      }
    }

    throw new Error(`Value not found for locator: ${locatorKey}`);
  } else {
    // iOS approach
    const engAnchor = english.trim();
    const serAnchor = serbian.trim();

    // 1️⃣ Parent container approach
    const labelSelector = `//XCUIElementTypeOther[contains(@name,"${engAnchor}") or contains(@name,"${serAnchor}")]`;
    const containerXpath = `${labelSelector}/parent::*//*`;
    const allDescendants = await $$(containerXpath);

    for (let i = 0; i < (await allDescendants.length); i++) {
      const el = allDescendants[i];
      const type = await el.getAttribute('type');
      const name = await el.getAttribute('name');

      if (
        type === 'XCUIElementTypeStaticText' &&
        name !== engAnchor &&
        name !== serAnchor
      ) {
        console.log(`   🔍 Found value (parent container): ${name}`);
        value = name;
        return name;
      }
    }

    // 2️⃣ Direct multi-line StaticText approach
    const multiLineSelector = `//XCUIElementTypeStaticText[contains(@name,"${engAnchor}")]`;
    console.log(
      `     🔍 Searching multi-line StaticText with selector: ${multiLineSelector}`,
    );
    const allStaticTexts = await $$(multiLineSelector);

    for (let i = 0; i < (await allStaticTexts.length); i++) {
      const el = allStaticTexts[i];
      const name = await el.getAttribute('name');
      if (name && name !== engAnchor && name !== serAnchor) {
        const match = name.match(/\d+[\d,.]*\s?[A-Z]{2,3}$/);
        if (match) {
          console.log(
            `    🔍 Found value (multi-line StaticText): ${match[0]}`,
          );
          value = match[0];
          return value;
        }
      }
    }

    if (!value) {
      console.warn(
        `ℹ️ Retrieved account value text is empty for label: "${engAnchor}" / "${serAnchor}"`,
      );
    }
  }

  return value ?? '';
}
