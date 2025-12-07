@smoke
Feature: Internal transfer from CA to CL and from CL to CA
    As a mobile banking user
    I want to transfer funds from current account to credit card and fom credit card to credit account


    @localJovica_SM_A546B
    @localMilosCards
    @localSinisaCards
    @localJovicaCards
    @androidDevice1
    @iosDevice14_iPhone
    @user=development_user
    Scenario Outline: Click on internal transfer icon
        When I navigate to "{{account_current}}" internal transfer icon on index "3"
        When I fill the internal transfer form with:
            | amount         | <amount>         |
            | account_number | <account_number> |
        And I confirm the internal transfer

        Examples:
            | amount | account_number |
            | 2      | 0064200595023  |


    @localJovica_SM_A546B
    @localMilosCards
    @localSinisaCards
    @localJovicaCards
    @androidDevice1
    @iosDevice14_iPhone
    @user=development_user
    Scenario Outline: Click on internal transfer icon
        When I navigate to "{{account_creditcard}}" internal transfer icon on index "1"
        When I fill the internal transfer form with:
            | amount         | <amount>         |
            | account_number | <account_number> |
        And I confirm the internal transfer

        Examples:
            | amount | account_number       |
            | 2      | 115-0381641949000-23 |

    @localMilos_SM_A546B
    @localSinisa_SM_A546B
    @localJovicaPayments
    @androidDevice1
    @iosDevice14_iPhone
    @user=development_user
    Scenario Outline: Make a payment internal transfer
        Given I navigate to Payment "{{payment_internal_transfer_title}}"
        When I fill the internal transfer form with:
            | amount         | <amount>         |
            | account_number | <account_number> |
        And I confirm the internal transfer

        Examples:
            | amount | account_number |
            | 2      | 0064200595023  |
