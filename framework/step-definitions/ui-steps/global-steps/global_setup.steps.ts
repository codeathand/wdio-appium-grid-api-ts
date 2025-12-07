import { DataTable, Given } from '@wdio/cucumber-framework';
import { memory } from '../../../support/memory';
interface ScenarioWorld {
  testData: Record<string, string>;
  replacePlaceholders: (text: string) => string;
}

Given(
  'I have the following test data:',
  function (this: ScenarioWorld, table: DataTable) {
    this.testData = {};

    table.rows().forEach(([key, value]) => {
      this.testData[key] = value;
      memory.set(key, value); // store per scenario
    });

    this.replacePlaceholders = (text: string): string => {
      return text.replace(/{{(.*?)}}/g, (_, key) => {
        const trimmedKey = key.trim();
        return this.testData[trimmedKey] ?? `{{${trimmedKey}}}`;
      });
    };

    console.log('📋 [Step] Scenario test data loaded:', this.testData);
  },
);
