// maybe to delete

/// <reference types="@wdio/globals/types" />

import {
  setWorldConstructor,
  World as CucumberWorld,
} from '@wdio/cucumber-framework';
import type { Browser } from 'webdriverio';

interface ContextStore {
  [key: string]: any;
}

export class CustomWorld extends CucumberWorld {
  driver: Browser | null = null;
  context: ContextStore = {};
  response?: any;

  constructor(options: any) {
    super(options);
  }

  async initDriverIO() {
    if (!this.driver) {
      this.driver = global.browser;
    }
  }

  async closeDriverIO() {
    try {
      if (this.driver) {
        await this.driver.deleteSession();
      }
    } catch (err) {
      console.warn('⚠️ deleteSession failed:', err);
    } finally {
      this.driver = null;
    }
  }
}

setWorldConstructor(CustomWorld);
