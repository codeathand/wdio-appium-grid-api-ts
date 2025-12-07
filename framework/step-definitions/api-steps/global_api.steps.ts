import { expect } from 'chai';
import { apiRequest } from '../../api-utils/apiClient';
import { memory } from '../../support/memory';
import { When, Then, DataTable } from '@wdio/cucumber-framework';
import currentConfig from '../../../config/env/env';

function replacePlaceholders(
  str: string,
  testData: Record<string, string>,
  _context = '',
) {
  return str.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();
    if (testData[trimmedKey] !== undefined) {
      return testData[trimmedKey];
    }
    if (memory.has(trimmedKey)) {
      const memoryValue = memory.get(trimmedKey);
      return memoryValue;
    }

    // 3. Onda proveri config
    const configFallbacks: Record<string, string | undefined> = {
      client_secret: currentConfig.clientSecret,
      tokenEndpoint: currentConfig.tokenEndpoint,
      grant_type: currentConfig.grantType,
      client_id: currentConfig.clientId,
    };

    if (configFallbacks[trimmedKey] !== undefined) {
      return configFallbacks[trimmedKey]!;
    }

    return '';
  });
}

function resolveBaseUrlLiteral(
  baseUrl: string | undefined,
  endpoint: string,
): 'apiBaseUrl' | 'tokenBaseUrl' | 'swaggerBaseUrl' | 'grafanaBaseUrl' {
  if (baseUrl) {
    return baseUrl as
      | 'apiBaseUrl'
      | 'tokenBaseUrl'
      | 'swaggerBaseUrl'
      | 'grafanaBaseUrl';
  } else if (endpoint.includes('/protocol/openid-connect/token')) {
    return 'tokenBaseUrl';
  } else if (endpoint.includes('/swagger')) {
    return 'swaggerBaseUrl';
  } else if (endpoint.includes('/api/') || endpoint.includes('/loki/')) {
    return 'grafanaBaseUrl';
  }
  return 'apiBaseUrl';
}

When(
  'I send {string} a {string} request to {string} with headers:',
  async function (
    baseUrl: string,
    method: string,
    endpoint: string,
    table: DataTable,
  ) {
    const worldData: Record<string, string> = this.testData || {};
    const memoryData: Record<string, string> = { ...memory.dictionary };
    const mergedData: Record<string, string> = {
      ...worldData,
      ...memoryData,
    };

    endpoint = replacePlaceholders(endpoint, mergedData, 'endpoint');

    const headers: Record<string, string> = {};
    for (const [key, rawValue] of table.raw()) {
      const value = replacePlaceholders(
        rawValue.replace(/^'(.*)'$/, '$1'),
        mergedData,
        `header "${key}"`,
      );
      headers[key] = value;
    }

    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const baseUrlLiteral = resolveBaseUrlLiteral(baseUrl, endpoint);

    const response = await apiRequest.call(this, {
      baseUrl: baseUrlLiteral,
      method,
      endpoint,
      headers,
      useAuth: true,
      data: this.requestBody || undefined,
    });

    this.response = response;
  },
);

When(
  'I send {string} a {string} request to {string} with headers and body:',
  async function (
    baseUrl: string,
    method: string,
    endpoint: string,
    table: DataTable,
  ) {
    if (method === 'NONE') {
      return;
    }

    const worldData: Record<string, string> = this.testData || {};
    const memoryData: Record<string, string> = { ...memory.dictionary };
    const mergedData: Record<string, string> = {
      ...worldData,
      ...memoryData,
    };

    endpoint = replacePlaceholders(endpoint, mergedData, 'endpoint');

    const headers: Record<string, string> = {};
    let bodyData: any = null;

    const rows = table.raw();

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === 'body') {
        const rawBodyFromColumn = rows[i][1];

        if (rawBodyFromColumn && rawBodyFromColumn !== 'NONE') {
          const bodyString = replacePlaceholders(
            rawBodyFromColumn.replace(/^'(.*)'$/, '$1'),
            mergedData,
            'request body',
          );
          bodyData = JSON.parse(bodyString);
        } else {
          const nextRow = rows[i + 1];
          if (nextRow && nextRow[0]) {
            const bodyString = replacePlaceholders(
              nextRow[0].replace(/^'(.*)'$/, '$1'),
              mergedData,
              'request body',
            );
            bodyData = JSON.parse(bodyString);
          }
        }

        continue;
      }

      const [key, rawValue] = rows[i];
      const value = replacePlaceholders(
        rawValue.replace(/^'(.*)'$/, '$1'),
        mergedData,
        `header "${key}"`,
      );
      headers[key] = value;
    }

    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const baseUrlLiteral = resolveBaseUrlLiteral(baseUrl, endpoint);

    const response = await apiRequest.call(this, {
      baseUrl: baseUrlLiteral,
      method,
      endpoint,
      headers,
      useAuth: true,
      data: bodyData || undefined,
    });

    this.response = response;
  },
);

Then(
  /^I send "([^"]*)" a "([^"]*)" request to "([^"]*)" with x-www-form-urlencoded body:$/,
  async function (
    baseUrl: string,
    method: string,
    endpoint: string,
    table: DataTable,
  ) {
    const testData: Record<string, string> = this.testData || {};

    endpoint = replacePlaceholders(endpoint, testData, 'endpoint');

    const body: Record<string, string> = {};

    const rows = table.raw();

    // Detektuj format tabele
    if (rows.length === 2 && rows[0].length > 1) {
      const headers = rows[0];
      const values = rows[1];

      for (let i = 0; i < headers.length; i++) {
        const key = headers[i].trim();
        let value = values[i]?.trim() || '';

        // Ako vrednost ima {{}}, resolve-uj je
        if (value.includes('{{')) {
          value = replacePlaceholders(value, testData, `body key "${key}"`);
        }

        body[key] = value;
      }
    } else {
      for (const [key, rawValue] of rows) {
        const resolvedValue = replacePlaceholders(
          rawValue.replace(/^'(.*)'$/, '$1'),
          testData,
          `body key "${key}"`,
        );
        body[key] = resolvedValue;
      }
    }

    const baseUrlLiteral = resolveBaseUrlLiteral(baseUrl, endpoint);

    const response = await apiRequest.call(this, {
      baseUrl: baseUrlLiteral,
      method,
      endpoint,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: new URLSearchParams(body).toString(),
    });

    this.response = response;

    if (response.data?.access_token) {
      this.testData = {
        ...testData,
        access_token: response.data.access_token,
      };
    }
  },
);

Then('the response status should be {int}', function (statusCode: number) {
  expect(this.response?.status).to.equal(statusCode);
});

Then(
  'I store the response value {string} as {string}',
  function (jsonPath: string, key: string) {
    const value = this.response?.data?.[jsonPath];
    if (value) {
      memory.set(key, value);
      this.testData = { ...this.testData, [key]: value };
    }
  },
);

Then(
  'I store the following card fields in memory:',
  function (table: DataTable) {
    const data = this.response?.data;
    if (!data) return;

    for (const [memoryKey, path] of Object.entries(table.rowsHash())) {
      const value = path.split('.').reduce((obj, key) => {
        if (obj && key in obj) return obj[key];
        return null;
      }, data);

      if (value !== null) {
        memory.set(memoryKey, value);
      }
    }
  },
);

Then('the request body is:', function (docString: string) {
  this.requestBody = JSON.parse(docString);
});

When('I fetch the latest PowerAuth header from Grafana', async function () {
  const currentTime = Date.now();
  const oneHourAgo = currentTime - 60 * 60 * 1000;

  const queryPayload = {
    queries: [
      {
        refId: 'A',
        expr: '{app="be-card-overview"}',
        queryType: 'range',
        datasource: {
          type: 'loki',
          uid: 'loki',
        },
        maxLines: 1000,
      },
    ],
    from: oneHourAgo.toString(),
    to: currentTime.toString(),
  };

  const response = await apiRequest.call(this, {
    baseUrl: 'grafanaBaseUrl',
    method: 'POST',
    endpoint: '/api/ds/query',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: queryPayload,
    useAuth: false,
  });

  let powerAuthHeader = null;

  if (response.data?.results?.A?.frames) {
    const frames = response.data.results.A.frames;

    for (const frame of frames) {
      if (frame.data?.values && frame.data.values.length >= 3) {
        const logValues = frame.data.values[2] || [];

        for (let i = logValues.length - 1; i >= 0; i--) {
          const logEntry = logValues[i];

          try {
            const parsedLog = JSON.parse(logEntry);
            const headers = parsedLog.message?.headers;

            if (headers && headers['x-powerauth-authorization']) {
              powerAuthHeader = headers['x-powerauth-authorization'][0];
              break;
            }
          } catch {
            continue;
          }
        }

        if (powerAuthHeader) break;
      }
    }
  }

  if (!powerAuthHeader) {
    const simpleQuery = {
      queries: [
        {
          refId: 'A',
          expr: '{app="be-card-overview"} |= "x-powerauth-authorization"',
          queryType: 'range',
          datasource: {
            type: 'loki',
            uid: 'loki',
          },
          maxLines: 100,
        },
      ],
      from: (Date.now() - 24 * 60 * 60 * 1000).toString(),
      to: Date.now().toString(),
    };

    const simpleResponse = await apiRequest.call(this, {
      baseUrl: 'grafanaBaseUrl',
      method: 'POST',
      endpoint: '/api/ds/query',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: simpleQuery,
      useAuth: false,
    });

    if (simpleResponse.data?.results?.A?.frames) {
      const frames = simpleResponse.data.results.A.frames;
      for (const frame of frames) {
        if (frame.data?.values && frame.data.values.length >= 3) {
          const logValues = frame.data.values[2] || [];

          for (let i = logValues.length - 1; i >= 0; i--) {
            const logEntry = logValues[i];

            const powerAuthMatch = logEntry.match(
              /"x-powerauth-authorization":\s*\["([^"]*(?:\\.[^"]*)*)"\]/,
            );
            if (powerAuthMatch) {
              powerAuthHeader = powerAuthMatch[1].replace(/\\"/g, '"');
              break;
            }
          }

          if (powerAuthHeader) break;
        }
      }
    }
  }

  if (!powerAuthHeader) {
    powerAuthHeader =
      'PowerAuth pa_version="3.2", pa_activation_id="f5a98be9-cb2f-420c-b2ae-c4d918dad367", pa_application_key="yq3rl269Jkets0MLi3t0Ig==", pa_nonce="0NjmTtc3NLi2Ryudl1Viaw==", pa_signature_type="possession_knowledge", pa_signature="nkTUyQX49/sEi2rR5GkpbMSKyol4wVt7InpizV6pfso="';
  }

  this.testData = { ...this.testData, powerauth_header: powerAuthHeader };
  memory.set('powerauth_header', powerAuthHeader);
});
