import fs from 'fs';
import path from 'path';

export async function dumpAllVisibleElementsConsole(): Promise<
  Array<Record<string, any>>
> {
  const elementsData: Array<Record<string, any>> = [];
  const rootSelector = driver.isAndroid ? '//*' : '//XCUIElementTypeAny';
  const allElements = await $$(rootSelector);

  for (const el of allElements) {
    try {
      const isDisplayed = await el.isDisplayed();
      if (!isDisplayed) continue;

      let elData: Record<string, any>;

      if (driver.isAndroid) {
        elData = {
          text: await el.getText().catch(() => null),
          contentDesc: await el.getAttribute('content-desc').catch(() => null),
          resourceId: await el.getAttribute('resource-id').catch(() => null),
          className: await el.getAttribute('class').catch(() => null),
          clickable: await el.getAttribute('clickable').catch(() => null),
          enabled: await el.getAttribute('enabled').catch(() => null),
          bounds: await el.getAttribute('bounds').catch(() => null),
          elementId: el.elementId,
        };
      } else {
        elData = {
          text: await el.getText().catch(() => null),
          name: await el.getAttribute('name').catch(() => null),
          label: await el.getAttribute('label').catch(() => null),
          value: await el.getAttribute('value').catch(() => null),
          type: await el.getAttribute('type').catch(() => null),
          enabled: await el.getAttribute('enabled').catch(() => null),
          elementId: el.elementId,
        };
      }

      elementsData.push(elData);
    } catch (err) {
      console.warn('Failed to read element:', err);
    }
  }

  console.log('[INFO] All visible elements on screen:', elementsData);
  return elementsData;
}

export async function dumpVisibleElementsFile(): Promise<void> {
  const lines: string[] = [];
  await browser.pause(5000); // wait for UI to settle

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (browser.isAndroid) {
    const allInputs = await $$(
      '//android.widget.EditText | //android.widget.Button | //android.widget.TextView | //android.view.View',
    );

    lines.push(
      `********* Found ${allInputs.length} Android elements on screen: *********`,
    );

    for (let i = 0; i < (await allInputs.length); i++) {
      const el = allInputs[i];
      try {
        const clazz = await el.getAttribute('class');
        const text = await el.getAttribute('text');
        const hint = await el.getAttribute('hint');
        const desc = await el.getAttribute('content-desc');
        const id = await el.getAttribute('resource-id');
        const scrollable = await el.getAttribute('scrollable');
        const clickable = await el.getAttribute('clickable');
        const checkable = await el.getAttribute('checkable');
        const bounds = await el.getAttribute('bounds');

        let suggestedXpath = '';
        if (text || hint || desc || id) {
          const conditions: string[] = [];
          if (text) conditions.push(`@text="${text}"`);
          if (desc) conditions.push(`@content-desc="${desc}"`);
          if (hint && hint !== 'null') conditions.push(`@hint="${hint}"`);
          if (id) conditions.push(`@resource-id="${id}"`);
          suggestedXpath = `//${clazz}[${conditions.join(' or ')}]`;
        } else if (clickable === 'true') {
          suggestedXpath = `(//${clazz}[@clickable="true"])[${i + 1}]`;
        }

        lines.push(
          `[${i + 1}] class=${clazz}, text="${text}", hint="${hint}", desc="${desc}", id="${id}", scrollable=${scrollable}, clickable=${clickable}, checkable=${checkable}, bounds=${bounds}\n  👉 Suggested locator: ${suggestedXpath}`,
        );
      } catch {
        lines.push(`[${i + 1}] (no attributes available)`);
      }
    }
  } else {
    const allInputs = await $$(
      '//XCUIElementTypeTextField | //XCUIElementTypeSecureTextField | //XCUIElementTypeButton | //XCUIElementTypeStaticText',
    );

    lines.push(
      `********* Found ${allInputs.length} iOS elements on screen: *********`,
    );

    for (let i = 0; i < (await allInputs.length); i++) {
      const el = allInputs[i];
      try {
        const type = await el.getTagName();
        const name = await el.getAttribute('name');
        const label = await el.getAttribute('label');
        const value = await el.getAttribute('value');
        const enabled = await el.getAttribute('enabled');
        const visible = await el.getAttribute('visible');
        let hittable = '';
        try {
          hittable = await el.getAttribute('wdHittable');
        } catch {
          hittable = '';
        }
        const rect = await el.getAttribute('rect');

        let suggestedXpath = '';
        if (name || label || value) {
          const conditions: string[] = [];
          if (name) conditions.push(`@name="${name}"`);
          if (label) conditions.push(`@label="${label}"`);
          if (value) conditions.push(`@value="${value}"`);
          suggestedXpath = `//${type}[${conditions.join(' or ')}]`;
        } else if (enabled === 'true' && visible === 'true') {
          suggestedXpath = `(//${type}[@enabled="true" and @visible="true"])[${i + 1}]`;
        }

        lines.push(
          `[${i + 1}] type=${type}, name="${name}", label="${label}", value="${value}", enabled=${enabled}, visible=${visible}, hittable=${hittable}, rect=${JSON.stringify(rect)}\n  👉 Suggested locator: ${suggestedXpath}`,
        );
      } catch {
        lines.push(`[${i + 1}] (no attributes available)`);
      }
    }
  }

  const artifactsDir = path.resolve('artifacts');
  if (!fs.existsSync(artifactsDir))
    fs.mkdirSync(artifactsDir, { recursive: true });

  const outFile = path.join(
    artifactsDir,
    `dump-elements-${(await browser.isAndroid) ? 'android' : 'ios'}-${timestamp}.txt`,
  );

  fs.writeFileSync(outFile, lines.join('\n'), 'utf-8');
  console.log(`✅ Dumped ${lines.length} lines to ${outFile}`);
}
