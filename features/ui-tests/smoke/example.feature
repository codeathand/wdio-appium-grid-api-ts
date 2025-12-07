@smoke
Feature: Credit card details validation
    As a mobile banking user
    I want to view my authorized account credit card details
    So that I can verify card information and available actions

    Background:
        Given I have the following test data:
            | key                 | value              |
            | grant_type          | client_credentials |
            | client_id           | mobi               |
            | scope               | customerId         |
            | customerId          | 1008071            |
            | experienceId        | 2484514            |
            | accountNumber       | 0381641949000      |
            | account_name        | MILEVA GRBIĆ       |
            | phone_number        | 38111258751        |
            | last_four_digits    | 5011               |
            | sms_code            | 111111             |
            | PIN                 | 123456             |
            | card_missing_digits | 0007               |
        When I login using the scenario test data

    @localMilos_SM_A546B
    @localSinisa_SM_A546B
    @localJovica_SM_A546B
    @androidDevice1
    @iosDevice14_iPhone
    @user=development_user
    Scenario: Verify credit card details in authorized accounts
        When I click "{{card_title}}" on "Login" page and verify card details
        When I Deblokada "{{main_menu_cards_overview}}" on "Home" page