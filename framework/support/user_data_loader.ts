import fs from 'fs';
import path from 'path';
import { memory } from './memory';

// ✅ load env from TEST_ENV or fallback to t1
const currentEnv = process.env.TEST_ENV || 't1';

const baseFile = path.join(__dirname, '../../config/users/users.base.json');
const overrideFile = path.join(
  __dirname,
  `../../config/users/users.${currentEnv}.override.json`,
);

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output: any = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = (target as any)[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object'
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      output[key] = sourceValue;
    }
  }
  return output;
}

export function getData(this: any, key: string): string {
  if (this?.testData && this.testData[key]) {
    return this.testData[key];
  }
  return memory.get(key);
}

export class UserDataLoader {
  private users: Record<string, Record<string, string>> = {};

  constructor() {
    let baseUsers: Record<string, any> = {};
    let envOverrides: Record<string, any> = {};

    if (fs.existsSync(baseFile)) {
      baseUsers = JSON.parse(fs.readFileSync(baseFile, 'utf-8'));
    }

    if (fs.existsSync(overrideFile)) {
      envOverrides = JSON.parse(fs.readFileSync(overrideFile, 'utf-8'));
    }

    // 🔥 merge only users + envOverrides
    const baseUsersData = baseUsers.users || {};
    const envOverridesData = envOverrides || {};
    this.users = deepMerge(baseUsersData, envOverridesData);

    // replace baseData references
    if (baseUsers.baseData) {
      for (const userKey of Object.keys(this.users)) {
        const user = this.users[userKey];
        for (const key of Object.keys(user)) {
          const val = user[key];
          if (typeof val === 'string' && val.startsWith('baseData.')) {
            const baseDataKey = val.replace('baseData.', '');
            user[key] = baseUsers.baseData[baseDataKey] ?? val;
          }
        }
      }
    }

    console.log(
      `📂 [UserDataLoader] Loaded base + overrides for env="${currentEnv}"`,
    );
  }

  loadFromJson(userName: string): void {
    console.log(`📂 [UserDataLoader] Attempting to load user: "${userName}"`);

    const user = this.users[userName];
    if (!user) {
      throw new Error(
        `❌ [UserDataLoader] User "${userName}" not found in users.json`,
      );
    }

    console.log(
      `✅ [UserDataLoader] Loaded user "${userName}" with keys: [${Object.keys(
        user,
      ).join(', ')}]`,
    );

    Object.entries(user).forEach(([key, value]) => {
      console.log(`📝 [UserDataLoader] memory.set("${key}") = "${value}"`);
      memory.set(key, value);
    });
  }

  getUserKeys(): string[] {
    return Object.keys(this.users);
  }
}

export const userDataLoader = new UserDataLoader();
