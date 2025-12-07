import { When } from '@wdio/cucumber-framework';
import {
  clickByLocator,
  clickIfDisplayed,
} from '../../ui-utils/ui-actions-methods/click_actions';
import { expectElement } from '../../ui-utils/ui-actions-methods/expect_actions';
import { goBack } from '../../ui-utils/app-methods/global_app_methods';
import { expectAuthorizationDialog } from '../../ui-utils/app-methods/global_ui_methods';
import { getValueByLocator } from '../../ui-utils/ui-actions-methods/get_value_actions';

When(
  /^I click "([^"]+)" on (.+) page and verify card details$/,
  async (card_title: string, _page: string) => {
    await clickByLocator(card_title);
    await expectElement('MILICA GRBOVIĆ').toBeVisible();
    await expectElement('5574 **** **** 9931').toBeVisible();
    await expectElement('30.9.2029.').toBeVisible();
    await expectElement('Aktivna').toBeVisible();
  },
);

When(
  /^I Deblokada "([^"]+)" on (.+) page$/,
  async (_main_menu_cards_overview: string, _page: string) => {
    //navigate to card overview
    // await clickByLocatorWithScroll(main_menu_cards_overview, 1, 1000);
    await clickIfDisplayed('card_is_status_active', 1);
    // await clickIfDisplayed('card_is_status_blocked', 1);
    // await clickIfDisplayed('card_is_status_ready_for_user_activation', 1);
    // await clickIfDisplayed('card_is_status_inactive', 1);
    // await clickIfDisplayed('card_is_status_temporarily_blocked', 1);
    //card details
    await clickByLocator('card_show_details');
    await clickByLocator('card_display_sensitive_data');
    //authorization dialog
    await expectAuthorizationDialog();
    await browser.pause(2000);
    await expectElement('5574893100079931').toBeVisible();
    const cardNumber = await getValueByLocator('card_number', 4000);
    console.log('✅ Card Number:', cardNumber);
    const card_type = await getValueByLocator('card_type');
    console.log('✅ Card Type:', card_type);
    const cvc = await getValueByLocator('general_cvc_two');
    console.log('✅ CVC:', cvc);
    const owner = await getValueByLocator('account_detail_info_owner');
    console.log('✅ Card Owner:', owner);
    await expectElement('5574893100079931').toBeVisible();
    await expectElement('Plastična').toBeVisible();
    await expectElement('237').toBeVisible();
    await expectElement('MILICA GRBOVIĆ').toBeVisible();
    await clickIfDisplayed('Skrim');
    await goBack();
  },
);
