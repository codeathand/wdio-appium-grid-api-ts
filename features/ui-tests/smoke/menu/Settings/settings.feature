@smoke
Feature: Settings lifecicle
    As a mobile banking user
    I want to be able to chage pin
    So that I can use app efficiently

    
    @localMilos_SM_A546B
    @localJovica_SM_A546B
    @localSinisa_SM_A546B
    @androidDevice1
    @iosDevice14_iPhone
    @user=development_user
    Scenario: MOB-2739/MOB-3974_current_account_change_pin
        When the user navigates to change PIN settings
        And the user completes activation process
        Then the user completes PIN change

