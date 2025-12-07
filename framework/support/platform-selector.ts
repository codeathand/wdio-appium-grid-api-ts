// Define enum for supported platforms
export enum Platform {
  ANDROID = 'Android',
  IOS = 'iOS',
}

// declare global {
//   // Extend global type to include platformName
//   var platformName: Platform;
// }

// export function platformName(): Platform {
//   return global.platformName;

// }

export function platformName(): Platform {
  const envValue = process.env.PLATFORM;
  if (!envValue) {
    throw new Error('PLATFORM environment variable is not set');
  }

  // Normalize input to match enum
  const normalized = envValue.trim().toLowerCase();
  if (normalized === 'android') return Platform.ANDROID;
  if (normalized === 'ios') return Platform.IOS;

  throw new Error(
    `Invalid PLATFORM value: "${envValue}". Must be Android or iOS`,
  );
}

export function isAndroid(): boolean {
  const envValue = process.env.PLATFORM;
  if (!envValue) {
    throw new Error('PLATFORM environment variable is not set');
  }

  // Normalize input to match enum
  const normalized = envValue.trim().toLowerCase();
  if (normalized === 'android') return true;
  return normalized === Platform.ANDROID;
}

export function platformSelector<T>(androidSelector: T, iosSelector: T): T {
  console.log('==== PLATFORM NAME ====', process.env.PLATFORM, isAndroid());
  return isAndroid() ? androidSelector : iosSelector;
}

export async function attrSelector(): Promise<string> {
  return isAndroid() ? 'content-desc' : 'name';
}

export async function checkboxValue(): Promise<string> {
  return isAndroid() ? 'checked' : 'value';
}

export async function pastedValue(): Promise<string> {
  return isAndroid() ? 'text' : 'value';
}
