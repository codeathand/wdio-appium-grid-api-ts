@regression
Feature: Pay to account


  @localMilosPayments
  @localSinisa_SM_A546B
  @localJovica_SM_A546B
  @androidDevice1
  @iosDevice13_iPhone
  @user=development_user
  Scenario Outline: Make a payment to an account - regression
    Given I navigate to Payment "{{general_pay_to_account}}"



  @localMilosPayments
  @localSinisa_SM_A546B
  @localJovica_SM_A546B
  @androidDevice1
  @iosDevice13_iPhone
  @user=development_user
  Scenario Outline: Make a payment internal transfer - regression
    Given I navigate to Payment "{{payment_internal_transfer_title}}"
