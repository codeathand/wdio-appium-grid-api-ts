@smoke
Feature: Pay to account


  @localMilos_SM_A546B
  @localSinisa_SM_A546B
  @androidDevice1
  @iosDevice14_iPhone
  @user=development_user
  Scenario Outline: Make a payment to an account
    Given I navigate to Payment "{{general_pay_to_account}}"
    When I fill the payment form with:
      | account_number     | <account_number>     |
      | beneficiary_name   | <beneficiary_name>   |
      | beneficiary_place  | <beneficiary_place>  |
      | beneficiary_street | <beneficiary_street> |
      | amount             | <amount>             |
      | payment_code       | <payment_code>       |
      | model_code         | <model_code>         |
      | reference_number   | <reference_number>   |
    And I confirm the payment with fingerprint "<fingerprint>"
    Then the payment should be completed successfully

    Examples:
      | account_number     | beneficiary_name | beneficiary_place | beneficiary_street  | amount | payment_code | model_code | reference_number | fingerprint |
      | 115038169451804159 | Vision           | Beograd           | Omladinskih brigada | 25     | 220          | 97         | 777              | 123456      |
