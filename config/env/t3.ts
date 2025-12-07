import { EnvConfig } from './env.interface';

const config: EnvConfig = {
  apiBaseUrl: 'https://t3.online.mobibanka.rs/t3',
  tokenBaseUrl: 'https://t-mobileapps-k8s.alcoyu.co.yu',
  tokenEndpoint: '/keycloakt3/realms/mobileapp/protocol/openid-connect/token',
  webtokenBaseUrl: '',
  swaggerBaseUrl: 'https://t-mobi-swagger-ui-k8s.alcoyu.co.yu',
  grafanaBaseUrl: 'https://t-grafana-apps-k8s.alcoyu.co.yu',
  clientSecret: 'mUK1QLqTbRf6NAbWbDJbRO20ICunDzeN',
  androidAppPath: 'config/app-staging-release.apk',
  androidAppActivity: 'rs.yettelbank.app.MainActivity',
  // iosAppPath: 'config/app-staging.ipa',
  androidPackageName: 'rs.yettelbank.app.stg',
  iosBundleId: 'rs.yettelbank.mobile.stg',
  testerAppPackage: 'com.google.firebase.appdistribution',
  testFlightBundleId: 'com.apple.TestFlight',
  appDisplayName: 'Yettel Bank T1',
  grantType: 'client_credentials',
  clientId: 'mobi',
};

export default config;
