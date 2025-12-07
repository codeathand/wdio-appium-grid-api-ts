import { EnvConfig } from './env.interface';
import t1 from './t1';
import t2 from './t2';
import t3 from './t3';

const configs: Record<string, EnvConfig> = { t1, t2, t3 };
const env = process.env.TEST_ENV || 't1';

if (!configs[env]) throw new Error(`Unknown environment: ${env}`);

const currentConfig: EnvConfig = configs[env];

export default currentConfig;
