@smoke
Feature: Card overview and details
    As a mobile banking user
    I want to view my authorized account credit card details and statuses (blocked, ready, inactive, active, temporarily blocked)
    So that I can verify card information and available actions viewing sensitive data, handling authorization (retrieving card number, type, CVC, and owner information)


    @localMilos_SM_A546B
    @localSinisa_SM_A546B
    @localJovica_SM_A546B
    @androidDevice1
    @iosDevice14_iPhone
    @user=development_user
    Scenario Outline: <title>
        # --- Token retrieval ---
        Then I send "tokenBaseUrl" a "POST" request to "{{tokenEndpoint}}" with x-www-form-urlencoded body:
            | client_id     | {{client_id}}     |
            | client_secret | {{client_secret}} |
            | grant_type    | {{grant_type}}    |
            | customerId    | {{customerId}}    |
            | experienceId  | {{experienceId}}  |
        Then the response status should be 200
        And I store the response value "access_token" as "access_token"

        # --- Cards overview ---
        When I send "apiBaseUrl" a "GET" request to "/private/v3/cards-overview?accountNumber={{accountNumber}}" with headers:
            | accept        | application/json        |
            | X-Customer-Id | {{customerId}}          |
            | Authorization | Bearer {{access_token}} |
        Then the response status should be 200
        And I store the following card fields in memory:
            | deviceId           | cards.0.deviceId          |
            | holderName         | cards.0.holderName        |
            | arrangementNumber  | cards.0.arrangementNumber |
            | validTo            | cards.0.validTo           |
            | card_type          | cards.0.type              |
            | card_form          | cards.0.form              |
            | masked_card_number | cards.0.maskedCardNumber  |
            | card_status        | cards.0.status            |

        # --- Card operation ---
        When I fetch the latest PowerAuth header from Grafana
        When I send <baseURL> a <method> request to <endpoint> with headers and body:
            | accept                    | application/json     |
            | X-Customer-Id             | {{customerId}}       |
            | X-PowerAuth-Authorization | {{powerauth_header}} |
            | Content-Type              | application/json     |
            | body                      | <body>               |

        Then the response status should be <expected_status>

        # --- UI validation ---
        And the user navigates to the Card Overview page
        And the user <ui_action>
        And the user opens the card details and displays sensitive data
        Then the card number, type, CVC, and owner should be visible
        And the card details should match the API response
        Examples:
            | title                            | method | baseURL          | endpoint                                                                                          | body                                                                            | expected_status | ui_action                            |
            | "MOB-2886_View_card_details"     | "GET"  | "apiBaseUrl"     | "/private/v3/cards-overview?accountNumber={{accountNumber}}"                                      | "NONE"                                                                          | 200             | "clicks on the first active card"    |
            | "MOB-5060/MOB-2804_Block_card"   | "PUT"  | "swaggerBaseUrl" | "/http://be-card-overview.be-card-overview:80/internal/v1/cards-overview/{{deviceId}}/blocking"   | '{"blockReason":"BLOCKED_BY_USER","isPermanent":false}'                         | 200             | "clicks on temporarily blocked card" |
            | "MOB-2804/MOB-5059_Unblock_card" | "PUT"  | "swaggerBaseUrl" | "/http://be-card-overview.be-card-overview:80/internal/v2/cards-overview/{{deviceId}}/unblocking" | '{"deviceId":"{{deviceId}}","digitsToValidate":"{{unblock_card_four_digits}}"}' | 204             | "clicks on the first active card"    |
