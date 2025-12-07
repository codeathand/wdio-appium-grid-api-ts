import { Then, When } from '@wdio/cucumber-framework';
import {
  clickButtonNearIfDisplayed,
  clickByLocator,
  clickByLocatorWithScroll,
} from '../../../ui-utils/ui-actions-methods/click_actions';
import { memory } from '../../../support/memory';
import { expectElement } from '../../../ui-utils/ui-actions-methods/expect_actions';
import { goBack } from '../../../ui-utils/app-methods/global_app_methods';
import { expectAuthorizationDialog } from '../../../ui-utils/app-methods/global_ui_methods';
import { getValueByLocator } from '../../../ui-utils/ui-actions-methods/get_value_actions';

const uiActions: Record<string, () => Promise<void>> = {
  'clicks on the first active card': async () => {
    await clickByLocator('card_is_status_active', 0);
  },

  'clicks on temporarily blocked card': async () => {
    await expectElement(
      'card_is_status_temporarily_blocked',
      'click',
      2000,
    ).toBeVisible();
    await clickByLocator('card_is_status_temporarily_blocked', 1);
  },
};

// -----------------
// STEP DEFINITION
// -----------------
When(
  'I navigate to {string} internal transfer icon on index {string}',
  async (accountType: string, index: string) => {
    await clickByLocatorWithScroll(accountType);
    await expectElement(accountType, 'click', 2000).toBeVisible();
    await clickButtonNearIfDisplayed(accountType, parseInt(index));
    // await clickIfDisplayed('account_transfer_tooltip');
  },
);

Then('the user {string}', async (uiAction: string) => {
  const action = uiActions[uiAction];
  if (action) {
    await action();
  }
});

Then('the user navigates to the Card Overview page', async () => {
  await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
  await clickByLocator('dashboard_bottom_navigation_menu');
  await clickByLocatorWithScroll('main_menu_cards_overview', undefined, 2000);
});

Then(
  'the user opens the card details and displays sensitive data',
  async () => {
    await clickByLocator('card_show_details');
    await clickByLocator('card_display_sensitive_data');
    await expectAuthorizationDialog();
    await expectElement('card_number').toBeVisible();
  },
);

Then('the card number, type, CVC, and owner should be visible', async () => {
  await validateAndStoreCardDetails();
});

async function validateAndStoreCardDetails(): Promise<void> {
  await expectElement('card_number').toExist();
  await expectElement('card_number').toBeVisible();

  await expectElement('account_detail_info_owner').toExist();
  await expectElement('account_detail_info_owner').toBeVisible();

  const cardNumber = await getValueByLocator('card_number');
  const cardOwner = await getValueByLocator('account_detail_info_owner');
  memory.set('ui_card_number', cardNumber);
  memory.set('ui_card_owner', cardOwner);
}

Then('the card details should match the API response', async function () {
  await validateCardDetailsWithAPI();
  await goBack();
  await clickButtonNearIfDisplayed('card_app_bar');
  await clickButtonNearIfDisplayed('card_title');
});

async function validateCardDetailsWithAPI(): Promise<void> {
  const uiCardNumber = memory.get('ui_card_number');
  const uiCardOwner = memory.get('ui_card_owner');
  const apiMaskedCardNumber = memory.get('masked_card_number');
  const apiHolderName = memory.get('holderName');

  const validationErrors: string[] = [];

  validateCardNumber(uiCardNumber, apiMaskedCardNumber, validationErrors);
  validateCardOwner(uiCardOwner, apiHolderName, validationErrors);

  if (validationErrors.length > 0) {
    return;
  }
}

function validateCardNumber(
  uiCardNumber: string,
  apiMaskedCardNumber: string,
  errors: string[],
): void {
  if (uiCardNumber === apiMaskedCardNumber) return;

  const uiStart = uiCardNumber.substring(0, 4);
  const uiEnd = uiCardNumber.substring(uiCardNumber.length - 4);
  const apiStart = apiMaskedCardNumber.substring(0, 4);
  const apiEnd = apiMaskedCardNumber.substring(apiMaskedCardNumber.length - 4);

  if (uiStart !== apiStart || uiEnd !== apiEnd) {
    errors.push(
      `Card Number mismatch - UI: "${uiCardNumber}", API: "${apiMaskedCardNumber}"`,
    );
  }
}

function validateCardOwner(
  uiCardOwner: string,
  apiHolderName: string,
  errors: string[],
): void {
  if (uiCardOwner.trim() !== apiHolderName) {
    errors.push(
      `Card Owner mismatch - UI: "${uiCardOwner}", API: "${apiHolderName}"`,
    );
  }
}
