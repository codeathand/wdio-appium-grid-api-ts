import { Given, Then } from '@wdio/cucumber-framework';
import { startRecorder } from '../recorder';

Given('I start recording user actions', async () => {
  startRecorder();
});

Then('I pause for manual actions', async () => {
  console.log('🎬 Manual recording started. Interact with the app now!');
  await new Promise(() => {}); // never resolves
});
