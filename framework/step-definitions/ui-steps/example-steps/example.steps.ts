import { When } from '@wdio/cucumber-framework';
import { clickByLocator } from '../../../ui-utils/ui-actions-methods/click_actions';
import { expectElement } from '../../../ui-utils/ui-actions-methods/expect_actions';

When('the user open app', async () => {
  // await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
  // await clickByLocator('dashboard_bottom_navigation_menu');
  // await clickByLocatorWithScroll('main_menu_settings', 1, 1000, 5, 1000);
  // await expectElement('settings_change_pin').toBeVisible();
  // await clickByLocator('settings_change_pin');
  console.log('===== RADIIIIIIII!!!!!!!!!!!!!!! =====');
  const source = await driver.getPageSource();
  console.log(source); // or save to file
  await expectElement('view_wallet').toBeVisible();
});

When('the user open app again', async () => {
  // await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
  // await clickByLocator('dashboard_bottom_navigation_menu');
  // await clickByLocatorWithScroll('main_menu_settings', 1, 1000, 5, 1000);
  // await expectElement('settings_change_pin').toBeVisible();
  // await clickByLocator('settings_change_pin');
  console.log('===== OPET RADIIIIIIII!!!!!!!!!!!!!!! =====');
  const source = await driver.getPageSource();
  console.log(source); // or save to file
  await expectElement('view_wallet').toBeVisible();
});
