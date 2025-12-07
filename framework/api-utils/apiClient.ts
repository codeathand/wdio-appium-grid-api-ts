import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import currentConfig from '../../config/env/env';
import { memory } from '../support/memory';
import { addStep } from '@wdio/allure-reporter';
import { Status } from 'allure-js-commons';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export interface RequestOptions {
  baseUrl?: 'apiBaseUrl' | 'tokenBaseUrl' | 'swaggerBaseUrl' | 'grafanaBaseUrl';
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  data?: any;
  useAuth?: boolean;
}

export function replacePlaceholders(input: string): string {
  return input.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const trimmedKey = key.trim();

    try {
      const value = memory.get(trimmedKey);
      const logMsg = `✅ Placeholder {{${trimmedKey}}} resolved`;
      addStep(logMsg, {}, Status.PASSED);
      return value;
    } catch {
      const configValue = getConfigValue(trimmedKey);

      if (configValue !== undefined) {
        const logMsg = `✅ Placeholder {{${trimmedKey}}} resolved from config`;
        addStep(logMsg, {}, Status.PASSED);
        return configValue;
      }

      const errorMsg = `❌ Failed to replace placeholder {{${trimmedKey}}}`;
      addStep(errorMsg, {}, Status.FAILED);
      throw new Error(`${errorMsg}: Key not found in memory or config`);
    }
  });
}

function getConfigValue(key: string): string | undefined {
  const configMap: Record<string, string | undefined> = {
    client_secret: currentConfig.clientSecret,
    grant_type: currentConfig.grantType,
    client_id: currentConfig.clientId,
  };

  return configMap[key];
}

export async function apiRequest(
  this: any,
  options: RequestOptions,
): Promise<AxiosResponse> {
  const startTime = Date.now();

  try {
    const headers = { ...(options.headers || {}) };

    if (options.useAuth && !headers['Authorization']) {
      try {
        const token = memory.get('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          const logMsg = '      ✅ Authorization token added to request';
          console.log(logMsg);
          addStep(logMsg, {}, Status.PASSED);
        }
      } catch {
        const logMsg = '      ⚠️ Access token not found in memory';
        console.log(logMsg);
        addStep(logMsg, {}, Status.BROKEN);
      }
    }

    for (const key in headers) {
      try {
        headers[key] = replacePlaceholders(headers[key]);
      } catch (e) {
        const errorMsg = `❌ Failed to replace placeholder in header "${key}"`;
        console.error(errorMsg);
        addStep(errorMsg, {}, Status.FAILED);
        throw new Error(`${errorMsg}: ${e}`);
      }
    }

    const baseUrl =
      options.baseUrl === 'tokenBaseUrl'
        ? currentConfig.tokenBaseUrl
        : options.baseUrl === 'swaggerBaseUrl'
          ? currentConfig.swaggerBaseUrl
          : options.baseUrl === 'grafanaBaseUrl'
            ? currentConfig.grafanaBaseUrl
            : currentConfig.apiBaseUrl;

    const fullUrl = `${baseUrl}${options.endpoint}`;

    const requestLogMsg = `     🌐 Sending ${options.method} request to ${fullUrl}`;
    console.log(requestLogMsg);
    addStep(requestLogMsg, {}, Status.PASSED);

    if (options.data) {
      const dataPreview =
        typeof options.data === 'string'
          ? options.data.substring(0, 100)
          : JSON.stringify(options.data).substring(0, 100);
      const bodyLogMsg = `      📋 Request body: ${dataPreview}${dataPreview.length >= 100 ? '...' : ''}`;
      console.log(bodyLogMsg);
      addStep(bodyLogMsg, {}, Status.PASSED);
    }

    const config: AxiosRequestConfig = {
      method: options.method,
      url: fullUrl,
      headers,
      data: options.data,
      validateStatus: () => true,
    };

    const response = await axios(config);
    const duration = Date.now() - startTime;

    const statusEmoji =
      response.status >= 200 && response.status < 300
        ? '✅'
        : response.status >= 400
          ? '❌'
          : '⚠️';

    const responseStatus =
      response.status >= 200 && response.status < 300
        ? Status.PASSED
        : response.status >= 400
          ? Status.FAILED
          : Status.BROKEN;

    const responseLogMsg = `      ${statusEmoji} Response status: ${response.status} (${duration}ms)`;
    console.log(responseLogMsg);
    addStep(responseLogMsg, {}, responseStatus);

    if (response.data) {
      const dataPreview =
        typeof response.data === 'object'
          ? JSON.stringify(response.data).substring(0, 100)
          : String(response.data).substring(0, 100);
      const dataLogMsg = `    📦 Response data preview: ${dataPreview}${dataPreview.length >= 100 ? '...' : ''}`;
      console.log(dataLogMsg);
      addStep(dataLogMsg, {}, Status.PASSED);
    }

    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorLogMsg = `❌ API request failed: ${error.message} (${duration}ms)`;

    console.error(errorLogMsg);
    addStep(errorLogMsg, { error: error.toString() }, Status.FAILED);

    throw new Error(
      `${options.method} ${options.endpoint} failed: ${error.message}`,
    );
  }
}
