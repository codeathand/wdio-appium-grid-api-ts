@smoke
Feature: Exchange office transactions
    As a mobile banking user
    I want to exchange currency through the exchange office
    So that I can convert my funds quickly and securely

    @localMilos_SM_A546B
    @localJovica_SM_A546B
    @localSinisa_SM_A546B
    @androidDevice2
    @iosDevice14_iPhone
    @user=development_user
    Scenario Outline: Perform exchange in Exchange office
        When I store the exchange account value and calculate the expected increase of "<amount>"
        When I navigate to the exchange office from the Home page
        And I choose account "<account>"
        And I enter exchange amount "<amount>"
        And I confirm the exchange
        Then the exchange should be completed successfully
        Examples:
            | amount | account              |
            | 0,01   | 115-0381641949000-23 |
