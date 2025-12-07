import { Given, When, Then } from '@wdio/cucumber-framework';
import {
  clickByLocator,
  clickIfDisplayed,
} from '../../../ui-utils/ui-actions-methods/click_actions';
import {
  typeAmountField,
  typeInFieldByLocator,
} from '../../../ui-utils/ui-actions-methods/type_actions';
import { expectElement } from '../../../ui-utils/ui-actions-methods/expect_actions';

Given('I navigate to Payment {string}', async (paymentType: string) => {
  await expectElement('card_pay').toBeVisible();
  await clickByLocator('card_pay');
  await clickByLocator(paymentType);
});

When('I fill the payment form with:', async (table) => {
  const data = table.rowsHash();
  await expectElement('general_pay_to_account').toBeVisible();
  if (driver.isIOS) {
    await browser.pause(1000);
    await typeInFieldByLocator('', data.account_number, 1, true);
  } else {
    await typeInFieldByLocator('', data.account_number, 2, true);
  }
  await typeInFieldByLocator(
    'pay_to_mobile_beneficiary_name_label',
    data.beneficiary_name,
  );
  await expectElement(
    'pay_to_mobile_beneficiary_name_label',
    'type',
  ).toHaveValue(data.beneficiary_name);
  await typeInFieldByLocator(
    'payment_inputs_beneficiary_place',
    data.beneficiary_place,
  );
  await clickIfDisplayed('Next:');
  if (driver.isAndroid) {
    await expectElement(
      'payment_inputs_beneficiary_street_and_number',
    ).toBeVisible(); //android
    await clickByLocator(
      'payment_inputs_beneficiary_street_and_number',
      undefined,
      1000,
      false,
    ); //android
  }
  await typeInFieldByLocator(
    'payment_inputs_beneficiary_street_and_number',
    data.beneficiary_street,
  );
  await clickIfDisplayed('Next:');
  await typeAmountField(data.amount, 1000);
  if (driver.isIOS) {
    await expectElement('standing_order_detail_label_amount').toBeVisible();
    await clickIfDisplayed('standing_order_detail_label_amount');
    await expectElement('standing_order_detail_label_amount').toBeVisible();
  }
  await expectElement('standing_order_detail_domestic_label_payment_code')
    .toBeVisible;
  await clickByLocator('standing_order_detail_domestic_label_payment_code');
  await clickByLocator(data.payment_code, undefined, 1000, true);
  await clickByLocator('transaction_model_payment', undefined, 1000);
  await clickByLocator(data.model_code, undefined, 1000, true);
  if (driver.isAndroid) {
    await clickByLocator('transaction_reference_nr', undefined, 1000, false);
  }
  await typeInFieldByLocator('transaction_reference_nr', data.reference_number);
  if (driver.isIOS) {
    await clickIfDisplayed('keyboard_ios_done');
  }
});

When('I fill the internal transfer form with:', async (table) => {
  const data = table.rowsHash();
  await clickByLocator('payment_choose_account');
  await clickByLocator(data.account_number, undefined, 1000, true, true);
  await typeAmountField(data.amount, 1000, false);
  if (driver.isIOS) {
    await clickIfDisplayed(data.account_number);
  }
});

When(
  'I confirm the payment with fingerprint {string}',
  async (fingerprint: string) => {
    await expectElement('general_continue').toBeClickable();
    await clickByLocator('general_continue');
    await expectElement('general_pay').toBeClickable();
    await browser.pause(3000);
    await clickByLocator('general_pay');
    if (driver.isIOS) {
      await expectElement('authorization_dialog_description_face').toExist();
      await expectElement(
        'authorization_dialog_description_face',
      ).toBeVisible();
    } else {
      await expectElement('authorization_dialog_description_generic').toExist();
      await expectElement(
        'authorization_dialog_description_generic',
      ).toBeVisible();
    }
    await typeInFieldByLocator('', fingerprint, 1, true);
    await clickByLocator('general_confirm');
    await clickByLocator('general_done');
    await clickIfDisplayed('Skrim');
  },
);

When('I confirm the internal transfer', async () => {
  await clickByLocator('general_continue');
  await clickByLocator('general_confirm');
  await clickByLocator('general_done');
  await clickIfDisplayed('Skrim');
});

Then('the payment should be completed successfully', async () => {
  console.log('Payment completed successfully');
});
