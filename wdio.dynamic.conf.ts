import { browser } from '@wdio/globals';
import type { Options } from '@wdio/types';
import fs from 'fs';
import path from 'path';
import * as glob from 'glob';
import {
  DEVICES,
  DEVICE_COUNT_BY_SERVER,
  generateCapability,
} from './config/devices/devices';
import { HOSTS } from './config/selenium-hosts/hosts';
import { memory } from './framework/support/memory';

const TAGS = (process.env.TAGS || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);
const RUN_SERVER = process.env.RUN_SERVER || 'local';
const USER_PC_NAME = process.env.PC_NAME;
const MACHINE = process.env.MACHINE || ''; // mac | linux | '' (for local)
console.log('MACHINE', MACHINE);
// console.log('🏷️  TAGS:', TAGS.length ? TAGS : 'none', ' | RUN_SERVER:', RUN_SERVER, ' | USER_PC_NAME:', USER_PC_NAME);

const BASE_CUCUMBER_OPTS = {
  require: [
    path.resolve(__dirname, './framework/step-definitions/**/*.ts'),
    path.resolve(__dirname, './framework/support/hooks.ts'),
  ],
  timeout: 280000,
  // retry: 1,
};

/**
 * Collect capabilities ensuring each scenario runs only once per device.
 */
function collectCapabilities(): WebdriverIO.Capabilities[] {
  const featuresPath = path
    .resolve(__dirname, 'features', '**', '*.feature')
    .replace(/\\/g, '/');
  const featureFiles = glob.sync(featuresPath);

  const NORMALIZED_TAGS = TAGS.map((t) => (t.startsWith('@') ? t : '@' + t));
  const runningCurrent = NORMALIZED_TAGS.includes('@current');

  const caps: WebdriverIO.Capabilities[] = [];
  const tagBlockRe =
    /((?:^\s*@\S+(?:\s+@\S+)*\s*\r?\n)+)\s*Scenario[^\r\n]*/gim;

  featureFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    // 1. Extract feature-level tags
    const featureTagRe = /^(@\S+(?:\s+@\S+)*)\s*\r?\n\s*Feature:/im;
    const featureTagsMatch = featureTagRe.exec(content);
    const featureTags = featureTagsMatch
      ? (featureTagsMatch[1].match(/@\S+/g) || []).map((t) => t.trim())
      : [];

    let m: RegExpExecArray | null;
    const scenarioProcessed = new Set<string>();

    // 2. Process each scenario
    while ((m = tagBlockRe.exec(content)) !== null) {
      const scenarioTags = (m[1].match(/@\S+/g) || []).map((t) => t.trim());

      // Merge feature tags + scenario tags
      const allTags = [...featureTags, ...scenarioTags];
      const scenarioKey = allTags.sort().join(',');

      if (scenarioProcessed.has(scenarioKey)) continue;
      scenarioProcessed.add(scenarioKey);

      // Filtering
      if (runningCurrent && !allTags.includes('@current')) continue;
      if (!runningCurrent) {
        const intersects = allTags.some((t) => NORMALIZED_TAGS.includes(t));
        if (!intersects) continue;
      }

      // Find matching device
      let deviceTag = allTags.find((t) => {
        const device = DEVICES[t];
        if (!device || t === '@current') return false;

        // local mode → filter by USER_PC_NAME
        if (RUN_SERVER === 'local') {
          return (
            device.serverType === 'local' && device.pcOwner === USER_PC_NAME
          );
        }

        // grid mode → filter by MACHINE (mac/linux)
        if (RUN_SERVER === 'grid') {
          return device.serverType === MACHINE;
        }

        return false;
      });
      // let deviceTag = allTags.find(
      //   (t) =>
      //     DEVICES[t] &&
      //     t !== '@current' &&
      //     (RUN_SERVER === 'all' || DEVICES[t].serverType === RUN_SERVER) &&
      //     (DEVICES[t].serverType !== 'local' ||
      //       DEVICES[t].pcOwner === USER_PC_NAME),
      // );

      if (!deviceTag) continue;

      // Build capability
      const cap = generateCapability(deviceTag);
      const deviceInfo = DEVICES[deviceTag];
      (cap as any).hostname = HOSTS[deviceInfo.serverType];
      (cap as any).port = 4444;
      (cap as any).path = '/';
      (cap as any).specs = [file];
      (cap as any).cucumberOpts = {
        ...BASE_CUCUMBER_OPTS,
        tagExpression: allTags.filter((t) => t !== '@current').join(' and '),
      };

      // (cap as any)['wdio:options'] = { deviceTag, scenarioTags: allTags };
      (cap as any)['wdio:options'] = {
        deviceTag,
        scenarioTags: [],
        sessionId: '', // 🟢 placeholder
        sessionStartTime: '',
      };

      caps.push(cap);
      console.log(
        `✅ Device ${deviceTag} → tags: ${allTags.join(', ')} → file: ${file}`,
      );
    }
  });

  return caps;
}
const MAX_INSTANCES =
  DEVICE_COUNT_BY_SERVER[MACHINE as keyof typeof DEVICE_COUNT_BY_SERVER] || 1;
console.log('MAX_INSTANCES', MAX_INSTANCES, USER_PC_NAME);
const dynamicCapabilities = collectCapabilities();

export const config: Options.Testrunner = {
  runner: 'local',
  specs: ['./features/**/*.feature'], // fallback
  // maxInstances: dynamicCapabilities.length, // allow multiple devices to run in parallel
  maxInstances: MAX_INSTANCES, // allow multiple devices to run in parallel
  capabilities: dynamicCapabilities,
  logLevel: 'silent',
  framework: 'cucumber',

  cucumberOpts: {
    ...BASE_CUCUMBER_OPTS,
    tags: TAGS,
  },

  reporters: [
    [
      'allure',
      {
        outputDir: 'reports/allure-results',
        useCucumberStepReporter: true,
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
      },
    ],
    [
      'cucumberjs-json',
      {
        jsonFolder: './reports/json/',
        language: 'en',
      },
    ],
  ],

  onPrepare() {
    console.log('🔧 Preparing test run for RUN_SERVER:', RUN_SERVER, ' ');
  },

  beforeScenario(this: any) {
    const currentCapability = (global as any).browser?.capabilities as any;
    const deviceTag = currentCapability?.['wdio:options']?.deviceTag;
    memory.set('deviceTag', deviceTag);
    const deviceUdid = currentCapability?.['appium:udid'];
    memory.set('deviceUdid', deviceUdid);

    console.log(`🌐 Running on device: ${deviceTag} (UDID: ${deviceUdid})`);
  },
} as Options.Testrunner;
