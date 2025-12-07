export interface EnvConfig {
  apiBaseUrl: string;
  tokenBaseUrl: string;
  tokenEndpoint: string;
  swaggerBaseUrl: string;
  grafanaBaseUrl: string;
  webtokenBaseUrl: string;
  clientSecret: string;
  androidAppPath: string;
  androidAppActivity: string;
  // iosAppPath: string;
  androidPackageName: string;
  iosBundleId: string;
  testerAppPackage?: string; // Android Firebase Tester package
  testFlightBundleId?: string; // iOS TestFlight bundleId
  appDisplayName: string; // e.g. "Yettel Bank T1" (label in Tester/TestFlight)
  grantType: string;
  clientId: string;
  scope?: string;
}
