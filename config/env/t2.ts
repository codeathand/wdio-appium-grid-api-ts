import { EnvConfig } from './env.interface';

const config: EnvConfig = {
  apiBaseUrl: '',
  tokenBaseUrl: '',
  tokenEndpoint: '',
  webtokenBaseUrl: '',
  swaggerBaseUrl: '',
  grafanaBaseUrl: '',
  clientSecret: '',
  androidAppPath: '',
  androidAppActivity: 'com.google.android.apps.wallet.main.WalletActivity',
  // iosAppPath: 'config/app-staging.ipa',
  androidPackageName: 'com.google.android.apps.walletnfcrel',
  iosBundleId: 'com.cardsapp.android',
  testerAppPackage: 'com.google.firebase.appdistribution',
  testFlightBundleId: 'com.apple.TestFlight',
  appDisplayName: 'Test',
  grantType: '',
  clientId: '',
};

export default config;
