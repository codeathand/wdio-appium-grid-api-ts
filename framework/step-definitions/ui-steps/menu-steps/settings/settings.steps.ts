import { Then, When } from '@wdio/cucumber-framework';
import {
  clickByLocator,
  clickByLocatorWithScroll,
} from '../../../../ui-utils/ui-actions-methods/click_actions';
import { expectElement } from '../../../../ui-utils/ui-actions-methods/expect_actions';
import { executeActivationProcess } from '../../../../ui-utils/app-methods/global_ui_methods';

When('the user navigates to change PIN settings', async () => {
  await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
  await clickByLocator('dashboard_bottom_navigation_menu');
  await clickByLocatorWithScroll('main_menu_settings', 1, 1000, 5, 1000);
  await expectElement('settings_change_pin').toBeVisible();
  await clickByLocator('settings_change_pin');
});

When('the user completes activation process', async function () {
  await executeActivationProcess(this);
});

Then('the user completes PIN change', async function () {
  await clickByLocator('tutorial_ready_button');
  await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
});
