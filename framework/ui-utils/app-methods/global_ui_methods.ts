import { expectElement } from '../ui-actions-methods/expect_actions.ts';
import { memory } from '../../support/memory.ts';
import { typeInFieldByLocator } from '../ui-actions-methods/type_actions.ts';
import {
  clickByLocator,
  clickIfDisplayed,
} from '../ui-actions-methods/click_actions.ts';
import { getData } from '../../support/user_data_loader.ts';
import { randomText } from './global_app_methods.ts';

export async function expectAuthorizationDialog() {
  const udid = memory.get('deviceUdid') as string | undefined;
  if (!udid) {
    console.warn(
      '⚠️ No UDID found in memory, skipping authorization dialog check.',
    );
    return;
  }

  const isEmulator = udid.toLowerCase().includes('emulator');

  if (driver.isIOS) {
    await expectElement('authorization_dialog_description_face').toExist();
    await expectElement('authorization_dialog_description_face').toBeVisible();
  } else {
    const selector = isEmulator
      ? 'authorization_dialog_description_fingerpring'
      : 'authorization_dialog_description_generic';

    await expectElement(selector).toExist();
    await expectElement(selector).toBeVisible();
  }

  await typeInFieldByLocator('', '123456', 1, true);
  await clickByLocator('general_confirm');
}

export async function executeActivationProcess(context: any): Promise<void> {
  await typeInFieldByLocator(
    'activation_personal_data_your_phone',
    getData.call(context, 'phone_number'),
    1,
  );
  await typeInFieldByLocator(
    'activation_personal_data_last_digits_of_id',
    getData.call(context, 'last_four_digits'),
  );
  await clickByLocator('general_continue');
  await typeInFieldByLocator('', getData.call(context, 'sms_code'), 1, true);
  await clickByLocator('general_continue');
  await expectElement('activation_pin_subtitle').toBeVisible();
  await typeInFieldByLocator(
    'activation_pin_label',
    getData.call(context, 'PIN'),
  );
  await typeInFieldByLocator(
    'activation_pin_confirm_label',
    getData.call(context, 'PIN'),
  );
  if (browser.isIOS) {
    await clickIfDisplayed('activation_pin_subtitle');
    await typeInFieldByLocator(
      'activation_pin_confirm_label',
      getData.call(context, 'PIN'),
    );
  }
  await clickByLocator('general_continue');
  await clickIfDisplayed('activation_button_not_now');
  if (browser.isIOS) {
    await typeInFieldByLocator('', randomText());
  } else {
    await typeInFieldByLocator('activation_device_nickname_label', randomText());
  }
  await clickByLocator('general_confirm');
  if (browser.isIOS) {
    await clickIfDisplayed('general_cancel');
  }
  await clickIfDisplayed('app_WhileUsingThisApp');
  await clickIfDisplayed('app_Allow');
  await expectElement('general_confirm').toBeVisible();
  await expectElement('general_confirm').toBeClickable();
  await clickByLocator('general_confirm');
}
