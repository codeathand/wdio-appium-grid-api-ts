import { When, Then } from '@wdio/cucumber-framework';
import {
  clickByLocator,
  clickByLocatorWithScroll,
  clickIfDisplayed,
} from '../../../../ui-utils/ui-actions-methods/click_actions';
import { typeInFieldByLocator } from '../../../../ui-utils/ui-actions-methods/type_actions';
import { expectElement } from '../../../../ui-utils/ui-actions-methods/expect_actions';
import { extractNumber } from '../../../../support/helper';
import { memory } from '../../../../support/memory';
import { handleIncidents } from '../../../../ui-utils/app-methods/global_app_methods';
import { getValueByLocator } from '../../../../ui-utils/ui-actions-methods/get_value_actions';

When(/^the user opens the term deposit creation screen$/, async () => {
  await expectElement('dashboard_bottom_navigation_menu').toBeVisible();
  await clickByLocator('dashboard_bottom_navigation_menu');
});

When(
  /^the user selects term type "([^"]+)" and value "([^"]+)"$/,
  async (termType: string, termValue: string) => {
    await expectElement(termType).toBeVisible();
    await clickByLocator(termType);

    const index = process.env.TEST_ENV === 't2' ? 1 : 2;
    console.log(
      `Using index ${index} for term value selection based on TEST_ENV=${process.env.TEST_ENV}`,
    );
    await clickByLocator(termValue, index);
    await clickByLocator('general_apply');
  },
);

When(
  /^the user increases the minimum saving amount by "([^"]+)"$/,
  async (increaseStr: string) => {
    const valueText = await getValueByLocator(
      'deposit_sight_minumum_saving_amount',
    );
    const current = extractNumber(valueText);
    const increase = parseFloat(increaseStr.replace(',', '.'));
    const expected = current + increase;
    memory.set('term_expected', expected.toString());

    const newText = valueText.replace(/\s+[A-Z]+$/, '');
    await clickByLocator('general_continue');
    await typeInFieldByLocator(newText, expected.toString(), 1, true);
    await clickIfDisplayed('deposit_term_amount_selection_choose_the_amount');
    await clickByLocator('general_continue');
  },
);

When(
  /^the user creates the term deposit with title "([^"]+)"$/,
  async (nickname: string) => {
    await clickByLocator('general_create');
    await expectElement('deposit_term_account_saving_nickname').toBeVisible();
    await typeInFieldByLocator(
      'deposit_term_account_saving_nickname_placeholder',
      nickname,
    );
    await clickIfDisplayed('keyboard_ios_done');
    await clickByLocatorWithScroll('general_create', undefined, undefined, 2);
    await clickByLocator('general_create');
  },
);

Then(/^the user authorizes with code "([^"]+)"$/, async (code: string) => {
  if (driver.isIOS) {
    await expectElement('authorization_dialog_description_face').toBeVisible();
  } else {
    await expectElement(
      'authorization_dialog_description_generic',
    ).toBeVisible();
  }
  await typeInFieldByLocator('', code, 1, true);
  await clickByLocator('general_confirm');
});

Then(/^the user confirms the new term deposit$/, async () => {
  await clickByLocator('general_done');
  await expectElement('account_current').toBeVisible();
});

When(/^the user closes the term deposit account$/, async () => {
  await (process.env.TEST_ENV === 't2'
    ? clickByLocator('terms_eur')
    : clickByLocatorWithScroll('terms_eur', undefined, 500, 1));

  const handled = await handleIncidents();
  if (handled) {
    await clickByLocator('terms_eur');
  }
  await expectElement(memory.get('account_name')).toBeVisible();
  await clickByLocator('terms_eur');
  await clickByLocator('account_detail_menu_close_account');
  await expectElement(
    'account_detail_info_revolving_usage_and_due_instalments_title',
  ).toBeVisible();
  await clickByLocator('account_detail_menu_close_account');
});

Then(
  /^the user authorizes closing with code "([^"]+)"$/,
  async (code: string) => {
    if (driver.isIOS) {
      await expectElement(
        'authorization_dialog_description_face',
      ).toBeVisible();
    } else {
      await expectElement(
        'authorization_dialog_description_generic',
      ).toBeVisible();
    }
    await typeInFieldByLocator('', code, 1, true);
    await clickByLocator('general_confirm');
    await clickByLocator('OK', undefined, undefined, true);
  },
);
