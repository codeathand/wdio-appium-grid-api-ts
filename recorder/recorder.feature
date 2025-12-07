Feature: UI Action Recorder

    @recorder
    Scenario: Record UI actions
        Given I start recording user actions
        Then I pause for manual actions
