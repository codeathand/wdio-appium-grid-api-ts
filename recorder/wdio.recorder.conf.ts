import type { Options } from '@wdio/types';
import { browser } from '@wdio/globals';
import type { Browser } from 'webdriverio';
import { recordAction } from '../framework/ui-utils/helpers/recorder';
import path from 'path';

export const config: Options.Testrunner = {
  hostname: 'localhost',
  port: 4444,
  path: '/',
  services: [],
  framework: 'cucumber',
  specs: [path.resolve(__dirname, './features/recorder.feature')],
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:udid': 'RZCWB0Z0KYL',
      'appium:appPackage': 'rs.yettelbank.app.stg',
      'appium:appActivity': 'rs.yettelbank.app.MainActivity',
    },
  ],
  cucumberOpts: {
    require: [
      path.resolve(
        __dirname,
        './framework/step-definitions/ui-steps/recorder-steps/**/*.ts',
      ),
    ],
    timeout: 60000 * 10,
  },

  before: function () {
    const commandsToRecord = [
      'click',
      'setValue',
      'addValue',
      'clearValue',
      'touchAction',
    ];

    for (const cmd of commandsToRecord) {
      const original = (browser as unknown as Browser)[cmd];

      (browser as unknown as Browser).addCommand(
        cmd,
        async function (...args: any[]) {
          let selector: string = '';
          let value: any;

          // Get a string selector if available
          if (this.elementId) {
            selector = (this.selector || '').toString();
          }

          if (args.length > 0) {
            value = args[0];
          }

          // Log to console
          console.log(
            `🎯 Action: ${cmd}, Selector: ${selector}, Value: ${value ?? 'N/A'}`,
          );

          // Log to file
          recordAction(cmd, selector, value);

          return original.apply(this, args);
        },
        true,
      );
    }
  },
} as Options.Testrunner;
