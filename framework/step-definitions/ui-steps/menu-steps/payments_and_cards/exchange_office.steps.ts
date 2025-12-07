import { When, Then } from '@wdio/cucumber-framework';
import {
  clickButtonNearIfDisplayed,
  clickByLocator,
  clickByLocatorWithScroll,
  clickIfDisplayed,
} from '../../../../ui-utils/ui-actions-methods/click_actions';
import { typeAmountField } from '../../../../ui-utils/ui-actions-methods/type_actions';
import { memory } from '../../../../support/memory';
import { extractNumber } from '../../../../support/helper';
import { expectElement } from '../../../../ui-utils/ui-actions-methods/expect_actions';
import { expectAuthorizationDialog } from '../../../../ui-utils/app-methods/global_ui_methods';
import { getValueByLocator } from '../../../../ui-utils/ui-actions-methods/get_value_actions';

When(
  'I store the exchange account value and calculate the expected increase of {string}',
  async (increaseStr: string) => {
    await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
    const valueText = await getValueByLocator('exchange_account_123');
    const current = extractNumber(valueText);
    const increase = parseFloat(increaseStr.replace(',', '.'));
    const expected = current + increase;
    memory.set('exchange_expected', expected.toString());
  },
);

When(
  /^I navigate to the exchange office from the (.+) page$/,
  async (_page: string) => {
    await clickByLocator('dashboard_bottom_navigation_menu');
    await clickByLocatorWithScroll(
      'main_menu_exchange_office',
      undefined,
      2000,
      2,
    );
    await clickByLocator('currency_exchange_exchange_currency');
    await clickByLocator('payment_choose_account');
  },
);

When('I choose account {string}', async (accountNumber: string) => {
  await clickByLocator(accountNumber, undefined, 1000, true);
  if (process.env.PLATFORM === 'iOS') {
    await clickByLocator(accountNumber, undefined, 1000, true); // iOS-specific double tap
  }
});

When('I enter exchange amount {string}', async (amount: string) => {
  await typeAmountField(amount, 1000, false);
  await clickIfDisplayed('standing_order_detail_label_amount');
});

When(/^I confirm the exchange$/, async () => {
  await clickByLocator('general_continue');
  await clickByLocator('general_convert');
  //authorization dialog
  await expectAuthorizationDialog();
  await clickIfDisplayed('rate_app_dialog_letter');
  await clickByLocator('general_done');

  // cleanup navigation for next steps
  //   await clickIfDisplayed('general_back');
  await clickButtonNearIfDisplayed('currency_exchange_title');
});

Then(/^the exchange should be completed successfully$/, async () => {
  await clickByLocator('dashboard_app_bar_smart_review');
  const expected = parseFloat(memory.get('exchange_expected'));
  await expectElement(expected.toString().replace('.', ',')).toBeVisible();
});
