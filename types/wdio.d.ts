export {};

declare module '@wdio/types' {
  export interface Capabilities {
    _deviceInfo?: {
      tag: string;
      platformName: 'Android' | 'iOS';
      udid: string;
      serverType: 'local' | 'linux' | 'mac';
      pcOwner?: string;
      port?: number;
    };
    specs?: string[];
  }
}

declare global {
  namespace WebdriverIO {
    interface Browser {
      currentDeviceTag?: string;
    }
  }
}
