import { EnvConfig } from './env.interface';

const config: EnvConfig = {
  apiBaseUrl: 'https://t1.mobile.yettelbank.rs',
  tokenBaseUrl: 'https://t1-mobileapps-k8s.alcoyu.co.yu',
  webtokenBaseUrl: '',
  swaggerBaseUrl: 'https://t1-mobi-swagger-ui-k8s.alcoyu.co.yu',
  tokenEndpoint: '/keycloak/realms/mobileapp/protocol/openid-connect/token',
  grafanaBaseUrl: '',
  clientSecret: 'JMhFSmvUsQNAepvjVo2lEg1jH6Xp9sGO',
  androidAppPath: 'config/app-staging-release.apk',
  androidAppActivity: 'rs.yettelbank.app.MainActivity',
  // iosAppPath: 'config/app-staging.ipa',
  androidPackageName: 'rs.yettelbank.app.t1',
  iosBundleId: 'rs.yettelbank.mobile.t1',
  testerAppPackage: 'com.google.firebase.appdistribution',
  testFlightBundleId: 'com.apple.TestFlight',
  appDisplayName: 'Yettel Bank T1',
  grantType: 'client_credentials',
  clientId: 'mobi',
};

export default config;
