// support/locators.ts
import * as Locators from '../../locators/index.pom';
import { expectElement } from '../../ui-utils/ui-actions-methods/expect_actions';
import { memory } from '../../support/memory';

export function resolveLocator(name: string) {
  // Strip curly braces if passed like {{name}}
  const key = name.replace(/[{}]/g, '');

  const locator = (Locators as any)[key];
  if (!locator) {
    throw new Error(`❌ Locator "${key}" not found in locators index`);
  }

  return locator;
}

export function resolveLocatorText(
  locatorKey: string,
  dynamic = false,
): { english: string; serbian: string } {
  if (dynamic) {
    return { english: locatorKey, serbian: locatorKey };
  }
  try {
    const locator = resolveLocator(locatorKey);
    return { english: locator.english, serbian: locator.serbian };
  } catch {
    return { english: locatorKey, serbian: locatorKey };
  }
}

// export function buildClickByLocator(
//   english: string,
//   serbian: string,
//   index?: number,
// ): { android: string; ios: string[] } {
//   const androidBase =
//     `//android.widget.Button[@content-desc="${serbian}"] | ` +
//     `//android.widget.Button[@content-desc="${english}"] | ` +
//     `//android.view.View[contains(@content-desc,"${english}")] |` +
//     `//android.view.View[contains(@content-desc,"${serbian}")] |` +
//     `//android.widget.Button[contains(@content-desc, "${english}") or contains(@content-desc, "${serbian}") or contains(@text, "${english}") or contains(@text, "${serbian}")] | ` +
//     `//android.view.View[contains(@content-desc, "${english}") or contains(@content-desc, "${serbian}") or contains(@text, "${english}") or contains(@text, "${serbian}")] | ` +
//     `//android.view.View[@hint="${english}" or @hint="${serbian}" or contains(@hint,"${english}") or contains(@hint,"${serbian}")] | ` +
//     `//android.view.View[@content-desc="null" or @hint="${serbian}"] | ` +
//     `//android.view.View[@content-desc="null" or @hint="${english}"] | ` +
//     `//android.widget.EditText[@hint="${english}" or @hint="${serbian}" or contains(@hint,"${english}") or contains(@hint,"${serbian}")] `;
//   const android = index ? `(${androidBase})[${index}]` : androidBase;

//   const englishNormalized = english.replace(/\n/g, ' ');
//   const serbianNormalized = serbian.replace(/\n/g, ' ');

//   const iosByName =
//     `//XCUIElementTypeButton[contains(@name,"${englishNormalized}") or contains(@name,"${serbianNormalized}")] | ` +
//     `//XCUIElementTypeStaticText[contains(@name,"${englishNormalized}") or contains(@name,"${serbianNormalized}")] | ` +
//     `//XCUIElementTypeOther[contains(@name,"${englishNormalized}") or contains(@name,"${serbianNormalized}")]`;

//   const iosByLabel =
//     `//XCUIElementTypeButton[contains(@label,"${englishNormalized}") or contains(@label,"${serbianNormalized}")] | ` +
//     `//XCUIElementTypeStaticText[contains(@label,"${englishNormalized}") or contains(@label,"${serbianNormalized}")] | ` +
//     `//XCUIElementTypeOther[contains(@label,"${englishNormalized}") or contains(@label,"${serbianNormalized}")]`;

//   const iosByValue =
//     `//XCUIElementTypeButton[contains(@value,"${englishNormalized}") or contains(@value,"${serbianNormalized}")] | ` +
//     `//XCUIElementTypeStaticText[contains(@value,"${englishNormalized}") or contains(@value,"${serbianNormalized}")] | ` +
//     `//XCUIElementTypeOther[contains(@value,"${englishNormalized}") or contains(@value,"${serbianNormalized}")]`;

//   const ios = [iosByValue, iosByName, iosByLabel].map((x) =>
//     index ? `(${x})[${index}]` : x,
//   );

//   return { android, ios };
// }

export function buildClickByLocator(
  english: string,
  serbian: string,
  index?: number,
): { android: string[]; ios: string[] } {
  const androidBase = [
    `//android.widget.Button[@content-desc="${english}" or @content-desc="${serbian}"]`,
    `//android.widget.Button[contains(@content-desc, "${english}") or contains(@content-desc, "${serbian}")]`,
    `//android.widget.Button[contains(@text, "${english}") or contains(@text, "${serbian}")]`,
    `//android.view.View[contains(@content-desc, "${english}") or contains(@content-desc, "${serbian}")]`,
    `//android.view.View[contains(@text, "${english}") or contains(@text, "${serbian}")]`,
    `//android.view.View[@hint="${english}" or @hint="${serbian}"]`,
    `//android.view.View[contains(@hint,"${english}") or contains(@hint,"${serbian}")]`,
    `//android.view.View[@content-desc="null" or @hint="${english}" or @hint="${serbian}"]`,
    `//android.widget.EditText[contains(@hint,"${english}") or contains(@hint,"${serbian}")]`,
    `//android.widget.EditText[@hint="${english}" or @hint="${serbian}"]`,
    `//android.widget.EditText[contains(@text,"${english}") or contains(text,"${serbian}")]`,
    `//android.widget.EditText[@text="${english}" or @text="${serbian}"]`,
    `//android.widget.TextView[@text="${english}" or @text="${serbian}"]`,
  ];

  const android = androidBase.map((sel) =>
    index ? `(${sel})[${index}]` : sel,
  );

  const englishNormalized = english.replace(/\n/g, ' ');
  const serbianNormalized = serbian.replace(/\n/g, ' ');

  const iosBase = [
    `//XCUIElementTypeButton[contains(@name,"${englishNormalized}") or contains(@name,"${serbianNormalized}")]`,
    `//XCUIElementTypeStaticText[contains(@name,"${englishNormalized}") or contains(@name,"${serbianNormalized}")]`,
    `//XCUIElementTypeOther[contains(@name,"${englishNormalized}") or contains(@name,"${serbianNormalized}")]`,
    `//XCUIElementTypeButton[contains(@label,"${englishNormalized}") or contains(@label,"${serbianNormalized}")]`,
    `//XCUIElementTypeStaticText[contains(@label,"${englishNormalized}") or contains(@label,"${serbianNormalized}")]`,
    `//XCUIElementTypeOther[contains(@label,"${englishNormalized}") or contains(@label,"${serbianNormalized}")]`,
    `//XCUIElementTypeButton[contains(@value,"${englishNormalized}") or contains(@value,"${serbianNormalized}")]`,
    `//XCUIElementTypeStaticText[contains(@value,"${englishNormalized}") or contains(@value,"${serbianNormalized}")]`,
    `//XCUIElementTypeOther[contains(@value,"${englishNormalized}") or contains(@value,"${serbianNormalized}")]`,
  ];

  // For now, return single locator; you can extend with variations if needed
  const ios = iosBase.map((sel) => (index ? `(${sel})[${index}]` : sel));

  return { android, ios };
}

// export function buildClickButtonNear(
//   english: string,
//   serbian: string,
//   index?: number,
// ): { android: string; ios: string } {
//   const androidBase =
//     `//android.widget.Button[@clickable='true' and @enabled='true']` +
//     `[preceding-sibling::android.view.View[@content-desc='${english}' or @content-desc='${serbian}'] ` +
//     `or following-sibling::android.view.View[@content-desc='${english}' or @content-desc='${serbian}']]`;
//   const android = index ? `(${androidBase})[${index}]` : androidBase;

//   const englishNormalized = english.replace(/\n/g, ' ').toUpperCase();
//   const serbianNormalized = serbian.replace(/\n/g, ' ').toUpperCase();

//   const iosBase =
//     `//XCUIElementTypeOther[` +
//     `translate(@name,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')="${englishNormalized}" or ` +
//     `translate(@name,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')="${serbianNormalized}"]` +
//     `/following-sibling::XCUIElementTypeButton`;
//   const ios = index ? `(${iosBase})[${index}]` : iosBase;

//   return { android, ios };
// }

// export const systemPopupSelectors = {
//   android: [
//     `//android.widget.Button[@resource-id="com.android.permissioncontroller:id/permission_allow_foreground_only_button"]`,
//     `//android.widget.Button[@text='Allow' or @text='OK' or contains(@text,'Allow')]`,
//   ],
//   ios: [
//     `//XCUIElementTypeButton[@name='Allow' or @name='OK' or contains(@name,'Allow')]`,
//   ],
// };

export function buildClickButtonNear(
  english: string,
  serbian: string,
  index?: number,
): { android: string[]; ios: string[] } {
  const androidBase = [
    `//android.widget.Button[@clickable='true' and @enabled='true'][preceding-sibling::android.view.View[@content-desc='${english}' or @content-desc='${serbian}']]`,
    `//android.widget.Button[@clickable='true' and @enabled='true'][following-sibling::android.view.View[@content-desc='${english}' or @content-desc='${serbian}']]`,
    `//android.view.View[@content-desc="${english}" or @content-desc="${serbian}"]/following-sibling::android.widget.Button`,
    `//android.view.View[@content-desc="${english}" or @content-desc="${serbian}"]/preceding-sibling::android.widget.Button`,
    `//android.view.View[@content-desc="${english}" or @content-desc="${serbian}"]/android.widget.Button`,
    `//android.view.View[contains(@content-desc,"${english}") or contains(@content-desc,"${serbian}")]/android.widget.Button`,
    `//android.view.View[@content-desc="${english}" or @content-desc="${serbian}"]/android.widget.EditText`,
  ];

  const android = androidBase.map((sel) =>
    index ? `(${sel})[${index}]` : sel,
  );

  const englishNormalized = english.replace(/\n/g, ' ');
  const serbianNormalized = serbian.replace(/\n/g, ' ');

  const iosBase = [
    `//XCUIElementTypeButton[@clickable='true' and @enabled='true'][preceding-sibling::XCUIElementTypeStaticText[@name='${englishNormalized}' or @name='${serbianNormalized}']]`,
    `//XCUIElementTypeButton[@clickable='true' and @enabled='true'][following-sibling::XCUIElementTypeStaticText[@name='$englishNormalizedh}' or @name='${serbianNormalized}']]`,
    `//XCUIElementTypeStaticText[@name="${englishNormalized}" or @name="${serbianNormalized}"]/following-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeStaticText[@name="${englishNormalized}" or @name="${serbianNormalized}"]/preceding-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeOther[@name="${englishNormalized}" or @name="${serbianNormalized}"]/following-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeOther[@name="${englishNormalized}" or @name="${serbianNormalized}"]/preceding-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeButton[@clickable='true' and @enabled='true'][preceding-sibling::XCUIElementTypeOther[@name='${englishNormalized}' or @name='${serbianNormalized}']]`,
    `//XCUIElementTypeButton[@clickable='true' and @enabled='true'][following-sibling::XCUIElementTypeOther[@name='${englishNormalized}' or @name='${serbianNormalized}']]`,
    `//XCUIElementTypeOther[@name="${englishNormalized}" or @name="${serbianNormalized}"]/following-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeOther[.//XCUIElementTypeStaticText[translate(@name, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')="${englishNormalized}" or translate(@name, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')="${serbianNormalized}"]]//XCUIElementTypeButton`,
    `//XCUIElementTypeOther[contains(@name,"${english}") or contains(@name,"${serbian}")]/following-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeStaticText[contains(@name,"${english}") or contains(@name,"${serbian}")]/following-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeOther[contains(@name,"${english}") or contains(@name,"${serbian}")]/preceding-sibling::XCUIElementTypeButton`,
    `//XCUIElementTypeStaticText[contains(@name,"${english}") or contains(@name,"${serbian}")]/preceding-sibling::XCUIElementTypeButton`,
  ];

  // For now, return single locator; you can extend with variations if needed
  const ios = iosBase.map((sel) => (index ? `(${sel})[${index}]` : sel));

  return { android, ios };
}

export const systemPopupSelectors = {
  android: [
    `//android.widget.Button[@resource-id="com.android.permissioncontroller:id/permission_allow_foreground_only_button"]`,
    `//android.widget.Button[@text='Allow' or @text='OK' or contains(@text,'Allow')]`,
  ],
  ios: [
    `//XCUIElementTypeButton[@name='Allow' or @name='OK' or contains(@name,'Allow')]`,
  ],
};

export function buildTypeByLocator(
  english: string,
  serbian: string,
  index?: number,
): { android: string[]; ios: string[] } {
  // Escape for XPath
  function xpathLiteral(s: string): string {
    if (s.indexOf('"') === -1) return `"${s}"`;
    if (s.indexOf("'") === -1) return `'${s}'`;
    const parts = s.split('"');
    const concatParts: string[] = [];
    parts.forEach((part, i) => {
      concatParts.push(`"${part}"`);
      if (i !== parts.length - 1) concatParts.push('"');
    });
    return `concat(${concatParts.join(',')})`;
  }

  const englishNorm = english.replace(/\n/g, ' ');
  const serbianNorm = serbian.replace(/\n/g, ' ');
  const engLit = xpathLiteral(englishNorm);
  const serLit = xpathLiteral(serbianNorm);

  // Android priorities
  const androidBase = [
    `//android.widget.EditText[@hint=${engLit} or @hint=${serLit}]`,
    `//android.widget.EditText[contains(@hint,${engLit}) or contains(@hint,${serLit})]`,
    `//android.widget.EditText[@text=${engLit} or @text=${serLit}]`,
    `//android.widget.EditText[contains(@text,${engLit}) or contains(@text,${serLit})]`,
    `//android.widget.EditText[@content-desc=${engLit} or @content-desc=${serLit}]`,
    `//android.view.View[@content-desc=${serLit} or @content-desc=${engLit}]//android.widget.EditText`,
    `//android.widget.ScrollView//android.widget.EditText`,
    `//android.widget.EditText[(@hint="null" and @content-desc="null")]`,
  ];

  const android = androidBase.map((sel) =>
    index ? `(${sel})[${index}]` : sel,
  );

  // iOS priorities

  const iosBase = [
    `//XCUIElementTypeSecureTextField`,
    `//XCUIElementTypeTextField[@name=${serLit} or @name=${engLit}] | //XCUIElementTypeSecureTextField[@name=${serLit} or @name=${engLit}]`,
    `//XCUIElementTypeTextField[@value=${serLit} or @value=${engLit}] | //XCUIElementTypeSecureTextField[@value=${serLit} or @value=${engLit}]`,
    `//XCUIElementTypeTextField[contains(@placeholder,${engLit}) or contains(@placeholder,${serLit})] | //XCUIElementTypeSecureTextField[contains(@placeholder,${engLit}) or contains(@placeholder,${serLit})]`,
  ];

  // const iosBase = [
  // `//XCUIElementTypeTextField[@name=${serLit} or @name=${engLit}] | //XCUIElementTypeSecureTextField[@name=${serLit} or @name=${engLit}]`,
  // `//XCUIElementTypeTextField[@value=${serLit} or @value=${engLit}] | //XCUIElementTypeSecureTextField[@value=${serLit} or @value=${engLit}]`,
  // `//XCUIElementTypeTextField[contains(@placeholder,${engLit}) or contains(@placeholder,${serLit})] | //XCUIElementTypeSecureTextField[contains(@placeholder,${engLit}) or contains(@placeholder,${serLit})]`,
  // ];

  const ios = iosBase.map((sel) => (index ? `(${sel})[${index}]` : sel));

  return { android, ios };
}

export async function buildPasteValueByLocator(): Promise<void> {
  const isAndroid = browser.isAndroid;
  const selector = isAndroid
    ? '//android.widget.EditText'
    : '//XCUIElementTypeTextField';
  const element = await $(selector);

  const name = isAndroid ? await element.getText() : await element.getValue();
  memory.set('name', name);

  await element.clearValue();
  await expectElement(element).toBeClickable();

  const gestureCommand = isAndroid
    ? 'mobile: longClickGesture'
    : 'mobile: touchAndHold';
  const duration = isAndroid ? 2000 : 2.0; // Android uses ms, iOS uses seconds

  await browser.execute(gestureCommand, {
    elementId: element.elementId,
    duration,
  });
}
