@smoke
Feature: Term deposit lifecycle
    As a mobile banking user
    I want to create and close a term deposit
    So that I can manage my savings efficiently

    @localMilos_SM_A546B
    @localJovica_SM_A546B
    @localSinisa_SM_A546B
    @androidDevice1
    @iosDevice14_iPhone
    @user=development_user
    Scenario: QV-4638_Opening_Closing_foreign_currency_savings_term
        When the user opens the term deposit creation screen
        When the user selects term type "main_menu_term_deposit" and value "general_learn_more"
        And the user increases the minimum saving amount by "5,00"
        And the user creates the term deposit with title "Terms Eur"
        Then the user authorizes with code "123456"
        And the user confirms the new term deposit
        When the user closes the term deposit account
        Then the user authorizes closing with code "123456"