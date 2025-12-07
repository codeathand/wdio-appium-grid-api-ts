import { When } from '@wdio/cucumber-framework';
import { ensureOnboardingOrLogin } from '../../../ui-utils/app-methods/global_app_methods';

interface ScenarioWorld {
  testData: Record<string, string>;
  replacePlaceholders: (text: string) => string;
}

When(
  'I login using the scenario test data',
  async function (this: ScenarioWorld) {
    console.log('🚀 Logging in using scenario test data...');
    await ensureOnboardingOrLogin.call(this); // uses this.testData and memory
  },
);
